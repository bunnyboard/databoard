import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetDexDataDataOptions, GetDexDataResult, Uniswapv2Events, Uniswapv3Events } from './types';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { CustomQueryChainLogsBlockRange, DefaultQueryChainLogsBlockRange, TokenDexBase } from '../../../configs';
import { ContractCall } from '../../../services/blockchains/domains';
import logger from '../../../lib/logger';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import UniswapIndexer from './indexer';
import envConfig from '../../../configs/envConfig';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import { Address, decodeEventLog } from 'viem';
import { AddressMulticall3 } from '../../../configs/constants';
import BigNumber from 'bignumber.js';
import { UniswapDexConfig } from '../../../configs/protocols/uniswap';

// query data of 200 pools per time
const callSize = 200;

// we count pool have base assets (ETH, USDT, USDC) usd value > $1000
const MaliciousPoolBaseAssetBalance = 1000;

export default class UniswapCore extends UniswapIndexer {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getDexData(options: GetDexDataDataOptions): Promise<GetDexDataResult | null> {
    const result: GetDexDataResult = {
      totalLiquidityUsd: 0,
      totalSwapFeeUsdForLps: 0,
      totalSwapFeeUsdForProtocol: 0,
      volumeAddLiquidityUsd: 0,
      volumeRemoveLiquidityUsd: 0,
      volumeSwapUsd: 0,
    };

    for (const dexConfig of options.chainConfig.dexes) {
      if (dexConfig.birthday <= options.timestamp) {
        if (dexConfig.version === Pool2Types.univ2) {
          const balanceUsd = await this.getDexBalanceV2(dexConfig, options.timestamp, options.blockNumber);
          result.totalLiquidityUsd += balanceUsd;
        } else if (dexConfig.version === Pool2Types.univ3) {
          const balanceUsd = await this.getDexBalanceV3(dexConfig, options.timestamp, options.blockNumber);
          result.totalLiquidityUsd += balanceUsd;
        }
      }
    }

    // custom config for every chain if possible
    const blockRange = CustomQueryChainLogsBlockRange[options.chainConfig.chain]
      ? CustomQueryChainLogsBlockRange[options.chainConfig.chain]
      : DefaultQueryChainLogsBlockRange;

    // caching for logging
    let lastProgressPercentage = 0;
    let totalLogsCount = 0;

    let startBlock = options.beginBlock;
    while (startBlock <= options.endBlock) {
      const logs = await this.getChainLogs({
        chain: options.chainConfig.chain,
        fromBlock: startBlock,
        toBlock: startBlock + blockRange,
      });

      const parseResultV2 = await this.parseDexV2Events(options, logs);
      result.volumeSwapUsd += parseResultV2.volumeSwapUsd;
      result.volumeAddLiquidityUsd += parseResultV2.volumeAddLiquidityUsd;
      result.volumeRemoveLiquidityUsd += parseResultV2.volumeRemoveLiquidityUsd;
      result.totalSwapFeeUsdForLps += parseResultV2.totalSwapFeeUsdForLps;
      result.totalSwapFeeUsdForProtocol += parseResultV2.totalSwapFeeUsdForProtocol;

      const parseResultV3 = await this.parseDexV3Events(options, logs);
      result.volumeSwapUsd += parseResultV3.volumeSwapUsd;
      result.volumeAddLiquidityUsd += parseResultV3.volumeAddLiquidityUsd;
      result.volumeRemoveLiquidityUsd += parseResultV3.volumeRemoveLiquidityUsd;
      result.totalSwapFeeUsdForLps += parseResultV3.totalSwapFeeUsdForLps;
      result.totalSwapFeeUsdForProtocol += parseResultV3.totalSwapFeeUsdForProtocol;

      totalLogsCount += logs.length;
      const processBlocks = startBlock - options.beginBlock;
      const progress = (processBlocks / (options.endBlock - options.beginBlock)) * 100;

      // less logs
      if (progress - lastProgressPercentage >= 5) {
        logger.debug('processing univ2 dex logs', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          chain: options.chainConfig.chain,
          blocks: `${startBlock}->${options.endBlock}`,
          progress: `${progress.toFixed(2)}%`,
        });
        lastProgressPercentage = progress;
      }

      startBlock += blockRange + 1;
    }

    return result;
  }

  // helpers
  protected helperGetBaseTokenAddress(pool2: Pool2): string | null {
    for (const whitelistBaseToken of TokenDexBase[pool2.chain]) {
      if (compareAddress(whitelistBaseToken, pool2.token0.address)) {
        return pool2.token0.address;
      } else if (compareAddress(whitelistBaseToken, pool2.token1.address)) {
        return pool2.token1.address;
      }
    }

    return null;
  }

  protected helperGetIsBlacklistPool(pool2: Pool2, dexConfig: UniswapDexConfig): boolean {
    if (dexConfig.blacklistPools) {
      for (const blacklistPool of dexConfig.blacklistPools) {
        if (compareAddress(blacklistPool, pool2.address)) {
          return true;
        }
      }
    }

    return false;
  }

  protected async parseDexV2Events(options: GetDexDataDataOptions, logs: Array<any>): Promise<GetDexDataResult> {
    const result: GetDexDataResult = {
      totalLiquidityUsd: 0,
      totalSwapFeeUsdForLps: 0,
      totalSwapFeeUsdForProtocol: 0,
      volumeAddLiquidityUsd: 0,
      volumeRemoveLiquidityUsd: 0,
      volumeSwapUsd: 0,
    };

    for (const log of logs) {
      const signature = log.topics[0];

      if (
        // v2 pair events
        signature === Uniswapv2Events.Swap ||
        signature === Uniswapv2Events.Mint ||
        signature === Uniswapv2Events.Burn
      ) {
        const pool2: Pool2 | undefined = await this.storages.database.find({
          collection: envConfig.mongodb.collections.metadataPool2.name,
          query: {
            chain: options.chainConfig.chain,
            address: normalizeAddress(log.address),
          },
        });

        if (pool2) {
          // make sure the address is the pool of this dex config
          const dexConfig = options.chainConfig.dexes.filter((dexConfig) =>
            compareAddress(dexConfig.factory, pool2.factory),
          )[0];
          if (dexConfig) {
            // v2 events
            const event: any = decodeEventLog({
              abi: UniswapV2PairAbi,
              topics: log.topics,
              data: log.data,
            });

            const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
            if (baseTokenAddress) {
              const baseTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: options.chainConfig.chain,
                address: baseTokenAddress,
                timestamp: options.timestamp,
              });

              if (signature === Uniswapv2Events.Swap) {
                // to avoid wrong swap amount, we count only base token amount
                // if swap from base token, we count the amountId
                // otherwise we count the amountOut
                const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), pool2.token0.decimals);
                const amount0Out = formatBigNumberToNumber(event.args.amount0Out.toString(), pool2.token0.decimals);
                const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), pool2.token1.decimals);
                const amount1Out = formatBigNumberToNumber(event.args.amount1Out.toString(), pool2.token1.decimals);

                let volumeUsd = 0;
                if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                  if (amount0In > 0) {
                    volumeUsd = amount0In * baseTokenPriceUsd;
                  } else if (amount0Out > 0) {
                    // amountOut have already deducted fees
                    volumeUsd = (amount0Out * baseTokenPriceUsd) / (1 - pool2.feeRate);
                  }
                } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                  if (amount1In > 0) {
                    volumeUsd = amount1In * baseTokenPriceUsd;
                  } else if (amount1Out > 0) {
                    // amountOut have already deducted fees
                    volumeUsd = (amount1Out * baseTokenPriceUsd) / (1 - pool2.feeRate);
                  }
                }

                // cal fees
                const feeRateLp = dexConfig.feeRateForLiquidityProviders
                  ? dexConfig.feeRateForLiquidityProviders
                  : pool2.feeRate
                    ? pool2.feeRate
                    : 0.003; // default 0.3%
                const feeRateProtocol = dexConfig.feeRateForProtocol ? dexConfig.feeRateForProtocol : 0;
                const feeUsdForLp = volumeUsd * feeRateLp;
                const feeUsdForProtocol = volumeUsd * feeRateProtocol;

                result.volumeSwapUsd += volumeUsd;
                result.totalSwapFeeUsdForLps += feeUsdForLp;
                result.totalSwapFeeUsdForProtocol += feeUsdForProtocol;
              } else {
                const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
                const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

                let amountUsd = 0;
                if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                  amountUsd = amount0 * baseTokenPriceUsd;
                } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                  amountUsd = amount1 * baseTokenPriceUsd;
                }

                if (signature === Uniswapv2Events.Mint) {
                  result.volumeAddLiquidityUsd += amountUsd;
                } else if (signature === Uniswapv2Events.Burn) {
                  result.volumeRemoveLiquidityUsd += amountUsd;
                }
              }
            }
          }
        }
      }
    }

    return result;
  }

  protected async parseDexV3Events(options: GetDexDataDataOptions, logs: Array<any>): Promise<GetDexDataResult> {
    const result: GetDexDataResult = {
      totalLiquidityUsd: 0,
      totalSwapFeeUsdForLps: 0,
      totalSwapFeeUsdForProtocol: 0,
      volumeAddLiquidityUsd: 0,
      volumeRemoveLiquidityUsd: 0,
      volumeSwapUsd: 0,
    };

    for (const log of logs) {
      const signature = log.topics[0];

      if (
        // v3 pair events
        signature === Uniswapv3Events.Swap ||
        signature === Uniswapv3Events.Mint ||
        signature === Uniswapv3Events.Burn
      ) {
        const pool2: Pool2 | undefined = await this.storages.database.find({
          collection: envConfig.mongodb.collections.metadataPool2.name,
          query: {
            chain: options.chainConfig.chain,
            address: normalizeAddress(log.address),
          },
        });

        if (pool2) {
          // make sure the address is the pool of this dex config
          const dexConfig = options.chainConfig.dexes.filter((dexConfig) =>
            compareAddress(dexConfig.factory, pool2.factory),
          )[0];
          if (dexConfig) {
            // v3 events
            const event: any = decodeEventLog({
              abi: UniswapV3PoolAbi,
              topics: log.topics,
              data: log.data,
            });

            const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
            if (baseTokenAddress) {
              const baseTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: options.chainConfig.chain,
                address: baseTokenAddress,
                timestamp: options.timestamp,
              });

              if (signature === Uniswapv3Events.Swap) {
                const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
                const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

                let volumeUsd = 0;
                if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                  if (amount0 > 0) {
                    // swap token0 for token1
                    volumeUsd = amount0 * baseTokenPriceUsd;
                  } else if (amount0 < 0) {
                    // swap token1 for token0
                    volumeUsd = (Math.abs(amount0) * baseTokenPriceUsd) / (1 - pool2.feeRate);
                  }
                } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                  if (amount1 > 0) {
                    // swap token1 for token0
                    volumeUsd = amount1 * baseTokenPriceUsd;
                  } else if (amount1 < 0) {
                    // swap token0 for token1
                    volumeUsd = (Math.abs(amount1) * baseTokenPriceUsd) / (1 - pool2.feeRate);
                  }
                }

                const totalSwapFees = volumeUsd * pool2.feeRate;
                const feeRateProtocol = dexConfig.feeRateForProtocol ? dexConfig.feeRateForProtocol : 0;
                const feeRateForLps = 1 - feeRateProtocol;

                result.volumeSwapUsd += volumeUsd;
                result.totalSwapFeeUsdForLps += totalSwapFees * feeRateForLps;
                result.totalSwapFeeUsdForProtocol += totalSwapFees * feeRateProtocol;
              } else {
                const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
                const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

                let amountUsd = 0;
                if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                  amountUsd = amount0 * baseTokenPriceUsd;
                } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                  amountUsd = amount1 * baseTokenPriceUsd;
                }

                if (signature === Uniswapv3Events.Mint) {
                  result.volumeAddLiquidityUsd += amountUsd;
                } else if (signature === Uniswapv3Events.Burn) {
                  result.volumeRemoveLiquidityUsd += amountUsd;
                }
              }
            }
          }
        }
      }
    }

    return result;
  }

  protected async getDexBalanceV2(
    dexConfig: UniswapDexConfig,
    timestamp: number,
    blockNumber: number,
  ): Promise<number> {
    let totalBalanceUsd = 0;

    if (dexConfig.version === Pool2Types.univ2) {
      const client = await this.services.blockchain.evm.getPublicClient(dexConfig.chain);

      // cahing
      const cachingProcessedPools: { [key: string]: boolean } = {};

      let poolIndex = 0;
      while (true) {
        const poolConfigs: Array<Pool2> = await this.storages.database.query({
          collection: envConfig.mongodb.collections.metadataPool2.name,
          query: {
            chain: dexConfig.chain,
            factory: normalizeAddress(dexConfig.factory),
          },
          options: {
            limit: callSize,
            skip: poolIndex * callSize,
            order: { address: 1 },
          },
        });

        if (poolConfigs.length === 0) {
          break;
        }

        const balanceCalls: Array<ContractCall> = [];
        for (const pool2 of poolConfigs) {
          balanceCalls.push({
            abi: Erc20Abi,
            target: pool2.token0.address,
            method: 'balanceOf',
            params: [pool2.address],
          });
          balanceCalls.push({
            abi: Erc20Abi,
            target: pool2.token1.address,
            method: 'balanceOf',
            params: [pool2.address],
          });
        }

        // query balances
        const contracts = balanceCalls.map((call) => {
          return {
            address: call.target as Address,
            abi: call.abi,
            functionName: call.method,
            args: call.params,
          } as const;
        });
        const callResults: Array<any> = await client.multicall({
          multicallAddress: AddressMulticall3,
          contracts: contracts,
          blockNumber: BigInt(blockNumber),
          allowFailure: true,
        });
        // we allow failure on multicall
        // so if a call failed, we count the balance is zero
        const balanceResults: Array<any> = callResults.map((item) => (item.result ? item.result : 0n));

        for (let i = 0; i < poolConfigs.length; i++) {
          const pool2 = poolConfigs[i];

          if (cachingProcessedPools[pool2.address]) {
            continue;
          } else {
            cachingProcessedPools[pool2.address] = true;
          }

          const balance0 = formatBigNumberToNumber(
            balanceResults[i * 2] ? balanceResults[i * 2].toString() : '0',
            pool2.token0.decimals,
          );
          const balance1 = formatBigNumberToNumber(
            balanceResults[i * 2 + 1] ? balanceResults[i * 2 + 1].toString() : '0',
            pool2.token1.decimals,
          );

          const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
          if (baseTokenAddress) {
            const baseTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.chain,
              address: baseTokenAddress,
              timestamp: timestamp,
            });

            let token0PriceUsd = 0;
            let token1PriceUsd = 0;
            if (compareAddress(pool2.token0.address, baseTokenAddress)) {
              token0PriceUsd = baseTokenPriceUsd;
              token1PriceUsd = balance1 > 0 ? (balance0 / balance1) * baseTokenPriceUsd : 0;
            } else {
              token1PriceUsd = baseTokenPriceUsd;
              token0PriceUsd = balance0 > 0 ? (balance1 / balance0) * baseTokenPriceUsd : 0;
            }

            const balanceUsd = balance0 * token0PriceUsd + balance1 * token1PriceUsd;

            totalBalanceUsd += balanceUsd;
          }
        }

        logger.debug('processed pools liquidity data', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          chain: dexConfig.chain,
          version: dexConfig.version,
          factory: dexConfig.factory,
          totalPools: poolIndex * callSize + poolConfigs.length,
        });

        poolIndex += 1;
      }
    }

    return totalBalanceUsd;
  }

  protected async getDexBalanceV3(
    dexConfig: UniswapDexConfig,
    timestamp: number,
    blockNumber: number,
  ): Promise<number> {
    let totalBalanceUsd = 0;

    if (dexConfig.version === Pool2Types.univ3) {
      const client = await this.services.blockchain.evm.getPublicClient(dexConfig.chain);

      // cahing
      const cachingProcessedPools: { [key: string]: boolean } = {};

      let poolIndex = 0;
      while (true) {
        const poolConfigs: Array<Pool2> = await this.storages.database.query({
          collection: envConfig.mongodb.collections.metadataPool2.name,
          query: {
            chain: dexConfig.chain,
            factory: normalizeAddress(dexConfig.factory),
          },
          options: {
            limit: callSize,
            skip: poolIndex * callSize,
            order: { address: 1 },
          },
        });

        if (poolConfigs.length === 0) {
          break;
        }

        const balanceCalls: Array<ContractCall> = [];
        for (const pool2 of poolConfigs) {
          balanceCalls.push({
            abi: UniswapV3PoolAbi,
            target: pool2.address,
            method: 'slot0',
            params: [],
          });
          balanceCalls.push({
            abi: Erc20Abi,
            target: pool2.token0.address,
            method: 'balanceOf',
            params: [pool2.address],
          });
          balanceCalls.push({
            abi: Erc20Abi,
            target: pool2.token1.address,
            method: 'balanceOf',
            params: [pool2.address],
          });
        }

        // query balances
        const contracts = balanceCalls.map((call) => {
          return {
            address: call.target as Address,
            abi: call.abi,
            functionName: call.method,
            args: call.params,
          } as const;
        });
        const callResults: Array<any> = await client.multicall({
          multicallAddress: AddressMulticall3,
          contracts: contracts,
          blockNumber: BigInt(blockNumber),
          allowFailure: true,
        });
        // we allow failure on multicall
        // so if a call failed, we count the balance is zero
        const balanceResults: Array<any> = callResults.map((item) => (item.result ? item.result : 0n));

        for (let i = 0; i < poolConfigs.length; i++) {
          const pool2 = poolConfigs[i];

          // ignore blacklist pools
          if (this.helperGetIsBlacklistPool(pool2, dexConfig)) {
            continue;
          }

          if (cachingProcessedPools[pool2.address]) {
            continue;
          } else {
            cachingProcessedPools[pool2.address] = true;
          }

          const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
          if (!baseTokenAddress) {
            // this pool does not contain baseToken
            continue;
          }

          const slot0 = balanceResults[i * 3];
          const balance0 = formatBigNumberToNumber(
            balanceResults[i * 3 + 1] ? balanceResults[i * 3 + 1].toString() : '0',
            pool2.token0.decimals,
          );
          const balance1 = formatBigNumberToNumber(
            balanceResults[i * 3 + 2] ? balanceResults[i * 3 + 2].toString() : '0',
            pool2.token1.decimals,
          );

          if (slot0 && balance0 > 0 && balance1 > 0) {
            let token0PriceUsd = 0;
            let token1PriceUsd = 0;

            // https://blog.uniswap.org/uniswap-v3-math-primer
            // slot0.sqrtPriceX96 -> sqrtPrice
            const diffDecimals = pool2.token1.decimals - pool2.token0.decimals;
            const sqrtPrice = new BigNumber(slot0[0].toString())
              .dividedBy(2 ** 96)
              .pow(2)
              .dividedBy(10 ** diffDecimals)
              .toNumber();

            // sqrtPrice -> price
            const token0PriceVsToken1 = sqrtPrice;
            const token1PriceVsToken0 = sqrtPrice > 0 ? 1 / token0PriceVsToken1 : 0;

            if (compareAddress(baseTokenAddress, pool2.token0.address)) {
              // price token1 vs token0
              token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.chain,
                address: pool2.token0.address,
                timestamp: timestamp,
              });

              token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;

              if (balance0 * token0PriceUsd < MaliciousPoolBaseAssetBalance) {
                continue;
              }
            } else {
              // price token0 vs token1
              token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.chain,
                address: pool2.token1.address,
                timestamp: timestamp,
              });

              token0PriceUsd = token0PriceVsToken1 * token1PriceUsd;

              if (balance1 * token1PriceUsd < MaliciousPoolBaseAssetBalance) {
                continue;
              }
            }

            const balanceUsd = balance0 * token0PriceUsd + balance1 * token1PriceUsd;

            totalBalanceUsd += balanceUsd;
          }
        }

        logger.debug('processed pools liquidity data', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          chain: dexConfig.chain,
          version: dexConfig.version,
          factory: dexConfig.factory,
          totalPools: poolIndex * callSize + poolConfigs.length,
        });

        poolIndex += 1;
      }
    }

    return totalBalanceUsd;
  }
}
