import dotenv from 'dotenv';

import { EnvConfig } from '../types/configs';
import { BlockchainConfigs } from './blockchains';
import { DatabaseCollectionConfigs } from './database';

// global env and configurations
dotenv.config();

const envConfig: EnvConfig = {
  mongodb: {
    databaseName: String(process.env.DATABASE_MONGODB_NAME),
    connectionUri: String(process.env.DATABASE_MONGODB_URI),
    collections: DatabaseCollectionConfigs,
  },
  blockchains: BlockchainConfigs,
  env: {
    debug: String(process.env.ENV_DEBUG) === 'true',
  },
  sentry: {
    dsn: process.env.SENTRY_DSN && process.env.SENTRY_DSN !== '' ? String(process.env.SENTRY_DSN) : null,
  },
  etherscan: {
    etherscanApiKey:
      process.env.ETHERSCAN_API_KEY && process.env.ETHERSCAN_API_KEY !== ''
        ? String(process.env.ETHERSCAN_API_KEY)
        : null,
  },
  coingecko: {
    coingeckoApiKey:
      process.env.COINGECKO_API_KEY && process.env.COINGECKO_API_KEY !== ''
        ? String(process.env.COINGECKO_API_KEY)
        : null,
  },
  thegraph: {
    thegraphApiKey:
      process.env.THEGRAPH_API_KEY && process.env.THEGRAPH_API_KEY !== '' ? String(process.env.THEGRAPH_API_KEY) : null,
  },
};

export default envConfig;
