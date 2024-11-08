import { Token as UniswapSdkToken } from '@uniswap/sdk-core';
import { Pool } from '@uniswap/v3-sdk';
import BigNumber from 'bignumber.js';

import ERC20Abi from '../../configs/abi/ERC20.json';
import UniswapV3PoolAbi from '../../configs/abi/uniswap/UniswapV3Pool.json';
import { normalizeAddress } from '../../lib/utils';
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
      const baseTokenBalance = await blockchain.readContract({
        chain: source.chain,
        abi: ERC20Abi,
        target: source.baseToken.address,
        method: 'balanceOf',
        params: [source.address],
        blockNumber: blockNumber,
      });

      const quotaTokenBalance = await blockchain.readContract({
        chain: source.chain,
        abi: ERC20Abi,
        target: source.quotaToken.address,
        method: 'balanceOf',
        params: [source.address],
        blockNumber: blockNumber,
      });

      if (baseTokenBalance && quotaTokenBalance && baseTokenBalance.toString() !== '0') {
        return new BigNumber(quotaTokenBalance.toString())
          .multipliedBy(new BigNumber(10).pow(source.baseToken.decimals))
          .dividedBy(new BigNumber(baseTokenBalance.toString()))
          .dividedBy(new BigNumber(10).pow(source.quotaToken.decimals))
          .toString(10);
      }
    } else if (source.type === 'univ3') {
      const [fee, state, liquidity] = await Promise.all([
        blockchain.readContract({
          chain: source.chain,
          abi: UniswapV3PoolAbi,
          target: source.address,
          method: 'fee',
          params: [],
          blockNumber: blockNumber,
        }),
        blockchain.readContract({
          chain: source.chain,
          abi: UniswapV3PoolAbi,
          target: source.address,
          method: 'slot0',
          params: [],
          blockNumber: blockNumber,
        }),
        blockchain.readContract({
          chain: source.chain,
          abi: UniswapV3PoolAbi,
          target: source.address,
          method: 'liquidity',
          params: [],
          blockNumber: blockNumber,
        }),
      ]);

      if (fee && state && liquidity) {
        const baseTokenConfig = new UniswapSdkToken(1, source.baseToken.address, source.baseToken.decimals, '', '');
        const quoteTokenConfig = new UniswapSdkToken(1, source.quotaToken.address, source.quotaToken.decimals, '', '');

        const pool = new Pool(
          baseTokenConfig,
          quoteTokenConfig,
          Number(fee.toString()),
          state[0].toString(),
          liquidity.toString(),
          new BigNumber(state[1].toString()).toNumber(),
        );

        if (normalizeAddress(pool.token0.address) === normalizeAddress(source.baseToken.address)) {
          return new BigNumber(pool.token0Price.toFixed(12)).toString(10);
        } else {
          return new BigNumber(pool.token1Price.toFixed(12)).toString(10);
        }
      }
    }

    return null;
  }
}
