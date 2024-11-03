import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import StargatePoolV1Abi from '../../../configs/abi/stargate/PoolV1.json';
import StargatePoolV2Abi from '../../../configs/abi/stargate/PoolV2.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { StargateChainIds, StargateProtocolConfig } from '../../../configs/protocols/stargate';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { Address, decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import { ContractCall } from '../../../services/blockchains/domains';

// v1
const EventMint = '0xb4c03061fb5b7fed76389d5af8f2e0ddb09f8c70d1333abbb62582835e10accb';
const EventBurn = '0x49995e5dd6158cf69ad3e9777c46755a1a826a446c6416992167462dad033b2a';
const EventSwap = '0x34660fc8af304464529f48a778e03d03e4d34bcd5f9b6f0cfbf3cd238c642f7f';

// v2
const EventDeposited = '0x8752a472e571a816aea92eec8dae9baf628e840f4929fbcc2d155e6233ff68a7';
const EventRedeemed = '0x27d4634c833b7622a0acddbf7f746183625f105945e95c723ad1d5a9f2a0b6fc';
const EventOFTSent = '0x85496b760a4b7f8d66384b9df21b381f5d1b1e79f229a47aaf4c232edc2fe59a';

export default class StargateAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.stargate';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    const stargateConfig = this.protocolConfig as StargateProtocolConfig;
    for (const config of stargateConfig.bridgeConfigs) {
      if (config.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[config.chain]) {
        protocolData.breakdown[config.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[config.chain]) {
        (protocolData.volumeBridgePaths as any)[config.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, options.endTime);

      const erc20Pools = config.pools.filter((poolConfig) => !compareAddress(poolConfig.token, AddressZero));
      const calls: Array<ContractCall> = erc20Pools.map((poolConfig) => {
        return {
          abi: Erc20Abi,
          target: poolConfig.token,
          method: 'balanceOf',
          params: [poolConfig.address],
        };
      });
      const results = await this.services.blockchain.evm.multicall({
        chain: config.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      if (results) {
        for (let i = 0; i < erc20Pools.length; i++) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: config.chain,
            address: erc20Pools[i].token,
          });
          if (token && results[i] && results[i].toString() !== '0') {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const balanceUsd = formatBigNumberToNumber(results[i].toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalAssetDeposited += balanceUsd;
            protocolData.totalValueLocked += balanceUsd;
            (protocolData.totalSupplied as number) += balanceUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                volumes: {
                  deposit: 0,
                  withdraw: 0,
                  bridge: 0,
                },
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
          }
        }
      }

      const client = this.services.blockchain.evm.getPublicClient(config.chain);
      const nativePools = config.pools.filter((poolConfig) => compareAddress(poolConfig.token, AddressZero));
      for (const nativePool of nativePools) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: config.chain,
          address: nativePool.token,
          timestamp: options.timestamp,
        });

        // on v1, count native balance of native vault contract
        // on v2, count native balance of pool contract
        const nativebalance = await client.getBalance({
          address: config.version === 1 ? (nativePool.nativeVault as Address) : (nativePool.address as Address),
          blockNumber: BigInt(blockNumber),
        });
        const balanceUsd = formatBigNumberToNumber(nativebalance ? nativebalance.toString() : '0', 18) * tokenPriceUsd;

        protocolData.totalAssetDeposited += balanceUsd;
        protocolData.totalValueLocked += balanceUsd;
        (protocolData.totalSupplied as number) += balanceUsd;

        if (!protocolData.breakdown[config.chain][nativePool.token]) {
          protocolData.breakdown[config.chain][nativePool.token] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              bridge: 0,
            },
          };
        }
        protocolData.breakdown[config.chain][nativePool.token].totalAssetDeposited += balanceUsd;
        protocolData.breakdown[config.chain][nativePool.token].totalValueLocked += balanceUsd;
        (protocolData.breakdown[config.chain][nativePool.token].totalSupplied as number) += balanceUsd;
      }

      for (const poolConfig of config.pools) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: config.chain,
          address: poolConfig.token,
        });
        if (token) {
          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                bridge: 0,
              },
            };
          }

          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: config.chain,
            address: poolConfig.token,
            timestamp: options.timestamp,
          });

          const logs = await this.services.blockchain.evm.getContractLogs({
            chain: config.chain,
            address: poolConfig.address,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of logs) {
            const signature = log.topics[0];

            if (config.version === 1) {
              if (signature === EventMint || signature === EventBurn || signature === EventSwap) {
                const event: any = decodeEventLog({
                  abi: StargatePoolV1Abi,
                  topics: log.topics,
                  data: log.data,
                });
                switch (signature) {
                  case EventSwap: {
                    const chainId = Number(event.args.chainId);
                    let destChainName: string | null = null;
                    for (const [stargateChainId, chainName] of Object.entries(StargateChainIds)) {
                      if (chainId.toString() === stargateChainId) {
                        destChainName = chainName;
                      }
                    }

                    if (!destChainName) {
                      continue;
                    }

                    const volumeAmountUsd =
                      formatBigNumberToNumber(event.args.amountSD.toString(), token.decimals) * tokenPriceUsd;
                    const protocolFeeUsd =
                      formatBigNumberToNumber(event.args.protocolFee.toString(), token.decimals) * tokenPriceUsd;
                    const eqFeeUsd =
                      formatBigNumberToNumber(event.args.eqFee.toString(), token.decimals) * tokenPriceUsd;
                    const lpFeeUsd =
                      formatBigNumberToNumber(event.args.lpFee.toString(), token.decimals) * tokenPriceUsd;

                    protocolData.totalFees += protocolFeeUsd + lpFeeUsd + eqFeeUsd;
                    protocolData.supplySideRevenue += lpFeeUsd + eqFeeUsd;
                    protocolData.protocolRevenue += protocolFeeUsd;
                    protocolData.breakdown[token.chain][token.address].totalFees +=
                      protocolFeeUsd + lpFeeUsd + eqFeeUsd;
                    protocolData.breakdown[token.chain][token.address].supplySideRevenue += lpFeeUsd + eqFeeUsd;
                    protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;

                    (protocolData.volumes.bridge as number) += volumeAmountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += volumeAmountUsd;

                    if (!(protocolData.volumeBridgePaths as any)[config.chain][destChainName]) {
                      (protocolData.volumeBridgePaths as any)[config.chain][destChainName] = 0;
                    }
                    (protocolData.volumeBridgePaths as any)[config.chain][destChainName] += volumeAmountUsd;

                    break;
                  }
                  case EventMint:
                  case EventBurn: {
                    const volumeAmountUsd =
                      formatBigNumberToNumber(event.args.amountSD.toString(), token.decimals) * tokenPriceUsd;

                    if (signature === EventMint) {
                      (protocolData.volumes.deposit as number) += volumeAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += volumeAmountUsd;

                      const mintFeeUsd =
                        formatBigNumberToNumber(event.args.mintFeeAmountSD.toString(), token.decimals) * tokenPriceUsd;

                      protocolData.totalFees += mintFeeUsd;
                      protocolData.protocolRevenue += mintFeeUsd;
                      protocolData.breakdown[token.chain][token.address].totalFees = mintFeeUsd;
                      protocolData.breakdown[token.chain][token.address].protocolRevenue = mintFeeUsd;
                    } else {
                      (protocolData.volumes.withdraw as number) += volumeAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) +=
                        volumeAmountUsd;
                    }

                    break;
                  }
                }
              }
            } else if (config.version === 2) {
              if (signature === EventDeposited || signature === EventRedeemed || signature === EventOFTSent) {
                const event: any = decodeEventLog({
                  abi: StargatePoolV2Abi,
                  topics: log.topics,
                  data: log.data,
                });
                switch (signature) {
                  case EventOFTSent: {
                    const chainId = Number(event.args.dstEid);
                    let destChainName: string | null = null;
                    for (const [stargateChainId, chainName] of Object.entries(StargateChainIds)) {
                      if (chainId.toString() === stargateChainId) {
                        destChainName = chainName;
                      }
                    }

                    if (!destChainName) {
                      continue;
                    }

                    const amountSentLD = formatBigNumberToNumber(event.args.amountSentLD.toString(), token.decimals);
                    const amountReceivedLD = formatBigNumberToNumber(
                      event.args.amountReceivedLD.toString(),
                      token.decimals,
                    );

                    const volumeAmountUsd = amountSentLD * tokenPriceUsd;
                    const protocolFeeUsd = (amountSentLD - amountReceivedLD) * tokenPriceUsd;

                    protocolData.totalFees += protocolFeeUsd;
                    protocolData.protocolRevenue += protocolFeeUsd;
                    protocolData.breakdown[token.chain][token.address].totalFees += protocolFeeUsd;
                    protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;

                    (protocolData.volumes.bridge as number) += volumeAmountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += volumeAmountUsd;

                    if (!(protocolData.volumeBridgePaths as any)[config.chain][destChainName]) {
                      (protocolData.volumeBridgePaths as any)[config.chain][destChainName] = 0;
                    }
                    (protocolData.volumeBridgePaths as any)[config.chain][destChainName] += volumeAmountUsd;

                    break;
                  }
                  case EventDeposited:
                  case EventRedeemed: {
                    const volumeAmountUsd =
                      formatBigNumberToNumber(event.args.amountLD.toString(), token.decimals) * tokenPriceUsd;
                    if (signature === EventDeposited) {
                      (protocolData.volumes.deposit as number) += volumeAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += volumeAmountUsd;
                    } else {
                      (protocolData.volumes.withdraw as number) += volumeAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) +=
                        volumeAmountUsd;
                    }

                    break;
                  }
                }
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
