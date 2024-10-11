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
  ETHBridgeInitiated: '0x2849b43074093a05396b6f2a937dee8565b15a48a7b3d4bffb732a5017380af5',
  ERC20BridgeInitiated: '0x7ff126db8024424bbfd9826e8ab82ff59136289ea440b04b39a0df1b03b9cabf',
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
    for (const log of logs.filter((item) => item.topics[0] === Events.ETHBridgeInitiated)) {
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

        for (const log of logs.filter((item) => item.topics[0] === Events.ERC20BridgeInitiated)) {
          const event: any = decodeEventLog({
            abi: L1StandardBridgeAbi,
            topics: log.topics,
            data: log.data,
          });
          if (compareAddress(token.address, event.args.localToken)) {
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
