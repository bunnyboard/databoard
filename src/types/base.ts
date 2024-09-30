export const ProtocolCategories = {
  lending: 'lending',
  dex: 'dex',
  liquidStaking: 'liquidStaking',
  bridge: 'bridge',
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

  // blockchain supports EIP-1559
  // https://eips.ethereum.org/EIPS/eip-1559
  // the block number when EIP-1559 was actived
  eip1559?: number;

  // if layer2 flag is enable, we count transaction fees
  // from block = block.baseFeePerGas * block.gasUsed
  layer2?: boolean;

  // should use public nodes
  nodeRpcs: Array<string>;
}
