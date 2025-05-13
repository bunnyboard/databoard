import axios from 'axios';
import { querySubgraphMetaBlock } from '../../lib/subgraph';
import DatabaseService from '../../services/database/database';
import { normalizeAddress } from '../../lib/utils';
import { Pool2, Pool2Types } from '../../types/domains/pool2';
import envConfig from '../../configs/envConfig';

export async function getUniswapV4Pools(database: DatabaseService, config: any): Promise<void> {
  // save the latest block number
  const latestBlockNumber = await querySubgraphMetaBlock(config.subgraph);

  console.log(`\n>>> ${config.version} ${config.chain}`);
  console.log(`>>> start to get pools from subgraph ${config.subgraph} latestBlockNumber: ${latestBlockNumber}`);

  let latestId: string = '';
  let factoryAddress = '';
  do {
    const response = await axios.post(config.subgraph, {
      query: `
        {
          factories: poolManagers(first: 1) {
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
        type: Pool2Types.univ4,
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
