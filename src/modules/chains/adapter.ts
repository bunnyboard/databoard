import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { formatTime } from '../../lib/utils';
import { IOracleService } from '../../services/oracle/domains';
import { ChainConfig } from '../../types/base';
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

export default class ChainAdapter implements IChainAdapter {
  public readonly name: string = 'chain';
  public readonly priceOracle: IOracleService;
  public readonly storages: ContextStorages;
  public readonly chainConfig: ChainConfig;

  constructor(priceOracle: IOracleService, storages: ContextStorages, chainConfig: ChainConfig) {
    this.priceOracle = priceOracle;
    this.storages = storages;
    this.chainConfig = chainConfig;
  }

  public async getLatestBlockNumber(): Promise<number> {
    return 0;
  }

  public async getBlockData(blockNumber: number): Promise<ChainBlockData | null> {
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

  public async run(options: RunAdapterOptions): Promise<void> {
    // index blocks to latest block number
    await this.indexBlocks();
  }
}
