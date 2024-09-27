import { AutoOracleConfig } from '../../types/oracles';

export const AutoOracleConfigs: { [key: string]: AutoOracleConfig } = {
  ethereum: {
    wrapToken: {
      chain: 'ethereum',
      symbol: 'WETH',
      decimals: 18,
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f', // uniswap v2 factory
      },
    ],
  },
  arbitrum: {
    wrapToken: {
      chain: 'arbitrum',
      symbol: 'WETH',
      decimals: 18,
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // uniswap v2 factory
      },
    ],
  },
  avalanche: {
    wrapToken: {
      chain: 'avalanche',
      symbol: 'WAVAX',
      decimals: 18,
      address: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C', // uniswap v2 factory
      },
    ],
  },
  bnbchain: {
    wrapToken: {
      chain: 'bnbchain',
      symbol: 'WBNB',
      decimals: 18,
      address: '0xbb4CdB9CBd36B01bD1cBaEBF2De08d9173bc095c',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6', // uniswap v2 factory
      },
    ],
  },
  base: {
    wrapToken: {
      chain: 'base',
      symbol: 'WETH',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000006',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6', // uniswap v2 factory
      },
    ],
  },
  optimism: {
    wrapToken: {
      chain: 'optimism',
      symbol: 'WETH',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000006',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf', // uniswap v2 factory
      },
    ],
  },
  polygon: {
    wrapToken: {
      chain: 'polygon',
      symbol: 'WMATIC',
      decimals: 18,
      address: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C', // uniswap v2 factory
      },
    ],
  },
  blast: {
    wrapToken: {
      chain: 'blast',
      symbol: 'WETH',
      decimals: 18,
      address: '0x4300000000000000000000000000000000000004',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x5C346464d33F90bABaf70dB6388507CC889C1070', // uniswap v2 factory
      },
    ],
  },
};
