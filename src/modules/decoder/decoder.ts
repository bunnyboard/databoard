import { CustomQueryChainLogsBlockRange, DefaultQueryChainLogsBlockRange } from '../../configs';
import { DecoderModuleConfig } from '../../configs/decoder';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import ExecuteSession from '../../services/executeSession';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import { RunDecoderOptions } from '../../types/options';
import { handleEventLog } from './handler';

// contract event logs decoder
export default class DecoderModule {
  public readonly name: string = 'decoder';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;
  public readonly decoderConfig: DecoderModuleConfig;
  public executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, decoderConfig: DecoderModuleConfig) {
    (this.services = services), (this.storages = storages);
    this.decoderConfig = decoderConfig;
    this.executeSession = new ExecuteSession();
  }

  public async run(options: RunDecoderOptions): Promise<void> {
    if (!this.decoderConfig.chains[options.chain]) {
      return;
    }

    // start from config block
    let stateBlock = this.decoderConfig.chains[options.chain].fromBlock;

    // start from input fromBlock
    if (options.fromBlock) {
      stateBlock = options.fromBlock;
    }

    // query database state
    const databaseStateKey = `indexing-decoder-${options.chain}`;
    const databaseState = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: databaseStateKey,
      },
    });
    if (databaseState) {
      stateBlock = databaseState.blockNumber;
    }

    const client = this.services.blockchain.evm.getPublicClient(options.chain);

    // get latest block - the target block to sync to
    const latestBlockNumber = Number(await client.getBlockNumber());

    logger.info('start to decode chain event logs', {
      service: this.name,
      chain: options.chain,
      fromBlock: stateBlock,
      toBlock: latestBlockNumber,
    });

    // custom config for every chain if possible
    const blockRange = CustomQueryChainLogsBlockRange[options.chain]
      ? CustomQueryChainLogsBlockRange[options.chain]
      : DefaultQueryChainLogsBlockRange;

    while (stateBlock <= latestBlockNumber) {
      const toBlock = stateBlock + blockRange > latestBlockNumber ? latestBlockNumber : stateBlock + blockRange;

      const logs = await client.getLogs({
        fromBlock: BigInt(stateBlock),
        toBlock: BigInt(toBlock),
      });
      for (const log of logs) {
        await handleEventLog({
          context: {
            services: this.services,
            storages: this.storages,
          },
          config: this.decoderConfig,
          chain: options.chain,
          log: log,
        });
      }

      stateBlock = toBlock + 1;

      if (!options.force) {
        // save state block
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.caching.name,
          keys: {
            name: databaseStateKey,
          },
          updates: {
            name: databaseStateKey,
            blockNumber: stateBlock,
          },
          upsert: true,
        });
      }
    }
  }
}
