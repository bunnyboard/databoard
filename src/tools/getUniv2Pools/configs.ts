import { ChainNames } from '../../configs/names';
import { getSubgraphEndpoint } from '../helpers/subgraph';

export const endpointConfigs: Array<{
  chain: string;
  feeRate: number;
  subgraph: string;
}> = [
  // sushi
  // {
  //   chain: ChainNames.ethereum,
  //   feeRate: 0.003, // 0.3% per swap
  //   subgraph: getSubgraphEndpoint('GyZ9MgVQkTWuXGMSd3LXESvpevE8S8aD3uktJh7kbVmc'),
  // },
  // {
  //   chain: ChainNames.arbitrum,
  //   feeRate: 0.003, // 0.3% per swap
  //   subgraph: getSubgraphEndpoint('8yBXBTMfdhsoE5QCf7KnoPmQb7QAWtRzESfYjiCjGEM9'),
  // },
  // {
  //   chain: ChainNames.avalanche,
  //   feeRate: 0.003, // 0.3% per swap
  //   subgraph: getSubgraphEndpoint('5DpWu6oLUEwKYLcya5fJf3MW5CE6yEMnZ8iwekmTNAbV'),
  // },
  {
    chain: ChainNames.base,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('7pXNLCc12pRM3bBPUAP9ZoEvkgUCjaBe9QC3DV9L2qzE'),
  },
  {
    chain: ChainNames.bnbchain,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('24xqSifM5xPfGrW8MDwRhgaDsq7uaP2762fmxjyxJzot'),
  },
  {
    chain: ChainNames.celo,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('8WcZLSs8QUSJptPbpBScoDafmp8E9whnSqYJc9TMyYFs'),
  },
  {
    chain: ChainNames.gnosis,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('7czeiia7ZXvsW45szX2w8EK1ZNgZWZET83zYCwE6JT9x'),
  },
  {
    chain: ChainNames.linea,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('G4sRz1YAcEFYFewGLQ9bt76gQuP1oyuzhVSTvs9bj7qn'),
  },
  {
    chain: ChainNames.optimism,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('4KvWjKY89DefJ6mPMASCTUDAZ6dyHSu7osCNQqaaaY3y'),
  },
  {
    chain: ChainNames.scroll,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('CiW3nquNZjKDoMfR4TbSpB4ox8Pq66FDxwSsohigSdxw'),
  },
  {
    chain: ChainNames.polygon,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('8obLTNcEuGMieUt6jmrDaQUhWyj2pys26ULeP3gFiGNv'),
  },
  {
    chain: ChainNames.sonic,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('DiS2ZgxR2upUs1s21wviEaY7hwjRWyrphhoBgKNc1Boo'),
  },
  {
    chain: ChainNames.blast,
    feeRate: 0.003, // 0.3% per swap
    subgraph: 'https://api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs/sushiswap/v2-blast/gn',
  },
];
