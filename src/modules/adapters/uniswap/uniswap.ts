import { UniswapDexConfig, UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import logger from '../../../lib/logger';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import AdapterDataHelper from '../helpers';
import UniswapCore from './core';

interface GetDexDataOptions {
  dexConfig: UniswapDexConfig;
  timestamp: number;
  fromTime: number;
  toTime: number;
}

export default class UniswapAdapter extends UniswapCore {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // public async getPoolDataV3(options: GetUniswapPoolDataOptions): Promise<GetUniswapPoolDataResult> {
  //   const data: GetUniswapPoolDataResult = {
  //     token0: {
  //       totalLiquidityUsd: 0,
  //       totalSwapFeeUsd: 0,
  //       volumeSwapUsd: 0,
  //       volumeAddLiquidityUsd: 0,
  //       volumeRemoveLiquidityUsd: 0,
  //     },
  //     token1: {
  //       totalLiquidityUsd: 0,
  //       totalSwapFeeUsd: 0,
  //       volumeSwapUsd: 0,
  //       volumeAddLiquidityUsd: 0,
  //       volumeRemoveLiquidityUsd: 0,
  //     },
  //     total: {
  //       totalLiquidityUsd: 0,
  //       totalSwapFeeUsd: 0,
  //       volumeSwapUsd: 0,
  //       volumeAddLiquidityUsd: 0,
  //       volumeRemoveLiquidityUsd: 0,
  //     },
  //   };

  //   let token0PriceUsd = 0;
  //   let token1PriceUsd = 0;

  //   if (TokenDexBase[options.dexConfig.chain]) {
  //     for (const baseTokenAddress of TokenDexBase[options.dexConfig.chain]) {
  //       if (compareAddress(baseTokenAddress, options.pool.token0.address)) {
  //         token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
  //           chain: options.dexConfig.chain,
  //           address: options.pool.token0.address,
  //           timestamp: options.timestamp,
  //         });

  //         const token1PriceVsToken0 = await UniswapLibs.getPricePoolV3(
  //           options.dexConfig.chain,
  //           options.pool.poolAddress,
  //           options.pool.token1,
  //           options.pool.token0,
  //           options.blockNumber,
  //         );
  //         token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;

  //         break;
  //       } else if (compareAddress(baseTokenAddress, options.pool.token1.address)) {
  //         token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
  //           chain: options.dexConfig.chain,
  //           address: options.pool.token1.address,
  //           timestamp: options.timestamp,
  //         });

  //         const token0PriceVsToken1 = await UniswapLibs.getPricePoolV3(
  //           options.dexConfig.chain,
  //           options.pool.poolAddress,
  //           options.pool.token0,
  //           options.pool.token1,
  //           options.blockNumber,
  //         );
  //         token0PriceUsd = token0PriceVsToken1 * token1PriceUsd;
  //         break;
  //       }
  //     }
  //   }

  //   if (token0PriceUsd === 0 || token1PriceUsd === 0) {
  //     return data;
  //   }

  //   const [balance0, balance1] = await this.services.blockchain.evm.multicall({
  //     chain: options.dexConfig.chain,
  //     blockNumber: options.blockNumber,
  //     calls: [
  //       {
  //         abi: Erc20Abi,
  //         target: options.pool.token0.address,
  //         method: 'balanceOf',
  //         params: [options.pool.poolAddress],
  //       },
  //       {
  //         abi: Erc20Abi,
  //         target: options.pool.token1.address,
  //         method: 'balanceOf',
  //         params: [options.pool.poolAddress],
  //       },
  //     ],
  //   });

  //   const token0LiquidityUsd =
  //     formatBigNumberToNumber(balance0.toString(), options.pool.token0.decimals) * token0PriceUsd;
  //   const token1LiquidityUsd =
  //     formatBigNumberToNumber(balance1.toString(), options.pool.token1.decimals) * token1PriceUsd;
  //   data.total.totalLiquidityUsd += token0LiquidityUsd + token1LiquidityUsd;
  //   data.token0.totalLiquidityUsd += token0LiquidityUsd;
  //   data.token1.totalLiquidityUsd += token1LiquidityUsd;

  //   const logs = await this.services.blockchain.evm.getContractLogs({
  //     chain: options.dexConfig.chain,
  //     address: options.pool.poolAddress,
  //     fromBlock: options.beginBlock,
  //     toBlock: options.endBlock,
  //   });
  //   for (const log of logs) {
  //     const signature = log.topics[0];
  //     if (
  //       signature === Uniswapv3Events.Swap ||
  //       signature === Uniswapv3Events.Mint ||
  //       signature === Uniswapv3Events.Burn
  //     ) {
  //       const event: any = decodeEventLog({
  //         abi: UniswapV3PoolAbi,
  //         topics: log.topics,
  //         data: log.data,
  //       });

  //       switch (signature) {
  //         case Uniswapv3Events.Swap: {
  //           const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals);
  //           const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals);

  //           let swapVolumeUsd = 0;
  //           let swapFeeUsd = 0;
  //           if (amount0 > 0) {
  //             // token0 is the input
  //             swapVolumeUsd = Math.abs(amount0) * token0PriceUsd;
  //             swapFeeUsd = swapVolumeUsd * options.pool.feeRate;

  //             data.token0.volumeSwapUsd += swapVolumeUsd;
  //             data.token0.totalSwapFeeUsd += swapFeeUsd;
  //           } else {
  //             // token1 is the input
  //             swapVolumeUsd = Math.abs(amount1) * token1PriceUsd;
  //             swapFeeUsd = swapVolumeUsd * options.pool.feeRate;

  //             data.token1.volumeSwapUsd += swapVolumeUsd;
  //             data.token1.totalSwapFeeUsd += swapFeeUsd;
  //           }
  //           data.total.volumeSwapUsd += swapVolumeUsd;
  //           data.total.totalSwapFeeUsd += swapFeeUsd;

  //           break;
  //         }
  //         case Uniswapv3Events.Mint: {
  //           const amount0Usd =
  //             formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
  //           const amount1Usd =
  //             formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token0.decimals) * token0PriceUsd;
  //           data.total.volumeAddLiquidityUsd += amount0Usd + amount1Usd;
  //           data.token0.volumeAddLiquidityUsd += amount0Usd;
  //           data.token1.volumeAddLiquidityUsd += amount1Usd;
  //           break;
  //         }
  //         case Uniswapv3Events.Burn: {
  //           const amount0Usd =
  //             formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
  //           const amount1Usd =
  //             formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;
  //           data.total.volumeRemoveLiquidityUsd += amount0Usd + amount1Usd;
  //           data.token0.volumeRemoveLiquidityUsd += amount0Usd;
  //           data.token1.volumeRemoveLiquidityUsd += amount1Usd;
  //         }
  //       }
  //     }
  //   }

  //   data.total.totalSwapFeeUsd = data.total.volumeSwapUsd * options.pool.feeRate;
  //   data.token0.totalSwapFeeUsd = data.token0.volumeSwapUsd * options.pool.feeRate;
  //   data.token1.totalSwapFeeUsd = data.token1.volumeSwapUsd * options.pool.feeRate;

  //   return data;
  // }

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

    for (const poolAddress of options.dexConfig.whitelistedPools) {
      const pool2Data = await this.getPool2Data({
        dexConfig: options.dexConfig,
        poolAddress: poolAddress,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
        beginBlock: beginBlockk,
        endBlock: endBlock,
      });

      if (pool2Data) {
        logger.info('got pool2 liquidity data', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          chain: options.dexConfig.chain,
          version: options.dexConfig.version,
          pool: poolAddress,
          tvl: pool2Data.total.totalLiquidityUsd,
          vol: pool2Data.total.volumeSwapUsd,
        });

        newProtocolData.totalAssetDeposited += pool2Data.total.totalLiquidityUsd;
        newProtocolData.totalValueLocked += pool2Data.total.totalLiquidityUsd;
        newProtocolData.totalFees += pool2Data.total.totalSwapFeeUsd;
        newProtocolData.supplySideRevenue += pool2Data.total.totalSwapFeeUsd;
        (newProtocolData.totalSupplied as number) += pool2Data.total.totalLiquidityUsd;
        (newProtocolData.volumes.trade as number) += pool2Data.total.volumeSwapUsd;
        (newProtocolData.volumes.deposit as number) += pool2Data.total.volumeAddLiquidityUsd;
        (newProtocolData.volumes.withdraw as number) += pool2Data.total.volumeRemoveLiquidityUsd;

        if (!newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address]) {
          newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              trade: 0,
            },
          };
        }
        newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].totalAssetDeposited +=
          pool2Data.token0.totalLiquidityUsd;
        newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].totalValueLocked +=
          pool2Data.token0.totalLiquidityUsd;
        newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].totalFees +=
          pool2Data.token0.totalSwapFeeUsd;
        newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].supplySideRevenue +=
          pool2Data.token0.totalSwapFeeUsd;
        (newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address]
          .totalSupplied as number) += pool2Data.token0.totalLiquidityUsd;
        (newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].volumes
          .trade as number) += pool2Data.token0.volumeSwapUsd;
        (newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].volumes
          .deposit as number) += pool2Data.token0.volumeAddLiquidityUsd;
        (newProtocolData.breakdown[pool2Data.token0.token.chain][pool2Data.token0.token.address].volumes
          .withdraw as number) += pool2Data.token0.volumeRemoveLiquidityUsd;

        if (!newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address]) {
          newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              trade: 0,
            },
          };
        }
        newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].totalAssetDeposited +=
          pool2Data.token1.totalLiquidityUsd;
        newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].totalValueLocked +=
          pool2Data.token1.totalLiquidityUsd;
        newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].totalFees +=
          pool2Data.token1.totalSwapFeeUsd;
        newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].supplySideRevenue +=
          pool2Data.token1.totalSwapFeeUsd;
        (newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address]
          .totalSupplied as number) += pool2Data.token1.totalLiquidityUsd;
        (newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].volumes
          .trade as number) += pool2Data.token1.volumeSwapUsd;
        (newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].volumes
          .deposit as number) += pool2Data.token1.volumeAddLiquidityUsd;
        (newProtocolData.breakdown[pool2Data.token1.token.chain][pool2Data.token1.token.address].volumes
          .withdraw as number) += pool2Data.token1.volumeRemoveLiquidityUsd;
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
      protocolData = await this.getDexData(
        {
          dexConfig: dexConfig,
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
}
