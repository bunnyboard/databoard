import { TimeUnits } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getStartDayTimestamp, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
import { ProtocolConfig } from '../../types/base';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import { GetProtocolDataOptions, RunAdapterOptions, TestAdapterOptions } from '../../types/options';
import ProtocolAdapter from './protocol';

// the same with ProtocolAdapter
// but data will be saved to blockchains collections
export default class BlockchainAdapter extends ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<any | null> {
    return null;
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    //
    // collect current state data
    //
    if (!options.service || options.service === 'state') {
      this.executeSession.startSession('start to update blockchain current data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
      });

      const currentTimestamp = getTimestamp();
      const last24HoursTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
      const last48HoursTimestamp = last24HoursTimestamp - TimeUnits.SecondsPerDay;

      const last24HoursData = await this.getProtocolData({
        timestamp: currentTimestamp,
        beginTime: last24HoursTimestamp,
        endTime: currentTimestamp,
      });
      const last48HoursData = await this.getProtocolData({
        timestamp: last24HoursTimestamp,
        beginTime: last48HoursTimestamp,
        endTime: last24HoursTimestamp,
      });
      if (last24HoursData) {
        if (last48HoursData) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.blockchainDataStates.name,
            keys: {
              chain: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
              last24HoursData: last48HoursData,
            },
            upsert: true,
          });
        } else {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.blockchainDataStates.name,
            keys: {
              chain: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
            },
            upsert: true,
          });
        }
      }

      this.executeSession.endSession('updated current data for blockchain', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
      });
    }

    //
    // collect snapshots
    //
    if (!options.service || options.service === 'snapshot') {
      const currentTimestamp = getTimestamp();
      let startTime = options.fromTime ? options.fromTime : this.protocolConfig.birthday;

      // we make sure startTime is start day (00:00 UTC+0) timestamp
      startTime = getStartDayTimestamp(startTime);

      if (!options.force) {
        // we find the latest snapshot timestamp
        const latestSnapshot = (
          await this.storages.database.query({
            collection: envConfig.mongodb.collections.blockchainDataSnapshots.name,
            query: {
              chain: this.protocolConfig.protocol,
            },
            options: {
              limit: 1,
              skip: 0,
              order: { timestamp: -1 },
            },
          })
        )[0];
        if (latestSnapshot) {
          startTime = latestSnapshot.timestamp;
        }
      }

      const todayTimestamp = getTodayUTCTimestamp();
      logger.info('start to update blockchain snapshots data', {
        service: this.name,
        chain: this.protocolConfig.protocol,
        fromDate: getDateString(startTime),
        toDate: getDateString(todayTimestamp),
      });

      while (startTime <= todayTimestamp) {
        this.executeSession.startSession('start to update blockchain snapshot', {
          service: this.name,
          chain: this.protocolConfig.protocol,
          date: getDateString(startTime),
        });

        let endTime = startTime + TimeUnits.SecondsPerDay - 1;
        if (endTime > currentTimestamp) {
          endTime = currentTimestamp;
        }

        const dataTimeframe24Hours = await this.getProtocolData({
          timestamp: startTime,
          beginTime: startTime,
          endTime: endTime,
        });
        if (dataTimeframe24Hours) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.blockchainDataSnapshots.name,
            keys: {
              chain: dataTimeframe24Hours.protocol,
              timestamp: dataTimeframe24Hours.timestamp,
            },
            updates: {
              ...dataTimeframe24Hours,
            },
            upsert: true,
          });
        }

        this.executeSession.endSession('updated snapshot data for blockchain', {
          service: this.name,
          chain: this.protocolConfig.protocol,
          date: getDateString(startTime),
        });

        startTime += TimeUnits.SecondsPerDay;
      }
    }
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const current = getTimestamp();
    const fromTime = options.timestamp ? options.timestamp : current - 300;
    const toTime = options.timestamp ? options.timestamp + 300 : current;

    if (options.output === 'json') {
      console.log(
        JSON.stringify(
          await this.getProtocolData({
            timestamp: fromTime,
            beginTime: fromTime,
            endTime: toTime,
          }),
        ),
      );
    } else {
      logger.inspect(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
  }
}
