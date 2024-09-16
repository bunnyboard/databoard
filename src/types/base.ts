export const ProtocolCategories = {
  lending: 'lending',
  dex: 'dex',
  liquidStaking: 'liquidStaking',
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

export type ChainNativeCoin = 'ETH' | 'BNB' | 'POL' | 'AVAX' | 'FTM';

// chain configs used for chainboard
export interface ChainConfig {
  chain: string;
  family: ChainFamily;
  nativeToken: ChainNativeCoin;

  birthday: number;
  birthblock: number;

  // blockchain supports EIP-1559?
  // https://eips.ethereum.org/EIPS/eip-1559
  eip1559?: boolean;

  // should use public nodes
  nodeRpcs: Array<string>;
}
