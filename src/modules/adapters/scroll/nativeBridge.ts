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
import EthGatewayAbi from '../../../configs/abi/scroll/L1ETHGateway.json';
import Erc20GatewayAbi from '../../../configs/abi/scroll/L1StandardERC20Gateway.json';
import { ScrollBridgeProtocolConfig } from '../../../configs/protocols/scroll';

const Events = {
  // ERC20 deposit
  DepositERC20: '0x31cd3b976e4d654022bf95c68a2ce53f1d5d94afabe0454d2832208eeb40af25',

  // native ETH deposit
  DepositETH: '0x6670de856ec8bf5cb2b7e957c5dc24759716056f79d97ea5e7c939ca0ba5a675',
};

export default class ScrollNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.scroll 📜';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const scrollConfig = this.protocolConfig as ScrollBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [scrollConfig.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [scrollConfig.chain]: {
          [scrollConfig.layer2Chain]: 0,
        },
      },
    };

    if (scrollConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      scrollConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      scrollConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      scrollConfig.chain,
      options.endTime,
    );

    const bridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: scrollConfig.chain,
      address: scrollConfig.ethGateway,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    // native ETH
    const client = this.services.blockchain.evm.getPublicClient(scrollConfig.chain);
    const nativeBalance = await client.getBalance({
      address: scrollConfig.messengerProxy as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: scrollConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[scrollConfig.chain][AddressZero] = {
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      totalAssetDeposited: nativeBalanceLockedUsd,
      totalValueLocked: nativeBalanceLockedUsd,
    };
    for (const log of bridgeLogs.filter((item) => item.topics[0] === Events.DepositETH)) {
      const event: any = decodeEventLog({
        abi: EthGatewayAbi,
        topics: log.topics,
        data: log.data,
      });
      const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * nativeTokenPriceUsd;
      (protocolData.volumes.bridge as number) += amountUsd;
      (protocolData.volumeBridgePaths as any)[scrollConfig.chain][scrollConfig.layer2Chain] += amountUsd;
      (protocolData.breakdown[scrollConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;
    }

    // ERC20 tokens activities
    const calls: Array<ContractCall> = scrollConfig.supportedTokens.map((tokenAddress) => {
      return {
        abi: Erc20Abi,
        target: tokenAddress,
        method: 'balanceOf',
        params: [scrollConfig.erc20Gateway],
      };
    });

    const results = await this.services.blockchain.evm.multicall({
      chain: scrollConfig.chain,
      blockNumber: blockNumber,
      calls: calls,
    });
    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: scrollConfig.chain,
      address: scrollConfig.erc20Gateway,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (let i = 0; i < scrollConfig.supportedTokens.length; i++) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: scrollConfig.chain,
        address: scrollConfig.supportedTokens[i],
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
        protocolData.breakdown[scrollConfig.chain][token.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
          totalAssetDeposited: nativeBalanceLockedUsd,
          totalValueLocked: nativeBalanceLockedUsd,
        };

        for (const log of logs.filter((item) => item.topics[0] === Events.DepositERC20)) {
          const event: any = decodeEventLog({
            abi: Erc20GatewayAbi,
            topics: log.topics,
            data: log.data,
          });
          if (compareAddress(token.address, event.args.l1Token)) {
            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.volumeBridgePaths as any)[scrollConfig.chain][scrollConfig.layer2Chain] += amountUsd;
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
