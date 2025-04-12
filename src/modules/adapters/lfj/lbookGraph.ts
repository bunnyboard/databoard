import envConfig from '../../../configs/envConfig';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import logger from '../../../lib/logger';
import { Pool2 } from '../../../types/domains/pool2';
import { EventSignatures } from '../../../configs/constants';
import { querySubgraph, querySubgraphMetaBlock } from '../../../lib/subgraph';
import { normalizeAddress } from '../../../lib/utils';
import UniswapV3Core from '../uniswap/univ3';

const callLimit = 1000;

export default class LfjLiquidityBookGraph extends UniswapV3Core {
  public readonly name: string = 'adapter.lfj';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    this.poolCreatedEventSignature = EventSignatures.UniswapV2Factory_PairCreated;
  }

  public async indexPools(): Promise<void> {
    if (!this.factoryConfig.subgraph) {
      await super.indexPools();
    } else {
      let startBlock = this.factoryConfig.factoryBirthblock;

      // get the latest index number from db if any
      const syncStateKey = this.getPoolsIndexingKey();
      const syncState = await this.storages.database.find({
        collection: envConfig.mongodb.collections.caching.name,
        query: {
          name: syncStateKey,
        },
      });
      if (syncState) {
        startBlock = Number(syncState.blockNumber);
      }

      // get current latest block sync from subgraph
      const latestBlockNumber = await querySubgraphMetaBlock(this.factoryConfig.subgraph.endpoint);

      logger.info('start to sync pools from subgraph', {
        service: this.name,
        chain: this.factoryConfig.chain,
        factory: this.factoryConfig.factory,
        toBlock: latestBlockNumber,
      });

      let lastPoolId = '';
      const fieldQueryPools = this.factoryConfig.subgraph.queryFields.pools;
      do {
        const responseData = await querySubgraph(
          this.factoryConfig.subgraph.endpoint,
          `
            {
              pools: ${fieldQueryPools}(first: ${callLimit}, where: {block_gte: ${startBlock}, id_gt: "${lastPoolId}"}, orderBy: id, orderDirection: asc) {
                id,
                tokenX {
                  id
                  symbol
                  decimals
                }
                tokenY {
                  id
                  symbol
                  decimals
                }
                block
              }
            }
          `,
        );

        const rawPools: Array<any> = responseData.pools;
        for (const rawPool of rawPools) {
          const pool2 = await this.parsePoolCreatedEvent(rawPool);

          if (pool2) {
            await this.storages.database.update({
              collection: envConfig.mongodb.collections.datasyncPool2.name,
              keys: {
                chain: pool2.chain,
                factory: pool2.factory,
                address: pool2.address,
              },
              updates: {
                ...pool2,
              },
              upsert: true,
            });
          }
        }

        if (rawPools.length > 0) {
          lastPoolId = normalizeAddress(rawPools[rawPools.length - 1].id);
          logger.debug('got pools from subgraph', {
            service: this.name,
            chain: this.factoryConfig.chain,
            factory: this.factoryConfig.factory,
            lastPool: lastPoolId,
          });
        } else {
          lastPoolId = '';
        }
      } while (lastPoolId !== '');

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: syncStateKey,
        },
        updates: {
          name: syncStateKey,
          blockNumber: latestBlockNumber,
        },
        upsert: true,
      });
    }
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    return {
      chain: this.factoryConfig.chain,
      type: this.factoryConfig.version,
      factory: normalizeAddress(this.factoryConfig.factory),
      address: normalizeAddress(log.id),
      feeRate: 0,
      token0: {
        chain: this.factoryConfig.chain,
        symbol: log.tokenX.symbol,
        decimals: Number(log.tokenX.decimals),
        address: normalizeAddress(log.tokenX.id),
      },
      token1: {
        chain: this.factoryConfig.chain,
        symbol: log.tokenY.symbol,
        decimals: Number(log.tokenY.decimals),
        address: normalizeAddress(log.tokenY.id),
      },
      birthblock: Number(log.block),
    };
  }
}
