import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import { GetPool2DataOptions, GetPool2DataResult } from './types';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { TokenDexBase } from '../../../configs';
import { Uniswapv2Events } from './types';
import { decodeEventLog } from 'viem';

export default class UniswapCore extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getPool2Data(options: GetPool2DataOptions): Promise<GetPool2DataResult | null> {
    let feeRate = 0;
    if (options.dexConfig.version === 2) {
      feeRate = options.dexConfig.feeRate ? options.dexConfig.feeRate : feeRate;

      const [token0Address, token1Address] = await this.services.blockchain.evm.multicall({
        chain: options.dexConfig.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: UniswapV2PairAbi,
            target: options.poolAddress,
            method: 'token0',
            params: [],
          },
          {
            abi: UniswapV2PairAbi,
            target: options.poolAddress,
            method: 'token1',
            params: [],
          },
        ],
      });

      if (!token0Address || !token1Address) {
        // pool was not existed yet
        return null;
      }

      const [reserve0, reserve1] = await this.services.blockchain.evm.multicall({
        chain: options.dexConfig.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: Erc20Abi,
            target: token0Address,
            method: 'balanceOf',
            params: [options.poolAddress],
          },
          {
            abi: Erc20Abi,
            target: token1Address,
            method: 'balanceOf',
            params: [options.poolAddress],
          },
        ],
      });

      if (Number(reserve0) === 0 || Number(reserve1) === 0) {
        return null;
      }

      const token0 = await this.services.blockchain.evm.getTokenInfo({
        chain: options.dexConfig.chain,
        address: token0Address,
      });
      const token1 = await this.services.blockchain.evm.getTokenInfo({
        chain: options.dexConfig.chain,
        address: token1Address,
      });
      if (token0 && token1) {
        const data: GetPool2DataResult = {
          token0: {
            token: token0,
            totalLiquidityUsd: 0,
            totalSwapFeeUsd: 0,
            volumeSwapUsd: 0,
            volumeAddLiquidityUsd: 0,
            volumeRemoveLiquidityUsd: 0,
          },
          token1: {
            token: token1,
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

        const token0Balance = formatBigNumberToNumber(reserve0.toString(), token0.decimals);
        const token1Balance = formatBigNumberToNumber(reserve1.toString(), token1.decimals);

        // we will get both token0 and token1 prices
        let token0PriceUsd = 0;
        let token1PriceUsd = 0;

        if (TokenDexBase[options.dexConfig.chain]) {
          for (const baseTokenAddress of TokenDexBase[options.dexConfig.chain]) {
            if (compareAddress(baseTokenAddress, token0.address)) {
              token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: options.dexConfig.chain,
                address: token0.address,
                timestamp: options.timestamp,
              });
              token1PriceUsd = (token0Balance / token1Balance) * token0PriceUsd;
            } else if (compareAddress(baseTokenAddress, token1.address)) {
              token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: options.dexConfig.chain,
                address: token1.address,
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

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: options.dexConfig.chain,
          address: options.poolAddress,
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
                const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), token0.decimals);
                const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), token1.decimals);

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
                  formatBigNumberToNumber(event.args.amount0.toString(), token0.decimals) * token0PriceUsd;
                const amount1Usd =
                  formatBigNumberToNumber(event.args.amount1.toString(), token1.decimals) * token1PriceUsd;

                data.total.volumeAddLiquidityUsd += amount0Usd + amount1Usd;
                data.token0.volumeAddLiquidityUsd += amount0Usd;
                data.token1.volumeAddLiquidityUsd += amount1Usd;

                break;
              }
              case Uniswapv2Events.Burn: {
                const amount0Usd =
                  formatBigNumberToNumber(event.args.amount0.toString(), token0.decimals) * token0PriceUsd;
                const amount1Usd =
                  formatBigNumberToNumber(event.args.amount1.toString(), token1.decimals) * token1PriceUsd;

                data.total.volumeRemoveLiquidityUsd += amount0Usd + amount1Usd;
                data.token0.volumeRemoveLiquidityUsd += amount0Usd;
                data.token1.volumeRemoveLiquidityUsd += amount1Usd;

                break;
              }
            }
          }
        }

        data.total.totalSwapFeeUsd = data.total.volumeSwapUsd * feeRate;
        data.token0.totalSwapFeeUsd = data.token0.volumeSwapUsd * feeRate;
        data.token1.totalSwapFeeUsd = data.token1.volumeSwapUsd * feeRate;

        return data;
      }
    } else if (options.dexConfig.version === 3) {
    }

    return null;
  }
}
