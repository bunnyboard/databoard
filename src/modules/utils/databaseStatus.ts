import envConfig from '../../configs/envConfig';
import { ContextServices, ContextStorages } from '../../types/namespaces';

// help to query database sync overall status
export default class DatabaseStatusReport {
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  constructor(services: ContextServices, storages: ContextStorages) {
    this.services = services;
    this.storages = storages;
  }

  public async getDatabaseStatus(): Promise<any> {
    const result: any = {
      protocols: [],
    };

    const protcolDataStates = await this.storages.database.query({
      collection: envConfig.mongodb.collections.protocolDataStates.name,
      query: {},
    });

    for (const protocolDataState of protcolDataStates) {
      const latestSnapshot = await this.storages.database.find({
        collection: envConfig.mongodb.collections.protocolDataSnapshots.name,
        query: {
          protocol: protocolDataState.protocol,
        },
        options: {
          limit: 1,
          skip: 0,
          order: { timestamp: -1 },
        },
      });

      result.protocols.push({
        protocol: protocolDataState.protocol,
        totalValueLocked: protocolDataState.totalValueLocked ? protocolDataState.totalValueLocked : 0,
        totalVolume: protocolDataState.totalVolume ? protocolDataState.totalVolume : 0,
        timestamp: protocolDataState.timestamp,
        lastSnapshot: latestSnapshot ? latestSnapshot.timestamp : null,
      });
    }

    return result;
  }
}
