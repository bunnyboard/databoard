import BigNumber from 'bignumber.js';
import CurveMetaPoolAbi from '../../configs/abi/curve/MetaPool.json';
import Erc20Abi from '../../configs/abi/ERC20.json';
import CurveStablePoolAbi from '../../configs/abi/curve/CurveStableSwapNG.json';
import { formatBigNumberToNumber, formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceCurvePool } from '../../types/oracles';
import OracleService from '../../services/oracle/oracle';
import { ContractCall } from '../../services/blockchains/domains';
import { Token } from '../../types/base';

interface GetMetaPoolPriceOptions {
  config: OracleSourceCurvePool;
  blockNumber: number;
}

interface GetPoolLpTokenPriceUsdOptions {
  chain: string;
  address: string;
  blockNumber: number;
  timestamp: number;
}

export default class CurveLibs {
  public static async getCurvePoolPrice(options: GetMetaPoolPriceOptions): Promise<string | null> {
    const blockchain = new BlockchainService();

    let price = await blockchain.readContract({
      chain: options.config.chain,
      abi: options.config.type === 'curveMetaPool' ? CurveMetaPoolAbi : CurveStablePoolAbi,
      target: options.config.address,
      method: options.config.type === 'curveMetaPool' ? 'get_dy_underlying' : 'get_dy',
      params: [
        options.config.baseTokenIndex,
        options.config.quotaTokenIndex,
        new BigNumber(1).multipliedBy(new BigNumber(10).pow(options.config.baseToken.decimals)).toString(10),
      ],
      blockNumber: options.blockNumber,
    });

    if (!price) {
      price = await blockchain.readContract({
        chain: options.config.chain,
        abi: [
          {
            stateMutability: 'view',
            type: 'function',
            name: 'get_dy',
            inputs: [
              {
                name: 'i',
                type: 'uint256',
              },
              {
                name: 'j',
                type: 'uint256',
              },
              {
                name: 'dx',
                type: 'uint256',
              },
            ],
            outputs: [
              {
                name: '',
                type: 'uint256',
              },
            ],
          },
        ],
        target: options.config.address,
        method: 'get_dy',
        params: [
          options.config.baseTokenIndex,
          options.config.quotaTokenIndex,
          new BigNumber(1).multipliedBy(new BigNumber(10).pow(options.config.baseToken.decimals)).toString(10),
        ],
        blockNumber: options.blockNumber,
      });
    }

    if (price) {
      return formatBigNumberToString(price.toString(), options.config.quotaToken.decimals);
    } else {
      return null;
    }
  }

  public static async getPoolLpTokenPriceUsd(options: GetPoolLpTokenPriceUsdOptions): Promise<string | null> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const totalSupply = await blockchain.readContract({
      chain: options.chain,
      abi: Erc20Abi,
      target: options.address,
      method: 'totalSupply',
      params: [],
      blockNumber: options.blockNumber,
    });

    const lpTokenSupply = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', 18);
    if (lpTokenSupply === 0) {
      return null;
    }

    const getCoinsCalls: Array<ContractCall> = [];
    for (let i = 0; i < 10; i++) {
      getCoinsCalls.push({
        abi: CurveStablePoolAbi,
        target: options.address,
        method: 'coins',
        params: [i],
      });
    }
    const getCoinsResults = await blockchain.multicall({
      chain: options.chain,
      calls: getCoinsCalls,
    });

    const tokens: Array<Token> = [];
    for (const coinAddress of getCoinsResults) {
      if (coinAddress) {
        const token = await blockchain.getTokenInfo({
          chain: options.chain,
          address: coinAddress,
        });
        if (token) {
          tokens.push(token);
        }
      }
    }

    let totalBalanceUsd = 0;
    for (const token of tokens) {
      const tokenPriceUsd = await oracle.getTokenPriceUsdRounded({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });

      const getBalanceResult = await blockchain.getTokenBalance({
        chain: token.chain,
        address: token.address,
        owner: options.address,
        blockNumber: options.blockNumber,
      });

      totalBalanceUsd +=
        formatBigNumberToNumber(getBalanceResult ? getBalanceResult.toString() : '0', token.decimals) * tokenPriceUsd;
    }

    return (totalBalanceUsd / lpTokenSupply).toString();
  }

  // private async getPoolNativePrice(options: GetMetaPoolPriceOptions): Promise<string | null> {
  //   const blockchain = new BlockchainService();

  //   let price = await blockchain.readContract({
  //     chain: options.config.chain,
  //     abi: CurvePoolNativeAbi,
  //     target: options.config.address,
  //     method: 'get_dy',
  //     params: [
  //       options.config.baseTokenIndex,
  //       options.config.quotaTokenIndex,
  //       new BigNumber(1).multipliedBy(new BigNumber(10).pow(options.config.baseToken.decimals)).toString(10),
  //     ],
  //     blockNumber: options.blockNumber,
  //   });

  //   if (price) {
  //     return formatBigNumberToString(price.toString(), options.config.quotaToken.decimals);
  //   } else {
  //     return null;
  //   }
  // }
}
