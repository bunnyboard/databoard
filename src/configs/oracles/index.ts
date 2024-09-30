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
      {
        type: 'univ2',
        address: '0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac', // sushi v2 factory
      },
      {
        type: 'univ2',
        address: '0x1097053Fd2ea711dad45caCcc45EfF7548fCB362', // pancakeswap v2 factory
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
      {
        type: 'univ2',
        address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4', // sushi v2 factory
      },
      {
        type: 'univ2',
        address: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E', // pancakeswap v2 factory
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
        address: '0x9Ad6C38BE94206cA50bb0d90783181662f0Cfa10', // traderjoe v2 factory
      },
      {
        type: 'univ2',
        address: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C', // uniswap v2 factory
      },
      {
        type: 'univ2',
        address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4', // sushi v2 factory
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
        address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // pancakeswap v2 factory
      },
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
      {
        type: 'univ2',
        address: '0x71524B4f93c58fcbF659783284E38825f0622859', // sushi v2 factory
      },
      {
        type: 'univ2',
        address: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E', // pancakeswap v2 factory
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
      {
        type: 'univ2',
        address: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C', // sushi v2 factory
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
      {
        type: 'univ2',
        address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4', // sushi v2 factory
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
      {
        type: 'univ2',
        address: '0x42Fa929fc636e657AC568C0b5Cf38E203b67aC2b', // sushi v2 factory
      },
    ],
  },
  zksync: {
    wrapToken: {
      chain: 'zksync',
      symbol: 'WETH',
      decimals: 18,
      address: '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d', // pancakeswap v2 factory
      },
      {
        type: 'univ2',
        address: '0x3a76e377ED58c8731F9DF3A36155942438744Ce3', // zkswap v2 factory
      },
    ],
  },
  linea: {
    wrapToken: {
      chain: 'linea',
      symbol: 'WETH',
      decimals: 18,
      address: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E', // pancakeswap v2 factory
      },
    ],
  },
  fantom: {
    wrapToken: {
      chain: 'fantom',
      symbol: 'WETH',
      decimals: 18,
      address: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
    },
    dexes: [
      {
        type: 'univ2',
        address: '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3', // spooky v2 factory
      },
      {
        type: 'univ2',
        address: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4', // sushi v2 factory
      },
    ],
  },
};
