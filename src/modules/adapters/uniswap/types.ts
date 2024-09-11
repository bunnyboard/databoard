import { UniswapDexConfig } from '../../../configs/protocols/uniswap';
import { Token } from '../../../types/base';
import { ContextServices } from '../../../types/namespaces';

export interface Pool {
  chain: string;
  factory: string;
  address: string;
  token0: Token;
  token1: Token;
  birthblock: number;
  feeRate: number;
}

export interface GetUniswapPoolDataOptions {
  services: ContextServices;
  dexConfig: UniswapDexConfig;
  pool: Pool;
  timestamp: number;
  blockNumber: number;
  beginBlock: number;
  endBlock: number;
}

export interface GetUniswapPoolDataResult {
  totalLiquidityUsd: number;
  totalSwapFeeUsd: number;
  volumeSwapUsd: number;
  volumeAddLiquidityUsd: number;
  volumeRemoveLiquidityUsd: number;
}
