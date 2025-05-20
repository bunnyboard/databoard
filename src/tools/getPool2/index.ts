// get to get liquidity pools metadata
// save time to sync from blockchains

import envConfig from '../../configs/envConfig';
import DatabaseService from '../../services/database/database';
import { Pool2Types, PoolBalancerTypes } from '../../types/domains/pool2';
import { getBalancerPools } from './balancer';
import { UniswapSubgraphs } from './configs';
// import { SushiSubgraphs } from './configs';
import { getUniswapV2Pools } from './uniswapv2';
import { getUniswapV3Pools } from './uniswapv3';
import { getUniswapV4Pools } from './uniswapv4';

const ProtocolSubgraphs: Array<any> = [
  // BalancerSubgraphs,
  // SushiSubgraphs,
  UniswapSubgraphs,
];

(async function () {
  const database = new DatabaseService();
  await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

  for (const protocolSubgraphs of ProtocolSubgraphs) {
    for (const subgraph of protocolSubgraphs) {
      switch (subgraph.version) {
        case PoolBalancerTypes.balv2:
        case PoolBalancerTypes.balv3: {
          await getBalancerPools(database, subgraph);
          break;
        }
        case Pool2Types.univ2: {
          await getUniswapV2Pools(database, subgraph);
          break;
        }
        case Pool2Types.univ3: {
          await getUniswapV3Pools(database, subgraph);
          break;
        }
        case Pool2Types.univ4: {
          await getUniswapV4Pools(database, subgraph);
          break;
        }
      }
    }
  }

  process.exit(1);
})();
