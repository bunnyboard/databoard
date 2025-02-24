import { OracleCurrencyBase } from '../../types/oracles';
import { IBlockchainService } from '../blockchains/domains';

export interface GetTokenPriceOptions {
  // chain where token was deployed
  chain: string;

  // the token contract address
  address: string;

  // it will be converted to block number to query on-chain data
  timestamp: number;

  // disable warning logs
  disableWarning?: boolean;

  // enable auto searching liquidity pools
  enableAutoSearching?: boolean;
}

export interface getCurrencyPriceOptions {
  currency: OracleCurrencyBase;
  timestamp: number;
}

export interface IOracleService {
  name: string;

  blockchain: IBlockchainService | null | undefined;

  // get currency price in usd
  getCurrencyPriceUsd: (options: getCurrencyPriceOptions) => Promise<number>;

  // same as getTokenPriceUsd but return number type
  getTokenPriceUsdRounded: (options: GetTokenPriceOptions) => Promise<number>;
}
