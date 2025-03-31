import { IDatabaseService } from '../database/domains';

export interface GetLogsByTopic0Options {
  // use for caching
  // disable caching if storage was not set
  database: IDatabaseService | undefined | null;

  chain: string;
  fromBlock: number;
  toBlock: number;
  topic0: string;
}

export interface EtherscanLogItem {
  chain: string;
  address: string;
  topics: Array<string>;
  data: string;
  blockNumber: number;
  logIndex: number;
  transactionHash: string;
}

export interface IEtherscanService {
  name: string;

  // etherscan api service - API key
  apiKey: string | null;

  getLogsByTopic0AutoPaging: (options: GetLogsByTopic0Options) => Promise<Array<EtherscanLogItem>>;
}
