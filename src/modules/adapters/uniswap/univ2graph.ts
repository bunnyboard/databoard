import envConfig from '../../../configs/envConfig';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import logger from '../../../lib/logger';
import { Pool2 } from '../../../types/domains/pool2';
import { EventSignatures } from '../../../configs/constants';
import UniswapV2Core from './univ2';
import { querySubgraph, querySubgraphMetaBlock } from '../../../lib/subgraph';
import { normalizeAddress } from '../../../lib/utils';
import { GetDexDataOptions, GetDexDataResult } from './core';

const callLimit = 1000;

// suport query data from univ2 subgraph
// https://github.com/Uniswap/v2-subgraph
export default class UniswapV2Graph extends UniswapV2Core {
  public readonly name: string = 'adapter.uniswap 🦄';

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
      const fieldPoolFeesRate = this.factoryConfig.subgraph.queryFields.poolFeesRate;
      do {
        const responseData = await querySubgraph(
          this.factoryConfig.subgraph.endpoint,
          `
            {
              pools: ${fieldQueryPools}(first: ${callLimit}, where: {createdAtBlockNumber_gte: ${startBlock}, id_gt: "${lastPoolId}"}, orderBy: id, orderDirection: asc) {
                id,
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
                ${fieldPoolFeesRate}
                createdAtBlockNumber
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
    const feeRateForLiquidityProviders = this.factoryConfig.feeRateForLiquidityProviders
      ? this.factoryConfig.feeRateForLiquidityProviders
      : 0;
    const feeRateForProtocol = this.factoryConfig.feeRateForProtocol ? this.factoryConfig.feeRateForProtocol : 0;

    let feeRate = feeRateForLiquidityProviders + feeRateForProtocol;
    if (feeRate === 0) {
      feeRate = 0.003;
    }

    return {
      chain: this.factoryConfig.chain,
      type: this.factoryConfig.version,
      factory: normalizeAddress(this.factoryConfig.factory),
      address: normalizeAddress(log.id),
      feeRate: feeRate,
      token0: {
        chain: this.factoryConfig.chain,
        symbol: log.token0.symbol,
        decimals: Number(log.token0.decimals),
        address: normalizeAddress(log.token0.id),
      },
      token1: {
        chain: this.factoryConfig.chain,
        symbol: log.token1.symbol,
        decimals: Number(log.token1.decimals),
        address: normalizeAddress(log.token1.id),
      },
      birthblock: Number(log.createdAtBlockNumber),
    };
  }

  protected async getTotalLiquidityUsd(timestamp: number): Promise<number> {
    if (!this.factoryConfig.subgraph) {
      return super.getTotalLiquidityUsd(timestamp);
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      this.factoryConfig.chain,
      timestamp,
    );
    const metaBlockNumber = await querySubgraphMetaBlock(this.factoryConfig.subgraph.endpoint);
    const queryBlock = blockNumber > metaBlockNumber ? metaBlockNumber : blockNumber;

    const fieldFactories = this.factoryConfig.subgraph.queryFields.factories;
    const fieldTotalLiquidityUSD = this.factoryConfig.subgraph.queryFields.totalLiquidityUSD;
    const responseData = await querySubgraph(
      this.factoryConfig.subgraph.endpoint,
      `
      {
        factories: ${fieldFactories}(first: 1, block: {number: ${queryBlock}}) {
          ${fieldTotalLiquidityUSD}
        }
      }  
    `,
    );

    return Number(responseData.factories[0][fieldTotalLiquidityUSD]);
  }

  public async getDexData(options: GetDexDataOptions): Promise<GetDexDataResult> {
    if (!this.factoryConfig.subgraph) {
      return super.getDexData(options);
    }

    const result: GetDexDataResult = {
      totalLiquidity: await this.getTotalLiquidityUsd(options.timestamp),
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };

    const metaBlockNumber = await querySubgraphMetaBlock(this.factoryConfig.subgraph.endpoint);
    const queryToBlock = options.toBlock > metaBlockNumber ? metaBlockNumber : options.toBlock;

    const fieldFactories = this.factoryConfig.subgraph.queryFields.factories;
    const fieldTotalVolumeUsd = this.factoryConfig.subgraph.queryFields.totalVolumeUSD;
    const responseData = await querySubgraph(
      this.factoryConfig.subgraph.endpoint,
      `
      {
        fromFactories: ${fieldFactories}(first: 1, block: {number: ${options.fromBlock}}) {
          ${fieldTotalVolumeUsd}
        }
        toFactories: ${fieldFactories}(first: 1, block: {number: ${queryToBlock}}) {
          ${fieldTotalVolumeUsd}
        }
      }  
    `,
    );
    const totalVolumeUsdFrom = Number(responseData.fromFactories[0][fieldTotalVolumeUsd]);
    const totalVolumeUsdTo = Number(responseData.toFactories[0][fieldTotalVolumeUsd]);

    result.swapVolumeUsd = totalVolumeUsdTo - totalVolumeUsdFrom;

    let feeRateProtocol = 0;
    let feeRateSupplySide = 0.003; // default univ2
    if (this.factoryConfig.feeRateForProtocol && this.factoryConfig.feeRateForLiquidityProviders) {
      feeRateProtocol = this.factoryConfig.feeRateForProtocol;
      feeRateSupplySide = this.factoryConfig.feeRateForLiquidityProviders;
    }

    result.protocolRevenueUsd = result.swapVolumeUsd * feeRateProtocol;
    result.supplySideRevenueUsd = result.swapVolumeUsd * feeRateSupplySide;

    return result;
  }
}
