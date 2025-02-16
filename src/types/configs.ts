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

  // save blockchain current data state
  blockchainDataStates: MongoCollectionConfig;

  // save blockchain data historical/snapshots
  blockchainDataSnapshots: MongoCollectionConfig;

  // save liquidity pool2 (uniswap v2, v3) configs
  datasyncPool2: MongoCollectionConfig;

  // save liquidity pools of Balancer.fi-like pools
  datasyncPoolBalancer: MongoCollectionConfig;

  // save blockchain block data
  datasyncChainBlocks: MongoCollectionConfig;

  // save decoded dex pool2
  decodeDexPool2: MongoCollectionConfig;

  // save decoded dex events
  decodeDexEvents: MongoCollectionConfig;
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

  // config sentry for errors tracing
  sentry: {
    dsn: string | null;
  };

  // etherscan api keys
  etherscan: {
    etherscanApiKey: string | null;
  };

  // coingecko api keys
  coingecko: {
    coingeckoApiKey: string | null;
  };

  // thegraph
  thegraph: {
    thegraphApiKey: string | null;
  };
}
