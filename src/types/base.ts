export const ChainFamilies = {
  evm: 'evm',
  bitcore: 'bitcore',
};
const AllChainFamilies = Object.values(ChainFamilies);
export type ChainFamily = (typeof AllChainFamilies)[number];

export interface Token {
  chain: string;
  address: string;
  symbol: string;
  decimals: number;
}

export interface ProtocolConfig {
  protocol: string;

  // timestamp when protocol was deployed
  birthday: number;
}

export interface SubgraphConfig {
  provider: 'thegraph' | 'custom';
  subgraphIdOrEndpoint: string;
  requestHeaders?: any;
  customParams?: any;
}
