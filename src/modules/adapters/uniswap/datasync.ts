import envConfig from '../../../configs/envConfig';
import { UniswapFactoryConfig, UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
import logger from '../../../lib/logger';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { decodeEventLog } from 'viem';
import { EventSignatures } from '../../../configs/constants';
import ProtocolAdapter from '../protocol';

export default class UniswapDatasync extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async indexPool2(): Promise<void> {
    const protocolConfig = this.protocolConfig as UniswapProtocolConfig;

    for (const factoryConfig of protocolConfig.factories) {
      let startBlock = factoryConfig.factoryBirthblock;

      // get the latest index number from db if any
      const syncStateKey = `factory-pools-sync-${factoryConfig.chain}-${normalizeAddress(factoryConfig.factory)}`;
      const syncState = await this.storages.database.find({
        collection: envConfig.mongodb.collections.caching.name,
        query: {
          name: syncStateKey,
        },
      });
      if (syncState) {
        startBlock = Number(syncState.blockNumber) + 1;
      }

      // get current chain latest block
      const latestBlockNumber = await this.services.blockchain.evm.getLastestBlockNumber(factoryConfig.chain);

      logger.info('start to sync pools from factory logs', {
        service: this.name,
        chain: factoryConfig.chain,
        factory: factoryConfig.factory,
        fromBlock: startBlock,
        toBlock: latestBlockNumber,
      });

      const blockRange = 10000;
      while (startBlock <= latestBlockNumber) {
        const toBlock = startBlock + blockRange > latestBlockNumber ? latestBlockNumber : startBlock + blockRange;
        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: factoryConfig.chain,
          address: factoryConfig.factory,
          fromBlock: startBlock,
          toBlock: toBlock,
        });

        for (const log of logs) {
          let pool2: Pool2 | null = null;

          if (log.topics[0] === EventSignatures.UniswapV2Factory_PairCreated) {
            pool2 = await UniswapDatasync.parseV2PairCreatedEvent(this.services, factoryConfig, log);
          } else if (log.topics[0] === EventSignatures.UniswapV3Factory_PoolCreated) {
            pool2 = await UniswapDatasync.parseV3PairCreatedEvent(this.services, factoryConfig, log);
          }

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

        startBlock = toBlock + 1;

        await this.storages.database.update({
          collection: envConfig.mongodb.collections.caching.name,
          keys: {
            name: syncStateKey,
          },
          updates: {
            name: syncStateKey,
            blockNumber: startBlock,
          },
          upsert: true,
        });
      }
    }
  }

  public static async parseV2PairCreatedEvent(
    services: ContextServices,
    factoryConfig: UniswapFactoryConfig,
    log: any,
  ): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: UniswapV2FactoryAbi,
      topics: log.topics,
      data: log.data,
    });

    const [token0, token1] = await Promise.all([
      services.blockchain.evm.getTokenInfo({
        chain: factoryConfig.chain,
        address: event.args.token0,
      }),
      services.blockchain.evm.getTokenInfo({
        chain: factoryConfig.chain,
        address: event.args.token1,
      }),
    ]);

    if (token0 && token1) {
      const feeRateForLiquidityProviders = factoryConfig.feeRateForLiquidityProviders
        ? factoryConfig.feeRateForLiquidityProviders
        : 0;
      const feeRateForProtocol = factoryConfig.feeRateForProtocol ? factoryConfig.feeRateForProtocol : 0;

      let feeRate = feeRateForLiquidityProviders + feeRateForProtocol;
      if (feeRate === 0) {
        feeRate = 0.003;
      }

      return {
        chain: factoryConfig.chain,
        type: Pool2Types.univ2,
        factory: normalizeAddress(factoryConfig.factory),
        address: normalizeAddress(event.args.pair),
        feeRate: feeRate,
        token0,
        token1,
        birthblock: Number(log.blockNumber),
      };
    }

    return null;
  }

  public static async parseV3PairCreatedEvent(
    services: ContextServices,
    factoryConfig: UniswapFactoryConfig,
    log: any,
  ): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: UniswapV3FactoryAbi,
      topics: log.topics,
      data: log.data,
    });

    const [token0, token1] = await Promise.all([
      services.blockchain.evm.getTokenInfo({
        chain: factoryConfig.chain,
        address: event.args.token0,
      }),
      services.blockchain.evm.getTokenInfo({
        chain: factoryConfig.chain,
        address: event.args.token1,
      }),
    ]);

    if (token0 && token1) {
      const feeRate = formatBigNumberToNumber(event.args.fee.toString(), 6);
      return {
        chain: factoryConfig.chain,
        type: Pool2Types.univ3,
        factory: normalizeAddress(factoryConfig.factory),
        address: normalizeAddress(event.args.pool),
        feeRate: feeRate,
        token0,
        token1,
        birthblock: Number(log.blockNumber),
      };
    }

    return null;
  }
}
