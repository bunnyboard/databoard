import { TimeUnits } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import logger, { logObjectFull } from '../../lib/logger';
import { getDateString, getStartDayTimestamp, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
import ExecuteSession from '../../services/executeSession';
import { ProtocolConfig } from '../../types/base';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import { GetProtocolDataOptions, RunAdapterOptions, TestAdapterOptions } from '../../types/options';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  public protocolConfig: ProtocolConfig;

  public executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    this.services = services;
    this.storages = storages;
    this.protocolConfig = protocolConfig;
    this.executeSession = new ExecuteSession();
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<any | null> {
    return null;
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    //
    // collect current state data
    //
    if (!options.service || options.service === 'state') {
      this.executeSession.startSession('start to update protocol current data', {
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
            collection: envConfig.mongodb.collections.protocolDataStates.name,
            keys: {
              protocol: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
              last24HoursData: last48HoursData,
            },
            upsert: true,
          });
        } else {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.protocolDataStates.name,
            keys: {
              protocol: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
            },
            upsert: true,
          });
        }
      }

      this.executeSession.endSession('updated current data for protocol', {
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
            collection: envConfig.mongodb.collections.protocolDataSnapshots.name,
            query: {
              protocol: this.protocolConfig.protocol,
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
      logger.info('start to update protocol snapshots data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        fromDate: getDateString(startTime),
        toDate: getDateString(todayTimestamp),
      });

      while (startTime <= todayTimestamp) {
        this.executeSession.startSession('start to update protocol snapshot', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
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
            collection: envConfig.mongodb.collections.protocolDataSnapshots.name,
            keys: {
              protocol: dataTimeframe24Hours.protocol,
              timestamp: dataTimeframe24Hours.timestamp,
            },
            updates: {
              ...dataTimeframe24Hours,
            },
            upsert: true,
          });
        }

        this.executeSession.endSession('updated snapshot data for protocol', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          date: getDateString(startTime),
        });

        startTime += TimeUnits.SecondsPerDay;
      }
    }
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const current = getTimestamp();
    const fromTime = options.timestamp ? options.timestamp : current - TimeUnits.SecondsPerDay;
    const toTime = options.timestamp ? options.timestamp + TimeUnits.SecondsPerDay : current;

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
      logObjectFull(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
  }
}
