import { CurvePoolConfig } from '../../../configs/protocols/stablecoin/curve3pool';
import BlockchainService from '../../../services/blockchains/blockchain';
import { StablecoinCurvePoolData } from '../../../types/domains/stablecoin';
import { GetProtocolDataOptions } from '../../../types/options';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import Curve3PoolAbi from '../../../configs/abi/curve/Curve3Pool.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import BigNumber from 'bignumber.js';

interface GetPoolDataOptions extends GetProtocolDataOptions {
  curvePool: CurvePoolConfig;
}

export default class CurvePoolHelper {
  public static async getPoolData(options: GetPoolDataOptions): Promise<StablecoinCurvePoolData> {
    const poolData: StablecoinCurvePoolData = {
      name: options.curvePool.name,
      coins: {},
    };

    const blockchain = new BlockchainService();
    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(options.curvePool.chain, options.timestamp);

    const results = await blockchain.multicall({
      chain: options.curvePool.chain,
      blockNumber: blockNumber,
      calls: Object.values(options.curvePool.coins).map((token) => {
        return {
          abi: Erc20Abi,
          target: token.address,
          method: 'balanceOf',
          params: [options.curvePool.poolAddress],
        };
      }),
    });

    const coinIds = Object.keys(options.curvePool.coins);
    for (let i = 0; i < coinIds.length; i++) {
      const balance = results[i] ? results[i] : '0';
      const token = options.curvePool.coins[coinIds[i]];

      poolData.coins[coinIds[i]] = {
        balance: 0,
        rates: {},
      };
      poolData.coins[coinIds[i]].balance = formatBigNumberToNumber(balance.toString(), token.decimals);

      for (let j = 0; j < coinIds.length; j++) {
        const rate = await blockchain.readContract({
          chain: options.curvePool.chain,
          abi: Curve3PoolAbi,
          target: options.curvePool.poolAddress,
          method: 'get_dy',
          params: [i, j, new BigNumber(10).pow(token.decimals).toString(10)],
        });

        if (rate) {
          const outputCoin = options.curvePool.coins[coinIds[j]];
          poolData.coins[coinIds[i]].rates[coinIds[j]] = formatBigNumberToNumber(rate.toString(), outputCoin.decimals);
        }
      }
    }

    return poolData;
  }
}
