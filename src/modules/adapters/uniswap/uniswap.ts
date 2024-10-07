import envConfig from '../../../configs/envConfig';
import { UniswapDexConfig, UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import logger from '../../../lib/logger';
import { compareAddress, formatBigNumberToNumber, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { DexPoolMinimumLiquidityToTrackVolume, TimeUnits } from '../../../configs/constants';
import { GetUniswapPoolDataOptions, GetUniswapPoolDataResult, Pool2 } from './types';
import { UniswapTestingData } from './testing';
import AdapterDataHelper from '../helpers';
import UniswapIndexer from './indexer';
import { TokenDexBase } from '../../../configs';
import UniswapLibs from '../../libs/uniswap';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import { Uniswapv2Events, Uniswapv3Events } from './abis';
import { decodeEventLog } from 'viem';

interface GetDexDataOptions {
  dexConfig: UniswapDexConfig;
  pools: Array<Pool2>;
  timestamp: number;
  fromTime: number;
  toTime: number;
}

export default class UniswapAdapter extends UniswapIndexer {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private isWhitelistedPool(pool: Pool2): boolean {
    if (TokenDexBase[pool.chain]) {
      for (const baseTokenAddress of TokenDexBase[pool.chain]) {
        if (compareAddress(baseTokenAddress, pool.token0.address)) {
          return true;
        } else if (compareAddress(baseTokenAddress, pool.token1.address)) {
          return true;
        }
      }
    }

    return false;
  }

  public async getPoolDataV2(options: GetUniswapPoolDataOptions): Promise<GetUniswapPoolDataResult | null> {
    const data: GetUniswapPoolDataResult = {
      token0: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsd: 0,
        volumeSwapUsd: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
      },
      token1: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsd: 0,
        volumeSwapUsd: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
      },
      total: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsd: 0,
        volumeSwapUsd: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
      },
    };

    const [balance0, balance1] = await this.services.blockchain.evm.multicall({
      chain: options.dexConfig.chain,
      blockNumber: options.blockNumber,
      calls: [
        {
          abi: Erc20Abi,
          target: options.pool.token0.address,
          method: 'balanceOf',
          params: [options.pool.poolAddress],
        },
        {
          abi: Erc20Abi,
          target: options.pool.token1.address,
          method: 'balanceOf',
          params: [options.pool.poolAddress],
        },
      ],
    });

    const token0Balance = formatBigNumberToNumber(balance0.toString(), options.pool.token0.decimals);
    const token1Balance = formatBigNumberToNumber(balance1.toString(), options.pool.token1.decimals);

    if (token0Balance === 0 || token1Balance === 0) {
      return null;
    }

    // we will get both token0 and token1 prices
    let token0PriceUsd = 0;
    let token1PriceUsd = 0;

    if (TokenDexBase[options.dexConfig.chain]) {
      for (const baseTokenAddress of TokenDexBase[options.dexConfig.chain]) {
        if (compareAddress(baseTokenAddress, options.pool.token0.address)) {
          token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: options.dexConfig.chain,
            address: options.pool.token0.address,
            timestamp: options.timestamp,
          });
          token1PriceUsd = (token0Balance / token1Balance) * token0PriceUsd;
        } else if (compareAddress(baseTokenAddress, options.pool.token1.address)) {
          token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: options.dexConfig.chain,
            address: options.pool.token1.address,
            timestamp: options.timestamp,
          });
          token0PriceUsd = (token1Balance / token0Balance) * token1PriceUsd;
        }
      }
    }

    const token0BalanceUsd = token0Balance * token0PriceUsd;
    const token1BalanceUsd = token1Balance * token1PriceUsd;

    data.total.totalLiquidityUsd += token0BalanceUsd + token1BalanceUsd;
    data.token0.totalLiquidityUsd += token0BalanceUsd;
    data.token1.totalLiquidityUsd += token1BalanceUsd;

    if (data.total.totalLiquidityUsd < DexPoolMinimumLiquidityToTrackVolume) {
      return data;
    }

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: options.dexConfig.chain,
      address: options.pool.poolAddress,
      fromBlock: options.beginBlock,
      toBlock: options.endBlock,
    });
    for (const log of logs) {
      const signature = log.topics[0];
      if (
        signature === Uniswapv2Events.Swap ||
        signature === Uniswapv2Events.Mint ||
        signature === Uniswapv2Events.Burn
      ) {
        const event: any = decodeEventLog({
          abi: UniswapV2PairAbi,
          topics: log.topics,
          data: log.data,
        });

        switch (signature) {
          case Uniswapv2Events.Swap: {
            const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), options.pool.token0.decimals);
            const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), options.pool.token1.decimals);

            if (amount0In > 0) {
              const swapVolumeUsd = amount0In * token0PriceUsd;
              data.total.volumeSwapUsd += swapVolumeUsd;
              data.token0.volumeSwapUsd += swapVolumeUsd;
            } else if (amount1In > 0) {
              const swapVolumeUsd = amount1In * token1PriceUsd;
              data.total.volumeSwapUsd += swapVolumeUsd;
              data.token1.volumeSwapUsd += swapVolumeUsd;
            }

            break;
          }
          case Uniswapv2Events.Mint: {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;

            data.total.volumeAddLiquidityUsd += amount0Usd + amount1Usd;
            data.token0.volumeAddLiquidityUsd += amount0Usd;
            data.token1.volumeAddLiquidityUsd += amount1Usd;

            break;
          }
          case Uniswapv2Events.Burn: {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;

            data.total.volumeRemoveLiquidityUsd += amount0Usd + amount1Usd;
            data.token0.volumeRemoveLiquidityUsd += amount0Usd;
            data.token1.volumeRemoveLiquidityUsd += amount1Usd;

            break;
          }
        }
      }
    }

    data.total.totalSwapFeeUsd = data.total.volumeSwapUsd * options.pool.feeRate;
    data.token0.totalSwapFeeUsd = data.token0.volumeSwapUsd * options.pool.feeRate;
    data.token1.totalSwapFeeUsd = data.token1.volumeSwapUsd * options.pool.feeRate;

    return data;
  }

  public async getPoolDataV3(options: GetUniswapPoolDataOptions): Promise<GetUniswapPoolDataResult> {
    const data: GetUniswapPoolDataResult = {
      token0: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsd: 0,
        volumeSwapUsd: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
      },
      token1: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsd: 0,
        volumeSwapUsd: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
      },
      total: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsd: 0,
        volumeSwapUsd: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
      },
    };

    let token0PriceUsd = 0;
    let token1PriceUsd = 0;

    if (TokenDexBase[options.dexConfig.chain]) {
      for (const baseTokenAddress of TokenDexBase[options.dexConfig.chain]) {
        if (compareAddress(baseTokenAddress, options.pool.token0.address)) {
          token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: options.dexConfig.chain,
            address: options.pool.token0.address,
            timestamp: options.timestamp,
          });

          const token1PriceVsToken0 = await UniswapLibs.getPricePoolV3(
            options.dexConfig.chain,
            options.pool.poolAddress,
            options.pool.token1,
            options.pool.token0,
            options.blockNumber,
          );
          token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;

          break;
        } else if (compareAddress(baseTokenAddress, options.pool.token1.address)) {
          token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: options.dexConfig.chain,
            address: options.pool.token1.address,
            timestamp: options.timestamp,
          });

          const token0PriceVsToken1 = await UniswapLibs.getPricePoolV3(
            options.dexConfig.chain,
            options.pool.poolAddress,
            options.pool.token0,
            options.pool.token1,
            options.blockNumber,
          );
          token0PriceUsd = token0PriceVsToken1 * token1PriceUsd;
          break;
        }
      }
    }

    if (token0PriceUsd === 0 || token1PriceUsd === 0) {
      return data;
    }

    const [balance0, balance1] = await this.services.blockchain.evm.multicall({
      chain: options.dexConfig.chain,
      blockNumber: options.blockNumber,
      calls: [
        {
          abi: Erc20Abi,
          target: options.pool.token0.address,
          method: 'balanceOf',
          params: [options.pool.poolAddress],
        },
        {
          abi: Erc20Abi,
          target: options.pool.token1.address,
          method: 'balanceOf',
          params: [options.pool.poolAddress],
        },
      ],
    });

    const token0LiquidityUsd =
      formatBigNumberToNumber(balance0.toString(), options.pool.token0.decimals) * token0PriceUsd;
    const token1LiquidityUsd =
      formatBigNumberToNumber(balance1.toString(), options.pool.token1.decimals) * token1PriceUsd;
    data.total.totalLiquidityUsd += token0LiquidityUsd + token1LiquidityUsd;
    data.token0.totalLiquidityUsd += token0LiquidityUsd;
    data.token1.totalLiquidityUsd += token1LiquidityUsd;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: options.dexConfig.chain,
      address: options.pool.poolAddress,
      fromBlock: options.beginBlock,
      toBlock: options.endBlock,
    });
    for (const log of logs) {
      const signature = log.topics[0];
      if (
        signature === Uniswapv3Events.Swap ||
        signature === Uniswapv3Events.Mint ||
        signature === Uniswapv3Events.Burn
      ) {
        const event: any = decodeEventLog({
          abi: UniswapV3PoolAbi,
          topics: log.topics,
          data: log.data,
        });

        switch (signature) {
          case Uniswapv3Events.Swap: {
            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals);

            let swapVolumeUsd = 0;
            let swapFeeUsd = 0;
            if (amount0 > 0) {
              // token0 is the input
              swapVolumeUsd = Math.abs(amount0) * token0PriceUsd;
              swapFeeUsd = swapVolumeUsd * options.pool.feeRate;

              data.token0.volumeSwapUsd += swapVolumeUsd;
              data.token0.totalSwapFeeUsd += swapFeeUsd;
            } else {
              // token1 is the input
              swapVolumeUsd = Math.abs(amount1) * token1PriceUsd;
              swapFeeUsd = swapVolumeUsd * options.pool.feeRate;

              data.token1.volumeSwapUsd += swapVolumeUsd;
              data.token1.totalSwapFeeUsd += swapFeeUsd;
            }
            data.total.volumeSwapUsd += swapVolumeUsd;
            data.total.totalSwapFeeUsd += swapFeeUsd;

            break;
          }
          case Uniswapv3Events.Mint: {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token0.decimals) * token0PriceUsd;
            data.total.volumeAddLiquidityUsd += amount0Usd + amount1Usd;
            data.token0.volumeAddLiquidityUsd += amount0Usd;
            data.token1.volumeAddLiquidityUsd += amount1Usd;
            break;
          }
          case Uniswapv3Events.Burn: {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;
            data.total.volumeRemoveLiquidityUsd += amount0Usd + amount1Usd;
            data.token0.volumeRemoveLiquidityUsd += amount0Usd;
            data.token1.volumeRemoveLiquidityUsd += amount1Usd;
          }
        }
      }
    }

    data.total.totalSwapFeeUsd = data.total.volumeSwapUsd * options.pool.feeRate;
    data.token0.totalSwapFeeUsd = data.token0.volumeSwapUsd * options.pool.feeRate;
    data.token1.totalSwapFeeUsd = data.token1.volumeSwapUsd * options.pool.feeRate;

    return data;
  }

  public async getDexData(options: GetDexDataOptions, protocolData: ProtocolData): Promise<ProtocolData> {
    const newProtocolData = protocolData;

    if (!newProtocolData.breakdown[options.dexConfig.chain]) {
      newProtocolData.breakdown[options.dexConfig.chain] = {};
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.dexConfig.chain,
      options.timestamp,
    );
    const beginBlockk = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.dexConfig.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.dexConfig.chain,
      options.toTime,
    );

    for (const pool of options.pools) {
      if (pool.birthblock > blockNumber) {
        // pool was not deployed yet
        continue;
      }

      let poolData: GetUniswapPoolDataResult | null = null;
      if (this.isWhitelistedPool(pool)) {
        if (options.dexConfig.version === 2) {
          poolData = await this.getPoolDataV2({
            dexConfig: options.dexConfig,
            pool: pool,
            timestamp: options.timestamp,
            blockNumber: blockNumber,
            beginBlock: beginBlockk,
            endBlock: endBlock,
          });
        } else if (options.dexConfig.version === 3) {
          poolData = await this.getPoolDataV3({
            dexConfig: options.dexConfig,
            pool: pool,
            timestamp: options.timestamp,
            blockNumber: blockNumber,
            beginBlock: beginBlockk,
            endBlock: endBlock,
          });
        }
      }

      if (poolData) {
        logger.info('got uniswap pool data', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          chain: pool.chain,
          version: options.dexConfig.version,
          pool: pool.poolAddress,
          tokens: `${pool.token0.symbol}-${pool.token1.symbol}`,
          tvl: poolData.total.totalLiquidityUsd,
          vol: poolData.total.volumeSwapUsd,
        });

        newProtocolData.totalAssetDeposited += poolData.total.totalLiquidityUsd;
        newProtocolData.totalValueLocked += poolData.total.totalLiquidityUsd;
        newProtocolData.totalFees += poolData.total.totalSwapFeeUsd;
        newProtocolData.supplySideRevenue += poolData.total.totalSwapFeeUsd;
        (newProtocolData.totalSupplied as number) += poolData.total.totalLiquidityUsd;
        (newProtocolData.volumes.trade as number) += poolData.total.volumeSwapUsd;
        (newProtocolData.volumes.deposit as number) += poolData.total.volumeAddLiquidityUsd;
        (newProtocolData.volumes.withdraw as number) += poolData.total.volumeRemoveLiquidityUsd;

        if (!newProtocolData.breakdown[pool.token0.chain][pool.token0.address]) {
          newProtocolData.breakdown[pool.token0.chain][pool.token0.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              trade: 0,
            },
          };
        }
        newProtocolData.breakdown[pool.token0.chain][pool.token0.address].totalAssetDeposited +=
          poolData.token0.totalLiquidityUsd;
        newProtocolData.breakdown[pool.token0.chain][pool.token0.address].totalValueLocked +=
          poolData.token0.totalLiquidityUsd;
        newProtocolData.breakdown[pool.token0.chain][pool.token0.address].totalFees += poolData.token0.totalSwapFeeUsd;
        newProtocolData.breakdown[pool.token0.chain][pool.token0.address].supplySideRevenue +=
          poolData.token0.totalSwapFeeUsd;
        (newProtocolData.breakdown[pool.token0.chain][pool.token0.address].totalSupplied as number) +=
          poolData.token0.totalLiquidityUsd;
        (newProtocolData.breakdown[pool.token0.chain][pool.token0.address].volumes.trade as number) +=
          poolData.token0.volumeSwapUsd;
        (newProtocolData.breakdown[pool.token0.chain][pool.token0.address].volumes.deposit as number) +=
          poolData.token0.volumeAddLiquidityUsd;
        (newProtocolData.breakdown[pool.token0.chain][pool.token0.address].volumes.withdraw as number) +=
          poolData.token0.volumeRemoveLiquidityUsd;

        if (!newProtocolData.breakdown[pool.token1.chain][pool.token1.address]) {
          newProtocolData.breakdown[pool.token1.chain][pool.token1.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              trade: 0,
            },
          };
        }
        newProtocolData.breakdown[pool.token1.chain][pool.token1.address].totalAssetDeposited +=
          poolData.token1.totalLiquidityUsd;
        newProtocolData.breakdown[pool.token1.chain][pool.token1.address].totalValueLocked +=
          poolData.token1.totalLiquidityUsd;
        newProtocolData.breakdown[pool.token1.chain][pool.token1.address].totalFees += poolData.token1.totalSwapFeeUsd;
        newProtocolData.breakdown[pool.token1.chain][pool.token1.address].supplySideRevenue +=
          poolData.token1.totalSwapFeeUsd;
        (newProtocolData.breakdown[pool.token1.chain][pool.token1.address].totalSupplied as number) +=
          poolData.token1.totalLiquidityUsd;
        (newProtocolData.breakdown[pool.token1.chain][pool.token1.address].volumes.trade as number) +=
          poolData.token1.volumeSwapUsd;
        (newProtocolData.breakdown[pool.token1.chain][pool.token1.address].volumes.deposit as number) +=
          poolData.token1.volumeAddLiquidityUsd;
        (newProtocolData.breakdown[pool.token1.chain][pool.token1.address].volumes.withdraw as number) +=
          poolData.token1.volumeRemoveLiquidityUsd;
      }
    }

    return newProtocolData;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    let protocolData: ProtocolData = {
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
        trade: 0,
      },
    };

    const uniswapConfig = this.protocolConfig as UniswapProtocolConfig;
    for (const dexConfig of uniswapConfig.dexes) {
      // query logs and get pool2 data
      await this.getPool2FromContractLogs(dexConfig);

      // get pool2 from database
      const pools: Array<Pool2> = await this.storages.database.query({
        collection: envConfig.mongodb.collections.liquidityPool2.name,
        query: {
          chain: dexConfig.chain,
          protocol: this.protocolConfig.protocol,
          factoryAddress: normalizeAddress(dexConfig.factory),
        },
      });

      protocolData = await this.getDexData(
        {
          dexConfig: dexConfig,
          pools: pools,
          timestamp: options.timestamp,
          fromTime: options.beginTime,
          toTime: options.endTime,
        },
        protocolData,
      );
    }

    if (protocolData) {
      console.log(AdapterDataHelper.fillupAndFormatProtocolData(protocolData));
      process.exit(0);
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const timestamp = options.timestamp ? options.timestamp : getTimestamp();

    for (const testing of UniswapTestingData) {
      let protocolData: ProtocolData = {
        protocol: this.protocolConfig.protocol,
        category: this.protocolConfig.category,
        birthday: this.protocolConfig.birthday,
        timestamp: timestamp,
        breakdown: {},
        ...getInitialProtocolCoreMetrics(),
        totalSupplied: 0,
        volumes: {
          deposit: 0,
          withdraw: 0,
          trade: 0,
        },
      };

      protocolData = await this.getDexData(
        {
          dexConfig: testing.dexConfig as UniswapDexConfig,
          pools: [testing.pool],
          timestamp: timestamp,
          fromTime: timestamp - TimeUnits.SecondsPerDay,
          toTime: timestamp,
        },
        protocolData,
      );

      if (options.output === 'json') {
        console.log(JSON.stringify(protocolData));
      } else {
        console.log(protocolData);
      }
    }
  }
}
