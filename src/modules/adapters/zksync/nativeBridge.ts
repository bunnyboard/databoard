import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import { AddressOne, AddressZero } from '../../../configs/constants';
import { ZksyncNativeBridgeProtocolConfig } from '../../../configs/protocols/zksync';
import ZksyncBridgeAbi from '../../../configs/abi/zksync/L1SharedBridge.json';
import { ContractCall } from '../../../services/blockchains/domains';
import ProtocolAdapter from '../protocol';

const Events = {
  // deposit from ethereum -> zksync
  BridgehubDepositInitiated: '0x8768405a01370685449c74c293804d6c9cc216d170acdbdba50b33ed4144447f',

  // withdraw from zksync -> ethereum
  WithdrawalFinalizedSharedBridge: '0x05518b128f0a9b11ddddebd5211a7fc2f4a689dab3a3e258d93eb13049983c3e',
};

export default class ZksyncNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.zksync';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const zksyncConfig = this.protocolConfig as ZksyncNativeBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [zksyncConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [zksyncConfig.layer2Chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [zksyncConfig.chain]: {
          [zksyncConfig.layer2Chain]: 0,
        },
        [zksyncConfig.layer2Chain]: {
          [zksyncConfig.chain]: 0,
        },
      },
    };

    if (zksyncConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      zksyncConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      zksyncConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      zksyncConfig.chain,
      options.endTime,
    );

    // zksync use AddressOne as native ETH
    const tokenAddresses = zksyncConfig.tokens.concat(AddressOne);
    const calls: Array<ContractCall> = tokenAddresses.map((address) => {
      return {
        abi: ZksyncBridgeAbi,
        target: zksyncConfig.shareBridge,
        method: 'chainBalance',
        params: [zksyncConfig.layer2ChainId, address],
      };
    });
    const getBalanceResults = await this.services.blockchain.evm.multicall({
      chain: zksyncConfig.chain,
      blockNumber: blockNumber,
      calls: calls,
    });
    for (let i = 0; i < tokenAddresses.length; i++) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: zksyncConfig.chain,
        address: tokenAddresses[i],
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const balanceUsd =
          formatBigNumberToNumber(getBalanceResults[i] ? getBalanceResults[i].toString() : '0', token.decimals) *
          tokenPriceUsd;

        if (balanceUsd > 0) {
          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                bridge: 0,
              },
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
        }
      }
    }

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: zksyncConfig.chain,
      address: zksyncConfig.shareBridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (
        log.topics[0] === Events.BridgehubDepositInitiated ||
        log.topics[0] === Events.WithdrawalFinalizedSharedBridge
      ) {
        const event: any = decodeEventLog({
          abi: ZksyncBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        const chainId = Number(event.args.chainId);
        const l1Token = await this.services.blockchain.evm.getTokenInfo({
          chain: zksyncConfig.chain,
          address: event.args.l1Token,
        });

        if (chainId === zksyncConfig.layer2ChainId && l1Token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: l1Token.chain,
            address: l1Token.address,
            timestamp: options.timestamp,
          });

          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), l1Token.decimals) * tokenPriceUsd;

          if (amountUsd > 0) {
            if (log.topics[0] === Events.BridgehubDepositInitiated) {
              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[zksyncConfig.chain][zksyncConfig.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[zksyncConfig.layer2Chain][zksyncConfig.chain] += amountUsd;
            }

            if (!protocolData.breakdown[l1Token.chain][l1Token.address]) {
              protocolData.breakdown[l1Token.chain][l1Token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridge: 0,
                },
              };
            }
            (protocolData.breakdown[l1Token.chain][l1Token.address].volumes.bridge as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
