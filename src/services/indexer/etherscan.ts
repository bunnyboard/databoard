import axios from 'axios';
import { EtherscanLogItem, GetLogsByTopic0Options, IEtherscanService } from './domains';
import logger from '../../lib/logger';
import { generateHashMD5, normalizeAddress, sleep } from '../../lib/utils';
import { getChainIdByName } from '../../lib/helpers';
import envConfig from '../../configs/envConfig';

const EtherscanQueryConfigs: any = {
  defaultBlockrange: 1000,
  customBlockRanges: {
    ethereum: 200,
    arbitrum: 10000,
    optimism: 10000,
    sonic: 5000,
  },
};

export default class EtherscanService implements IEtherscanService {
  public readonly name: string = 'etherscan';
  public readonly apiKey: string | null = null;

  constructor(apiKey: string | null) {
    this.apiKey = apiKey;
  }

  private async makeRequest(requestUrl: string): Promise<any> {
    let doIt = 0;

    do {
      try {
        const response = await axios.get(requestUrl);
        return response.data;
      } catch (e: any) {
        logger.warn('failed to make request to etherscan, retrying', {
          service: this.name,
          error: e.message,
        });
      }
      await sleep(2);
    } while (doIt < 5);

    return null;
  }

  private async getLogsByTopic0(options: GetLogsByTopic0Options): Promise<Array<EtherscanLogItem>> {
    const chainId = getChainIdByName(options.chain);

    let pageIndex = 1;
    let logs: Array<EtherscanLogItem> = [];
    do {
      const requestUrl = `https://api.etherscan.io/v2/api?chainId=${chainId}&module=logs&action=getLogs&fromBlock=${options.fromBlock}&toBlock=${options.toBlock}&topic0=${options.topic0}&page=${pageIndex}&offset=1000&apiKey=${this.apiKey}`;
      const responseData = await this.makeRequest(requestUrl);
      if (!responseData) {
        await sleep(2);
        continue;
      }

      if (responseData.result) {
        logs = logs.concat(
          responseData.result.map((item: any) => {
            return {
              chain: options.chain,
              address: normalizeAddress(item.address),
              topics: item.topics,
              data: item.data,
              blockNumber: parseInt(item.blockNumber, 16),
              logIndex: parseInt(item.logIndex, 16),
              transactionHash: item.transactionHash,
            } as EtherscanLogItem;
          }),
        );

        if (responseData.result.length === 0) {
          break;
        }
      } else {
        break;
      }

      pageIndex += 1;

      await sleep(0.2);
    } while (true);

    return logs;
  }

  public async getLogsByTopic0AutoPaging(options: GetLogsByTopic0Options): Promise<Array<EtherscanLogItem>> {
    let logs: Array<EtherscanLogItem> = [];

    const syncKey = generateHashMD5(
      `etherscan-getLogs-${options.chain}-${options.topic0}-${options.fromBlock}-${options.toBlock}`,
    );

    let startBlock = options.fromBlock;
    if (options.database) {
      const syncState = await options.database.find({
        collection: envConfig.mongodb.collections.caching.name,
        query: {
          name: syncKey,
        },
      });
      if (syncState) {
        const blockNumber = Number(syncState.blockNumber);
        if (blockNumber > startBlock) {
          // fill logs with database caching logs
          const databseLogs = await options.database.query({
            collection: envConfig.mongodb.collections.contractLogs.name,
            query: {
              chain: options.chain,
              'topics.0': options.topic0,
              blockNumber: {
                $gte: options.fromBlock,
                $lte: blockNumber,
              },
            },
          });

          logs = databseLogs.map((item) => {
            return {
              chain: item.chain,
              address: item.address,
              topics: item.topics,
              data: item.data,
              blockNumber: item.blockNumber,
              logIndex: item.logIndex,
              transactionHash: item.transactionHash,
            };
          });

          startBlock = blockNumber + 1;
        }
      }
    }

    const blockRange = EtherscanQueryConfigs.customBlockRanges[options.chain]
      ? EtherscanQueryConfigs.customBlockRanges[options.chain]
      : EtherscanQueryConfigs.defaultBlockrange;

    logger.debug('getting contract logs from etherscan', {
      service: this.name,
      chain: options.chain,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
      cached: `${Math.floor(((startBlock - options.fromBlock) / (options.toBlock - options.fromBlock)) * 100)}%`,
      cacheKey: syncKey,
    });

    while (startBlock <= options.toBlock) {
      const toBlock = startBlock + blockRange > options.toBlock ? options.toBlock : startBlock + blockRange;

      const roundLogs: Array<EtherscanLogItem> = await this.getLogsByTopic0({
        database: null,
        chain: options.chain,
        topic0: options.topic0,
        fromBlock: startBlock,
        toBlock: toBlock,
      });

      if (options.database) {
        await options.database.bulkWrite({
          collection: envConfig.mongodb.collections.contractLogs.name,
          operations: roundLogs.map((log) => {
            return {
              updateOne: {
                filter: {
                  chain: log.chain,
                  address: log.address,
                  transactionHash: log.transactionHash,
                  logIndex: log.logIndex,
                },
                update: {
                  $set: {
                    ...log,
                  },
                },
                upsert: true,
              },
            };
          }),
        });

        await options.database.update({
          collection: envConfig.mongodb.collections.caching.name,
          keys: {
            name: syncKey,
          },
          updates: {
            name: syncKey,
            blockNumber: toBlock,
          },
          upsert: true,
        });
      }

      // add to return list logs
      logs = logs.concat(roundLogs);

      startBlock = toBlock + 1;
    }

    return logs;
  }
}
