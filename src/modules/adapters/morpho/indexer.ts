import { MorphoBlueConfig } from '../../../configs/protocols/morpho';
import { ProtocolConfig, Token } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import { decodeEventLog } from 'viem';
import { normalizeAddress } from '../../../lib/utils';
import logger from '../../../lib/logger';
import envConfig from '../../../configs/envConfig';

export interface MorphoBlueMarketMetadata {
  chain: string;
  morphoBlue: string;
  marketId: string;
  debtToken: Token;
  collateralToken: Token;
  oracle: string;
  irm: string;
  ltv: string;
  birthday: number;
  birthblock: number;
}

export const Events = {
  // create market
  CreateMarket: '0xac4b2400f169220b0c0afdde7a0b32e775ba727ea1cb30b35f935cdaab8683ac',

  // save to databse these events
  SupplyCollateral: '0xa3b9472a1399e17e123f3c2e6586c23e504184d504de59cdaa2b375e880c6184',
  WithdrawCollateral: '0xe80ebd7cc9223d7382aab2e0d1d6155c65651f83d53c8b9b06901d167e321142',
  Liquidate: '0xa4946ede45d0c6f06a0f5ce92c9ad3b4751452d2fe0e25010783bcab57a67e41',
};

const KeyMarkets = 'morpho-blue-market';
const SyncKeyMarkets = 'indexing-morpho-markets';

// index vaults and markets from contract events
// and save them into database
export default class MorphoIndexerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getMarketInfoFromLog(
    morphoBlueConfig: MorphoBlueConfig,
    log: any,
  ): Promise<MorphoBlueMarketMetadata | null> {
    const event: any = decodeEventLog({
      abi: MorphoBlueAbi,
      topics: log.topics,
      data: log.data,
    });

    const block = await this.services.blockchain.evm.getBlock(morphoBlueConfig.chain, Number(log.blockNumber));

    const marketId = event.args.id;
    const debtToken = await this.services.blockchain.evm.getTokenInfo({
      chain: morphoBlueConfig.chain,
      address: event.args.marketParams.loanToken.toString(),
    });
    const collateral = await this.services.blockchain.evm.getTokenInfo({
      chain: morphoBlueConfig.chain,
      address: event.args.marketParams.collateralToken.toString(),
    });
    if (debtToken && collateral) {
      const lendingPool: MorphoBlueMarketMetadata = {
        chain: morphoBlueConfig.chain,
        morphoBlue: normalizeAddress(morphoBlueConfig.morphoBlue),
        marketId: marketId,
        birthblock: Number(log.blockNumber),
        birthday: Number(block.timestamp),
        debtToken,
        collateralToken: collateral,
        oracle: normalizeAddress(event.args.marketParams.oracle.toString()),
        irm: normalizeAddress(event.args.marketParams.irm.toString()),
        ltv: event.args.marketParams.lltv.toString(),
      };

      return lendingPool;
    }

    return null;
  }

  public async getMarketsMetadata(morphoBlueConfig: MorphoBlueConfig): Promise<Array<MorphoBlueMarketMetadata>> {
    const markets = await this.storages.database.query({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: `${KeyMarkets}-${morphoBlueConfig.chain}-${normalizeAddress(morphoBlueConfig.morphoBlue)}`,
      },
    });

    return markets.map((item) => {
      return {
        chain: item.chain,
        morphoBlue: item.address,
        marketId: item.marketId,
        birthblock: item.birthblock,
        birthday: item.birthday,
        debtToken: item.debtToken,
        collateralToken: item.collateralToken,
        oracle: item.oracle,
        irm: item.irm,
        ltv: item.ltv,
      };
    });
  }

  public async indexMarketsFromContractLogs(morphoBlueConfig: MorphoBlueConfig) {
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
        if (log.topics[0] === Events.CreateMarket) {
          const marketMetadata = await this.getMarketInfoFromLog(morphoBlueConfig, log);
          if (marketMetadata) {
            await this.storages.database.update({
              collection: envConfig.mongodb.collections.caching.name,
              keys: {
                name: `${KeyMarkets}-${marketMetadata.chain}-${marketMetadata.morphoBlue}`,
                poolId: marketMetadata.marketId,
              },
              updates: {
                name: `${KeyMarkets}-${marketMetadata.chain}-${marketMetadata.morphoBlue}`,
                ...marketMetadata,
              },
              upsert: true,
            });

            logger.debug('got morpho blue market metadata', {
              service: this.name,
              protocol: this.protocolConfig.protocol,
              chain: marketMetadata.chain,
              address: marketMetadata.morphoBlue,
              debtToken: marketMetadata.debtToken.symbol,
              collateral: marketMetadata.collateralToken.symbol,
            });
          }
        } else if (
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
