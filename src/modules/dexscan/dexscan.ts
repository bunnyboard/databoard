// import { TimeUnits } from '../../configs/constants';
// import { DexscanModuleConfig } from '../../configs/dexscan';
// import envConfig from '../../configs/envConfig';
// import logger from '../../lib/logger';
// import { getDateString, getStartDayTimestamp, getTimestamp, getTodayUTCTimestamp } from '../../lib/utils';
// import ExecuteSession from '../../services/executeSession';
// import { ContextServices, ContextStorages } from '../../types/namespaces';
// import { RunAdapterOptions } from '../../types/options';
// import UniswapCore from './uniswap/core';

// export default class DexscanModule extends UniswapCore {
//   public readonly name: string = 'dexscan.uniswap 🦄';

//   public executeSession: ExecuteSession;

//   constructor(services: ContextServices, storages: ContextStorages, dexscanConfig: DexscanModuleConfig) {
//     super(services, storages, dexscanConfig);
//     this.executeSession = new ExecuteSession();
//   }

//   private getOldestBirthday(): number {
//     let oldestBirthday = this.dexscanConfig.factories[0].birthday;
//     for (const factoryConfig of this.dexscanConfig.factories) {
//       if (factoryConfig.birthday < oldestBirthday) {
//         oldestBirthday = factoryConfig.birthday;
//       }
//     }

//     return oldestBirthday;
//   }

//   public async run(options: RunAdapterOptions): Promise<void> {
//     //
//     // collect current state data
//     //
//     if (!options.service || options.service === 'state') {
//       this.executeSession.startSession('start to update dexscan state data', {
//         service: this.name,
//         factories: this.dexscanConfig.factories.length,
//       });

//       const currentTimestamp = getTimestamp();
//       const last24HoursTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
//       const last48HoursTimestamp = last24HoursTimestamp - TimeUnits.SecondsPerDay;

//       const last24HoursProtocols = await this.getProtocolsData({
//         timestamp: currentTimestamp,
//         beginTime: last24HoursTimestamp,
//         endTime: currentTimestamp,
//       });
//       const last48HoursProtocols = await this.getProtocolsData({
//         timestamp: last24HoursTimestamp,
//         beginTime: last48HoursTimestamp,
//         endTime: last24HoursTimestamp,
//       });

//       for (const last24HoursData of last24HoursProtocols) {
//         const last48HoursData = last48HoursProtocols.filter((item) => item.protocol === last24HoursData.protocol)[0];
//         if (last48HoursData) {
//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.protocolDataStates.name,
//             keys: {
//               protocol: last24HoursData.protocol,
//             },
//             updates: {
//               ...last24HoursData,
//               last24HoursData: last48HoursData,
//             },
//             upsert: true,
//           });
//         } else {
//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.protocolDataStates.name,
//             keys: {
//               protocol: last24HoursData.protocol,
//             },
//             updates: {
//               ...last24HoursData,
//             },
//             upsert: true,
//           });
//         }
//       }

//       this.executeSession.endSession('updated current data for protocol', {
//         service: this.name,
//         factories: this.dexscanConfig.factories.length,
//       });
//     }

//     //
//     // collect snapshots
//     //
//     if (!options.service || options.service === 'snapshot') {
//       const currentTimestamp = getTimestamp();
//       let startTime = options.fromTime ? options.fromTime : this.getOldestBirthday();

//       // we make sure startTime is start day (00:00 UTC+0) timestamp
//       startTime = getStartDayTimestamp(startTime);

//       const snapshotSyncKeyName = `dexscan-snapshot-state`;
//       if (!options.force) {
//         // we find the latest snapshot timestamp
//         const latestState = await this.storages.database.find({
//           collection: envConfig.mongodb.collections.caching.name,
//           query: {
//             name: snapshotSyncKeyName,
//           },
//         });

//         if (latestState) {
//           startTime = latestState.timestamp;
//         }
//       }

//       const todayTimestamp = getTodayUTCTimestamp();
//       logger.info('start to update dexscan snapshots data', {
//         service: this.name,
//         factories: this.dexscanConfig.factories.length,
//         fromDate: getDateString(startTime),
//         toDate: getDateString(todayTimestamp),
//       });

//       while (startTime <= todayTimestamp) {
//         this.executeSession.startSession('start to update dexscan snapshots', {
//           service: this.name,
//           factories: this.dexscanConfig.factories.length,
//           date: getDateString(startTime),
//         });

//         let endTime = startTime + TimeUnits.SecondsPerDay - 1;
//         if (endTime > currentTimestamp) {
//           endTime = currentTimestamp;
//         }

//         const dataTimeframe24Hours = await this.getProtocolsData({
//           timestamp: startTime,
//           beginTime: startTime,
//           endTime: endTime,
//         });
//         for (const protocolData of dataTimeframe24Hours) {
//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.protocolDataSnapshots.name,
//             keys: {
//               protocol: protocolData.protocol,
//               timestamp: protocolData.timestamp,
//             },
//             updates: {
//               ...protocolData,
//             },
//             upsert: true,
//           });
//         }

//         // update state
//         if (!options.force) {
//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.caching.name,
//             keys: {
//               name: snapshotSyncKeyName,
//             },
//             updates: {
//               name: snapshotSyncKeyName,
//               timestamp: startTime,
//             },
//             upsert: true,
//           });
//         }

//         this.executeSession.endSession('updated dexscan snapshot', {
//           service: this.name,
//           factories: this.dexscanConfig.factories.length,
//           date: getDateString(startTime),
//         });

//         startTime += TimeUnits.SecondsPerDay;
//       }
//     }
//   }
// }
