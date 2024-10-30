import BigNumber from 'bignumber.js';
import CurveMetaPoolAbi from '../../configs/abi/curve/MetaPool.json';
import CurveStablePoolAbi from '../../configs/abi/curve/CurveStableSwapNG.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceCurvePool } from '../../types/oracles';
// import CurvePoolNativeAbi from '../../configs/abi/curve/CurvePoolNative.json';

interface GetMetaPoolPriceOptions {
  config: OracleSourceCurvePool;
  blockNumber: number;
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
