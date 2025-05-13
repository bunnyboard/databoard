import axios from 'axios';
import DatabaseService from '../../services/database/database';
import { PoolBalancer } from '../../types/domains/pool2';
import { normalizeAddress, sleep } from '../../lib/utils';
import envConfig from '../../configs/envConfig';

export async function getBalancerPools(database: DatabaseService, config: any): Promise<void> {
  console.log(`\n>>> start to get pools from subgraph ${config.subgraph}`);

  let latestId: string = '';
  do {
    const response = await axios.post(config.subgraph, {
      query: `
        {
          pools(first: 1000, where: {id_gt: "${latestId}"}, orderBy: id) {
            id
            address
            tokens(first: 1000) {
              address
              symbol
              decimals
            }
            swapFee
          }
        }
      `,
    });

    for (const poolData of response.data.data.pools) {
      const pool: PoolBalancer = {
        chain: config.chain,
        vault: normalizeAddress(config.vault),
        type: config.version,
        poolId: poolData.id,
        address: normalizeAddress(poolData.address),
        feeRate: Number(poolData.swapFee),
        tokens: [],
      };

      for (const token of poolData.tokens) {
        pool.tokens.push({
          chain: config.chain,
          address: normalizeAddress(token.address),
          symbol: token.symbol,
          decimals: Number(token.decimals),
        });
      }

      await database.update({
        collection: envConfig.mongodb.collections.datasyncPoolBalancer.name,
        keys: {
          chain: config.chain,
          vault: pool.vault,
          poolId: pool.poolId,
        },
        updates: {
          ...pool,
        },
        upsert: true,
      });

      latestId = pool.poolId;
    }

    if (response.data.data.pools.length === 0) {
      break;
    } else {
      console.log(`... latestId ${latestId}`);
    }

    await sleep(2);
  } while (latestId !== '');
}
