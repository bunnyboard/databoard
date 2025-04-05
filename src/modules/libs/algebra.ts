import BigNumber from 'bignumber.js';

import AlgebraPoolAbi from '../../configs/abi/algebra/AlgebraPool.json';
import { compareAddress } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourcePool2 } from '../../types/oracles';

export interface GetPool2LpPriceUsdOptions {
  chain: string;
  address: string;
  blockNumber: number;
  timestamp: number;
}

export default class AlgebraLibs {
  public static async getPricePool2(source: OracleSourcePool2, blockNumber: number): Promise<string | null> {
    const blockchain = new BlockchainService();

    // https://docs.algebra.finance/algebra-integral-documentation/algebra-integral-technical-reference/integration-process/interaction-with-pools/getting-data-from-pools#price
    const [token0, token1, globalState] = await blockchain.multicall({
      chain: source.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: AlgebraPoolAbi,
          target: source.address,
          method: 'token0',
          params: [],
        },
        {
          abi: AlgebraPoolAbi,
          target: source.address,
          method: 'token1',
          params: [],
        },
        {
          abi: AlgebraPoolAbi,
          target: source.address,
          method: 'globalState',
          params: [],
        },
      ],
    });

    if (token0 && token1 && globalState) {
      // slot0.sqrtPriceX96
      const sqrtPriceX96 = new BigNumber(globalState[0].toString());
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

    return null;
  }
}
