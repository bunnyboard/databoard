import { ChainFamily } from '../base';

export interface ChainCoreMetrics {
  // total transaction
  totalTransactions: number;

  // active address - count sender addresses
  activeAddresses: number;

  // total transaction fees (USD)
  totalFees: number;

  // native token price USD
  nativeCoinPrice: number;

  // block space or gas utilization
  utilization: number;

  // there are some blockchains which burn transaction fees
  // like ETH, BSC, ...
  totalFeesBurnt?: number;

  // list of miners / validators and their earned fees
  // address => earn fees
  validators?: {
    [key: string]: number;
  };
}

export interface ChainData extends ChainCoreMetrics {
  chain: string;
  family: ChainFamily;
  timestamp: number;
}
