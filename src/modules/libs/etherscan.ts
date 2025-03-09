import axios from 'axios';
import { getChainIdByName } from '../../lib/helpers';
import { normalizeAddress, sleep } from '../../lib/utils';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';

const EtherscanQueryConfigs: any = {
  defaultBlockrange: 1000,
  customBlockRanges: {
    ethereum: 200,
    arbitrum: 10000,
    optimism: 10000,
    sonic: 5000,
  },
};

export interface GetLogsByTopic0Options {
  chain: string;
  fromBlock: number;
  toBlock: number;
  topic0: string;
}

export interface EtherscanLogItem {
  address: string;
  topics: Array<string>;
  data: string;
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
}

export default class EtherscanLibs {
  public static async getLogsByTopic0(options: GetLogsByTopic0Options): Promise<Array<EtherscanLogItem>> {
    const chainId = getChainIdByName(options.chain);

    let pageIndex = 1;
    let logs: Array<EtherscanLogItem> = [];
    do {
      const requestUrl = `https://api.etherscan.io/v2/api?chainId=${chainId}&module=logs&action=getLogs&fromBlock=${options.fromBlock}&toBlock=${options.toBlock}&topic0=${options.topic0}&page=${pageIndex}&offset=1000&apiKey=${envConfig.etherscan.etherscanApiKey}`;
      const response = await axios.get(requestUrl);

      if (response.data.result) {
        logs = logs.concat(
          response.data.result.map((item: any) => {
            return {
              address: normalizeAddress(item.address),
              topics: item.topics,
              data: item.data,
              blockNumber: parseInt(item.blockNumber, 16),
              logIndex: parseInt(item.logIndex, 16),
              transactionHash: item.transactionHash,
            } as EtherscanLogItem;
          }),
        );

        if (response.data.result.length === 0) {
          break;
        }
      } else {
        break;
      }

      pageIndex += 1;

      await sleep(1);
    } while (true);

    return logs;
  }

  public static async getLogsByTopic0AutoPaging(options: GetLogsByTopic0Options): Promise<Array<EtherscanLogItem>> {
    let logs: Array<EtherscanLogItem> = [];

    const blockRange = EtherscanQueryConfigs.customBlockRanges[options.chain]
      ? EtherscanQueryConfigs.customBlockRanges[options.chain]
      : EtherscanQueryConfigs.defaultBlockrange;

    logger.debug('getting contract logs from etherscan', {
      service: this.name,
      chain: options.chain,
      fromBlock: options.fromBlock,
      toBlock: options.toBlock,
    });

    let startBlock = options.fromBlock;
    while (startBlock <= options.toBlock) {
      const toBlock = startBlock + blockRange > options.toBlock ? options.toBlock : startBlock + blockRange;

      const roundLogs: Array<EtherscanLogItem> = await EtherscanLibs.getLogsByTopic0({
        chain: options.chain,
        topic0: options.topic0,
        fromBlock: startBlock,
        toBlock: toBlock,
      });

      // add to return list logs
      logs = logs.concat(roundLogs);

      startBlock = toBlock + 1;
    }

    return logs;
  }
}
