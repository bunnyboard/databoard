// import { decodeEventLog } from 'viem';
// import envConfig from '../../../configs/envConfig';
// import { UniswapDexConfig } from '../../../configs/protocols/uniswap';
// import logger from '../../../lib/logger';
// import { normalizeAddress, formatBigNumberToNumber, compareAddress } from '../../../lib/utils';
// import { ProtocolConfig } from '../../../types/base';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import ProtocolAdapter from '../protocol';
// import { Uniswapv3Events } from './abis';
// import { Pool2 } from './types';
// import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
// import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
// import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
// import { AddressZero } from '../../../configs/constants';

// const poolCachingSyncKey = 'index-uniswap-pool';

// export default class UniswapIndexer extends ProtocolAdapter {
//   public readonly name: string = 'adapter.uniswap 🦄';

//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }

//   // index events, find pool2 and save to database
//   protected async getPool2FromContractLogs(config: UniswapDexConfig): Promise<void> {
//     if (config.version === 2) {
//       await this.getPool2FromContractLogsVersion2(config);
//     } else if (config.version === 3) {
//       let syncFromBlock = config.birthblock;
//       const latestBlockSynced = await this.storages.database.find({
//         collection: envConfig.mongodb.collections.caching.name,
//         query: {
//           name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
//         },
//       });
//       if (latestBlockSynced) {
//         syncFromBlock = latestBlockSynced.blockNumber;
//       }

//       const latestBlockNumber = await this.services.blockchain.evm.getLastestBlockNumber(config.chain);

//       logger.info('getting pool2 from contract logs', {
//         service: this.name,
//         protocol: this.protocolConfig.protocol,
//         chain: config.chain,
//         version: config.version,
//         factory: config.factory,
//         fromBlock: syncFromBlock,
//         toBlock: latestBlockNumber,
//       });

//       const blockRange = 1000;
//       while (syncFromBlock <= latestBlockNumber) {
//         const toBlock = syncFromBlock + blockRange > latestBlockNumber ? latestBlockNumber : syncFromBlock + blockRange;
//         const logs = await this.services.blockchain.evm.getContractLogs({
//           chain: config.chain,
//           address: config.factory,
//           fromBlock: syncFromBlock,
//           toBlock: toBlock,
//         });

//         for (const log of logs) {
//           if (log.topics[0] === Uniswapv3Events.PoolCreated) {
//             const event: any = decodeEventLog({
//               abi: UniswapV3FactoryAbi,
//               topics: log.topics,
//               data: log.data,
//             });
//             const token0 = await this.services.blockchain.evm.getTokenInfo({
//               chain: config.chain,
//               address: event.args.token0,
//             });
//             const token1 = await this.services.blockchain.evm.getTokenInfo({
//               chain: config.chain,
//               address: event.args.token1,
//             });
//             if (token0 && token1) {
//               const pool: Pool2 = {
//                 chain: config.chain,
//                 protocol: this.protocolConfig.protocol,
//                 poolAddress: normalizeAddress(event.args.pool),
//                 factoryAddress: normalizeAddress(config.factory),
//                 token0: token0,
//                 token1: token1,
//                 birthblock: Number(log.blockNumber),
//                 feeRate: formatBigNumberToNumber(event.args.fee.toString(), 6),
//               };

//               await this.storages.database.update({
//                 collection: envConfig.mongodb.collections.liquidityPool2.name,
//                 keys: {
//                   chain: pool.chain,
//                   protocol: this.protocolConfig.protocol,
//                   factoryAddress: pool.factoryAddress,
//                   poolAddress: pool.poolAddress,
//                 },
//                 updates: {
//                   ...pool,
//                 },
//                 upsert: true,
//               });

//               logger.debug('got uniswap liquidity pool2', {
//                 service: this.name,
//                 protocol: this.protocolConfig.protocol,
//                 chain: pool.chain,
//                 version: config.version,
//                 factory: pool.factoryAddress,
//                 pool: `${pool.token0.symbol}-${pool.token1.symbol}-${pool.feeRate}`,
//               });
//             }
//           }
//         }

//         syncFromBlock = toBlock + 1;

//         await this.storages.database.update({
//           collection: envConfig.mongodb.collections.caching.name,
//           keys: {
//             name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
//           },
//           updates: {
//             name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
//             blockNumber: syncFromBlock,
//           },
//           upsert: true,
//         });
//       }
//     }
//   }

//   private async getPool2FromContractLogsVersion2(config: UniswapDexConfig): Promise<void> {
//     let syncFromPoolIndex = 0;
//     const latestPoolIndexSynced = await this.storages.database.find({
//       collection: envConfig.mongodb.collections.caching.name,
//       query: {
//         name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
//       },
//     });
//     if (latestPoolIndexSynced) {
//       syncFromPoolIndex = latestPoolIndexSynced.poolIndex + 1;
//     }

//     const latestPoolIndex = Number(
//       await this.services.blockchain.evm.readContract({
//         chain: config.chain,
//         abi: UniswapV2FactoryAbi,
//         target: config.factory,
//         method: 'allPairsLength',
//         params: [],
//       }),
//     );

//     for (let poolIndex = syncFromPoolIndex; poolIndex < latestPoolIndex; poolIndex++) {
//       const pairAddress = await this.services.blockchain.evm.readContract({
//         chain: config.chain,
//         abi: UniswapV2FactoryAbi,
//         target: config.factory,
//         method: 'allPairs',
//         params: [poolIndex],
//       });
//       if (pairAddress && !compareAddress(pairAddress, AddressZero)) {
//         const [token0Address, token1Address] = await this.services.blockchain.evm.multicall({
//           chain: config.chain,
//           calls: [
//             {
//               abi: UniswapV2PairAbi,
//               target: pairAddress,
//               method: 'token0',
//               params: [],
//             },
//             {
//               abi: UniswapV2PairAbi,
//               target: pairAddress,
//               method: 'token1',
//               params: [],
//             },
//           ],
//         });
//         const [token0, token1] = await Promise.all([
//           this.services.blockchain.evm.getTokenInfo({
//             chain: config.chain,
//             address: token0Address,
//           }),
//           this.services.blockchain.evm.getTokenInfo({
//             chain: config.chain,
//             address: token1Address,
//           }),
//         ]);
//         if (token0 && token1) {
//           const pool: Pool2 = {
//             chain: config.chain,
//             protocol: this.protocolConfig.protocol,
//             poolAddress: normalizeAddress(pairAddress),
//             factoryAddress: normalizeAddress(config.factory),
//             token0: token0,
//             token1: token1,
//             birthblock: 0, // don't care
//             feeRate: config.feeRate ? config.feeRate : 0.003,
//           };

//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.liquidityPool2.name,
//             keys: {
//               chain: pool.chain,
//               protocol: this.protocolConfig.protocol,
//               factoryAddress: pool.factoryAddress,
//               poolAddress: pool.poolAddress,
//             },
//             updates: {
//               ...pool,
//             },
//             upsert: true,
//           });

//           logger.debug('got uniswap liquidity pool2', {
//             service: this.name,
//             protocol: this.protocolConfig.protocol,
//             chain: pool.chain,
//             version: config.version,
//             index: `${poolIndex}/${latestPoolIndex}`,
//             factory: pool.factoryAddress,
//             pool: `${pool.token0.symbol}-${pool.token1.symbol}-${pool.feeRate}`,
//           });

//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.caching.name,
//             keys: {
//               name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
//             },
//             updates: {
//               name: `${poolCachingSyncKey}-${config.chain}-${normalizeAddress(config.factory)}`,
//               poolIndex: poolIndex,
//             },
//             upsert: true,
//           });
//         }
//       }
//     }
//   }
// }
