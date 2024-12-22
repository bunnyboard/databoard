import { Token } from '../base';

export const Pool2Types = {
  univ2: 'univ2',
  univ3: 'univ3',
};
const AllPool2Types = Object.values(Pool2Types);
export type Pool2Type = (typeof AllPool2Types)[number];

export interface Pool2 {
  chain: string;
  type: Pool2Type;
  factory: string;
  address: string;
  feeRate: number;
  token0: Token;
  token1: Token;

  createdAtBlockNumber?: number;
  createdAtTimestamp?: number;
}

// Balancer.fi pools
export const PoolBalancerTypes = {
  balv2: 'balv2',
  balv3: 'balv3',
};
const AllPoolBalancerTypes = Object.values(PoolBalancerTypes);
export type PoolBalancerType = (typeof AllPoolBalancerTypes)[number];

export interface PoolBalancer {
  chain: string;
  type: PoolBalancerType;
  vault: string;
  poolId: string;
  address: string;
  feeRate: number;
  tokens: Array<Token>;
}
