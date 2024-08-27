export const ProtocolCategories = {
  lending: 'lending',
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

export interface ProtocolInfo {
  website: string;
  socials: {
    [key: string]: string;
  };
}

export interface ProtocolConfig {
  protocol: string;
  category: ProtocolCategory;

  // website and social links, etc, ...
  info?: ProtocolInfo;

  // timestamp when protocol was deployed
  birthday: number;
}

export interface LiquidityPoolConfig extends Token {
  tokens: Array<Token>;
}
