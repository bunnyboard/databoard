import { Token } from '../../types/base';
import cErc20Abi from '../../configs/abi/compound/cErc20.json';
import BlockchainService from '../../services/blockchains/blockchain';
import { formatBigNumberToNumber } from '../../lib/utils';
import OracleService from '../../services/oracle/oracle';

export interface GetCTokenPriceOptions {
  chain: string;
  cToken: string;
  underlying: Token;
  timestamp: number;
  blockNumber?: number;
}

export default class CompoundLibs {
  public static async getCTokenPriceUsd(options: GetCTokenPriceOptions): Promise<string | null> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const exchangeRate = await blockchain.readContract({
      chain: options.chain,
      abi: cErc20Abi,
      target: options.cToken,
      method: 'exchangeRateStored',
      params: [],
      blockNumber: options.blockNumber,
    });

    // https://docs.compound.finance/v2/#protocol-math
    const decimals = 18 + options.underlying.decimals - 8;

    const priceVsUnderlying = formatBigNumberToNumber(exchangeRate ? exchangeRate.toString() : '0', decimals);

    const underlyingPriceUsd = await oracle.getTokenPriceUsdRounded({
      chain: options.underlying.chain,
      address: options.underlying.address,
      timestamp: options.timestamp,
    });

    console.log(priceVsUnderlying, underlyingPriceUsd);

    return (priceVsUnderlying * underlyingPriceUsd).toString();
  }
}
