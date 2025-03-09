// help to query uniswap-v3 pools from given subgraph

import axios from 'axios';
import { normalizeAddress } from '../lib/utils';
import { Pool2, Pool2Types } from '../types/domains/pool2';
import DatabaseService from '../services/database/database';
import envConfig from '../configs/envConfig';
import { querySubgraphMetaBlock } from '../lib/subgraph';
import { getSubgraphEndpoint } from './helpers/subgraph';

const UniswapV3Endpoints: Array<{
  chain: string;
  subgraph: string;
}> = [
  // sushi
  {
    chain: 'ethereum',
    subgraph: getSubgraphEndpoint('7okunX6MGm2pdFK7WJSwm9o82okpBLEzfGrqHDDMWYvq'),
  },
  {
    chain: 'arbitrum',
    subgraph: getSubgraphEndpoint('4vRhyrcGqN63T7FXvL9W5X72iQN8H9fDNfLcUQBG91Wi'),
  },
  {
    chain: 'avalanche',
    subgraph: getSubgraphEndpoint('HE31GSTGpXsRnuT4sAJoFayGBZX2xBQqWq4db48YuKmD'),
  },
  {
    chain: 'base',
    subgraph: getSubgraphEndpoint('Cz4Snpih41NNNPZcbj1gd3fYXPwFr5q92iWMoZjCarEb'),
  },
  {
    chain: 'blast',
    subgraph: 'https://api.goldsky.com/api/public/project_clslspm3c0knv01wvgfb2fqyq/subgraphs/sushiswap/v3-blast/gn',
  },
  {
    chain: 'bnbchain',
    subgraph: getSubgraphEndpoint('GtUp5iLfjfYXtX76wF1yyteSSC5WqnYV8br5ixHZgFmW'),
  },
  {
    chain: 'linea',
    subgraph: getSubgraphEndpoint('E2vqqvSzDdUiPP1r7PFnPKZQ34pAhNZjc6rEcdj3uE5t'),
  },
  {
    chain: 'optimism',
    subgraph: getSubgraphEndpoint('Hc3vTLxWmtyrn59t2Yv3MiXJVxjfNyZi41iKE3rXXHMf'),
  },
  {
    chain: 'polygon',
    subgraph: getSubgraphEndpoint('G1Q6dviDfMm6hVLvCqbfeB19kLmvs7qrnBvXeFndjhaU'),
  },
  {
    chain: 'scroll',
    subgraph: getSubgraphEndpoint('5gyhoHx768oHn3GxsHsEc7oKFMPFg9AH8ud1dY8EirRc'),
  },
  {
    chain: 'sonic',
    subgraph: getSubgraphEndpoint('5ijXw9MafwFkXgoHmUiWsWHvRyYAL3RD4smnmBLmNPnw'),
  },
  {
    chain: 'gnosis',
    subgraph: getSubgraphEndpoint('GFvGfWBX47RNnvgwL6SjAAf2mrqrPxF91eA53F4eNegW'),
  },
];

(async function () {
  const database = new DatabaseService();
  await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

  for (const config of UniswapV3Endpoints) {
    // save the latest block number
    const latestBlockNumber = await querySubgraphMetaBlock(config.subgraph);

    let factoryAddress = '0';
    let latestId: string = '';
    do {
      const response = await axios.post(config.subgraph, {
        query: `
          {
            factories(first: 1) {
              id
            }

            pools(first: 1000, where: {id_gt: "${latestId}"}, orderBy: id) {
              id
              feeTier
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
              createdAtTimestamp
            }
          }
        `,
      });

      factoryAddress = normalizeAddress(response.data.data.factories[0].id);
      const pools: Array<Pool2> = response.data.data.pools.map((item: any) => {
        return {
          chain: config.chain,
          factory: normalizeAddress(factoryAddress),
          type: Pool2Types.univ3,
          feeRate: Number(item.feeTier) / 1e6,
          address: normalizeAddress(item.id),
          token0: {
            chain: config.chain,
            address: normalizeAddress(item.token0.id),
            symbol: item.token0.symbol,
            decimals: Number(item.token0.decimals),
          },
          token1: {
            chain: config.chain,
            address: normalizeAddress(item.token1.id),
            symbol: item.token1.symbol,
            decimals: Number(item.token1.decimals),
          },
          birthblock: Number(item.createdAtBlockNumber),
        };
      });

      for (const pool of pools) {
        await database.update({
          collection: envConfig.mongodb.collections.datasyncPool2.name,
          keys: {
            chain: config.chain,
            factory: pool.factory,
            address: pool.address,
          },
          updates: {
            ...pool,
          },
          upsert: true,
        });
      }

      if (response.data.data.pools.length === 0) {
        break;
      } else {
        latestId = response.data.data.pools[response.data.data.pools.length - 1].id;
        console.log(`... gettting pools of ${config.chain}:${factoryAddress}, latestId: ${latestId}`);
      }
    } while (true);

    const syncKey = `factory-pools-sync-${config.chain}-${normalizeAddress(factoryAddress)}`;
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
