import { decodeEventLog } from 'viem';
import envConfig from '../../../configs/envConfig';
import { UniswapDexConfig, UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import logger from '../../../lib/logger';
import { formatBigNumberToNumber, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import { Uniswapv2Events, Uniswapv3Events } from './abis';
import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { TimeUnits } from '../../../configs/constants';
import UniswapHelperV2 from './helperV2';
import UniswapHelperV3 from './helperV3';
import { GetUniswapPoolDataResult, Pool } from './types';

interface GetDexDataOptions {
  dexConfig: UniswapDexConfig;
  pools: Array<Pool>;
  timestamp: number;
  fromTime: number;
  toTime: number;
}

const poolCachingSyncKey = 'index-uniswap-pool';
const poolCachingKey = 'uniswap-pool';

export default class UniswapAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // get liquidity pools
  public async getPools(config: UniswapDexConfig): Promise<Array<Pool>> {
    const pools: Array<Pool> = [];

    let syncFromBlock = config.birthblock;
    const latestBlockSynced = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
      },
    });
    if (latestBlockSynced) {
      syncFromBlock = latestBlockSynced.blockNumber;
    }

    const databasePools: Array<any> = await this.storages.database.query({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: poolCachingKey,
        chain: config.chain,
        factory: normalizeAddress(config.factory),
      },
    });
    for (const databasePool of databasePools) {
      pools.push({
        chain: databasePool.chain,
        factory: databasePool.factory,
        address: databasePool.address,
        token0: databasePool.token0,
        token1: databasePool.token1,
        birthblock: databasePool.birthblock,
        feeRate: databasePool.feeRate,
      });

      if (databasePool.birthblock > syncFromBlock) {
        syncFromBlock = databasePool.birthblock + 1;
      }
    }

    const latestBlockNumber = await this.services.blockchain.evm.getLastestBlockNumber(config.chain);

    logger.info('get uniswap pools from factory events', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      chain: config.chain,
      version: config.version,
      factory: config.factory,
      fromBlock: syncFromBlock,
      toBlock: latestBlockNumber,
    });

    const blockRange = 1000;
    while (syncFromBlock <= latestBlockNumber) {
      const toBlock = syncFromBlock + blockRange > latestBlockNumber ? latestBlockNumber : syncFromBlock + blockRange;
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: config.chain,
        address: config.factory,
        fromBlock: syncFromBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === Uniswapv2Events.PairCreated) {
          const event: any = decodeEventLog({
            abi: UniswapV2FactoryAbi,
            topics: log.topics,
            data: log.data,
          });
          const token0 = await this.services.blockchain.evm.getTokenInfo({
            chain: config.chain,
            address: event.args.token0,
          });
          const token1 = await this.services.blockchain.evm.getTokenInfo({
            chain: config.chain,
            address: event.args.token1,
          });
          if (token0 && token1) {
            const pool: Pool = {
              chain: config.chain,
              address: normalizeAddress(event.args.pair),
              factory: normalizeAddress(config.factory),
              token0: token0,
              token1: token1,
              birthblock: Number(log.blockNumber),
              feeRate: config.feeRate ? config.feeRate : 0.003,
            };

            await this.storages.database.update({
              collection: envConfig.mongodb.collections.caching.name,
              keys: {
                name: poolCachingKey,
                chain: pool.chain,
                factory: pool.factory,
                address: pool.address,
              },
              updates: {
                name: poolCachingKey,
                ...pool,
              },
              upsert: true,
            });

            pools.push(pool);

            logger.debug('got uniswap liquidity pool', {
              service: this.name,
              protocol: this.protocolConfig.protocol,
              chain: pool.chain,
              version: config.version,
              factory: pool.factory,
              pool: `${pool.token0.symbol}-${pool.token1.symbol}-${pool.feeRate}`,
            });
          }
        } else if (log.topics[0] === Uniswapv3Events.PoolCreated) {
          const event: any = decodeEventLog({
            abi: UniswapV3FactoryAbi,
            topics: log.topics,
            data: log.data,
          });
          const token0 = await this.services.blockchain.evm.getTokenInfo({
            chain: config.chain,
            address: event.args.token0,
          });
          const token1 = await this.services.blockchain.evm.getTokenInfo({
            chain: config.chain,
            address: event.args.token1,
          });
          if (token0 && token1) {
            const pool: Pool = {
              chain: config.chain,
              address: normalizeAddress(event.args.pool),
              factory: normalizeAddress(config.factory),
              token0: token0,
              token1: token1,
              birthblock: Number(log.blockNumber),
              feeRate: formatBigNumberToNumber(event.args.fee.toString(), 6),
            };

            await this.storages.database.update({
              collection: envConfig.mongodb.collections.caching.name,
              keys: {
                name: poolCachingKey,
                chain: pool.chain,
                factory: pool.factory,
                address: pool.address,
              },
              updates: {
                name: poolCachingKey,
                ...pool,
              },
              upsert: true,
            });

            pools.push(pool);

            logger.debug('got uniswap v3 pool', {
              service: this.name,
              protocol: this.protocolConfig.protocol,
              chain: pool.chain,
              factory: pool.factory,
              pair: `${pool.token0.symbol}-${pool.token1.symbol}-${pool.feeRate}`,
            });
          }
        }
      }

      syncFromBlock = toBlock + 1;

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
        },
        updates: {
          name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
          blockNumber: syncFromBlock,
        },
        upsert: true,
      });
    }

    return pools;
  }

  public async getDexData(options: GetDexDataOptions, protocolData: ProtocolData): Promise<ProtocolData> {
    const newProtocolData = protocolData;

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.dexConfig.chain,
      options.timestamp,
    );
    const beginBlockk = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.dexConfig.chain,
      options.fromTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.dexConfig.chain,
      options.toTime,
    );

    for (const pool of options.pools) {
      let poolData: GetUniswapPoolDataResult | null = null;
      if (options.dexConfig.version === 2) {
        poolData = await UniswapHelperV2.getPairData({
          services: this.services,
          dexConfig: options.dexConfig,
          pool: pool,
          timestamp: options.timestamp,
          blockNumber: blockNumber,
          beginBlock: beginBlockk,
          endBlock: endBlock,
        });
      } else if (options.dexConfig.version === 3) {
        poolData = await UniswapHelperV3.getPoolData({
          services: this.services,
          dexConfig: options.dexConfig,
          pool: pool,
          timestamp: options.timestamp,
          blockNumber: blockNumber,
          beginBlock: beginBlockk,
          endBlock: endBlock,
        });
      }

      if (poolData) {
        logger.info('got uniswap pool data', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          chain: pool.chain,
          version: options.dexConfig.version,
          pool: pool.address,
          tokens: `${pool.token0.symbol}-${pool.token1.symbol}`,
          tvl: poolData.totalLiquidityUsd,
        });

        newProtocolData.totalAssetDeposited += poolData.totalLiquidityUsd;
        newProtocolData.totalValueLocked += poolData.totalLiquidityUsd;
        (newProtocolData.totalSupplied as number) += poolData.totalLiquidityUsd;
        (newProtocolData.volumes.tokenSwap as number) += poolData.volumeSwapUsd;
        (newProtocolData.volumes.deposit as number) += poolData.volumeAddLiquidityUsd;
        (newProtocolData.volumes.withdraw as number) += poolData.volumeRemoveLiquidityUsd;
        newProtocolData.moneyFlowIn += poolData.volumeAddLiquidityUsd;
        newProtocolData.moneyFlowOut += poolData.volumeRemoveLiquidityUsd;
        newProtocolData.moneyFlowNet = newProtocolData.moneyFlowIn - newProtocolData.moneyFlowOut;
        newProtocolData.totalFees += poolData.totalSwapFeeUsd;
        newProtocolData.supplySideRevenue += poolData.totalSwapFeeUsd;
      }
    }

    return newProtocolData;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    logger.info('getting uniswap protocol data', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      blockTime: options.timestamp,
      beginTime: options.beginTime,
      endTime: options.endTime,
    });

    let protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        tokenSwap: 0,
      },
    };

    const uniswapConfig = this.protocolConfig as UniswapProtocolConfig;
    for (const dexConfig of uniswapConfig.dexes) {
      const pools = await this.getPools(dexConfig);
      protocolData = await this.getDexData(
        {
          dexConfig: dexConfig,
          pools: pools,
          timestamp: options.timestamp,
          fromTime: options.beginTime,
          toTime: options.endTime,
        },
        protocolData,
      );
    }

    return protocolData;
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const timestamp = options.timestamp ? options.timestamp : getTimestamp();

    const pools: Array<Pool> = [
      {
        chain: 'ethereum',
        factory: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
        address: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
        token0: {
          chain: 'ethereum',
          symbol: 'USDC',
          decimals: 6,
          address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        token1: {
          chain: 'ethereum',
          symbol: 'WETH',
          decimals: 18,
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        birthblock: 10008355,
        feeRate: 0.003,
      },
    ];

    const dexConfig: UniswapDexConfig = {
      chain: 'ethereum',
      version: 2,
      factory: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      birthday: 1588636800,
      birthblock: 10000836,
    };

    let protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        tokenSwap: 0,
      },
    };

    protocolData = await this.getDexData(
      {
        dexConfig: dexConfig,
        pools: pools,
        timestamp: timestamp,
        fromTime: timestamp - TimeUnits.SecondsPerDay,
        toTime: timestamp,
      },
      protocolData,
    );

    if (options.output === 'json') {
      console.log(JSON.stringify(protocolData));
    } else {
      console.log(protocolData);
    }
  }
}
