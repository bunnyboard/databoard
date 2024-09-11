import { TokenDexBase } from '../../../configs';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import { Uniswapv2Events } from './abis';
import { decodeEventLog } from 'viem';
import { GetUniswapPoolDataOptions, GetUniswapPoolDataResult } from './types';

export default class UniswapHelperV2 {
  public static async getPairData(options: GetUniswapPoolDataOptions): Promise<GetUniswapPoolDataResult> {
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
          const balance = await options.services.blockchain.evm.readContract({
            chain: options.dexConfig.chain,
            abi: Erc20Abi,
            target: options.pool.token0.address,
            method: 'balanceOf',
            params: [options.pool.address],
            blockNumber: options.blockNumber,
          });
          data.totalLiquidityUsd +=
            formatBigNumberToNumber(balance.toString(), options.pool.token0.decimals) * 2 * token0PriceUsd;
          break;
        } else if (compareAddress(baseTokenAddress, options.pool.token1.address)) {
          const priceUsd = await options.services.oracle.getTokenPriceUsd({
            chain: options.dexConfig.chain,
            address: options.pool.token1.address,
            timestamp: options.timestamp,
          });
          token1PriceUsd = priceUsd ? Number(priceUsd) : 0;
          const balance = await options.services.blockchain.evm.readContract({
            chain: options.dexConfig.chain,
            abi: Erc20Abi,
            target: options.pool.token1.address,
            method: 'balanceOf',
            params: [options.pool.address],
            blockNumber: options.blockNumber,
          });
          data.totalLiquidityUsd +=
            formatBigNumberToNumber(balance.toString(), options.pool.token1.decimals) * 2 * token1PriceUsd;
          break;
        }
      }
    }

    if (token0PriceUsd > 0 || token1PriceUsd > 0) {
      const logs = await options.services.blockchain.evm.getContractLogs({
        chain: options.dexConfig.chain,
        address: options.pool.address,
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
              const amount0Out = formatBigNumberToNumber(
                event.args.amount0Out.toString(),
                options.pool.token0.decimals,
              );
              const amount1Out = formatBigNumberToNumber(
                event.args.amount1Out.toString(),
                options.pool.token1.decimals,
              );

              let swapVolumeUsd = 0;

              if (token0PriceUsd > 0) {
                if (amount0In > 0) {
                  swapVolumeUsd = amount0In * token0PriceUsd;
                } else if (amount0Out > 0) {
                  // amount out has laready reduced by fees
                  swapVolumeUsd = (amount0Out / (1 - options.pool.feeRate)) * token0PriceUsd;
                }
              } else if (token1PriceUsd > 0) {
                if (amount1In > 0) {
                  swapVolumeUsd = amount1In * token1PriceUsd;
                } else if (amount1Out > 0) {
                  // amount out has laready reduced by fees
                  swapVolumeUsd = (amount1Out / (1 - options.pool.feeRate)) * token1PriceUsd;
                }
              }

              data.volumeSwapUsd += swapVolumeUsd;
              data.totalSwapFeeUsd += swapVolumeUsd * options.pool.feeRate;

              break;
            }
            case Uniswapv2Events.Mint: {
              let amountUsd = 0;
              if (token0PriceUsd > 0) {
                amountUsd =
                  formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
              } else if (token1PriceUsd > 0) {
                amountUsd =
                  formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;
              }
              data.volumeAddLiquidityUsd += amountUsd * 2;
              break;
            }
            case Uniswapv2Events.Burn: {
              let amountUsd = 0;
              if (token0PriceUsd > 0) {
                amountUsd =
                  formatBigNumberToNumber(event.args.amount0.toString(), options.pool.token0.decimals) * token0PriceUsd;
              } else if (token1PriceUsd > 0) {
                amountUsd =
                  formatBigNumberToNumber(event.args.amount1.toString(), options.pool.token1.decimals) * token1PriceUsd;
              }
              data.volumeRemoveLiquidityUsd += amountUsd * 2;
              break;
            }
          }
        }
      }
    }

    return data;
  }
}
