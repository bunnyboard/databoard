import { TokenDexBase } from '../../../configs';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import { Uniswapv3Events } from './abis';
import { decodeEventLog } from 'viem';
import UniswapLibs from '../../libs/uniswap';
import { GetUniswapPoolDataOptions, GetUniswapPoolDataResult } from './types';

export default class UniswapHelperV3 {
  public static async getPoolData(options: GetUniswapPoolDataOptions): Promise<GetUniswapPoolDataResult> {
    const data: GetUniswapPoolDataResult = {
      totalLiquidityUsd: 0,
      totalSwapFeeUsd: 0,
      volumeSwapUsd: 0,
      volumeAddLiquidityUsd: 0,
      volumeRemoveLiquidityUsd: 0,
    };

    let token0PriceUsd = 0;
    let token1PriceUsd = 0;

    if (TokenDexBase[options.dexConfig.chain]) {
      for (const baseTokenAddress of TokenDexBase[options.dexConfig.chain]) {
        if (compareAddress(baseTokenAddress, options.pool.token0.address)) {
          const priceUsd = await options.services.oracle.getTokenPriceUsd({
            chain: options.dexConfig.chain,
            address: options.pool.token0.address,
            timestamp: options.timestamp,
          });
          token0PriceUsd = priceUsd ? Number(priceUsd) : 0;

          const token1PriceVsToken0 = await UniswapLibs.getPricePoolV3(
            options.dexConfig.chain,
            options.pool.address,
            options.pool.token1,
            options.pool.token0,
            options.blockNumber,
          );
          token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;

          break;
        } else if (compareAddress(baseTokenAddress, options.pool.token1.address)) {
          const priceUsd = await options.services.oracle.getTokenPriceUsd({
            chain: options.dexConfig.chain,
            address: options.pool.token1.address,
            timestamp: options.timestamp,
          });
          token1PriceUsd = priceUsd ? Number(priceUsd) : 0;

          const token0PriceVsToken1 = await UniswapLibs.getPricePoolV3(
            options.dexConfig.chain,
            options.pool.address,
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

    const [balance0, balance1] = await options.services.blockchain.evm.multicall({
      chain: options.dexConfig.chain,
      blockNumber: options.blockNumber,
      calls: [
        {
          abi: Erc20Abi,
          target: options.pool.token0.address,
          method: 'balanceOf',
          params: [options.pool.address],
        },
        {
          abi: Erc20Abi,
          target: options.pool.token1.address,
          method: 'balanceOf',
          params: [options.pool.address],
        },
      ],
    });

    const token0LiquidityUsd =
      formatBigNumberToNumber(balance0.toString(), options.pool.token0.decimals) * token0PriceUsd;
    const token1LiquidityUsd =
      formatBigNumberToNumber(balance1.toString(), options.pool.token1.decimals) * token1PriceUsd;
    data.totalLiquidityUsd += token0LiquidityUsd + token1LiquidityUsd;

    const logs = await options.services.blockchain.evm.getContractLogs({
      chain: options.dexConfig.chain,
      address: options.pool.address,
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
            if (amount0 < 0) {
              // token0 is the input
              swapVolumeUsd = Math.abs(amount0) * token0PriceUsd;
              swapFeeUsd = swapVolumeUsd * options.pool.feeRate;
            } else {
              // token1 is the input
              swapVolumeUsd = Math.abs(amount1) * token1PriceUsd;
              swapFeeUsd = swapVolumeUsd * options.pool.feeRate;
            }
            data.volumeSwapUsd += swapVolumeUsd;
            data.totalSwapFeeUsd += swapFeeUsd;
            break;
          }
          case Uniswapv3Events.Mint: {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;
            data.volumeAddLiquidityUsd += amount0Usd + amount1Usd;
            break;
          }
          case Uniswapv3Events.Burn: {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;
            data.volumeRemoveLiquidityUsd += amount0Usd + amount1Usd;
          }
        }
      }
    }

    return data;
  }
}
