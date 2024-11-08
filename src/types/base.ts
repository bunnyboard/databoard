export const ProtocolCategories = {
  lending: 'lending',
  dex: 'dex',
  aggregator: 'aggregator',
  liquidStaking: 'liquidStaking',
  bridge: 'bridge',
  marketplace: 'marketplace',
  restaking: 'restaking',
  blockchain: 'blockchain',
};

const AllProtocolCategories = Object.values(ProtocolCategories);
export type ProtocolCategory = (typeof AllProtocolCategories)[number];

export const ChainFamilies = {
  evm: 'evm',
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
  category: ProtocolCategory;

  // timestamp when protocol was deployed
  birthday: number;
}
