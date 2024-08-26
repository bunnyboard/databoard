import { IBlockchainService } from '../services/blockchains/domains';
import { IMemcacheService } from '../services/caching/domains';
import { IDatabaseService } from '../services/database/domains';
import { IOracleService } from '../services/oracle/domains';
import { ProtocolConfig } from './base';
import { ProtocolData } from './domains/protocol';
import { GetProtocolDataOptions, RunAdapterOptions, TestAdapterOptions } from './options';

export interface ContextStorages {
  database: IDatabaseService;
  memcache: IMemcacheService;
}

export interface ContextServices {
  blockchain: {
    // setrvice for evm chains
    evm: IBlockchainService;
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
  getProtocolData: (options: GetProtocolDataOptions) => Promise<ProtocolData | null>;

  // run updater worker which interval query data and save to database
  run: (options: RunAdapterOptions) => Promise<void>;

  // run test and console output data
  // for testing or verifying purposes
  runTest: (options: TestAdapterOptions) => Promise<void>;
}
