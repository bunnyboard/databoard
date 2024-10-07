import { UniswapDexConfig } from '../../../configs/protocols/uniswap';
import { Token } from '../../../types/base';

export interface Pool2 {
  chain: string;
  protocol: string;
  factoryAddress: string;
  poolAddress: string;
  token0: Token;
  token1: Token;
  birthblock: number;
  feeRate: number;
}

export interface GetUniswapPoolDataOptions {
  dexConfig: UniswapDexConfig;
  pool: Pool2;
  timestamp: number;
  blockNumber: number;
  beginBlock: number;
  endBlock: number;
}

export interface GetUniswapPoolDataResult {
  total: {
    totalLiquidityUsd: number;
    totalSwapFeeUsd: number;
    volumeSwapUsd: number;
    volumeAddLiquidityUsd: number;
    volumeRemoveLiquidityUsd: number;
  };
  token0: {
    totalLiquidityUsd: number;
    totalSwapFeeUsd: number;
    volumeSwapUsd: number;
    volumeAddLiquidityUsd: number;
    volumeRemoveLiquidityUsd: number;
  };
  token1: {
    totalLiquidityUsd: number;
    totalSwapFeeUsd: number;
    volumeSwapUsd: number;
    volumeAddLiquidityUsd: number;
    volumeRemoveLiquidityUsd: number;
  };
}
