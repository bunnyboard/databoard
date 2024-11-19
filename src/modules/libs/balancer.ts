import { OracleSourceBalancerPool } from '../../types/oracles';
import GyroECLPPoolAbi from '../../configs/abi/balancer/GyroECLPPool.json';
import VaultAbi from '../../configs/abi/balancer/Vault.json';
import BlockchainService from '../../services/blockchains/blockchain';
import BigNumber from 'bignumber.js';
import { compareAddress, formatBigNumberToNumber } from '../../lib/utils';

interface GePoolSpotPriceOptions {
  config: OracleSourceBalancerPool;
  blockNumber: number;
}

export default class BalancerLibs {
  public static async getPoolSpotPrice(options: GePoolSpotPriceOptions): Promise<string | null> {
    const blockchain = new BlockchainService();

    if (options.config.type === 'balv2_Gyro_ECLP') {
      const getPrice = await blockchain.readContract({
        abi: GyroECLPPoolAbi,
        chain: options.config.chain,
        target: options.config.address,
        method: 'getPrice',
        params: [],
        blockNumber: options.blockNumber,
      });

      const price = new BigNumber(getPrice ? getPrice.toString() : '0');
      if (price.gt(0)) {
        return new BigNumber(1e18).dividedBy(price).toString(10);
      }
    } else if (options.config.type === 'balv2_Weight') {
      // refer: https://token-engineering-balancer.gitbook.io/balancer-simulations/additional-code-and-instructions/balancer-the-python-edition/balancer_math.py

      const poolTokens = await await blockchain.readContract({
        abi: VaultAbi,
        chain: options.config.chain,
        target: options.config.vault,
        method: 'getPoolTokens',
        params: [options.config.poolId],
        blockNumber: options.blockNumber,
      });

      if (poolTokens) {
        const tokens = poolTokens[0];
        const balances = poolTokens[1];

        let amountBase = 0;
        let amountQuota = 0;
        for (let i = 0; i < tokens.length; i++) {
          if (compareAddress(tokens[i], options.config.baseToken.address)) {
            amountBase = formatBigNumberToNumber(balances[i].toString(), options.config.baseToken.decimals);
          } else if (compareAddress(tokens[i], options.config.quotaToken.address)) {
            amountQuota = formatBigNumberToNumber(balances[i].toString(), options.config.quotaToken.decimals);
          }
        }

        const numer = amountQuota / (options.config.quotaWeight ? options.config.quotaWeight : 0.5);
        const denom = amountBase / (options.config.baseWeight ? options.config.baseWeight : 0.5);

        return (numer / denom).toString();
      }
    }

    return null;
  }
}
