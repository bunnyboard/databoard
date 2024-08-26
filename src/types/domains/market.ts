//
// Market Data Metrics
//

import { Token } from '../base';

export interface MarketData {
  // token metadata
  token: Token;

  // token price in USD
  tokenPrice: number;

  // totalSupply from ERC20-totalSupply
  totalSupply: number;

  // full diluted market cap
  // marketCapFullDiluted = tokenPrice * totalSupply
  marketCapFullDiluted: number;
}
