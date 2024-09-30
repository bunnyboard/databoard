import { TimeUnits } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { formatTime, getTimestamp } from '../../lib/utils';
import ExecuteSession from '../../services/executeSession';
import { IOracleService } from '../../services/oracle/domains';
import { ChainConfig } from '../../types/base';
import { ChainData } from '../../types/domains/chain';
import { ContextStorages, IChainAdapter } from '../../types/namespaces';
import { RunAdapterOptions } from '../../types/options';

export interface ChainBlockData {
  chain: string;
  number: number;
  timestamp: number;

  // gas limit
  resourceLimit: string;
  // gas used
  resourceUsed: string;

  // total transaction in block
  // execlude system transactions (on layer 2)
  totalTransactions: number;

  // list of transaction sender addresses
  // address => sent transaction count
  senderAddresses: { [key: string]: number };
}

export interface GetChainDataOptions {
  timestamp: number;
  beginTime: number;
  endTime: number;
}

export default class ChainAdapter implements IChainAdapter {
  public readonly name: string = 'chain';
  public readonly priceOracle: IOracleService;
  public readonly storages: ContextStorages;
  public readonly chainConfig: ChainConfig;
  public executeSession: ExecuteSession;

  constructor(priceOracle: IOracleService, storages: ContextStorages, chainConfig: ChainConfig) {
    this.priceOracle = priceOracle;
    this.storages = storages;
    this.chainConfig = chainConfig;
    this.executeSession = new ExecuteSession();
  }

  public async getLatestBlockNumber(): Promise<number> {
    return 0;
  }

  public async getBlockData(blockNumber: number): Promise<ChainBlockData | null> {
    return null;
  }

  public async getChainData(options: GetChainDataOptions): Promise<ChainData | null> {
    return null;
  }

  // query block data and save them into database caching
  public async indexBlocks() {
    let startBlock = 0;

    const latestBlock: any = (
      await this.storages.database.query({
        collection: envConfig.mongodb.collections.chainBlocks.name,
        query: {
          chain: this.chainConfig.chain,
        },
        options: {
          limit: 1,
          skip: 0,
          order: { number: -1 },
        },
      })
    )[0];
    if (latestBlock) {
      startBlock = latestBlock.number;
    }

    const latestBlockNumber = await this.getLatestBlockNumber();

    // start index the last 1000 blocks
    if (startBlock === 0) {
      startBlock = latestBlockNumber - 1000;
    }

    logger.info('start indexing chain blocks data', {
      service: this.name,
      chain: this.chainConfig.chain,
      fromBlock: startBlock,
      toBlock: latestBlockNumber,
    });

    let stateBlock = startBlock;
    let _startExeTime = new Date().getTime();
    while (stateBlock <= latestBlockNumber) {
      const blockData: ChainBlockData | null = await this.getBlockData(stateBlock);

      if (blockData) {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.chainBlocks.name,
          keys: {
            chain: blockData.chain,
            number: blockData.number,
          },
          updates: {
            ...blockData,
          },
          upsert: true,
        });
      }

      const blockCounts = 100;
      if (stateBlock - startBlock > 0 && (stateBlock - startBlock) % blockCounts === 0) {
        const _endExeTime = new Date().getTime();
        const elapsed = _endExeTime - _startExeTime;
        const elapsedSecs = elapsed / 1000;
        logger.info('indexing chain blocks data', {
          service: this.name,
          chain: this.chainConfig.chain,
          currentBlock: stateBlock,
          age: blockData ? formatTime(blockData.timestamp) : 'unknown',
          progress: `${stateBlock - startBlock}/${latestBlockNumber - startBlock}`,
          took: `${elapsed}ms`,
          speed: `${(blockCounts / elapsedSecs).toFixed(2)} blocks/s`,
        });
        _startExeTime = new Date().getTime();
      }

      stateBlock += 1;
    }
  }

  public async calculateDayData(): Promise<void> {
    this.executeSession.startSession('start to update chain current data', {
      service: this.name,
      chain: this.chainConfig.chain,
      family: this.chainConfig.family,
    });

    const currentTimestamp = getTimestamp();
    const last24HoursTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
    const last48HoursTimestamp = last24HoursTimestamp - TimeUnits.SecondsPerDay;

    const last24HoursData = await this.getChainData({
      timestamp: currentTimestamp,
      beginTime: last24HoursTimestamp,
      endTime: currentTimestamp,
    });
    const last48HoursData = await this.getChainData({
      timestamp: last24HoursTimestamp,
      beginTime: last48HoursTimestamp,
      endTime: last24HoursTimestamp,
    });

    if (last24HoursData) {
      if (last48HoursData) {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.blockchainDataStates.name,
          keys: {
            chain: last24HoursData.chain,
          },
          updates: {
            ...last24HoursData,
            last24HoursData: last48HoursData,
          },
          upsert: true,
        });
      } else {
        await this.storages.database.update({
          collection: envConfig.mongodb.collections.blockchainDataStates.name,
          keys: {
            chain: last24HoursData.chain,
          },
          updates: {
            ...last24HoursData,
          },
          upsert: true,
        });
      }

      this.executeSession.endSession('updated chain current data', {
        service: this.name,
        chain: this.chainConfig.chain,
        family: this.chainConfig.family,
        txnCount: last24HoursData.totalTransactions,
        addressCount: last24HoursData.activeAddresses,
      });
    }
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    // index blocks to latest block number
    await this.indexBlocks();

    // calculate day data for chain
    await this.calculateDayData();
  }
}
