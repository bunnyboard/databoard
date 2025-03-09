// get all pools from subgraph and save to database

import axios from 'axios';
import envConfig from '../configs/envConfig';
import { ChainNames } from '../configs/names';
import DatabaseService from '../services/database/database';
import { normalizeAddress } from '../lib/utils';
import { Pool2, Pool2Types } from '../types/domains/pool2';
import { querySubgraphMetaBlock } from '../lib/subgraph';
import { getSubgraphEndpoint } from './helpers/subgraph';

const endpointConfigs: Array<{
  chain: string;
  feeRate: number;
  subgraph: string;
}> = [
  // sushi
  {
    chain: ChainNames.ethereum,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('GyZ9MgVQkTWuXGMSd3LXESvpevE8S8aD3uktJh7kbVmc'),
  },
  {
    chain: ChainNames.arbitrum,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('8yBXBTMfdhsoE5QCf7KnoPmQb7QAWtRzESfYjiCjGEM9'),
  },
  {
    chain: ChainNames.avalanche,
    feeRate: 0.003, // 0.3% per swap
    subgraph: getSubgraphEndpoint('5DpWu6oLUEwKYLcya5fJf3MW5CE6yEMnZ8iwekmTNAbV'),
  },
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

(async function () {
  const database = new DatabaseService();
  await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

  for (const endpointConfig of endpointConfigs) {
    // save the latest block number
    const latestBlockNumber = await querySubgraphMetaBlock(endpointConfig.subgraph);

    let latestId: string = '';
    let factoryAddress = '';
    do {
      const response = await axios.post(endpointConfig.subgraph, {
        query: `
          {
            factories: uniswapFactories(first: 1) {
              id
            }

            pools: pairs(first: 1000, where: {id_gt: "${latestId}"}, orderBy: id, orderDirection: asc) {
              id
              token0 {
                id
                symbol
                decimals
              }
              token1 {
                id
                symbol
                decimals
              }
              createdAtBlockNumber
            }
          }
        `,
      });

      const data = response.data.data;
      factoryAddress = normalizeAddress(data.factories[0].id);
      for (const rawPool of data.pools) {
        const pool: Pool2 = {
          chain: endpointConfig.chain,
          type: Pool2Types.univ2,
          factory: factoryAddress,
          address: normalizeAddress(rawPool.id),
          token0: {
            chain: endpointConfig.chain,
            address: normalizeAddress(rawPool.token0.id),
            symbol: rawPool.token0.symbol,
            decimals: Number(rawPool.token0.decimals),
          },
          token1: {
            chain: endpointConfig.chain,
            address: normalizeAddress(rawPool.token1.id),
            symbol: rawPool.token1.symbol,
            decimals: Number(rawPool.token1.decimals),
          },
          feeRate: endpointConfig.feeRate,
          birthblock: Number(rawPool.createdAtBlockNumber),
        };

        await database.update({
          collection: envConfig.mongodb.collections.datasyncPool2.name,
          keys: {
            chain: pool.chain,
            factory: pool.factory,
            address: pool.address,
          },
          updates: {
            ...pool,
          },
          upsert: true,
        });
      }

      if (data.pools.length === 0) {
        break;
      } else {
        latestId = data.pools[data.pools.length - 1].id;
        console.log(`... gettting pools of ${endpointConfig.chain}:${factoryAddress}, latestId: ${latestId}`);
      }
    } while (true);

    const syncKey = `factory-pools-sync-${endpointConfig.chain}-${normalizeAddress(factoryAddress)}`;
    await database.update({
      collection: envConfig.mongodb.collections.caching.name,
      keys: {
        name: syncKey,
      },
      updates: {
        name: syncKey,
        blockNumber: latestBlockNumber,
      },
      upsert: true,
    });
  }

  process.exit(0);
})();
