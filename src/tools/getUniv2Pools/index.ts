// get all pools from subgraph and save to database

import axios from 'axios';
import envConfig from '../../configs/envConfig';
import DatabaseService from '../../services/database/database';
import { normalizeAddress } from '../../lib/utils';
import { Pool2, Pool2Types } from '../../types/domains/pool2';
import { querySubgraphMetaBlock } from '../../lib/subgraph';
import { endpointConfigs } from './configs';

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

      console.log(response.data);

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
