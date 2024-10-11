import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { Address, decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import { ContractCall } from '../../../services/blockchains/domains';
import ArbitrumBridgeAbi from '../../../configs/abi/arbitrum/Bridge.json';
import Erc20GatewayAbi from '../../../configs/abi/arbitrum/L1ERC20Gateway.json';
import { ArbitrumBridgeProtocolConfig } from '../../../configs/protocols/arbitrum';

const Events = {
  // ERC20 deposit
  DepositInitiated: '0xb8910b9960c443aac3240b98585384e3a6f109fbf6969e264c3f183d69aba7e1',

  // native ETH deposit
  MessageDelivered: '0x5e3c1311ea442664e8b1611bfabef659120ea7a0a2cfc0667700bebc69cbffe1',
};

export default class ArbitrumNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.arbitrum';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const arbitrumConfig = this.protocolConfig as ArbitrumBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [arbitrumConfig.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [arbitrumConfig.chain]: {
          [arbitrumConfig.layer2Chain]: 0,
        },
      },
    };

    if (arbitrumConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      arbitrumConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      arbitrumConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      arbitrumConfig.chain,
      options.endTime,
    );

    const bridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: arbitrumConfig.chain,
      address: arbitrumConfig.bridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    // native ETH
    const client = this.services.blockchain.evm.getPublicClient(arbitrumConfig.chain);
    const nativeBalance = await client.getBalance({
      address: arbitrumConfig.bridge as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: arbitrumConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[arbitrumConfig.chain][AddressZero] = {
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      totalAssetDeposited: nativeBalanceLockedUsd,
      totalValueLocked: nativeBalanceLockedUsd,
    };
    const cachingTransactions: { [key: string]: boolean } = {};
    for (const log of bridgeLogs.filter((item) => item.topics[0] === Events.MessageDelivered)) {
      const event: any = decodeEventLog({
        abi: ArbitrumBridgeAbi,
        topics: log.topics,
        data: log.data,
      });
      // kind 12 is deposit ETH transaction
      const kind = Number(event.args.kind);
      if (kind === 12) {
        // we need to get transaction ETH value
        if (!cachingTransactions[log.transactionHash]) {
          const transaction = await client.getTransaction({
            hash: log.transactionHash,
          });
          if (transaction) {
            cachingTransactions[log.transactionHash] = true;
            const amountUsd = formatBigNumberToNumber(transaction.value.toString(), 18) * nativeTokenPriceUsd;
            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.volumeBridgePaths as any)[arbitrumConfig.chain][arbitrumConfig.layer2Chain] += amountUsd;
            (protocolData.breakdown[arbitrumConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;
          }
        }
      }
    }

    // ERC20 tokens activities
    for (const erc20Gateway of arbitrumConfig.erc20Gateways) {
      const calls: Array<ContractCall> = arbitrumConfig.supportedTokens.map((tokenAddress) => {
        return {
          abi: Erc20Abi,
          target: tokenAddress,
          method: 'balanceOf',
          params: [erc20Gateway],
        };
      });

      const results = await this.services.blockchain.evm.multicall({
        chain: arbitrumConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: arbitrumConfig.chain,
        address: erc20Gateway,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (let i = 0; i < arbitrumConfig.supportedTokens.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: arbitrumConfig.chain,
          address: arbitrumConfig.supportedTokens[i],
        });
        if (token && results[i]) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const balanceUsd = formatBigNumberToNumber(results[i].toString(), token.decimals) * tokenPriceUsd;

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;
          protocolData.breakdown[arbitrumConfig.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
            totalAssetDeposited: nativeBalanceLockedUsd,
            totalValueLocked: nativeBalanceLockedUsd,
          };

          for (const log of logs.filter((item) => item.topics[0] === Events.DepositInitiated)) {
            const event: any = decodeEventLog({
              abi: Erc20GatewayAbi,
              topics: log.topics,
              data: log.data,
            });
            if (compareAddress(token.address, event.args.l1Token)) {
              const amountUsd = formatBigNumberToNumber(event.args._amount.toString(), token.decimals) * tokenPriceUsd;

              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[arbitrumConfig.chain][arbitrumConfig.layer2Chain] += amountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
