import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { BalancerDexConfig, BalancerProtocolConfig } from '../../../configs/protocols/balancer';
import { decodeEventLog } from 'viem';
import BalancerVaultAbi from '../../../configs/abi/balancer/Vault.json';
import BalancerVaultV3Abi from '../../../configs/abi/balancer/VaultV3.json';
import WeightPoolAbi from '../../../configs/abi/balancer/WeightedPool.json';
import StablePoolV3Abi from '../../../configs/abi/balancer/StablePoolV3.json';
import { formatBigNumberToNumber, getTimestamp, normalizeAddress } from '../../../lib/utils';
import logger from '../../../lib/logger';
import ProtocolExtendedAdapter from '../extended';
import envConfig from '../../../configs/envConfig';
import { PoolBalancer, PoolBalancerTypes } from '../../../types/domains/pool2';

const Events = {
  FlashLoan: '0x0d7d75e01ab95780d3cd1c8ec0dd6c2ce19e3a20427eec8bf53283b6fb8e95f0',
  PoolBalanceChanged: '0xe5ce249087ce04f05a957192435400fd97868dba0e6a4b4c049abf8af80dae78',
  Swap: '0x2170c741c41531aec20e7c107c24eecfdd15e69c9bb0a8dd37b1840b9e0b207b',
};

const V3Events = {
  LiquidityAdded: '0xa26a52d8d53702bba7f137907b8e1f99ff87f6d450144270ca25e72481cca871',
  LiquidityRemoved: '0xfbe5b0d79fb94f1e81c0a92bf86ae9d3a19e9d1bf6202c0d3e75120f65d5d8a5',
  Swap: '0x0874b2d545cb271cdbda4e093020c452328b24af12382ed62c4d00f5c26709db',
};

export default class BalancerAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.balancer';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getPoolSwapFeePercentageV2(dexConfig: BalancerDexConfig, poolId: string): Promise<number> {
    const pool: PoolBalancer | undefined = await this.storages.database.find({
      collection: envConfig.mongodb.collections.datasyncPoolBalancer.name,
      query: {
        chain: dexConfig.chain,
        vault: normalizeAddress(dexConfig.vault),
        poolId: poolId,
      },
    });
    if (pool) {
      return pool.feeRate;
    }

    let feePercentage = 0;
    const getPoolResult = await this.services.blockchain.evm.readContract({
      chain: dexConfig.chain,
      abi: BalancerVaultAbi,
      target: dexConfig.vault,
      method: 'getPool',
      params: [poolId],
    });
    if (getPoolResult && getPoolResult[0]) {
      const getSwapFeePercentage = await this.services.blockchain.evm.readContract({
        chain: dexConfig.chain,
        abi: WeightPoolAbi,
        target: getPoolResult[0],
        method: 'getSwapFeePercentage',
        params: [],
      });

      feePercentage = formatBigNumberToNumber(getSwapFeePercentage ? getSwapFeePercentage.toString() : '0', 18);

      const getPoolTokens = await this.services.blockchain.evm.readContract({
        chain: dexConfig.chain,
        abi: BalancerVaultAbi,
        target: dexConfig.vault,
        method: 'getPoolTokens',
        params: [poolId],
      });
      if (getPoolTokens) {
        const pool: PoolBalancer = {
          chain: dexConfig.chain,
          type: dexConfig.version,
          vault: normalizeAddress(dexConfig.vault),
          poolId: poolId,
          address: normalizeAddress(getPoolResult[0]),
          feeRate: feePercentage,
          tokens: [],
        };
        for (const address of getPoolTokens[0]) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: dexConfig.chain,
            address: address,
          });
          if (token) {
            pool.tokens.push(token);
          }
        }
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.datasyncPoolBalancer.name,
          keys: {
            chain: dexConfig.chain,
            vault: normalizeAddress(dexConfig.vault),
            poolId: poolId,
          },
          updates: {
            ...pool,
          },
          upsert: true,
        });
      }
    }

    return feePercentage;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        swap: 0,
        flashloan: 0,
      },
      breakdownChains: {},
    };

    const balancerConfig = this.protocolConfig as BalancerProtocolConfig;
    for (const dexConfig of balancerConfig.dexes) {
      if (dexConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData.breakdownChains as any)[dexConfig.chain]) {
        (protocolData.breakdownChains as any)[dexConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          totalSupplied: 0,
          volumes: {
            deposit: 0,
            withdraw: 0,
            swap: 0,
            flashloan: 0,
          },
        };
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.endTime,
      );

      const tokens: Array<Token> = [];
      for (const address of dexConfig.tokens) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: dexConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: dexConfig.chain,
        ownerAddress: dexConfig.vault,
        tokens: tokens,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;
      (protocolData.totalSupplied as number) += getBalanceResult.totalBalanceUsd;

      for (const tokenBalance of Object.values(getBalanceResult.tokenBalanceUsds)) {
        (protocolData.breakdownChains as any)[dexConfig.chain].totalAssetDeposited += tokenBalance.balanceUsd;
        (protocolData.breakdownChains as any)[dexConfig.chain].totalValueLocked += tokenBalance.balanceUsd;
        (protocolData.breakdownChains as any)[dexConfig.chain].totalSupplied += tokenBalance.balanceUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: dexConfig.chain,
        address: dexConfig.vault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      if (dexConfig.version === PoolBalancerTypes.balv2) {
        for (const log of logs) {
          if (Object.values(Events).includes(log.topics[0])) {
            const event: any = decodeEventLog({
              abi: BalancerVaultAbi,
              topics: log.topics,
              data: log.data,
            });

            switch (log.topics[0]) {
              case Events.FlashLoan: {
                const token = await this.services.blockchain.evm.getTokenInfo({
                  chain: dexConfig.chain,
                  address: event.args.token,
                });
                if (token) {
                  const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: token.chain,
                    address: token.address,
                    timestamp: options.timestamp,
                  });
                  const volumeUsd =
                    formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;
                  const feeUsd =
                    formatBigNumberToNumber(event.args.feeAmount.toString(), token.decimals) * tokenPriceUsd;

                  protocolData.totalFees += feeUsd;
                  protocolData.protocolRevenue += feeUsd;
                  (protocolData.volumes.flashloan as number) += volumeUsd;

                  (protocolData.breakdownChains as any)[dexConfig.chain].totalFees += feeUsd;
                  (protocolData.breakdownChains as any)[dexConfig.chain].protocolRevenue += feeUsd;
                  (protocolData.breakdownChains as any)[dexConfig.chain].volumes.flashloan += volumeUsd;
                }
                break;
              }
              case Events.Swap: {
                let volumeUsd = 0;
                let swapFeeUsd = 0;

                // we count volume on these tokens we have already known in balancer vaults
                // these tokens are configured at BalancerConfigs

                const [tokenIn, tokenOut] = await Promise.all([
                  this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: event.args.tokenIn,
                  }),
                  this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: event.args.tokenOut,
                  }),
                ]);

                if (tokenIn && tokenOut) {
                  let tokenInPriceUsd = 0;
                  let tokenOutPriceUsd = 0;

                  const feePercentage = await this.getPoolSwapFeePercentageV2(dexConfig, event.args.poolId);

                  tokenInPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: tokenIn.chain,
                    address: tokenIn.address,
                    timestamp: options.timestamp,
                    disableWarning: true,
                  });
                  if (tokenInPriceUsd > 0) {
                    volumeUsd =
                      formatBigNumberToNumber(event.args.amountIn.toString(), tokenIn.decimals) * tokenInPriceUsd;
                    swapFeeUsd = volumeUsd * feePercentage;
                  } else {
                    tokenOutPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                      chain: tokenOut.chain,
                      address: tokenOut.address,
                      timestamp: options.timestamp,
                      disableWarning: true,
                    });
                    // amountOut is deducted by fees
                    const amountOut =
                      formatBigNumberToNumber(event.args.amountOut.toString(), tokenOut.decimals) * tokenOutPriceUsd;
                    volumeUsd = amountOut / (1 - feePercentage);
                    swapFeeUsd = volumeUsd * feePercentage;
                  }

                  if (tokenInPriceUsd === 0 && tokenOutPriceUsd === 0) {
                    // log the unknown tokens swap
                    logger.warn('failed to get token price for swap', {
                      service: this.name,
                      protocol: this.protocolConfig.protocol,
                      chain: dexConfig.chain,
                      txn: log.transactionHash,
                      logIndex: log.logIndex,
                    });
                  }
                }

                const protocolRevenue = swapFeeUsd * dexConfig.protocolFeeRate;

                protocolData.totalFees += swapFeeUsd;
                protocolData.supplySideRevenue += swapFeeUsd - protocolRevenue;
                protocolData.protocolRevenue += protocolRevenue;
                (protocolData.volumes.swap as number) += volumeUsd;

                (protocolData.breakdownChains as any)[dexConfig.chain].totalFees += swapFeeUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].supplySideRevenue +=
                  swapFeeUsd - protocolRevenue;
                (protocolData.breakdownChains as any)[dexConfig.chain].protocolRevenue += protocolRevenue;
                (protocolData.breakdownChains as any)[dexConfig.chain].volumes.swap += volumeUsd;

                break;
              }
              case Events.PoolBalanceChanged: {
                const tokens: Array<Token | null> = [];
                for (const address of event.args.tokens) {
                  const token = await this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: address,
                  });
                  tokens.push(token);
                }

                for (let i = 0; i < tokens.length; i++) {
                  const token = tokens[i];
                  if (token) {
                    const amount = formatBigNumberToNumber(
                      event.args.deltas[i] ? event.args.deltas[i] : '0',
                      token.decimals,
                    );
                    if (amount !== 0) {
                      const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                        chain: token.chain,
                        address: token.address,
                        timestamp: options.timestamp,
                      });
                      const amountUsd = amount * tokenPriceUsd;

                      if (amountUsd > 0) {
                        (protocolData.volumes.deposit as number) += Math.abs(amountUsd);
                        (protocolData.breakdownChains as any)[dexConfig.chain].volumes.deposit += Math.abs(amountUsd);
                      } else if (amountUsd < 0) {
                        (protocolData.volumes.withdraw as number) += Math.abs(amountUsd);
                        (protocolData.breakdownChains as any)[dexConfig.chain].volumes.withdraw += Math.abs(amountUsd);
                      }
                    }
                  }
                }

                break;
              }
            }
          }
        }
      } else if (dexConfig.version === PoolBalancerTypes.balv3) {
        for (const log of logs) {
          if (Object.values(V3Events).includes(log.topics[0])) {
            const event: any = decodeEventLog({
              abi: BalancerVaultV3Abi,
              topics: log.topics,
              data: log.data,
            });

            switch (log.topics[0]) {
              case V3Events.Swap: {
                let volumeUsd = 0;
                let swapFeeUsd = 0;

                // fee percentage
                const feePercentage = formatBigNumberToNumber(event.args.swapFeePercentage.toString(), 18);

                const [tokenIn, tokenOut] = await Promise.all([
                  this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: event.args.tokenIn,
                  }),
                  this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: event.args.tokenOut,
                  }),
                ]);

                if (tokenIn && tokenOut) {
                  let tokenInPriceUsd = 0;
                  let tokenOutPriceUsd = 0;

                  tokenInPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: tokenIn.chain,
                    address: tokenIn.address,
                    timestamp: options.timestamp,
                    disableWarning: true,
                  });
                  if (tokenInPriceUsd > 0) {
                    volumeUsd =
                      formatBigNumberToNumber(event.args.amountIn.toString(), tokenIn.decimals) * tokenInPriceUsd;
                    swapFeeUsd = volumeUsd * feePercentage;
                  } else {
                    tokenOutPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                      chain: tokenOut.chain,
                      address: tokenOut.address,
                      timestamp: options.timestamp,
                      disableWarning: true,
                    });
                    // amountOut is deducted by fees
                    const amountOut =
                      formatBigNumberToNumber(event.args.amountOut.toString(), tokenOut.decimals) * tokenOutPriceUsd;
                    volumeUsd = amountOut / (1 - feePercentage);
                    swapFeeUsd = volumeUsd * feePercentage;
                  }

                  if (tokenInPriceUsd === 0 && tokenOutPriceUsd == 0) {
                    // log the unknown tokens swap
                    logger.warn('failed to get token price for swap', {
                      service: this.name,
                      protocol: this.protocolConfig.protocol,
                      chain: dexConfig.chain,
                      txn: log.transactionHash,
                      logIndex: log.logIndex,
                    });
                  }
                }

                const protocolRevenue = swapFeeUsd * dexConfig.protocolFeeRate;

                protocolData.totalFees += swapFeeUsd;
                protocolData.supplySideRevenue += swapFeeUsd - protocolRevenue;
                protocolData.protocolRevenue += protocolRevenue;
                (protocolData.volumes.swap as number) += volumeUsd;

                (protocolData.breakdownChains as any)[dexConfig.chain].totalFees += swapFeeUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].supplySideRevenue +=
                  swapFeeUsd - protocolRevenue;
                (protocolData.breakdownChains as any)[dexConfig.chain].protocolRevenue += protocolRevenue;
                (protocolData.breakdownChains as any)[dexConfig.chain].volumes.swap += volumeUsd;

                break;
              }
              case V3Events.LiquidityAdded: {
                const tokenAddresses: Array<string> = await this.services.blockchain.evm.readContract({
                  chain: dexConfig.chain,
                  abi: StablePoolV3Abi,
                  target: event.args.pool,
                  method: 'getTokens',
                  params: [],
                });

                let amountUsd = 0;
                for (let i = 0; i < event.args.amountsAddedRaw.length; i++) {
                  const token = await this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: tokenAddresses[i],
                  });
                  if (token) {
                    const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                      chain: token.chain,
                      address: token.address,
                      timestamp: options.timestamp,
                    });
                    amountUsd +=
                      formatBigNumberToNumber(event.args.amountsAddedRaw[i].toString(), token.decimals) * tokenPriceUsd;
                  }
                }

                (protocolData.volumes.deposit as number) += amountUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].volumes.deposit += amountUsd;

                break;
              }
              case V3Events.LiquidityRemoved: {
                const tokenAddresses: Array<string> = await this.services.blockchain.evm.readContract({
                  chain: dexConfig.chain,
                  abi: StablePoolV3Abi,
                  target: event.args.pool,
                  method: 'getTokens',
                  params: [],
                });

                let amountUsd = 0;
                for (let i = 0; i < event.args.amountsRemovedRaw.length; i++) {
                  const token = await this.services.blockchain.evm.getTokenInfo({
                    chain: dexConfig.chain,
                    address: tokenAddresses[i],
                  });
                  if (token) {
                    const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                      chain: token.chain,
                      address: token.address,
                      timestamp: options.timestamp,
                    });
                    amountUsd +=
                      formatBigNumberToNumber(event.args.amountsRemovedRaw[i].toString(), token.decimals) *
                      tokenPriceUsd;
                  }
                }

                (protocolData.volumes.withdraw as number) += amountUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].volumes.withdraw += amountUsd;

                break;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const period = 3600 * 24;
    const current = getTimestamp();
    const fromTime = options.timestamp ? options.timestamp : current - period;
    const toTime = options.timestamp ? options.timestamp + period : current;

    if (options.output === 'json') {
      console.log(
        JSON.stringify(
          await this.getProtocolData({
            timestamp: fromTime,
            beginTime: fromTime,
            endTime: toTime,
          }),
        ),
      );
    } else {
      console.log(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
  }
}
