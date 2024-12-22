import dotenv from 'dotenv';

import { DatabaseCollectionConfig } from '../types/configs';

// load env
dotenv.config();

const CollectionPrefix = 'databoard';
const DatasyncPrefix = 'datasync';
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

  // datasync
  datasyncPool2: {
    name: `${DatasyncPrefix}.pool2`,
    indies: [
      {
        chain: 1,
        factory: 1,
        address: 1, // pool address
      },
      {
        'token0.address': 1,
        'token1.address': 1,
      },
    ],
  },
  datasyncPoolBalancer: {
    name: `${DatasyncPrefix}.poolBalancer`,
    indies: [
      {
        chain: 1,
        vault: 1,
        poolId: 1,
      },
    ],
  },
};
