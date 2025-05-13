import { ChainNames } from '../../configs/names';
import { getTheGraphEndpoint } from '../../lib/subgraph';
import { Pool2Types, PoolBalancerTypes } from '../../types/domains/pool2';

export const BalancerSubgraphs = [
  // v2
  {
    chain: ChainNames.ethereum,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'C4ayEZP2yTXRAB8vSaTrgN4m9anTe9Mdm2ViyiAuV9TV',
    }),
  },
  {
    chain: ChainNames.polygon,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'H9oPAbXnobBRq1cB3HDmbZ1E8MWQyJYQjT1QDJMrdbNp',
    }),
  },
  {
    chain: ChainNames.arbitrum,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: '98cQDy6tufTJtshDCuhh9z2kWXsQWBHVh2bqnLHsGAeS',
    }),
  },
  {
    chain: ChainNames.gnosis,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'EJezH1Cp31QkKPaBDerhVPRWsKVZLrDfzjrLqpmv6cGg',
    }),
  },
  {
    chain: ChainNames.avalanche,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: '7asfmtQA1KYu6CP7YVm5kv4bGxVyfAHEiptt2HMFgkHu',
    }),
  },
  {
    chain: ChainNames.base,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'E7XyutxXVLrp8njmjF16Hh38PCJuHm12RRyMt5ma4ctX',
    }),
  },
  {
    chain: ChainNames.polygonzkevm,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: '2Pn2rKmJdkKs9b4wK7CXQN9z5jHXkY4HbBuTVAEo4aoS',
    }),
  },

  // v3
  {
    chain: ChainNames.arbitrum,
    version: PoolBalancerTypes.balv3,
    vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'Ad1cgTzScNmiDPSCeGYxgMU3YdRPrQXGkCZgpmPauauk',
    }),
  },
  {
    chain: ChainNames.base,
    version: PoolBalancerTypes.balv3,
    vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9',
    subgraph: getTheGraphEndpoint({
      subgraphId: '9b7UBHq8DXxrfGsYhAzF3jZn5mNRgZb5Ag18UL9GJ3cV',
    }),
  },
  {
    chain: ChainNames.ethereum,
    version: PoolBalancerTypes.balv3,
    vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9',
    subgraph: getTheGraphEndpoint({
      subgraphId: '4rixbLvpuBCwXTJSwyAzQgsLR8KprnyMfyCuXT8Fj5cd',
    }),
  },
  {
    chain: ChainNames.gnosis,
    version: PoolBalancerTypes.balv3,
    vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'DDoABVc9xCRQwuXRq2QLZ6YLkjoFet74vnfncQDgJVo2',
    }),
  },

  // beets - balv2
  {
    chain: ChainNames.optimism,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'FsmdxmvBJLGjUQPxKMRtcWKzuCNpomKuMTbSbtRtggZ7',
    }),
  },
  {
    chain: ChainNames.fantom,
    version: PoolBalancerTypes.balv2,
    vault: '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'CcWtE5UMUaoKTRu8LWjzambKJtgUVjcN31pD5BdffVzK',
    }),
  },
  {
    chain: ChainNames.sonic,
    version: PoolBalancerTypes.balv2,
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    subgraph: getTheGraphEndpoint({
      subgraphId: 'wwazpiPPt5oJMiTNnQ2VjVxKnKakGDuE2FfEZPD4TKj',
    }),
  },

  // beets - balv3
  {
    chain: ChainNames.sonic,
    version: PoolBalancerTypes.balv3,
    vault: '0xba1333333333a1ba1108e8412f11850a5c319ba9',
    subgraph: getTheGraphEndpoint({
      subgraphId: '8dRsm8mbA77DwEhVQVgzKmmYByjcbZoyXkafDbD5TuHq',
    }),
  },
];

export const SushiSubgraphs = [
  // sushi - forked from univ2
  {
    chain: ChainNames.ethereum,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'GyZ9MgVQkTWuXGMSd3LXESvpevE8S8aD3uktJh7kbVmc',
    }),
  },
  {
    chain: ChainNames.arbitrum,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '8yBXBTMfdhsoE5QCf7KnoPmQb7QAWtRzESfYjiCjGEM9',
    }),
  },
  {
    chain: ChainNames.avalanche,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '5DpWu6oLUEwKYLcya5fJf3MW5CE6yEMnZ8iwekmTNAbV',
    }),
  },
  {
    chain: ChainNames.base,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '7pXNLCc12pRM3bBPUAP9ZoEvkgUCjaBe9QC3DV9L2qzE',
    }),
  },
  {
    chain: ChainNames.bnbchain,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '24xqSifM5xPfGrW8MDwRhgaDsq7uaP2762fmxjyxJzot',
    }),
  },
  {
    chain: ChainNames.celo,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '8WcZLSs8QUSJptPbpBScoDafmp8E9whnSqYJc9TMyYFs',
    }),
  },
  {
    chain: ChainNames.gnosis,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '7czeiia7ZXvsW45szX2w8EK1ZNgZWZET83zYCwE6JT9x',
    }),
  },
  {
    chain: ChainNames.linea,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'G4sRz1YAcEFYFewGLQ9bt76gQuP1oyuzhVSTvs9bj7qn',
    }),
  },
  {
    chain: ChainNames.optimism,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '4KvWjKY89DefJ6mPMASCTUDAZ6dyHSu7osCNQqaaaY3y',
    }),
  },
  {
    chain: ChainNames.scroll,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'CiW3nquNZjKDoMfR4TbSpB4ox8Pq66FDxwSsohigSdxw',
    }),
  },
  {
    chain: ChainNames.polygon,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '8obLTNcEuGMieUt6jmrDaQUhWyj2pys26ULeP3gFiGNv',
    }),
  },
  {
    chain: ChainNames.sonic,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'DiS2ZgxR2upUs1s21wviEaY7hwjRWyrphhoBgKNc1Boo',
    }),
  },
  {
    chain: ChainNames.blast,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: 'https://api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs/sushiswap/v2-blast/gn',
  },

  // sushi - forked from univ3
  {
    chain: 'ethereum',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '7okunX6MGm2pdFK7WJSwm9o82okpBLEzfGrqHDDMWYvq',
    }),
  },
  {
    chain: 'arbitrum',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '4vRhyrcGqN63T7FXvL9W5X72iQN8H9fDNfLcUQBG91Wi',
    }),
  },
  {
    chain: 'avalanche',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'HE31GSTGpXsRnuT4sAJoFayGBZX2xBQqWq4db48YuKmD',
    }),
  },
  {
    chain: 'base',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'Cz4Snpih41NNNPZcbj1gd3fYXPwFr5q92iWMoZjCarEb',
    }),
  },
  {
    chain: 'blast',
    version: Pool2Types.univ3,
    subgraph: 'https://api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs/sushiswap/v3-blast/gn',
  },
  {
    chain: 'bnbchain',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'GtUp5iLfjfYXtX76wF1yyteSSC5WqnYV8br5ixHZgFmW',
    }),
  },
  {
    chain: 'linea',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'E2vqqvSzDdUiPP1r7PFnPKZQ34pAhNZjc6rEcdj3uE5t',
    }),
  },
  {
    chain: 'optimism',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'Hc3vTLxWmtyrn59t2Yv3MiXJVxjfNyZi41iKE3rXXHMf',
    }),
  },
  {
    chain: 'polygon',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'G1Q6dviDfMm6hVLvCqbfeB19kLmvs7qrnBvXeFndjhaU',
    }),
  },
  {
    chain: 'scroll',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '5gyhoHx768oHn3GxsHsEc7oKFMPFg9AH8ud1dY8EirRc',
    }),
  },
  {
    chain: 'sonic',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '5ijXw9MafwFkXgoHmUiWsWHvRyYAL3RD4smnmBLmNPnw',
    }),
  },
  {
    chain: 'gnosis',
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW',
    }),
  },
];

export const UniswapSubgraphs = [
  // uniswap v2
  {
    chain: ChainNames.ethereum,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'EYCKATKGBKLWvSfwvBjzfCBmGwYNdVkduYXVivCsLRFu',
    }),
  },
  {
    chain: ChainNames.arbitrum,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'CStW6CSQbHoXsgKuVCrk3uShGA4JX3CAzzv2x9zaGf8w',
    }),
  },
  {
    chain: ChainNames.base,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '4jGhpKjW4prWoyt5Bwk1ZHUwdEmNWveJcjEyjoTZWCY9',
    }),
  },
  {
    chain: ChainNames.bnbchain,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: '8EjCaWZumyAfN3wyB4QnibeeXaYS8i4sp1PiWT91AGrt',
    }),
  },
  {
    chain: ChainNames.polygon,
    version: Pool2Types.univ2,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getTheGraphEndpoint({
      subgraphId: 'EXBcAqmvQi6VAnE9X4MNK83LPeA6c1PsGskffbmThoeK',
    }),
  },

  // uniswap v3
  {
    chain: ChainNames.ethereum,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    }),
  },
  {
    chain: ChainNames.optimism,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'Jhu62RoQqrrWoxUUhWFkiMHDrqsTe7hTGb3NGiHPuf9',
    }),
  },
  {
    chain: ChainNames.arbitrum,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM',
    }),
  },
  {
    chain: ChainNames.polygon,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '3hCPRGf4z88VC5rsBKU5AA9FBBq5nF3jbKJG7VZCbhjm',
    }),
  },
  {
    chain: ChainNames.celo,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'ESdrTJ3twMwWVoQ1hUE2u7PugEHX3QkenudD6aXCkDQ4',
    }),
  },
  {
    chain: ChainNames.bnbchain,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'F85MNzUGYqgSHSHRGgeVMNsdnW1KtZSVgFULumXRZTw2',
    }),
  },
  {
    chain: ChainNames.avalanche,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '9EAxYE17Cc478uzFXRbM7PVnMUSsgb99XZiGxodbtpbk',
    }),
  },
  {
    chain: ChainNames.base,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'GqzP4Xaehti8KSfQmv3ZctFSjnSUYZ4En5NRsiTbvZpz',
    }),
  },
  {
    chain: ChainNames.zksync,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'AKMoyKWWTwmNxa36nLKrRPauBSjmFST7kn6XdXAc6xVP',
    }),
  },
  {
    chain: ChainNames.blast,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '2LHovKznvo8YmKC9ZprPjsYAZDCc4K5q4AYz8s3cnQn1',
    }),
  },

  // uniswap v4
  {
    chain: ChainNames.ethereum,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'DiYPVdygkfjDWhbxGSqAQxwBKmfKnkWQojqeM2rkLb3G',
    }),
  },
  {
    chain: ChainNames.arbitrum,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'G5TsTKNi8yhPSV7kycaE23oWbqv9zzNqR49FoEQjzq1r',
    }),
  },
  {
    chain: ChainNames.avalanche,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: '49JxRo9FGxWpSf5Y5GKQPj5NUpX2HhpoZHpGzNEWQZjq',
    }),
  },
  {
    chain: ChainNames.base,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'HNCFA9TyBqpo5qpe6QreQABAA1kV8g46mhkCcicu6v2R',
    }),
  },
  {
    chain: ChainNames.blast,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'FCHYK3Ab6bBnkfeCKRhFbs1Q8rX4yt6rKJibpDTC74ns',
    }),
  },
  {
    chain: ChainNames.bnbchain,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: '2qQpC8inZPZL4tYfRQPFGZhsE8mYzE67n5z3Yf5uuKMu',
    }),
  },
  {
    chain: ChainNames.optimism,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: '6RBtsmGUYfeLeZsYyxyKSUiaA6WpuC69shMEQ1Cfuj9u',
    }),
  },
  {
    chain: ChainNames.polygon,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'CwpebM66AH5uqS5sreKij8yEkkPcHvmyEs7EwFtdM5ND',
    }),
  },
  {
    chain: ChainNames.unichain,
    version: Pool2Types.univ4,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'Bd8UnJU8jCRJKVjcW16GHM3FNdfwTojmWb3QwSAmv8Uc',
    }),
  },
];

export const PancakeSubgraphs = [
  // pancake forked from univ3
  {
    chain: ChainNames.ethereum,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'CJYGNhb7RvnhfBDjqpRnD3oxgyhibzc7fkAMa38YV3oS',
    }),
  },
  {
    chain: ChainNames.bnbchain,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'Hv1GncLY5docZoGtXjo4kwbTvxm3MAhVZqBZE4sUT9eZ',
    }),
  },
  {
    chain: ChainNames.polygonzkevm,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '7HroSeAFxfJtYqpbgcfAnNSgkzzcZXZi6c75qLPheKzQ',
    }),
  },
  {
    chain: ChainNames.arbitrum,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '251MHFNN1rwjErXD2efWMpNS73SANZN8Ua192zw6iXve',
    }),
  },
  {
    chain: ChainNames.base,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: '5YYKGBcRkJs6tmDfB3RpHdbK2R5KBACHQebXVgbUcYQp',
    }),
  },
  {
    chain: ChainNames.zksync,
    version: Pool2Types.univ3,
    subgraph: getTheGraphEndpoint({
      subgraphId: 'QmfQrpvop3HgYpzFZz1PSkippkbTewqjE6znHi18o9z7ZR',
    }),
  },
  {
    chain: ChainNames.linea,
    version: Pool2Types.univ3,
    subgraph: 'https://graph-query.linea.build/subgraphs/name/pancakeswap/exchange-v3-linea',
  },
];
