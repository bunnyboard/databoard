import { MorphoBlueConfig } from '../../../configs/protocols/morpho';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import { normalizeAddress } from '../../../lib/utils';
import logger from '../../../lib/logger';
import envConfig from '../../../configs/envConfig';

export const Events = {
  // save to databse these events
  SupplyCollateral: '0xa3b9472a1399e17e123f3c2e6586c23e504184d504de59cdaa2b375e880c6184',
  WithdrawCollateral: '0xe80ebd7cc9223d7382aab2e0d1d6155c65651f83d53c8b9b06901d167e321142',
  Liquidate: '0xa4946ede45d0c6f06a0f5ce92c9ad3b4751452d2fe0e25010783bcab57a67e41',
};

const SyncKeyMarkets = 'indexing-morpho-markets';

// index vaults and markets from contract events
// and save them into database
export default class MorphoIndexerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async indexHistoricalLogs(morphoBlueConfig: MorphoBlueConfig) {
    // find the latest block number when events was synced from database
    let startFromBlock = morphoBlueConfig.birthblock ? morphoBlueConfig.birthblock : 0;
    const latestBlock = await this.services.blockchain.evm.getLastestBlockNumber(morphoBlueConfig.chain);

    // find the latest block from database if any
    const latestSyncState: any = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: `${SyncKeyMarkets}-${morphoBlueConfig.chain}-${normalizeAddress(morphoBlueConfig.morphoBlue)}`,
      },
    });
    if (latestSyncState) {
      startFromBlock = latestSyncState.blockNumber;
    }

    logger.info('indexing morpho blue markets from logs', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      chain: morphoBlueConfig.chain,
      morphoBlue: morphoBlueConfig.morphoBlue,
      fromBlock: startFromBlock,
      toBlock: latestBlock,
    });

    const patchSize = 100000; // 100k blocks
    while (startFromBlock < latestBlock) {
      const toBlock = startFromBlock + patchSize > latestBlock ? latestBlock : startFromBlock + patchSize;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: morphoBlueConfig.chain,
        address: morphoBlueConfig.morphoBlue,
        fromBlock: startFromBlock,
        toBlock: toBlock,
        blockRange: morphoBlueConfig.chain === 'base' ? 10000 : 5000,
      });

      for (const log of logs) {
        if (
          log.topics[0] === Events.SupplyCollateral ||
          log.topics[0] === Events.WithdrawCollateral ||
          log.topics[0] === Events.Liquidate
        ) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.contractLogs.name,
            keys: {
              chain: morphoBlueConfig.chain,
              address: normalizeAddress(morphoBlueConfig.morphoBlue),
              transactionHash: log.transactionHash,
              logIndex: log.logIndex,
            },
            updates: {
              chain: morphoBlueConfig.chain,
              address: normalizeAddress(log.address),
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
          name: `${SyncKeyMarkets}-${morphoBlueConfig.chain}-${normalizeAddress(morphoBlueConfig.morphoBlue)}`,
        },
        updates: {
          name: `${SyncKeyMarkets}-${morphoBlueConfig.chain}-${normalizeAddress(morphoBlueConfig.morphoBlue)}`,
          blockNumber: startFromBlock,
        },
        upsert: true,
      });
    }
  }
}
