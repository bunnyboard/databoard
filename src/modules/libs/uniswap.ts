import BigNumber from 'bignumber.js';

import ERC20Abi from '../../configs/abi/ERC20.json';
import UniswapV2PairAbi from '../../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3PoolAbi from '../../configs/abi/uniswap/UniswapV3Pool.json';
import { compareAddress, formatBigNumberToNumber } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/base';
import { OracleSourcePool2 } from '../../types/oracles';
import OracleService from '../../services/oracle/oracle';

export interface LiquidityPoolConfig extends Token {
  tokens: Array<Token>;
}

export interface GetPool2LpPriceUsdOptions {
  chain: string;
  lpAddress: string;
  blockNumber: number;
  timestamp: number;
}

export default class UniswapLibs {
  public static async getPricePool2(source: OracleSourcePool2, blockNumber: number): Promise<string | null> {
    const blockchain = new BlockchainService();

    if (source.type === 'univ2') {
      const [baseTokenBalance, quotaTokenBalance] = await blockchain.multicall({
        chain: source.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: ERC20Abi,
            target: source.baseToken.address,
            method: 'balanceOf',
            params: [source.address],
          },
          {
            abi: ERC20Abi,
            target: source.quotaToken.address,
            method: 'balanceOf',
            params: [source.address],
          },
        ],
      });

      if (baseTokenBalance && quotaTokenBalance && baseTokenBalance.toString() !== '0') {
        return new BigNumber(quotaTokenBalance.toString())
          .multipliedBy(new BigNumber(10).pow(source.baseToken.decimals))
          .dividedBy(new BigNumber(baseTokenBalance.toString()))
          .dividedBy(new BigNumber(10).pow(source.quotaToken.decimals))
          .toString(10);
      }
    } else if (source.type === 'univ3') {
      // https://blog.uniswap.org/uniswap-v3-math-primer
      const [token0, token1, slot0] = await blockchain.multicall({
        chain: source.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: UniswapV3PoolAbi,
            target: source.address,
            method: 'token0',
            params: [],
          },
          {
            abi: UniswapV3PoolAbi,
            target: source.address,
            method: 'token1',
            params: [],
          },
          {
            abi: UniswapV3PoolAbi,
            target: source.address,
            method: 'slot0',
            params: [],
          },
        ],
      });

      if (token0 && token1 && slot0) {
        // slot0.sqrtPriceX96
        const sqrtPriceX96 = new BigNumber(slot0[0].toString());
        const buyOneOfToken0 = sqrtPriceX96.dividedBy(2 ** 96).pow(2);

        if (buyOneOfToken0.gt(0)) {
          if (compareAddress(source.baseToken.address, token0)) {
            const decimals = 10 ** source.quotaToken.decimals / 10 ** source.baseToken.decimals;
            return buyOneOfToken0.dividedBy(decimals).toString(10);
          } else if (compareAddress(source.baseToken.address, token1)) {
            const decimals = 10 ** source.baseToken.decimals / 10 ** source.quotaToken.decimals;
            return new BigNumber(1).dividedBy(buyOneOfToken0.dividedBy(decimals)).toString(10);
          }
        }
      }
    }

    return null;
  }

  public static async getPool2LpPriceUsd(options: GetPool2LpPriceUsdOptions): Promise<number> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    try {
      const [token0Address, token1Address] = await blockchain.multicall({
        chain: options.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: UniswapV2PairAbi,
            target: options.lpAddress,
            method: 'token0',
            params: [],
          },
          {
            abi: UniswapV2PairAbi,
            target: options.lpAddress,
            method: 'token1',
            params: [],
          },
        ],
      });

      const token0 = await blockchain.getTokenInfo({
        chain: options.chain,
        address: token0Address,
      });
      const token1 = await blockchain.getTokenInfo({
        chain: options.chain,
        address: token1Address,
      });

      if (token0 && token1) {
        const [balance0, balance1, totalSupply] = await blockchain.multicall({
          chain: options.chain,
          blockNumber: options.blockNumber,
          calls: [
            {
              abi: ERC20Abi,
              target: token0.address,
              method: 'balanceOf',
              params: [options.lpAddress],
            },
            {
              abi: ERC20Abi,
              target: token1.address,
              method: 'balanceOf',
              params: [options.lpAddress],
            },
            {
              abi: ERC20Abi,
              target: options.lpAddress,
              method: 'totalSupply',
              params: [],
            },
          ],
        });

        const supply = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', 18);
        if (supply > 0) {
          const token0PriceUsd = await oracle.getTokenPriceUsdRounded({
            chain: token0.chain,
            address: token0.address,
            timestamp: options.timestamp,
          });
          const token1PriceUsd = await oracle.getTokenPriceUsdRounded({
            chain: token1.chain,
            address: token1.address,
            timestamp: options.timestamp,
          });

          const balance0Usd =
            formatBigNumberToNumber(balance0 ? balance0.toString() : '0', token0.decimals) * token0PriceUsd;
          const balance1Usd =
            formatBigNumberToNumber(balance1 ? balance1.toString() : '0', token1.decimals) * token1PriceUsd;

          const lpPriceUsd = (balance0Usd + balance1Usd) / supply;

          return lpPriceUsd;
        }
      }
    } catch (e: any) {}

    return 0;
  }
}
