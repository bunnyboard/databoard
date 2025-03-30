import { ChainNames } from '../../configs/names';
import { getSubgraphEndpoint } from '../helpers/subgraph';

export interface SubgraphConfig {
  chain: string;
  version: 'univ2' | 'univ3' | 'univ2Messari';
  feeRate: number;
  factoryAddress?: string;
  fromIndex?: number | string;
  endpoint: string;
}

export const SubgraphConfigs: Array<SubgraphConfig> = [
  // ======================= uniswap v2 =======================
  {
    chain: ChainNames.ethereum,
    version: 'univ2',
    feeRate: 0.003,
    factoryAddress: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
    fromIndex: 0,
    endpoint: getSubgraphEndpoint('EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu'),
  },
  // {
  //   chain: ChainNames.avalanche,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
  //   endpoint: '',
  // },
  // {
  //   chain: ChainNames.arbitrum,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
  //   endpoint: getSubgraphEndpoint('CStW6CSQbHoXsgKuVCrk3uShGA4JX3CAzzv2x9zaGf8w'),
  // },
  // {
  //   chain: ChainNames.base,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   // factoryAddress: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
  //   endpoint: getSubgraphEndpoint('4jGhpKjW4prWoyt5Bwk1ZHUwdEmNWveJcjEyjoTZWCY9'),
  // },
  // {
  //   chain: ChainNames.bnbchain,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
  //   endpoint: getSubgraphEndpoint('8EjCaWZumyAfN3wyB4QnibeeXaYS8i4sp1PiWT91AGrt'),
  // },
  // {
  //   chain: ChainNames.polygon,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
  //   endpoint: getSubgraphEndpoint('EXBcAqmvQi6VAnE9X4MNK83LPeA6c1PsGskffbmThoeK'),
  // },
  // {
  //   chain: ChainNames.optimism,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
  //   endpoint: '',
  // },
  // {
  //   chain: ChainNames.blast,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
  //   endpoint: '',
  // },
  // {
  //   chain: ChainNames.zora,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x0F797dC7efaEA995bB916f268D919d0a1950eE3C',
  //   endpoint: '',
  // },
  // {
  //   chain: ChainNames.worldchain,
  //   version: 'univ2',
  //   feeRate: 0.003,
  //   factoryAddress: '0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f',
  //   endpoint: '',
  // },

  // ======================= uniswap v3 =======================
  // {
  //   chain: ChainNames.ethereum,
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV'),
  // },

  // ======================= sushi v2 =======================
  // {
  //   chain: ChainNames.ethereum,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('GyZ9MgVQkTWuXGMSd3LXESvpevE8S8aD3uktJh7kbVmc'),
  // },
  // {
  //   chain: ChainNames.arbitrum,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('8yBXBTMfdhsoE5QCf7KnoPmQb7QAWtRzESfYjiCjGEM9'),
  // },
  // {
  //   chain: ChainNames.avalanche,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('5DpWu6oLUEwKYLcya5fJf3MW5CE6yEMnZ8iwekmTNAbV'),
  // },
  // {
  //   chain: ChainNames.base,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('7pXNLCc12pRM3bBPUAP9ZoEvkgUCjaBe9QC3DV9L2qzE'),
  // },
  // {
  //   chain: ChainNames.bnbchain,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('24xqSifM5xPfGrW8MDwRhgaDsq7uaP2762fmxjyxJzot'),
  // },
  // {
  //   chain: ChainNames.celo,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('8WcZLSs8QUSJptPbpBScoDafmp8E9whnSqYJc9TMyYFs'),
  // },
  // {
  //   chain: ChainNames.gnosis,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('7czeiia7ZXvsW45szX2w8EK1ZNgZWZET83zYCwE6JT9x'),
  // },
  // {
  //   chain: ChainNames.linea,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('G4sRz1YAcEFYFewGLQ9bt76gQuP1oyuzhVSTvs9bj7qn'),
  // },
  // {
  //   chain: ChainNames.optimism,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('4KvWjKY89DefJ6mPMASCTUDAZ6dyHSu7osCNQqaaaY3y'),
  // },
  // {
  //   chain: ChainNames.scroll,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('CiW3nquNZjKDoMfR4TbSpB4ox8Pq66FDxwSsohigSdxw'),
  // },
  // {
  //   chain: ChainNames.polygon,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('8obLTNcEuGMieUt6jmrDaQUhWyj2pys26ULeP3gFiGNv'),
  // },
  // {
  //   chain: ChainNames.sonic,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: getSubgraphEndpoint('DiS2ZgxR2upUs1s21wviEaY7hwjRWyrphhoBgKNc1Boo'),
  // },
  // {
  //   chain: ChainNames.blast,
  //   version: 2,
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint: 'https://api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs/sushiswap/v2-blast/gn',
  // },
  // ======================= sushi v3 =======================
  // {
  //   chain: 'ethereum',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('7okunX6MGm2pdFK7WJSwm9o82okpBLEzfGrqHDDMWYvq'),
  // },
  // {
  //   chain: 'arbitrum',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('4vRhyrcGqN63T7FXvL9W5X72iQN8H9fDNfLcUQBG91Wi'),
  // },
  // {
  //   chain: 'avalanche',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('HE31GSTGpXsRnuT4sAJoFayGBZX2xBQqWq4db48YuKmD'),
  // },
  // {
  //   chain: 'base',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('Cz4Snpih41NNNPZcbj1gd3fYXPwFr5q92iWMoZjCarEb'),
  // },
  // {
  //   chain: 'blast',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: 'https://api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs/sushiswap/v3-blast/gn',
  // },
  // {
  //   chain: 'bnbchain',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('GtUp5iLfjfYXtX76wF1yyteSSC5WqnYV8br5ixHZgFmW'),
  // },
  // {
  //   chain: 'linea',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('E2vqqvSzDdUiPP1r7PFnPKZQ34pAhNZjc6rEcdj3uE5t'),
  // },
  // {
  //   chain: 'optimism',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('Hc3vTLxWmtyrn59t2Yv3MiXJVxjfNyZi41iKE3rXXHMf'),
  // },
  // {
  //   chain: 'polygon',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('G1Q6dviDfMm6hVLvCqbfeB19kLmvs7qrnBvXeFndjhaU'),
  // },
  // {
  //   chain: 'scroll',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('5gyhoHx768oHn3GxsHsEc7oKFMPFg9AH8ud1dY8EirRc'),
  // },
  // {
  //   chain: 'sonic',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('5ijXw9MafwFkXgoHmUiWsWHvRyYAL3RD4smnmBLmNPnw'),
  // },
  // {
  //   chain: 'gnosis',
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint: getSubgraphEndpoint('GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW'),
  // },

  // ======================= spookyswap =======================
  // {
  //   chain: ChainNames.sonic,
  //   version: 'univ2',
  //   feeRate: 0.003, // 0.3% per swap
  //   endpoint:
  //     'https://api.0xgraph.xyz/api/public/28820bd2-ad8b-4d40-a142-ce8d7c786f66/subgraphs/spookyswap/v2/v0.0.1/gn',
  // },
  // {
  //   chain: ChainNames.sonic,
  //   version: 'univ3',
  //   feeRate: 0, // don't use
  //   endpoint:
  //     'https://api.0xgraph.xyz/api/public/28820bd2-ad8b-4d40-a142-ce8d7c786f66/subgraphs/spookyswap/v3/v0.0.1/gn',
  // },
];
