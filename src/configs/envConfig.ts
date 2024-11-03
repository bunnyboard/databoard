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
    etherscanApiKey: String(process.env.ETHERSCAN_API_KEY),
  },
};

export default envConfig;
