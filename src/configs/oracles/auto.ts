import { OnchainOracleConfig } from '../../types/oracles';

export const AutoOracleConfigs: { [key: string]: OnchainOracleConfig } = {
  ethereum: {
    wrapToken: {
      chain: 'ethereum',
      symbol: 'WETH',
      decimals: 18,
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    quotaTokens: [
      // {
      //   chain: 'ethereum',
      //   symbol: 'USDC',
      //   decimals: 6,
      //   address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      // },
      // {
      //   chain: 'ethereum',
      //   symbol: 'USDT',
      //   decimals: 6,
      //   address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      // },
      // {
      //   chain: 'ethereum',
      //   symbol: 'DAI',
      //   decimals: 18,
      //   address: '0x6b175474e89094c44da98b954eedeac495271d0f',
      // },
    ],
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
      // {
      //   type: 'univ3',
      //   address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // uniswap v3 factory
      //   fees: [500, 3000, 10000],
      // },
      // {
      //   type: 'univ3',
      //   address: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F', // sushi v3 factory
      //   fees: [500, 3000, 10000],
      // },
      // {
      //   type: 'univ3',
      //   address: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865', // pancakeswap v3 factory
      //   fees: [500, 3000, 10000],
      // },
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
      {
        type: 'univ2',
        address: '0x6EcCab422D763aC031210895C81787E87B43A652', // camelot factory
      },
      // {
      //   type: 'univ3',
      //   address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // uniswap v3
      //   fees: [500, 3000, 10000],
      // },
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
    quotaTokens: [
      // {
      //   chain: 'bnbchain',
      //   symbol: 'USDT',
      //   decimals: 18,
      //   address: '0x55d398326f99059ff775485246999027b3197955',
      // },
    ],
    dexes: [
      {
        type: 'univ2',
        address: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73', // pancakeswap v2 factory
      },
      {
        type: 'univ2',
        address: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6', // uniswap v2 factory
      },
      // {
      //   type: 'univ3',
      //   address: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865', // pancakeswap v3 factory
      // },
    ],
  },
  base: {
    wrapToken: {
      chain: 'base',
      symbol: 'WETH',
      decimals: 18,
      address: '0x4200000000000000000000000000000000000006',
    },
    quotaTokens: [
      // {
      //   chain: 'base',
      //   symbol: 'USDC',
      //   decimals: 6,
      //   address: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
      // },
    ],
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
      // {
      //   type: 'univ3',
      //   address: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD', // uniswap v3 factory
      //   fees: [500, 3000, 10000],
      // },
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
      // {
      //   type: 'univ3',
      //   address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // uniswap v3 factory
      //   fees: [500, 3000, 10000],
      // },
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
      {
        type: 'univ2',
        address: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32', // quickswap v2 factory
      },
      // {
      //   type: 'univ3',
      //   address: '0x1F98431c8aD98523631AE4a59f267346ea31F984', // uniswap v3 factory
      //   fees: [500, 3000, 10000],
      // },
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
      {
        type: 'univ2',
        address: '0xb4A7D971D0ADea1c73198C97d7ab3f9CE4aaFA13', // thruster v2 factory - 0.3% fee
      },
      {
        type: 'univ2',
        address: '0x37836821a2c03c171fB1a595767f4a16e2b93Fc4', // thruster v2 factory - 1% fee
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
