import { ChainNames } from './names';

export interface DecoderModuleConfig {
  chains: {
    [key: string]: {
      fromBlock: number;
    };
  };
}

export const DecoderEvents = {
  UniswapV2Factory_PairCreated: '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9',
  UniswapV2Pair_Mint: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
  UniswapV2Pair_Burn: '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
  UniswapV2Pair_Swap: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
};

export const DecoderAbis = {
  [DecoderEvents.UniswapV2Factory_PairCreated]: 'event PairCreated(address indexed, address indexed, address, uint256)',
  [DecoderEvents.UniswapV2Pair_Mint]: 'event Mint(address indexed, uint256, uint256)',
  [DecoderEvents.UniswapV2Pair_Burn]: 'event Burn(address indexed, uint256, uint256, address indexed)',
  [DecoderEvents.UniswapV2Pair_Swap]:
    'event Swap(address indexed, uint256, uint256, uint256, uint256, address indexed)',
};

export const DecoderConfigs: DecoderModuleConfig = {
  chains: {
    [ChainNames.ethereum]: {
      fromBlock: 10000835, // UniswapV2Factory deployed
    },
  },
};
