// import { DexscanFactoryConfig, DexscanModuleConfig, getDexscanModuleConfigChains } from '../../../configs/dexscan';
// import envConfig from '../../../configs/envConfig';
// import { compareAddress, formatBigNumberToNumber, normalizeAddress, sleep } from '../../../lib/utils';
// import { Pool2, Pool2Types } from '../../../types/domains/pool2';
// import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import { GetProtocolDataOptions } from '../../../types/options';
// import AdapterDataHelper from '../../adapters/helpers';
// import UniswapIndexer from './indexer';
// import Erc20Abi from '../../../configs/abi/ERC20.json';
// import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
// import { ContractCall } from '../../../services/blockchains/domains';
// import { Address } from 'viem';
// import { AddressMulticall3 } from '../../../configs/constants';
// import BigNumber from 'bignumber.js';
// import { CustomQueryChainLogsBlockRange, DefaultQueryChainLogsBlockRange } from '../../../configs';
// import UniswapEventDecoder from './decoder';
// import logger from '../../../lib/logger';

// // query data of 200 pools per time
// const callSize = 200;

// // we count pool have base assets (ETH, USDT, USDC) usd value > $1000
// const MaliciousPoolBaseAssetBalance = 1000;

// export default class UniswapCore {
//   public readonly name: string = 'dexscan.uniswap 🦄';
//   public readonly services: ContextServices;
//   public readonly storages: ContextStorages;
//   public readonly dexscanConfig: DexscanModuleConfig;

//   public readonly indexer: UniswapIndexer;
//   public readonly decoder: UniswapEventDecoder;

//   constructor(services: ContextServices, storages: ContextStorages, dexscanConfig: DexscanModuleConfig) {
//     this.services = services;
//     this.storages = storages;
//     this.dexscanConfig = dexscanConfig;

//     this.indexer = new UniswapIndexer(services, storages, dexscanConfig);
//     this.decoder = new UniswapEventDecoder(services, storages, dexscanConfig);
//   }

//   public async getProtocolsData(options: GetProtocolDataOptions): Promise<Array<ProtocolData>> {
//     // synced liquidity pools were deployed
//     await this.indexer.indexLiquidityPools();

//     // protocols data
//     const protocols: { [key: string]: ProtocolData } = {};

//     // get liquidity balances
//     for (const factoryConfig of this.dexscanConfig.factories) {
//       if (options.timestamp < factoryConfig.birthday) {
//         continue;
//       }

//       if (!protocols[factoryConfig.protocol]) {
//         protocols[factoryConfig.protocol] = {
//           protocol: factoryConfig.protocol,
//           birthday: factoryConfig.birthday,
//           timestamp: options.timestamp,
//           breakdown: {},
//           breakdownChains: {},
//           ...getInitialProtocolCoreMetrics(),
//           totalSupplied: 0,
//           volumes: {
//             deposit: 0,
//             withdraw: 0,
//             swap: 0,
//           },
//         };
//       }

//       if (!(protocols[factoryConfig.protocol].breakdownChains as any)[factoryConfig.chain]) {
//         (protocols[factoryConfig.protocol].breakdownChains as any)[factoryConfig.chain] = {
//           ...getInitialProtocolCoreMetrics(),
//           totalSupplied: 0,
//           volumes: {
//             deposit: 0,
//             withdraw: 0,
//             swap: 0,
//           },
//         };
//       }

//       const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//         factoryConfig.chain,
//         options.timestamp,
//       );

//       const balanceUsd = await this.getFactoryLiquidity(factoryConfig, options.timestamp, blockNumber);

//       protocols[factoryConfig.protocol].totalAssetDeposited += balanceUsd;
//       protocols[factoryConfig.protocol].totalValueLocked += balanceUsd;
//       (protocols[factoryConfig.protocol].totalSupplied as number) += balanceUsd;

//       (protocols[factoryConfig.protocol].breakdownChains as any)[factoryConfig.chain].totalAssetDeposited += balanceUsd;
//       (protocols[factoryConfig.protocol].breakdownChains as any)[factoryConfig.chain].totalValueLocked += balanceUsd;
//       (protocols[factoryConfig.protocol].breakdownChains as any)[factoryConfig.chain].totalSupplied += balanceUsd;
//     }

//     // process logs
//     const factoryChains = getDexscanModuleConfigChains(this.dexscanConfig);
//     for (const [chain, factoryConfigs] of Object.entries(factoryChains)) {
//       const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(chain, options.beginTime);
//       const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(chain, options.endTime);

//       logger.info('start to query univ2, univ3 logs', {
//         service: this.name,
//         chain: chain,
//         factories: factoryConfigs.length,
//         fromBlock: beginBlock,
//         toBlock: endBlock,
//       });

//       // custom config for every chain if possible
//       const blockRange = CustomQueryChainLogsBlockRange[chain]
//         ? CustomQueryChainLogsBlockRange[chain]
//         : DefaultQueryChainLogsBlockRange;

//       // caching for logging
//       let lastProgressPercentage = 0;
//       let totalLogsCount = 0;
//       let indexBlock = beginBlock;

//       const client = this.services.blockchain.evm.getPublicClient(chain);

//       while (indexBlock <= endBlock) {
//         const toBlock = indexBlock + blockRange;

//         try {
//           const logs = await client.getLogs({
//             fromBlock: BigInt(indexBlock),
//             toBlock: BigInt(toBlock),
//           });

//           for (const log of logs) {
//             const result = await this.decoder.decodeAndCountFromLog({
//               chain: chain,
//               log: log,
//               timestamp: options.timestamp,
//             });

//             if (result) {
//               protocols[result.protocol].totalFees += result.swapFeesForLp + result.swapFeesForProtocol;
//               protocols[result.protocol].supplySideRevenue += result.swapFeesForLp;
//               protocols[result.protocol].protocolRevenue += result.swapFeesForProtocol;
//               (protocols[result.protocol].volumes.swap as number) += result.swapVolume;
//               (protocols[result.protocol].volumes.deposit as number) += result.addLiquidityVolume;
//               (protocols[result.protocol].volumes.withdraw as number) += result.removeLiquidityVolume;
//             }
//           }

//           totalLogsCount += logs.length;
//           const processBlocks = toBlock - beginBlock;
//           const progress = (processBlocks / (endBlock - beginBlock)) * 100;

//           // less logs
//           if (progress - lastProgressPercentage >= 5) {
//             logger.debug('processing univ2, univ3 logs', {
//               service: this.name,
//               chain: chain,
//               factories: factoryConfigs.length,
//               blocks: `${indexBlock}->${endBlock}`,
//               progress: `${progress.toFixed(2)}%`,
//             });
//             lastProgressPercentage = progress;
//           }

//           indexBlock = toBlock;
//         } catch (e: any) {
//           logger.warn('failed to processing univ2, univ3 logs, retry', {
//             service: this.name,
//             chain: chain,
//             factories: factoryConfigs.length,
//             error: e.message,
//           });
//           await sleep(2);
//           continue;
//         }
//       }

//       console.log(protocols);
//     }

//     if (Object.values(protocols).length > 0) {
//       logger.inspect(Object.values(protocols));
//       process.exit(0);
//     }

//     // format return data
//     return Object.values(protocols).map((item) => AdapterDataHelper.fillupAndFormatProtocolData(item));
//   }

//   protected async getFactoryLiquidity(
//     factoryConfig: DexscanFactoryConfig,
//     timestamp: number,
//     blockNumber: number,
//   ): Promise<number> {
//     if (factoryConfig.version === Pool2Types.univ2) {
//       return await this.getFactoryBalanceV2(factoryConfig, timestamp, blockNumber);
//     } else if (factoryConfig.version === Pool2Types.univ3) {
//       return await this.getFactoryBalanceV3(factoryConfig, timestamp, blockNumber);
//     }

//     return 0;
//   }

//   protected async getFactoryBalanceV2(
//     factoryConfig: DexscanFactoryConfig,
//     timestamp: number,
//     blockNumber: number,
//   ): Promise<number> {
//     let totalBalanceUsd = 0;

//     if (factoryConfig.version === Pool2Types.univ2) {
//       const client = await this.services.blockchain.evm.getPublicClient(factoryConfig.chain);

//       // cahing
//       const cachingProcessedPools: { [key: string]: boolean } = {};

//       let poolIndex = 0;
//       while (true) {
//         const poolConfigs: Array<Pool2> = await this.storages.database.query({
//           collection: envConfig.mongodb.collections.datasyncPool2.name,
//           query: {
//             chain: factoryConfig.chain,
//             factory: normalizeAddress(factoryConfig.factory),
//           },
//           options: {
//             limit: callSize,
//             skip: poolIndex * callSize,
//             order: { address: 1 },
//           },
//         });

//         if (poolConfigs.length === 0) {
//           break;
//         }

//         const balanceCalls: Array<ContractCall> = [];
//         for (const pool2 of poolConfigs) {
//           balanceCalls.push({
//             abi: Erc20Abi,
//             target: pool2.token0.address,
//             method: 'balanceOf',
//             params: [pool2.address],
//           });
//           balanceCalls.push({
//             abi: Erc20Abi,
//             target: pool2.token1.address,
//             method: 'balanceOf',
//             params: [pool2.address],
//           });
//         }

//         // query balances
//         const contracts = balanceCalls.map((call) => {
//           return {
//             address: call.target as Address,
//             abi: call.abi,
//             functionName: call.method,
//             args: call.params,
//           } as const;
//         });
//         const callResults: Array<any> = await client.multicall({
//           multicallAddress: AddressMulticall3,
//           contracts: contracts,
//           blockNumber: BigInt(blockNumber),
//           allowFailure: true,
//         });
//         // we allow failure on multicall
//         // so if a call failed, we count the balance is zero
//         const balanceResults: Array<any> = callResults.map((item) => (item.result ? item.result : 0n));

//         for (let i = 0; i < poolConfigs.length; i++) {
//           const pool2 = poolConfigs[i];

//           if (cachingProcessedPools[pool2.address]) {
//             continue;
//           } else {
//             cachingProcessedPools[pool2.address] = true;
//           }

//           const balance0 = formatBigNumberToNumber(
//             balanceResults[i * 2] ? balanceResults[i * 2].toString() : '0',
//             pool2.token0.decimals,
//           );
//           const balance1 = formatBigNumberToNumber(
//             balanceResults[i * 2 + 1] ? balanceResults[i * 2 + 1].toString() : '0',
//             pool2.token1.decimals,
//           );

//           // get base token address if any
//           const baseTokenAddress = this.dexscanConfig.baseTokens[factoryConfig.chain].filter(
//             (item) => compareAddress(item, pool2.token0.address) || compareAddress(item, pool2.token1.address),
//           )[0];
//           if (baseTokenAddress) {
//             const baseTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//               chain: pool2.chain,
//               address: baseTokenAddress,
//               timestamp: timestamp,
//             });

//             if (compareAddress(baseTokenAddress, pool2.token0.address)) {
//               totalBalanceUsd += balance0 * baseTokenPriceUsd * 2;
//             } else {
//               totalBalanceUsd += balance1 * baseTokenPriceUsd * 2;
//             }
//           }
//         }

//         logger.debug('processed pools liquidity data', {
//           service: this.name,
//           chain: factoryConfig.chain,
//           version: factoryConfig.version,
//           factory: factoryConfig.factory,
//           totalPools: poolIndex * callSize + poolConfigs.length,
//         });

//         poolIndex += 1;
//       }
//     }

//     return totalBalanceUsd;
//   }

//   protected async getFactoryBalanceV3(
//     factoryConfig: DexscanFactoryConfig,
//     timestamp: number,
//     blockNumber: number,
//   ): Promise<number> {
//     let totalBalanceUsd = 0;

//     if (factoryConfig.version === Pool2Types.univ3) {
//       const client = await this.services.blockchain.evm.getPublicClient(factoryConfig.chain);

//       // caching
//       const cachingProcessedPools: { [key: string]: boolean } = {};

//       let poolIndex = 0;
//       while (true) {
//         const poolConfigs: Array<Pool2> = await this.storages.database.query({
//           collection: envConfig.mongodb.collections.datasyncPool2.name,
//           query: {
//             chain: factoryConfig.chain,
//             factory: normalizeAddress(factoryConfig.factory),
//           },
//           options: {
//             limit: callSize,
//             skip: poolIndex * callSize,
//             order: { address: 1 },
//           },
//         });

//         if (poolConfigs.length === 0) {
//           break;
//         }

//         const balanceCalls: Array<ContractCall> = [];
//         for (const pool2 of poolConfigs) {
//           balanceCalls.push({
//             abi: UniswapV3PoolAbi,
//             target: pool2.address,
//             method: 'slot0',
//             params: [],
//           });
//           balanceCalls.push({
//             abi: Erc20Abi,
//             target: pool2.token0.address,
//             method: 'balanceOf',
//             params: [pool2.address],
//           });
//           balanceCalls.push({
//             abi: Erc20Abi,
//             target: pool2.token1.address,
//             method: 'balanceOf',
//             params: [pool2.address],
//           });
//         }

//         // query balances
//         const contracts = balanceCalls.map((call) => {
//           return {
//             address: call.target as Address,
//             abi: call.abi,
//             functionName: call.method,
//             args: call.params,
//           } as const;
//         });
//         const callResults: Array<any> = await client.multicall({
//           multicallAddress: AddressMulticall3,
//           contracts: contracts,
//           blockNumber: BigInt(blockNumber),
//           allowFailure: true,
//         });
//         // we allow failure on multicall
//         // so if a call failed, we count the balance is zero
//         const balanceResults: Array<any> = callResults.map((item) => (item.result ? item.result : 0n));

//         for (let i = 0; i < poolConfigs.length; i++) {
//           const pool2 = poolConfigs[i];

//           // ignore blacklist pools
//           if (this.helperGetIsBlacklistPool(pool2, factoryConfig)) {
//             continue;
//           }

//           if (cachingProcessedPools[pool2.address]) {
//             continue;
//           } else {
//             cachingProcessedPools[pool2.address] = true;
//           }

//           // get base token address if any
//           const baseTokenAddress = this.dexscanConfig.baseTokens[factoryConfig.chain].filter(
//             (item) => compareAddress(item, pool2.token0.address) || compareAddress(item, pool2.token1.address),
//           )[0];

//           if (baseTokenAddress) {
//             const slot0 = balanceResults[i * 3];
//             const balance0 = formatBigNumberToNumber(
//               balanceResults[i * 3 + 1] ? balanceResults[i * 3 + 1].toString() : '0',
//               pool2.token0.decimals,
//             );
//             const balance1 = formatBigNumberToNumber(
//               balanceResults[i * 3 + 2] ? balanceResults[i * 3 + 2].toString() : '0',
//               pool2.token1.decimals,
//             );

//             if (slot0 && balance0 > 0 && balance1 > 0) {
//               let token0PriceUsd = 0;
//               let token1PriceUsd = 0;

//               // https://blog.uniswap.org/uniswap-v3-math-primer
//               // slot0.sqrtPriceX96 -> sqrtPrice
//               const diffDecimals = pool2.token1.decimals - pool2.token0.decimals;
//               const sqrtPrice = new BigNumber(slot0[0].toString())
//                 .dividedBy(2 ** 96)
//                 .pow(2)
//                 .dividedBy(10 ** diffDecimals)
//                 .toNumber();

//               // sqrtPrice -> price
//               const token0PriceVsToken1 = sqrtPrice;
//               const token1PriceVsToken0 = sqrtPrice > 0 ? 1 / token0PriceVsToken1 : 0;

//               if (compareAddress(baseTokenAddress, pool2.token0.address)) {
//                 // price token1 vs token0
//                 token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                   chain: pool2.chain,
//                   address: pool2.token0.address,
//                   timestamp: timestamp,
//                 });

//                 token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;

//                 if (balance0 * token0PriceUsd < MaliciousPoolBaseAssetBalance) {
//                   continue;
//                 }
//               } else {
//                 // price token0 vs token1
//                 token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                   chain: pool2.chain,
//                   address: pool2.token1.address,
//                   timestamp: timestamp,
//                 });

//                 token0PriceUsd = token0PriceVsToken1 * token1PriceUsd;

//                 if (balance1 * token1PriceUsd < MaliciousPoolBaseAssetBalance) {
//                   continue;
//                 }
//               }

//               const balance0Usd = balance0 * token0PriceUsd;
//               const balance1Usd = balance1 * token1PriceUsd;

//               totalBalanceUsd += balance0Usd + balance1Usd;
//             }
//           }
//         }

//         logger.debug('processed pools liquidity data', {
//           service: this.name,
//           chain: factoryConfig.chain,
//           version: factoryConfig.version,
//           factory: factoryConfig.factory,
//           totalPools: poolIndex * callSize + poolConfigs.length,
//         });

//         poolIndex += 1;
//       }
//     }

//     return totalBalanceUsd;
//   }

//   protected helperGetIsBlacklistPool(pool2: Pool2, factoryConfig: DexscanFactoryConfig): boolean {
//     if (factoryConfig.blacklistPools) {
//       for (const blacklistPool of factoryConfig.blacklistPools) {
//         if (compareAddress(blacklistPool, pool2.address)) {
//           return true;
//         }
//       }
//     }

//     return false;
//   }
// }
