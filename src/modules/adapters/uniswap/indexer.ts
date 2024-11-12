import envConfig from '../../../configs/envConfig';
import { UniswapDexConfig } from '../../../configs/protocols/uniswap';
import { normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import { ContractCall } from '../../../services/blockchains/domains';
import logger from '../../../lib/logger';
import { Uniswapv3Events } from './types';
import { decodeEventLog } from 'viem';

// help to index logs for uniswap v2, v3 dex data
export default class UniswapIndexer extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async indexDexData(dexConfig: UniswapDexConfig): Promise<void> {
    if (dexConfig.version === Pool2Types.univ2) {
      await this.indexDexDataUniV2(dexConfig);
    } else if (dexConfig.version === Pool2Types.univ3) {
      await this.indexDexDataUniV3(dexConfig);
    }
  }

  private async indexDexDataUniV2(dexConfig: UniswapDexConfig): Promise<void> {
    const latestPoolIndexingKey = `UniV2FactoryPoolIndex-${dexConfig.chain}-${normalizeAddress(dexConfig.factory)}`;

    let startIndex = 0;
    const latestStateIndexFromDb = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: latestPoolIndexingKey,
      },
    });
    if (latestStateIndexFromDb) {
      startIndex = latestStateIndexFromDb.poolListIndex;
    }

    const poolLength = await this.services.blockchain.evm.readContract({
      chain: dexConfig.chain,
      abi: UniswapV2FactoryAbi,
      target: dexConfig.factory,
      method: 'allPairsLength',
      params: [],
    });

    logger.info('start to index univ2 pool2 metadata', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      chain: dexConfig.chain,
      version: dexConfig.version,
      factory: dexConfig.factory,
      fromIndex: startIndex,
      toIndex: Number(poolLength),
    });

    const callSize = 200;
    while (startIndex < Number(poolLength)) {
      this.executeSession.startSessionMuted();

      const targetIndexEnd = startIndex + callSize > Number(poolLength) ? Number(poolLength) : startIndex + callSize;

      const getAddressCalls: Array<ContractCall> = [];
      for (let i = startIndex; i < targetIndexEnd; i++) {
        getAddressCalls.push({
          abi: UniswapV2FactoryAbi,
          target: dexConfig.factory,
          method: 'allPairs',
          params: [i],
        });
      }

      const getAddressResults = await this.services.blockchain.evm.multicall({
        chain: dexConfig.chain,
        calls: getAddressCalls,
      });

      const getPoolTokenCalls: Array<ContractCall> = [];
      for (let i = 0; i < getAddressResults.length; i++) {
        getPoolTokenCalls.push({
          abi: UniswapV2PairAbi,
          target: getAddressResults[i],
          method: 'token0',
          params: [],
        });
        getPoolTokenCalls.push({
          abi: UniswapV2PairAbi,
          target: getAddressResults[i],
          method: 'token1',
          params: [],
        });
      }

      const getPoolTokenResults = await this.services.blockchain.evm.multicall({
        chain: dexConfig.chain,
        calls: getPoolTokenCalls,
      });

      for (let i = 0; i < getAddressResults.length; i++) {
        const token0 = await this.services.blockchain.evm.getTokenInfo({
          chain: dexConfig.chain,
          address: getPoolTokenResults[i * 2],
        });
        const token1 = await this.services.blockchain.evm.getTokenInfo({
          chain: dexConfig.chain,
          address: getPoolTokenResults[i * 2 + 1],
        });

        if (token0 && token1) {
          const feeRate =
            dexConfig.feeRateForLiquidityProviders && dexConfig.feeRateForProtocol
              ? dexConfig.feeRateForLiquidityProviders + dexConfig.feeRateForProtocol
              : 0.003;

          const pool: Pool2 = {
            protocol: this.protocolConfig.protocol,
            chain: dexConfig.chain,
            type: dexConfig.version,
            factory: normalizeAddress(dexConfig.factory),
            address: normalizeAddress(getAddressResults[i]),
            feeRate: feeRate,
            token0,
            token1,
          };

          await this.storages.database.update({
            collection: envConfig.mongodb.collections.metadataPool2.name,
            keys: {
              chain: dexConfig.chain,
              factory: pool.factory,
              address: pool.address,
            },
            updates: {
              ...pool,
            },
            upsert: true,
          });
        }
      }

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: latestPoolIndexingKey,
        },
        updates: {
          name: latestPoolIndexingKey,
          poolListIndex: targetIndexEnd,
        },
        upsert: true,
      });

      this.executeSession.endSession('got univ2 pool2 metadata from factory', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: dexConfig.chain,
        version: dexConfig.version,
        factory: dexConfig.factory,
        latestIndex: targetIndexEnd,
      });

      startIndex = targetIndexEnd;
    }
  }

  // index UniswapV3Factory contract logs
  private async indexDexDataUniV3(dexConfig: UniswapDexConfig): Promise<void> {
    const latestPoolIndexingKey = `UniV3FactoryPoolIndex-${dexConfig.chain}-${normalizeAddress(dexConfig.factory)}`;

    let startBlock = dexConfig.factoryBirthBlock ? dexConfig.factoryBirthBlock : 0;
    const latestStateIndexFromDb = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: latestPoolIndexingKey,
      },
    });
    if (latestStateIndexFromDb) {
      startBlock = latestStateIndexFromDb.latestBlockNumber;
    }

    const latestBlockNumber = await this.services.blockchain.evm.getLastestBlockNumber(dexConfig.chain);

    logger.info('start to index univ3 pool2 metadata', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      chain: dexConfig.chain,
      version: dexConfig.version,
      factory: dexConfig.factory,
      fromBlock: startBlock,
      toIndex: Number(latestBlockNumber),
    });

    const blockRange = 10000;
    while (startBlock <= Number(latestBlockNumber)) {
      this.executeSession.startSessionMuted();

      const toBlock =
        startBlock + blockRange > Number(latestBlockNumber) ? Number(latestBlockNumber) : startBlock + blockRange;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: dexConfig.chain,
        address: dexConfig.factory,
        fromBlock: startBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === Uniswapv3Events.PoolCreated) {
          const event: any = decodeEventLog({
            abi: UniswapV3FactoryAbi,
            topics: log.topics,
            data: log.data,
          });

          const token0 = await this.services.blockchain.evm.getTokenInfo({
            chain: dexConfig.chain,
            address: event.args.token0,
          });
          const token1 = await this.services.blockchain.evm.getTokenInfo({
            chain: dexConfig.chain,
            address: event.args.token1,
          });
          if (token0 && token1) {
            const pool: Pool2 = {
              protocol: this.protocolConfig.protocol,
              chain: dexConfig.chain,
              type: dexConfig.version,
              factory: normalizeAddress(dexConfig.factory),
              address: normalizeAddress(event.args.pool),
              feeRate: Number(event.args.fee) / 1e6,
              token0,
              token1,
            };

            await this.storages.database.update({
              collection: envConfig.mongodb.collections.metadataPool2.name,
              keys: {
                chain: dexConfig.chain,
                factory: pool.factory,
                address: pool.address,
              },
              updates: {
                ...pool,
              },
              upsert: true,
            });
          }
        }
      }

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: latestPoolIndexingKey,
        },
        updates: {
          name: latestPoolIndexingKey,
          latestBlockNumber: toBlock + 1,
        },
        upsert: true,
      });

      this.executeSession.endSession('got univ3 pool2 metadata from factory', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: dexConfig.chain,
        version: dexConfig.version,
        factory: dexConfig.factory,
        latestBlockNumber: toBlock,
      });

      startBlock = toBlock + 1;
    }
  }
}
