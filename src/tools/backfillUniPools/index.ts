// get all pools from subgraph and save to database

import envConfig from '../../configs/envConfig';
import DatabaseService from '../../services/database/database';
import { normalizeAddress } from '../../lib/utils';
import { querySubgraphMetaBlock } from '../../lib/subgraph';
import { SubgraphConfigs } from './configs';
import { parseDataPoolsV2, queryPoolsV2, queryPoolsV2Factory } from './univ2';
import { parseDataPoolsV3, queryPoolsV3 } from './univ3';
import { Pool2 } from '../../types/domains/pool2';
import BlockchainService from '../../services/blockchains/blockchain';
import Uniswapv2FactoryAbi from '../../configs/abi/uniswap/UniswapV2Factory.json';

(async function () {
  const blockchain = new BlockchainService();
  const database = new DatabaseService();
  await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

  for (const endpointConfig of SubgraphConfigs) {
    let latestBlockNumber = 0;
    let factoryAddress = '';

    if (endpointConfig.factoryAddress) {
      // save the latest block number
      factoryAddress = normalizeAddress(endpointConfig.factoryAddress);
      latestBlockNumber = await blockchain.getLastestBlockNumber(endpointConfig.chain);

      const pairsLength = Number(
        await blockchain.readContract({
          chain: endpointConfig.chain,
          abi: Uniswapv2FactoryAbi,
          target: endpointConfig.factoryAddress,
          method: 'allPairsLength',
          params: [],
          blockNumber: latestBlockNumber,
        }),
      );

      let i = endpointConfig.fromIndex ? Number(endpointConfig.fromIndex) : 0;
      const range = 500;
      do {
        const fromId = i;
        const toId = i + range >= pairsLength ? pairsLength - 1 : i + range;

        const { pools } = await queryPoolsV2Factory(endpointConfig, fromId, toId);

        for (const pool of pools) {
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

        console.log(`... gettting pools of ${endpointConfig.chain}:${factoryAddress}, latestId: ${toId}`);

        i += range;
      } while (i < pairsLength);
    } else {
      // save the latest block number
      latestBlockNumber = await querySubgraphMetaBlock(endpointConfig.endpoint);

      let latestId: string = endpointConfig.fromIndex ? endpointConfig.fromIndex.toString() : '';
      do {
        let pools: Array<Pool2> = [];

        if (endpointConfig.version === 'univ2') {
          const responseData = await queryPoolsV2(endpointConfig.endpoint, latestId);
          const parseData = parseDataPoolsV2(endpointConfig, responseData.data);
          factoryAddress = parseData.factoryAddress;
          pools = parseData.pools;
        } else if (endpointConfig.version === 'univ3') {
          const responseData = await queryPoolsV3(endpointConfig.endpoint, latestId);
          const parseData = parseDataPoolsV3(endpointConfig, responseData.data);
          factoryAddress = parseData.factoryAddress;
          pools = parseData.pools;
        }

        for (const pool of pools) {
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

        if (pools.length === 0) {
          break;
        } else {
          latestId = pools[pools.length - 1].address;
          console.log(`... gettting pools of ${endpointConfig.chain}:${factoryAddress}, latestId: ${latestId}`);
        }
      } while (true);
    }

    // save the latest block number
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
