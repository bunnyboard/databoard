import { IBitcoreService, IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { IEtherscanService } from '../services/indexer/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './base';
import {
  GetAddressBalanceUsdOptions,
  GetAddressBalanceUsdResult,
  GetChainLogsOptions,
  GetProtocolDataOptions,
  IndexContracLogsOptions,
  RunAdapterOptions,
  TestAdapterOptions,
} from './options';

export interface ContextStorages {
  database: IDatabaseService;
  memcache: IMemcacheService;
}

export interface ContextServices {
  blockchain: {
    // service for evm chains
    evm: IBlockchainService;

    // service for bitcore like chains: bitcoin, litecoin, ...
    bitcore: IBitcoreService;
  };
  indexer: {
    etherscan: IEtherscanService;
  };
  oracle: IOracleService;
}

// protocol adapter get on-chain data for
export interface IProtocolAdapter {
  name: string;

  services: ContextServices;
  storages: ContextStorages;

  protocolConfig: ProtocolConfig;

  // query protocol data
  getProtocolData: (options: GetProtocolDataOptions) => Promise<any | null>;

  // get balance USD of given address and a list of tokens
  getAddressBalanceUsd: (options: GetAddressBalanceUsdOptions) => Promise<GetAddressBalanceUsdResult>;

  // index logs of given contract address
  indexContractLogs: (options: IndexContracLogsOptions) => Promise<void>;

  // get logs from blockchain
  indexChainLogs: (options: GetChainLogsOptions) => Promise<void>;

  // start to run the adapter
  run: (options: RunAdapterOptions) => Promise<void>;

  // run test and console output data
  // for testing or verifying purposes
  runTest: (options: TestAdapterOptions) => Promise<void>;
}
