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
import { OptimismBridgeProtocolConfig } from '../../../configs/protocols/optimism';
import { ContractCall } from '../../../services/blockchains/domains';
import L1StandardBridgeAbi from '../../../configs/abi/optimism/L1StandardBridge.json';

const Events = {
  ETHDepositInitiated: '0x35d79ab81f2b2017e19afb5c5571778877782d7a8786f5907f93b0f4702f4f23',
  ERC20DepositInitiated: '0x718594027abd4eaed59f95162563e0cc6d0e8d5b86b1c7be8b1b0ac3343d0396',
};

export default class OptimismNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.optimism';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const optimismConfig = this.protocolConfig as OptimismBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [optimismConfig.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [optimismConfig.chain]: {
          [optimismConfig.layer2Chain]: 0,
        },
      },
    };

    if (optimismConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      optimismConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      optimismConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      optimismConfig.chain,
      options.endTime,
    );

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: optimismConfig.chain,
      address: optimismConfig.optimismGateway,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const client = this.services.blockchain.evm.getPublicClient(optimismConfig.chain);
    const nativeBalance = await client.getBalance({
      address: optimismConfig.optimismPortal as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: optimismConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[optimismConfig.chain][AddressZero] = {
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      totalAssetDeposited: nativeBalanceLockedUsd,
      totalValueLocked: nativeBalanceLockedUsd,
    };
    for (const log of logs.filter((item) => item.topics[0] === Events.ETHDepositInitiated)) {
      const event: any = decodeEventLog({
        abi: L1StandardBridgeAbi,
        topics: log.topics,
        data: log.data,
      });
      const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * nativeTokenPriceUsd;

      (protocolData.volumes.bridge as number) += amountUsd;
      (protocolData.volumeBridgePaths as any)[optimismConfig.chain][optimismConfig.layer2Chain] += amountUsd;
      (protocolData.breakdown[optimismConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;
    }

    const calls: Array<ContractCall> = optimismConfig.supportedTokens.map((tokenAddress) => {
      return {
        abi: Erc20Abi,
        target: tokenAddress,
        method: 'balanceOf',
        params: [optimismConfig.optimismGateway],
      };
    });
    const results = await this.services.blockchain.evm.multicall({
      chain: optimismConfig.chain,
      blockNumber: blockNumber,
      calls: calls,
    });
    for (let i = 0; i < optimismConfig.supportedTokens.length; i++) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: optimismConfig.chain,
        address: optimismConfig.supportedTokens[i],
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
        protocolData.breakdown[optimismConfig.chain][token.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
          totalAssetDeposited: nativeBalanceLockedUsd,
          totalValueLocked: nativeBalanceLockedUsd,
        };

        for (const log of logs.filter((item) => item.topics[0] === Events.ERC20DepositInitiated)) {
          const event: any = decodeEventLog({
            abi: L1StandardBridgeAbi,
            topics: log.topics,
            data: log.data,
          });
          if (compareAddress(token.address, event.args.l1Token)) {
            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.volumeBridgePaths as any)[optimismConfig.chain][optimismConfig.layer2Chain] += amountUsd;
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
