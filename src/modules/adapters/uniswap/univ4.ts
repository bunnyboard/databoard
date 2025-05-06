import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapV4PoolManagerAbi from '../../../configs/abi/uniswap/UniswapV4PoolManager.json';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { decodeEventLog } from 'viem';
import { EventSignatures } from '../../../configs/constants';
import UniswapV2Core from './univ2';
import envConfig from '../../../configs/envConfig';
import { Token } from '../../../types/base';
import AdapterDataHelper from '../helpers';
import { GetDexDataOptions, GetDexDataResult } from './core';

const UniswapV4Events = {
  Swap: '0x40e9cecb9f5f1f1c5b9c97dec2917b7ee92e57ba5563708daca94dd84ad7112f',
};

export default class UniswapV4Core extends UniswapV2Core {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    // override PoolCreated event
    this.poolCreatedEventSignature = EventSignatures.UniswapV4Factory_PoolCreated;
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: UniswapV4PoolManagerAbi,
      topics: log.topics,
      data: log.data,
    });

    const [token0, token1] = await Promise.all([
      this.services.blockchain.evm.getTokenInfo({
        chain: this.factoryConfig.chain,
        address: event.args.currency0,
      }),
      this.services.blockchain.evm.getTokenInfo({
        chain: this.factoryConfig.chain,
        address: event.args.currency1,
      }),
    ]);

    if (token0 && token1) {
      const feeRate = formatBigNumberToNumber(event.args.fee.toString(), 6);
      return {
        chain: this.factoryConfig.chain,
        type: Pool2Types.univ4,
        factory: normalizeAddress(this.factoryConfig.factory),
        address: normalizeAddress(event.args.id),
        feeRate: feeRate,
        token0,
        token1,
        birthblock: Number(log.blockNumber),
      };
    }

    return null;
  }

  // count unique tokens holded by PoolManager
  protected async getTotalLiquidityUsd(timestamp: number): Promise<number> {
    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      this.factoryConfig.chain,
      timestamp,
    );

    const tokens: { [key: string]: Token } = {};

    const callSize = 200;
    let poolIndex = 0;
    while (true) {
      const poolConfigs: Array<Pool2> = await this.storages.database.query({
        collection: envConfig.mongodb.collections.datasyncPool2.name,
        query: {
          chain: this.factoryConfig.chain,
          factory: normalizeAddress(this.factoryConfig.factory),
        },
        options: {
          limit: callSize,
          skip: poolIndex * callSize,
          order: { address: 1 },
        },
      });

      if (poolConfigs.length === 0) {
        break;
      }

      for (const pool2 of poolConfigs) {
        tokens[pool2.token0.address] = pool2.token0;
        tokens[pool2.token1.address] = pool2.token1;
      }
      poolIndex += 1;
    }

    const getBalanceResult = await AdapterDataHelper.getAddressBalanceUsd({
      services: this.services,
      chain: this.factoryConfig.chain,
      ownerAddress: this.factoryConfig.factory,
      tokens: Object.values(tokens),
      timestamp: timestamp,
      blockNumber: blockNumber,
      disableTokenPriceWarning: true,
    });

    return getBalanceResult.totalBalanceUsd;
  }

  public async getDexData(options: GetDexDataOptions): Promise<GetDexDataResult> {
    const result: GetDexDataResult = {
      totalLiquidity: await this.getTotalLiquidityUsd(options.timestamp),
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };

    // caching for reduce calls to db
    const cachingPools: { [key: string]: Pool2 | null } = {};
    const logs = (
      await this.services.blockchain.evm.getContractLogs({
        chain: this.factoryConfig.chain,
        address: this.factoryConfig.factory,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
      })
    ).filter((log) => log.topics[0] === UniswapV4Events.Swap);
    const events: Array<any> = logs.map((log) =>
      decodeEventLog({
        abi: UniswapV4PoolManagerAbi,
        topics: log.topics,
        data: log.data,
      }),
    );
    for (const event of events) {
      let pool2: Pool2 | undefined | null = cachingPools[event.args.id];
      if (!pool2) {
        pool2 = await this.storages.database.find({
          collection: envConfig.mongodb.collections.datasyncPool2.name,
          query: {
            chain: this.factoryConfig.chain,
            factory: normalizeAddress(this.factoryConfig.factory),
            address: normalizeAddress(event.args.id),
          },
        });
        if (pool2) {
          cachingPools[normalizeAddress(event.args.id)] = pool2;
        } else {
          cachingPools[normalizeAddress(event.args.id)] = null;
        }
      }

      if (pool2) {
        const feeRate = formatBigNumberToNumber(event.args.fee.toString(), 6);
        const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
        const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

        let volumeUsd = 0;
        if (amount0 < 0) {
          // swap token0 for token1
          const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: pool2.token0.chain,
            address: pool2.token0.address,
            timestamp: options.timestamp,
            disableWarning: true,
          });
          if (token0PriceUsd > 0) {
            volumeUsd = Math.abs(amount0) * token0PriceUsd;
          } else {
            const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.token1.chain,
              address: pool2.token1.address,
              timestamp: options.timestamp,
            });
            volumeUsd = (amount1 * token1PriceUsd) / (1 - feeRate);
          }
        } else if (amount0 > 0) {
          // swap token 1 for token0
          const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: pool2.token1.chain,
            address: pool2.token1.address,
            timestamp: options.timestamp,
            disableWarning: true,
          });
          if (token1PriceUsd > 0) {
            volumeUsd = Math.abs(amount1) * token1PriceUsd;
          } else {
            const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.token1.chain,
              address: pool2.token1.address,
              timestamp: options.timestamp,
            });
            volumeUsd = (amount0 * token0PriceUsd) / (1 - feeRate);
          }
        }

        result.swapVolumeUsd += volumeUsd;
        result.supplySideRevenueUsd += volumeUsd * feeRate;
      }
    }

    return result;
  }
}
