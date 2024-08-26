import { PublicClient } from 'viem';

import { ContextStorages } from '../../types/namespaces';
import { Token } from '../../types/base';

export interface ReadContractOptions {
  chain: string;
  target: string;
  abi: Array<any>;
  method: string;
  params: Array<any>;

  // sometime, we need query data at a given block
  // this call requires RPC is an archived node
  blockNumber?: number;
}

export interface GetTokenOptions {
  chain: string;
  address: string;

  // force to query data onchain
  onchain?: boolean;
}

export interface GetContractLogsOptions {
  chain: string;
  address: string;
  fromBlock: number;
  toBlock: number;

  blockRange?: number;
}

export interface ContractCall {
  target: string; // target/contract address
  abi: any; // target ABI
  method: string;
  params: Array<any>;
}

export interface MulticallOptions {
  chain: string;
  blockNumber?: number;
  calls: Array<ContractCall>;
}

export interface IndexContractLogsOptions extends GetContractLogsOptions {
  signatures: Array<string>;
}

export interface IBlockchainService {
  // should be labeled as blockchain
  name: string;

  getPublicClient: (chain: string) => PublicClient;

  // get latest block number from chain
  getLastestBlockNumber: (chain: string) => Promise<number>;

  // get block
  getBlock: (chain: string, number: number) => Promise<any>;

  // get token info
  getTokenInfo: (options: GetTokenOptions) => Promise<Token | null>;

  // get contract raw logs
  getContractLogs: (options: GetContractLogsOptions) => Promise<Array<any>>;

  // read contract public method
  readContract: (call: ReadContractOptions) => Promise<any>;

  // multicall3
  multicall3: (options: MulticallOptions) => Promise<any>;

  // this is a custom multicall
  // first, we try query data with multicall3
  // if it failed, we do read contract one by one
  multicall: (options: MulticallOptions) => Promise<any>;

  // loop until get block number success
  tryGetBlockNumberAtTimestamp: (chain: string, timestamp: number) => Promise<number>;

  // get contract logs and save to database
  indexContractLogs: (storages: ContextStorages, options: IndexContractLogsOptions) => Promise<void>;
}
