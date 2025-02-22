// import envConfig from '../../../configs/envConfig';
// import { normalizeAddress } from '../../../lib/utils';
// import { Pool2, Pool2Types } from '../../../types/domains/pool2';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
// import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
// import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
// import { ContractCall } from '../../../services/blockchains/domains';
// import logger from '../../../lib/logger';
// import { decodeEventLog } from 'viem';
// import { DexscanFactoryConfig, DexscanModuleConfig } from '../../../configs/dexscan';
// import { CustomQueryChainLogsBlockRange, DefaultQueryChainLogsBlockRange } from '../../../configs';

// // help to index liquidity pools of uniswap v2, v3
// export default class UniswapIndexer {
//   public readonly name: string = 'dexscan.uniswap 🦄';

//   public readonly services: ContextServices;
//   public readonly storages: ContextStorages;
//   public readonly dexscanConfig: DexscanModuleConfig;

//   constructor(services: ContextServices, storages: ContextStorages, dexscanConfig: DexscanModuleConfig) {
//     this.services = services;
//     this.storages = storages;
//     this.dexscanConfig = dexscanConfig;
//   }

//   // index all liquidity pools were deployed from all uniswap factories
//   // include v2 and v3
//   public async indexLiquidityPools(): Promise<void> {
//     const v2Factories: Array<DexscanFactoryConfig> = [];

//     // chain => Array<DexscanFactoryConfig>
//     const v3Factories: { [key: string]: Array<DexscanFactoryConfig> } = {};

//     for (const factoryConfig of this.dexscanConfig.factories) {
//       if (factoryConfig.version === Pool2Types.univ2) {
//         v2Factories.push(factoryConfig);
//       } else if (factoryConfig.version === Pool2Types.univ3) {
//         if (!v3Factories[factoryConfig.chain]) {
//           v3Factories[factoryConfig.chain] = [];
//         }
//         v3Factories[factoryConfig.chain].push(factoryConfig);
//       }
//     }

//     // uniswap v2 factory saved all created pair in an array
//     // we query all pool addresses by query this array
//     for (const factoryConfig of v2Factories) {
//       await this.indexPoolsFromFactoryV2(factoryConfig);
//     }

//     // otherwise, uniswap v3 didn't save deployed pool address in an array
//     // we must query from historical factory contract event logs
//     for (const [chain, factories] of Object.entries(v3Factories)) {
//       await this.indexDexDataUniV3(chain, factories);
//     }
//   }

//   private async indexPoolsFromFactoryV2(factoryConfig: DexscanFactoryConfig): Promise<void> {
//     const latestPoolIndexingKey = `datasync-UniV2FactoryPoolIndex-${factoryConfig.chain}-${normalizeAddress(factoryConfig.factory)}`;

//     let startIndex = 0;
//     const latestStateIndexFromDb = await this.storages.database.find({
//       collection: envConfig.mongodb.collections.caching.name,
//       query: {
//         name: latestPoolIndexingKey,
//       },
//     });
//     if (latestStateIndexFromDb) {
//       startIndex = latestStateIndexFromDb.poolListIndex;
//     }

//     const poolLength = await this.services.blockchain.evm.readContract({
//       chain: factoryConfig.chain,
//       abi: UniswapV2FactoryAbi,
//       target: factoryConfig.factory,
//       method: 'allPairsLength',
//       params: [],
//     });

//     logger.info('start to index univ2 pool2 metadata', {
//       service: this.name,
//       chain: factoryConfig.chain,
//       version: factoryConfig.version,
//       factory: factoryConfig.factory,
//       fromIndex: startIndex,
//       toIndex: Number(poolLength),
//     });

//     const callSize = 200;
//     while (startIndex < Number(poolLength)) {
//       const targetIndexEnd = startIndex + callSize > Number(poolLength) ? Number(poolLength) : startIndex + callSize;

//       const getAddressCalls: Array<ContractCall> = [];
//       for (let i = startIndex; i < targetIndexEnd; i++) {
//         getAddressCalls.push({
//           abi: UniswapV2FactoryAbi,
//           target: factoryConfig.factory,
//           method: 'allPairs',
//           params: [i],
//         });
//       }

//       const getAddressResults = await this.services.blockchain.evm.multicall({
//         chain: factoryConfig.chain,
//         calls: getAddressCalls,
//       });

//       const getPoolTokenCalls: Array<ContractCall> = [];
//       for (let i = 0; i < getAddressResults.length; i++) {
//         getPoolTokenCalls.push({
//           abi: UniswapV2PairAbi,
//           target: getAddressResults[i],
//           method: 'token0',
//           params: [],
//         });
//         getPoolTokenCalls.push({
//           abi: UniswapV2PairAbi,
//           target: getAddressResults[i],
//           method: 'token1',
//           params: [],
//         });
//       }

//       const getPoolTokenResults = await this.services.blockchain.evm.multicall({
//         chain: factoryConfig.chain,
//         calls: getPoolTokenCalls,
//       });

//       for (let i = 0; i < getAddressResults.length; i++) {
//         const token0 = await this.services.blockchain.evm.getTokenInfo({
//           chain: factoryConfig.chain,
//           address: getPoolTokenResults[i * 2],
//         });
//         const token1 = await this.services.blockchain.evm.getTokenInfo({
//           chain: factoryConfig.chain,
//           address: getPoolTokenResults[i * 2 + 1],
//         });

//         if (token0 && token1) {
//           const feeRate =
//             factoryConfig.feeRateForLiquidityProviders && factoryConfig.feeRateForProtocol
//               ? factoryConfig.feeRateForLiquidityProviders + factoryConfig.feeRateForProtocol
//               : 0.003;

//           const pool: Pool2 = {
//             chain: factoryConfig.chain,
//             type: factoryConfig.version,
//             factory: normalizeAddress(factoryConfig.factory),
//             address: normalizeAddress(getAddressResults[i]),
//             feeRate: feeRate,
//             token0,
//             token1,
//           };

//           await this.storages.database.update({
//             collection: envConfig.mongodb.collections.datasyncPool2.name,
//             keys: {
//               chain: factoryConfig.chain,
//               factory: pool.factory,
//               address: pool.address,
//             },
//             updates: {
//               ...pool,
//             },
//             upsert: true,
//           });
//         }
//       }

//       await this.storages.database.update({
//         collection: envConfig.mongodb.collections.caching.name,
//         keys: {
//           name: latestPoolIndexingKey,
//         },
//         updates: {
//           name: latestPoolIndexingKey,
//           poolListIndex: targetIndexEnd,
//         },
//         upsert: true,
//       });

//       logger.debug('got univ2 pool2 metadata from factory', {
//         service: this.name,
//         chain: factoryConfig.chain,
//         version: factoryConfig.version,
//         factory: factoryConfig.factory,
//         latestIndex: targetIndexEnd,
//       });

//       startIndex = targetIndexEnd;
//     }
//   }

//   // index UniswapV3Factory contract logs
//   // it doesn't care about which factories are enabled
//   // it just found exact the event with signature: 0x783cca1c0412dd0d695e784568c96da2e9c22ff989357a2e8b1d9b2b4e6b7118
//   // build up Pool2 item and save to database
//   private async indexDexDataUniV3(chain: string, factories: Array<DexscanFactoryConfig>): Promise<void> {
//     const latestPoolIndexingKey = `datasync-UniV3FactoryPoolIndex-${chain}`;

//     let startBlock = this.dexscanConfig.univ3Birthblocks[chain] ? this.dexscanConfig.univ3Birthblocks[chain] : 0;
//     if (startBlock === 0) {
//       logger.warn(`config not found dexscanConfig.univ3Birthblocks[${chain}]`, {
//         service: this.name,
//       });
//     }

//     const latestStateIndexFromDb = await this.storages.database.find({
//       collection: envConfig.mongodb.collections.caching.name,
//       query: {
//         name: latestPoolIndexingKey,
//       },
//     });
//     if (latestStateIndexFromDb) {
//       startBlock = latestStateIndexFromDb.latestBlockNumber;
//     }

//     if (startBlock === 0) {
//       logger.error('failed to get start block to index', {
//         service: this.name,
//         chain: chain,
//       });
//       process.exit(1);
//     }

//     const latestBlockNumber = Number(await this.services.blockchain.evm.getLastestBlockNumber(chain));

//     logger.info('start to index univ3 pool2 metadata', {
//       service: this.name,
//       chain: chain,
//       factories: factories.length,
//       fromBlock: startBlock,
//       toBlock: latestBlockNumber,
//     });

//     // custom config for every chain if possible
//     const blockRange = CustomQueryChainLogsBlockRange[chain]
//       ? CustomQueryChainLogsBlockRange[chain]
//       : DefaultQueryChainLogsBlockRange;

//     // caching for logging
//     let lastProgressPercentage = 0;
//     let totalLogsCount = 0;
//     let indexBlock = startBlock;

//     const client = this.services.blockchain.evm.getPublicClient(chain);
//     while (indexBlock <= latestBlockNumber) {
//       const toBlock = indexBlock + blockRange > latestBlockNumber ? latestBlockNumber : indexBlock + blockRange;

//       const logs = await client.getLogs({
//         fromBlock: BigInt(indexBlock),
//         toBlock: BigInt(toBlock),
//       });

//       for (const log of logs) {
//         if (log.topics[0] === this.dexscanConfig.events.factory.univ3PoolCreated) {
//           const event: any = decodeEventLog({
//             abi: UniswapV3FactoryAbi,
//             topics: log.topics,
//             data: log.data,
//           });

//           const token0 = await this.services.blockchain.evm.getTokenInfo({
//             chain: chain,
//             address: event.args.token0,
//           });
//           const token1 = await this.services.blockchain.evm.getTokenInfo({
//             chain: chain,
//             address: event.args.token1,
//           });
//           if (token0 && token1) {
//             const factoryAddress = normalizeAddress(log.address);
//             const poolAddress = normalizeAddress(event.args.pool);

//             const pool: Pool2 = {
//               chain: chain,
//               type: Pool2Types.univ3,
//               factory: factoryAddress,
//               address: poolAddress,
//               feeRate: Number(event.args.fee) / 1e6,
//               token0,
//               token1,
//             };

//             await this.storages.database.update({
//               collection: envConfig.mongodb.collections.datasyncPool2.name,
//               keys: {
//                 chain: chain,
//                 factory: pool.factory,
//                 address: pool.address,
//               },
//               updates: {
//                 ...pool,
//               },
//               upsert: true,
//             });
//           }
//         }
//       }

//       await this.storages.database.update({
//         collection: envConfig.mongodb.collections.caching.name,
//         keys: {
//           name: latestPoolIndexingKey,
//         },
//         updates: {
//           name: latestPoolIndexingKey,
//           latestBlockNumber: toBlock + 1,
//         },
//         upsert: true,
//       });

//       totalLogsCount += logs.length;
//       const processBlocks = toBlock - startBlock;
//       const progress = (processBlocks / (latestBlockNumber - startBlock)) * 100;

//       // less logs
//       if (progress - lastProgressPercentage >= 5) {
//         logger.debug('get chain logs to find univ3 pools', {
//           service: this.name,
//           chain: chain,
//           factories: factories.length,
//           blocks: `${indexBlock}->${latestBlockNumber}`,
//           progress: `${progress.toFixed(2)}%`,
//         });
//         lastProgressPercentage = progress;
//       }

//       indexBlock = toBlock + 1;
//     }
//   }
// }
