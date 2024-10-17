import { Token } from '../base';

export const Pool2Types = {
  univ2: 'univ2',
  univ3: 'univ3',
};
const AllPool2Types = Object.values(Pool2Types);
export type Pool2Type = (typeof AllPool2Types)[number];

export interface Pool2 {
  protocol: string;
  chain: string;
  type: Pool2Type;
  factory: string;
  address: string;
  feeRate: number;
  token0: Token;
  token1: Token;
}
