import dotenv from 'dotenv';

import { DatabaseCollectionConfig } from '../types/configs';

// load env
dotenv.config();

const CollectionPrefix = 'databoard';
export const DatabaseCollectionConfigs: DatabaseCollectionConfig = {
  caching: {
    name: `${CollectionPrefix}.caching`,
    indies: [
      {
        name: 1,
      },
    ],
  },
  contractLogs: {
    name: `${CollectionPrefix}.caching.contractLogs`,
    indies: [
      {
        chain: 1,
        address: 1,
        transactionHash: 1,
        logIndex: 1,
      },
    ],
  },
  chainBlocks: {
    name: `${CollectionPrefix}.caching.chainBlocks`,
    indies: [
      {
        chain: 1,
        number: 1,
        timestamp: 1,
      },
    ],
  },
  protocolDataStates: {
    name: `${CollectionPrefix}.protocolDataStates`,
    indies: [
      {
        protocol: 1,
      },
    ],
  },
  protocolDataSnapshots: {
    name: `${CollectionPrefix}.protocolDataSnapshots`,
    indies: [
      {
        protocol: 1,
        timestamp: 1,
      },
    ],
  },
  blockchainDataStates: {
    name: `${CollectionPrefix}.blockchainDataStates`,
    indies: [
      {
        chain: 1,
      },
    ],
  },
  blockchainDataSnapshots: {
    name: `${CollectionPrefix}.blockchainDataSnapshots`,
    indies: [
      {
        chain: 1,
        timestamp: 1,
      },
    ],
  },
};
