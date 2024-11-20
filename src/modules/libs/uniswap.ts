import BigNumber from 'bignumber.js';

import ERC20Abi from '../../configs/abi/ERC20.json';
import UniswapV3PoolAbi from '../../configs/abi/uniswap/UniswapV3Pool.json';
import { compareAddress } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/base';
import { OracleSourcePool2 } from '../../types/oracles';

export interface LiquidityPoolConfig extends Token {
  tokens: Array<Token>;
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

      console.log(token0, token1, slot0);

      if (token0 && token1 && slot0) {
        // slot0.sqrtPriceX96
        const sqrtPriceX96 = new BigNumber(slot0[0].toString());
        const buyOneOfToken0 = sqrtPriceX96.dividedBy(2 ** 96).pow(2);

        if (compareAddress(source.baseToken.address, token0)) {
          const decimals = 10 ** source.quotaToken.decimals / 10 ** source.baseToken.decimals;
          return buyOneOfToken0.dividedBy(decimals).toString(10);
        } else if (compareAddress(source.baseToken.address, token1)) {
          const decimals = 10 ** source.baseToken.decimals / 10 ** source.quotaToken.decimals;
          return new BigNumber(1).dividedBy(buyOneOfToken0.dividedBy(decimals)).toString(10);
        }
      }
    }

    return null;
  }
}
