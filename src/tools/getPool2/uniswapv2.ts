import axios from 'axios';
import { querySubgraphMetaBlock } from '../../lib/subgraph';
import DatabaseService from '../../services/database/database';
import { normalizeAddress } from '../../lib/utils';
import { Pool2, Pool2Types } from '../../types/domains/pool2';
import envConfig from '../../configs/envConfig';
// import UniswapV2FactoryAbi from '../../configs/abi/uniswap/UniswapV2Factory.json';
// import BlockchainService from '../../services/blockchains/blockchain';

export async function getUniswapV2Pools(database: DatabaseService, endpointConfig: any): Promise<void> {
  // save the latest block number
  const latestBlockNumber = await querySubgraphMetaBlock(endpointConfig.subgraph);

  console.log(`\n>>> ${endpointConfig.version} ${endpointConfig.chain}`);
  console.log(
    `>>> start to get pools from subgraph ${endpointConfig.subgraph} latestBlockNumber: ${latestBlockNumber}`,
  );

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
      console.log(`... latestId ${latestId}`);
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

// export async function getUniswapV2PoolsFactory(database: DatabaseService, endpointConfig: any): Promise<void> {
//   const blockchain = new BlockchainService();
//   const factoryAddress = normalizeAddress(endpointConfig.factory);
//   const latestBlockNumber = await blockchain.getLastestBlockNumber(endpointConfig);

//   let startIndex = 0;
//   const lastRunCacheKey = `temp-factory-pools-sync-${endpointConfig.chain}-${factoryAddress}`;
//   const lastRunCache = await database.find({
//     collection: envConfig.mongodb.collections.caching.name,
//     query: {
//       name: lastRunCacheKey,
//     }
//   });
//   if (lastRunCache) {
//     startIndex = Number(lastRunCache.lastIndex) + 1
//   }

//   const allPairsLength = await blockchain.readContract({
//     chain: endpointConfig.chain,
//     abi: UniswapV2FactoryAbi,
//     target: factoryAddress,
//     method: 'allPairsLength',
//     params: [],
//     blockNumber: latestBlockNumber,
//   })
//   for (let i = startIndex; i < Number(allPairsLength); i++) {

//   }

//   const syncKey = `factory-pools-sync-${endpointConfig.chain}-${factoryAddress}`;
//   await database.update({
//     collection: envConfig.mongodb.collections.caching.name,
//     keys: {
//       name: syncKey,
//     },
//     updates: {
//       name: syncKey,
//       blockNumber: latestBlockNumber,
//     },
//     upsert: true,
//   });
// }
