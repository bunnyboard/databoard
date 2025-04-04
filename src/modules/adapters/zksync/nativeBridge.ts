import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { decodeAbiParameters, decodeEventLog } from 'viem';
import { AddressOne, AddressZero } from '../../../configs/constants';
import { ZksyncL1ContractUpgradeDay, ZksyncNativeBridgeProtocolConfig } from '../../../configs/protocols/zksync';
import ZksyncBridgeAbi from '../../../configs/abi/zksync/L1SharedBridge.json';
import L1NullifierAbi from '../../../configs/abi/zksync/L1Nullifier.json';
import L1NativeTokenVaultAbi from '../../../configs/abi/zksync/L1NativeTokenVault.json';
import L1AssetRouterAbi from '../../../configs/abi/zksync/L1AssetRouter.json';
import { ContractCall } from '../../../services/blockchains/domains';
import ProtocolAdapter from '../protocol';

const Events = {
  // deposit from ethereum -> zksync
  BridgehubDepositInitiated: '0x8768405a01370685449c74c293804d6c9cc216d170acdbdba50b33ed4144447f',
  BridgehubDepositBaseTokenInitiated: '0x0f87e1ea5eb1f034a6071ef630c174063e3d48756f853efaaf4292b929298240',

  // withdraw from zksync -> ethereum
  WithdrawalFinalizedSharedBridge: '0x05518b128f0a9b11ddddebd5211a7fc2f4a689dab3a3e258d93eb13049983c3e',
  DepositFinalizedAssetRouter: '0x44eb9a840094a49b3cd0a5205042598a1c08c4e87bafb5760bc2d8efa170c541',
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
    let l1NativeVault = '';
    let l1AssetRouter = '';
    let getBalanceResults: Array<any> = [];
    if (options.timestamp >= ZksyncL1ContractUpgradeDay) {
      const addresses = await this.services.blockchain.evm.multicall({
        chain: zksyncConfig.chain,
        calls: [
          {
            abi: L1NullifierAbi,
            target: zksyncConfig.shareBridge,
            method: 'l1NativeTokenVault',
            params: [],
          },
          {
            abi: L1NullifierAbi,
            target: zksyncConfig.shareBridge,
            method: 'l1AssetRouter',
            params: [],
          },
        ],
        blockNumber: blockNumber,
      });

      l1NativeVault = normalizeAddress(addresses[0]);
      l1AssetRouter = normalizeAddress(addresses[1]);

      const getAssetIdsCalls: Array<ContractCall> = tokenAddresses.map((address) => {
        return {
          abi: L1NativeTokenVaultAbi,
          target: l1NativeVault,
          method: 'assetId',
          params: [address],
        };
      });
      const getAssetIdsResults = await this.services.blockchain.evm.multicall({
        chain: zksyncConfig.chain,
        blockNumber: blockNumber,
        calls: getAssetIdsCalls,
      });

      const getAssetBalanceCalls: Array<ContractCall> = getAssetIdsResults.map((assetId: string) => {
        return {
          abi: L1NativeTokenVaultAbi,
          target: l1NativeVault,
          method: 'chainBalance',
          params: [zksyncConfig.layer2ChainId, assetId],
        };
      });
      getBalanceResults = await this.services.blockchain.evm.multicall({
        chain: zksyncConfig.chain,
        blockNumber: blockNumber,
        calls: getAssetBalanceCalls,
      });
    } else {
      const calls: Array<ContractCall> = tokenAddresses.map((address) => {
        return {
          abi: ZksyncBridgeAbi,
          target: zksyncConfig.shareBridge,
          method: 'chainBalance',
          params: [zksyncConfig.layer2ChainId, address],
        };
      });
      getBalanceResults = await this.services.blockchain.evm.multicall({
        chain: zksyncConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });
    }

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

    let logs: Array<any> = [];
    if (options.timestamp >= ZksyncL1ContractUpgradeDay) {
      logs = await this.services.blockchain.evm.getContractLogs({
        chain: zksyncConfig.chain,
        address: l1AssetRouter,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
    } else {
      logs = await this.services.blockchain.evm.getContractLogs({
        chain: zksyncConfig.chain,
        address: zksyncConfig.shareBridge,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
    }

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
      } else if (
        log.topics[0] === Events.BridgehubDepositBaseTokenInitiated ||
        log.topics[0] === Events.DepositFinalizedAssetRouter
      ) {
        const event: any = decodeEventLog({
          abi: L1AssetRouterAbi,
          topics: log.topics,
          data: log.data,
        });

        const chainId = Number(event.args.chainId);
        if (chainId !== zksyncConfig.layer2ChainId) {
          continue;
        }

        let token: null | Token = null;
        let tokenAmount = 0;

        if (log.topics[0] === Events.BridgehubDepositBaseTokenInitiated) {
          const tokenAddress = await this.services.blockchain.evm.readContract({
            chain: zksyncConfig.chain,
            abi: L1NativeTokenVaultAbi,
            target: l1NativeVault,
            method: 'tokenAddress',
            params: [event.args.assetId],
          });
          token = await this.services.blockchain.evm.getTokenInfo({
            chain: zksyncConfig.chain,
            address: tokenAddress,
          });

          if (token) {
            tokenAmount = formatBigNumberToNumber(event.args.amount.toString(), token.decimals);
          }
        } else if (log.topics[0] === Events.DepositFinalizedAssetRouter) {
          const params = decodeAbiParameters(
            [{ type: 'address' }, { type: 'address' }, { type: 'address' }, { type: 'uint256' }, { type: 'bytes' }],
            event.args.assetData,
          );

          token = await this.services.blockchain.evm.getTokenInfo({
            chain: zksyncConfig.chain,
            address: params[2],
          });

          if (token) {
            tokenAmount = formatBigNumberToNumber(params[3].toString(), token.decimals);
          }
        }

        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const amountUsd = tokenAmount * tokenPriceUsd;

          if (amountUsd > 0) {
            (protocolData.volumes.bridge as number) += amountUsd;
            if (log.topics[0] === Events.BridgehubDepositBaseTokenInitiated) {
              (protocolData.volumeBridgePaths as any)[zksyncConfig.chain][zksyncConfig.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumeBridgePaths as any)[zksyncConfig.layer2Chain][zksyncConfig.chain] += amountUsd;
            }

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridge: 0,
                },
              };
            }
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
