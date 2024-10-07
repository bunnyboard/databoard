import { TimeUnits } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { getDateString, getStartDayTimestamp, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
import ExecuteSession from '../../services/executeSession';
import { Blockchain } from '../../types/configs';
import { ChainData } from '../../types/domains/chain';
import { ContextServices, ContextStorages, IChainAdapter } from '../../types/namespaces';
import { RunAdapterOptions } from '../../types/options';

export interface GetChainDataOptions {
  timestamp: number;
  beginTime: number;
  endTime: number;
}

export default class ChainAdapter implements IChainAdapter {
  public readonly name: string = 'chain';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;
  public readonly chainConfig: Blockchain;
  public executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, chainConfig: Blockchain) {
    this.services = services;
    this.storages = storages;
    this.chainConfig = chainConfig;
    this.executeSession = new ExecuteSession();
  }

  public async getLatestBlockNumber(): Promise<number> {
    return 0;
  }

  public async getChainData(options: GetChainDataOptions): Promise<ChainData | null> {
    return null;
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    if (options.service === undefined || options.service === 'state') {
      //
      // collect current state data
      //
      this.executeSession.startSession('start to update chain current data', {
        service: this.name,
        chain: this.chainConfig.name,
        family: this.chainConfig.family,
      });

      const currentTimestamp = getTimestamp();
      const last24HoursTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
      const last48HoursTimestamp = last24HoursTimestamp - TimeUnits.SecondsPerDay;

      const last24HoursData = await this.getChainData({
        timestamp: currentTimestamp,
        beginTime: last24HoursTimestamp,
        endTime: currentTimestamp,
      });
      const last48HoursData = await this.getChainData({
        timestamp: last24HoursTimestamp,
        beginTime: last48HoursTimestamp,
        endTime: last24HoursTimestamp,
      });

      if (last24HoursData) {
        if (last48HoursData) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.blockchainDataStates.name,
            keys: {
              chain: last24HoursData.chain,
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
              chain: last24HoursData.chain,
            },
            updates: {
              ...last24HoursData,
            },
            upsert: true,
          });
        }

        this.executeSession.endSession('updated chain current data', {
          service: this.name,
          chain: this.chainConfig.name,
          family: this.chainConfig.family,
          txnCount: last24HoursData.totalTransactions,
          addressCount: last24HoursData.activeAddresses,
        });
      }
    }

    if (options.service === undefined || options.service === 'snapshot') {
      //
      // collect snapshots
      //
      let startTime = options.fromTime ? options.fromTime : getTodayUTCTimestamp();
      if (!options.force) {
        // we find the latest snapshot timestamp
        const latestSnapshot = (
          await this.storages.database.query({
            collection: envConfig.mongodb.collections.blockchainDataSnapshots.name,
            query: {
              chain: this.chainConfig.name,
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

      startTime = getStartDayTimestamp(startTime);
      const todayTimestamp = getTodayUTCTimestamp();

      logger.info('start to update chain data snapshots', {
        service: this.name,
        chain: this.chainConfig.name,
        family: this.chainConfig.family,
        fromDate: getDateString(startTime),
        toDate: getDateString(todayTimestamp),
      });

      while (startTime <= todayTimestamp) {
        this.executeSession.startSessionMuted();

        const dataTimeframe24Hours = await this.getChainData({
          timestamp: startTime,
          beginTime: startTime,
          endTime: startTime + TimeUnits.SecondsPerDay - 1,
        });
        if (dataTimeframe24Hours) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.blockchainDataSnapshots.name,
            keys: {
              chain: dataTimeframe24Hours.chain,
              timestamp: dataTimeframe24Hours.timestamp,
            },
            updates: {
              ...dataTimeframe24Hours,
            },
            upsert: true,
          });
        }

        this.executeSession.endSession('updated chain data snapshot', {
          service: this.name,
          chain: this.chainConfig.name,
          family: this.chainConfig.family,
          date: getDateString(startTime),
        });

        startTime += TimeUnits.SecondsPerDay;
      }
    }
  }
}
