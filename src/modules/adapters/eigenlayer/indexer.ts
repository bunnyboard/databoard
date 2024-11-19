import envConfig from '../../../configs/envConfig';
import { EigenLayerProtocolConfig } from '../../../configs/protocols/eigenlayer';
import logger from '../../../lib/logger';
import { normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';

const Events = {
  PodDeployed: '0x21c99d0db02213c32fff5b05cf0a718ab5f858802b91498f80d82270289d856a',
};

const SyncKeyName = 'EigenLayerPodDeployedEventsSync';

export default class EigenLayerIndexer extends ProtocolAdapter {
  public readonly name: string = 'adapter.eigenlayer';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // index PodDeployed events
  public async indexHistoricalLogs(eigenConfig: EigenLayerProtocolConfig) {
    // find the latest block number when events was synced from database
    let startFromBlock = eigenConfig.birthblock ? eigenConfig.birthblock : 0;
    const latestBlock = await this.services.blockchain.evm.getLastestBlockNumber(eigenConfig.chain);

    // find the latest block from database if any
    const latestSyncState: any = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: SyncKeyName,
      },
    });
    if (latestSyncState) {
      startFromBlock = latestSyncState.blockNumber;
    }

    logger.info('indexing pod deployed events', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      chain: eigenConfig.chain,
      podManager: eigenConfig.podManager,
      fromBlock: startFromBlock,
      toBlock: latestBlock,
    });

    const patchSize = 10000; // 10k blocks
    while (startFromBlock < latestBlock) {
      const toBlock = startFromBlock + patchSize > latestBlock ? latestBlock : startFromBlock + patchSize;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: eigenConfig.chain,
        address: eigenConfig.podManager,
        fromBlock: startFromBlock,
        toBlock: toBlock,
        blockRange: 5000,
      });

      for (const log of logs) {
        if (log.topics[0] === Events.PodDeployed) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.contractLogs.name,
            keys: {
              chain: eigenConfig.chain,
              address: normalizeAddress(eigenConfig.podManager),
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
            },
            updates: {
              chain: eigenConfig.chain,
              address: normalizeAddress(eigenConfig.podManager),
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
              blockNumber: Number(log.blockNumber),
              topics: log.topics,
              data: log.data,
            },
            upsert: true,
          });
        }
      }

      startFromBlock = toBlock + 1;

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: SyncKeyName,
        },
        updates: {
          name: SyncKeyName,
          blockNumber: startFromBlock,
        },
        upsert: true,
      });
    }
  }
}
