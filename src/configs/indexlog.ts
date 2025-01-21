import { ChainNames } from './names';

export interface IndexlogChainConfig {
  chain: string;
  birthblock: number;
}

export interface IndexlogConfig {
  chains: {
    [key: string]: IndexlogChainConfig;
  };
  signatures: Array<string>;
}

export const IndexlogConfigs: IndexlogConfig = {
  chains: {
    [ChainNames.ethereum]: {
      chain: ChainNames.ethereum,
      birthblock: 10000835, // UniswapV2Factory was deployed
    },
  },
  signatures: [
    // uniswap v2
    '0x0d3648bd0f6ba80134a33ba9275ac585d9d315f0ad8355cddefde31afa28d0e9', // UniswapV2Factory-PairCreated
    '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822', // UniswapV2Factory-Swap
    '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f', // UniswapV2Factory-Mint
    '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496', // UniswapV2Factory-Burn

    // uniswap v3
    '0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118', // UniswapV3Factory-PoolCreated
    '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67', // UniswapV3Factory-Swap
    '0x19b47279256b2a23a1665c810c8d55a1758940ee09377d4f8d26497a3577dc83', // PancakeV3Factory-Swap
    '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde', // UniswapV3Factory-Mint
    '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c', // UniswapV3Factory-Burn
  ],
};
