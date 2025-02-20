import { IBitcoreService, IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { ILocaldbService } from '../services/localdb/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './base';
import { GetProtocolDataOptions, RunAdapterOptions, TestAdapterOptions } from './options';

export interface ContextStorages {
  database: IDatabaseService;
  memcache: IMemcacheService;
  localdb: ILocaldbService;
}

export interface ContextServices {
  blockchain: {
    // service for evm chains
    evm: IBlockchainService;

    // service for bitcore like chains: bitcoin, litecoin, ...
    bitcore: IBitcoreService;
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

  run: (options: RunAdapterOptions) => Promise<void>;

  // run test and console output data
  // for testing or verifying purposes
  runTest: (options: TestAdapterOptions) => Promise<void>;
}
