import { Token } from '../../types/base';
import cErc20Abi from '../../configs/abi/compound/cErc20.json';
import BlockchainService from '../../services/blockchains/blockchain';
import { formatBigNumberToString } from '../../lib/utils';

export interface GetCTokenPriceOptions {
  chain: string;
  cToken: string;
  underlying: Token;
  blockNumber?: number;
}

export default class CompoundLibs {
  public static async getCTokenPriceVsUnderlying(options: GetCTokenPriceOptions): Promise<string | null> {
    const blockchain = new BlockchainService();

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

    return formatBigNumberToString(exchangeRate ? exchangeRate.toString() : '0', decimals);
  }
}
