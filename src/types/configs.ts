import { MongoCollectionConfig } from '../services/database/domains';
import { ChainFamily, Token } from './base';

export interface Blockchain {
  // ex: ethereum
  name: string;

  // unique chain id number
  chainId: number;

  // default: evm, more coming soon
  family: ChainFamily;

  // default node RPC endpoint
  nodeRpc: string;

  // the native coin
  nativeToken: Token;
}

export interface DatabaseCollectionConfig {
  // save all caching data to get data faster
  // safe to delete this collection anytime
  caching: MongoCollectionConfig;

  // save contract logs
  contractLogs: MongoCollectionConfig;

  // save protocol current data state
  protocolDataStates: MongoCollectionConfig;

  // save protocol data historical/snapshots
  protocolDataSnapshots: MongoCollectionConfig;
}

export interface EnvConfig {
  env: {
    debug: boolean;
  };

  mongodb: {
    databaseName: string;
    connectionUri: string;
    collections: DatabaseCollectionConfig;
  };

  // we pre-define supported blockchains here
  blockchains: {
    [key: string]: Blockchain;
  };

  externalConfigs: {
    alchemyAppKey: string;
    etherscanApiKey: string;
  };
}
