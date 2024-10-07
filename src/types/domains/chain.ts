import { ChainFamily } from '../base';

export interface ChainCoreMetrics {
  // total transaction
  totalTransactions: number;

  // active address - count sender addresses
  activeAddresses: number;

  // native token price USD
  nativeCoinPrice: number;

  // block space or gas utilization
  blockUsage: number;

  // we calculate throughput by how many gases/block resources were consume per second
  throughput: number;

  // gas limit
  resourceLimit: string;

  // gas used
  resourceUsed: string;
}

export interface ChainData extends ChainCoreMetrics {
  chain: string;
  family: ChainFamily;
  timestamp: number;
}
