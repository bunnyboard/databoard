// import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
// import envConfig from '../../../configs/envConfig';
// import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
// import { getQueryEndpoint, querySubgraph, querySubgraphMetaBlock } from '../../../lib/subgraph';
// import { TokenDexBase } from '../../../configs';
// import { ContextServices } from '../../../types/namespaces';
// import { Pool2Types } from '../../../types/domains/pool2';
// import { AddressZero } from '../../../configs/constants';
// import { ContractCall } from '../../../services/blockchains/domains';
// import Erc20Abi from '../../../configs/abi/ERC20.json';

// const poolQueryRange = 200;
// const eventQueryRange = 1000;

// export interface SubgraphQueryParams {
//   factories: string;
//   totalVolumeUSD: string;
//   totalLiquidityUSD: string;

//   // for v3 query
//   totalFeesUSD?: string;
// }

// interface SubgraphQueryOptions {
//   factoryConfig: UniswapFactoryConfig;
//   params: SubgraphQueryParams;

//   blockNumber: number;
//   fromBlock: number;
//   toBlock: number;

//   timestamp: number;
//   fromTime: number;
//   toTime: number;

//   // some subgraph endpoint has error on count total liquidity
//   // if countPools is true, count tvl by couting all pools tvl
//   countPools?: boolean;
// }

// export interface SubgraphQueryResult {
//   liquidityUsd: number;
//   totalFeesUsd: number;
//   totalLpFeesUsd: number;
//   totalProtocolFeesUsd: number;
//   volumeSwapUsd: number;
//   volumeAddLiquidityUsd: number;
//   volumeRemoveLiquidityUsd: number;
// }

// export default class UniswapSubgraphQuery {
//   public readonly services: ContextServices;

//   constructor(services: ContextServices) {
//     this.services = services;
//   }

//   public async querySubgraphV2(options: SubgraphQueryOptions): Promise<SubgraphQueryResult | null> {
//     const { factoryConfig, params, blockNumber, fromBlock, timestamp, fromTime, toTime } = options;
//     let { toBlock } = options;

//     if (factoryConfig.subgraph && envConfig.thegraph.thegraphApiKey && factoryConfig.version === Pool2Types.univ2) {
//       const endpoint =
//         factoryConfig.subgraph.provider === 'thegraph'
//           ? getQueryEndpoint(factoryConfig.subgraph.subgraphIdOrEndpoint, envConfig.thegraph.thegraphApiKey)
//           : factoryConfig.subgraph.subgraphIdOrEndpoint;

//       // using latest subgraph meta block
//       // if meta block is before given toBlock
//       const metaBlock = await querySubgraphMetaBlock(endpoint);
//       toBlock = toBlock <= metaBlock ? toBlock : metaBlock;

//       const factoryData = await querySubgraph(
//         endpoint,
//         `
//         {
//           fromData: ${params.factories}(first: 1, block: {number: ${fromBlock}}) {
//             ${params.totalVolumeUSD}
//             ${params.totalLiquidityUSD}
//           }

//           toData: ${params.factories}(first: 1, block: {number: ${toBlock}}) {
//             ${params.totalVolumeUSD}
//             ${params.totalLiquidityUSD}
//           }
//         }
//       `,
//       );

//       const result: SubgraphQueryResult = {
//         liquidityUsd: 0,
//         totalFeesUsd: 0,
//         totalLpFeesUsd: 0,
//         totalProtocolFeesUsd: 0,
//         volumeSwapUsd: 0,
//         volumeAddLiquidityUsd: 0,
//         volumeRemoveLiquidityUsd: 0,
//       };

//       if (factoryData) {
//         const fromFactoryData = factoryData.fromData[0];
//         const toFactoryData = factoryData.toData[0];

//         if (fromFactoryData && toFactoryData) {
//           const fromLiquitiyUsd = formatBigNumberToNumber(fromFactoryData[params.totalLiquidityUSD].toString(), 0);
//           const toLiquitiyUsd = formatBigNumberToNumber(toFactoryData[params.totalLiquidityUSD].toString(), 0);

//           const fromVolumeUsd = formatBigNumberToNumber(fromFactoryData[params.totalVolumeUSD].toString(), 0);
//           const toVolumeUsd = formatBigNumberToNumber(toFactoryData[params.totalVolumeUSD].toString(), 0);
//           const volumeUsd = toVolumeUsd - fromVolumeUsd;

//           const feeRateForProtocol = factoryConfig.feeRateForProtocol ? factoryConfig.feeRateForProtocol : 0;
//           const feeRateForLiquidityProviders = factoryConfig.feeRateForLiquidityProviders
//             ? factoryConfig.feeRateForLiquidityProviders
//             : 0.003;

//           const totalFees = volumeUsd * (feeRateForProtocol + feeRateForLiquidityProviders);
//           const supplySideRevenue = volumeUsd * feeRateForLiquidityProviders;
//           const protocolRevenue = totalFees - supplySideRevenue;

//           result.liquidityUsd = blockNumber === fromBlock ? fromLiquitiyUsd : toLiquitiyUsd;
//           result.totalFeesUsd = totalFees;
//           result.totalLpFeesUsd = supplySideRevenue;
//           result.totalProtocolFeesUsd = protocolRevenue;
//           result.volumeSwapUsd = volumeUsd;
//         }
//       } else {
//         // query tvl and volume by counting pairs one by one
//       }

//       // query mint/burn events
//       const processedId: { [key: string]: boolean } = {};
//       const mintEvents: Array<any> = [];
//       const burnEvents: Array<any> = [];

//       let startTime = fromTime;
//       do {
//         const response = await querySubgraph(
//           endpoint,
//           `
//           {
//             mints(first: ${eventQueryRange}, where: {timestamp_gte: ${startTime}, timestamp_lte: ${toTime}}, orderBy: timestamp, orderDirection: asc) {
//               id
//               timestamp
//               amount0
//               amount1
//               amountUSD
//               pair {
//                 token0 {
//                   id
//                   decimals
//                 }
//                 token1 {
//                   id
//                   decimals
//                 }
//               }
//             }
//           }
//         `,
//         );

//         const events: Array<any> = response && response.mints ? response.mints : [];
//         for (const event of events) {
//           if (!processedId[event.id]) {
//             mintEvents.push({
//               ...event,
//               event: 'Mint',
//             });
//             processedId[event.id] = true;
//           }
//         }

//         if (events.length < eventQueryRange) {
//           break;
//         } else {
//           startTime = Number(events[events.length - 1].timestamp);
//         }
//       } while (true);

//       startTime = fromTime;
//       do {
//         const response = await querySubgraph(
//           endpoint,
//           `
//           {
//             burns(first: ${eventQueryRange}, where: {timestamp_gte: ${startTime}, timestamp_lte: ${toTime}}, orderBy: timestamp, orderDirection: asc) {
//               id
//               timestamp
//               amount0
//               amount1
//               amountUSD
//               pair {
//                 token0 {
//                   id
//                 }
//                 token1 {
//                   id
//                 }
//               }
//             }
//           }
//         `,
//         );

//         const events: Array<any> = response && response.burns ? response.burns : [];
//         for (const event of events) {
//           if (!processedId[event.id]) {
//             burnEvents.push({
//               ...event,
//               event: 'Burn',
//             });
//             processedId[event.id] = true;
//           }
//         }

//         if (events.length < eventQueryRange) {
//           break;
//         } else {
//           startTime = Number(events[events.length - 1].timestamp);
//         }
//       } while (true);

//       for (const event of mintEvents.concat(burnEvents)) {
//         if (factoryConfig.blacklistEventIds && factoryConfig.blacklistEventIds.includes(event.id)) {
//           continue;
//         }

//         if (event.amount0 && event.amount1) {
//           const token0Address = normalizeAddress(event.pair.token0.id);
//           const token1Address = normalizeAddress(event.pair.token1.id);

//           let liquidityAmountUsd = 0;
//           if (TokenDexBase[factoryConfig.chain] && TokenDexBase[factoryConfig.chain].includes(token0Address)) {
//             const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//               chain: factoryConfig.chain,
//               address: token0Address,
//               timestamp: timestamp,
//             });
//             liquidityAmountUsd = formatBigNumberToNumber(event.amount0.toString(), 0) * tokenPriceUsd;
//           } else if (TokenDexBase[factoryConfig.chain] && TokenDexBase[factoryConfig.chain].includes(token1Address)) {
//             const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//               chain: factoryConfig.chain,
//               address: token1Address,
//               timestamp: timestamp,
//             });
//             liquidityAmountUsd = formatBigNumberToNumber(event.amount1.toString(), 0) * tokenPriceUsd;
//           } else {
//             liquidityAmountUsd = formatBigNumberToNumber(event.amountUSD.toString(), 0);
//           }

//           if (event.event === 'Mint') {
//             result.volumeAddLiquidityUsd += liquidityAmountUsd * 2;
//           } else if (event.event === 'Burn') {
//             result.volumeRemoveLiquidityUsd += liquidityAmountUsd * 2;
//           }
//         }
//       }

//       return result;
//     }

//     return null;
//   }

//   public async querySubgraphV3(options: SubgraphQueryOptions): Promise<SubgraphQueryResult | null> {
//     const { factoryConfig, params, blockNumber, fromBlock, timestamp, fromTime, toTime } = options;
//     let { toBlock } = options;

//     if (factoryConfig.subgraph && envConfig.thegraph.thegraphApiKey && factoryConfig.version === Pool2Types.univ3) {
//       const endpoint =
//         factoryConfig.subgraph.provider === 'thegraph'
//           ? getQueryEndpoint(factoryConfig.subgraph.subgraphIdOrEndpoint, envConfig.thegraph.thegraphApiKey)
//           : factoryConfig.subgraph.subgraphIdOrEndpoint;

//       // using latest subgraph meta block
//       // if meta block is before given toBlock
//       const metaBlock = await querySubgraphMetaBlock(endpoint);
//       toBlock = toBlock <= metaBlock ? toBlock : metaBlock;

//       const factoryData = await querySubgraph(
//         endpoint,
//         `
//         {
//           fromData: ${params.factories}(first: 1, block: {number: ${fromBlock}}) {
//             ${params.totalVolumeUSD}
//             ${params.totalFeesUSD}
//             ${params.totalLiquidityUSD}
//           }

//           toData: ${params.factories}(first: 1, block: {number: ${toBlock}}) {
//             ${params.totalVolumeUSD}
//             ${params.totalFeesUSD}
//             ${params.totalLiquidityUSD}
//           }
//         }
//       `,
//       );

//       if (factoryData) {
//         const fromFactoryData = factoryData.fromData[0];
//         const toFactoryData = factoryData.toData[0];

//         if (fromFactoryData && toFactoryData) {
//           const fromLiquitiyUsd = formatBigNumberToNumber(fromFactoryData[params.totalLiquidityUSD].toString(), 0);
//           const toLiquitiyUsd = formatBigNumberToNumber(toFactoryData[params.totalLiquidityUSD].toString(), 0);

//           const fromFeesUsd = formatBigNumberToNumber(fromFactoryData[String(params.totalFeesUSD)].toString(), 0);
//           const toFeesUsd = formatBigNumberToNumber(toFactoryData[String(params.totalFeesUSD)].toString(), 0);

//           const fromVolumeUsd = formatBigNumberToNumber(fromFactoryData[params.totalVolumeUSD].toString(), 0);
//           const toVolumeUsd = formatBigNumberToNumber(toFactoryData[params.totalVolumeUSD].toString(), 0);

//           const volumeUsd = toVolumeUsd - fromVolumeUsd;
//           const feesUsd = toFeesUsd - fromFeesUsd;

//           const feeRateForProtocol = factoryConfig.feeRateForProtocol ? factoryConfig.feeRateForProtocol : 0;
//           const totalFees = feesUsd;
//           const protocolRevenue = totalFees * feeRateForProtocol;
//           const supplySideRevenue = totalFees - protocolRevenue;

//           const result: SubgraphQueryResult = {
//             liquidityUsd: blockNumber === fromBlock ? fromLiquitiyUsd : toLiquitiyUsd,
//             totalFeesUsd: feesUsd,
//             totalLpFeesUsd: supplySideRevenue,
//             totalProtocolFeesUsd: protocolRevenue,
//             volumeSwapUsd: volumeUsd,
//             volumeAddLiquidityUsd: 0,
//             volumeRemoveLiquidityUsd: 0,
//           };

//           if (options.countPools) {
//             result.liquidityUsd = 0;

//             // count total liquidity by count tvl of all pools
//             let startPoolId = AddressZero;
//             do {
//               const response = await querySubgraph(
//                 endpoint,
//                 `
//                 {
//                   pools(first: ${poolQueryRange}, block: {number: ${blockNumber}}, where: {id_gt: "${startPoolId}"}, orderBy: id, orderDirection: asc) {
//                     id
//                     token0 {
//                       id
//                       symbol
//                       decimals
//                     }
//                     token1 {
//                       id
//                       symbol
//                       decimals
//                     }
//                     token0Price
//                     token1Price
//                     totalValueLockedToken0
//                     totalValueLockedToken1
//                   }
//                 }
//               `,
//               );

//               // pools data from subgraph
//               const pools: Array<any> = response.pools ? response.pools : [];

//               const calls: Array<ContractCall> = [];
//               for (const pool of pools) {
//                 calls.push({
//                   abi: Erc20Abi,
//                   target: pool.token0.id,
//                   method: 'balanceOf',
//                   params: [pool.id],
//                 });
//                 calls.push({
//                   abi: Erc20Abi,
//                   target: pool.token1.id,
//                   method: 'balanceOf',
//                   params: [pool.id],
//                 });
//               }

//               const balances = await this.services.blockchain.evm.multicall({
//                 chain: factoryConfig.chain,
//                 blockNumber: blockNumber,
//                 calls: calls,
//               });
//               if (balances) {
//                 for (let i = 0; i < pools.length; i++) {
//                   const pool = pools[i];

//                   const token0Address = normalizeAddress(pool.token0.id);
//                   const token1Address = normalizeAddress(pool.token1.id);

//                   const token0PriceVsToken1 = formatBigNumberToNumber(pool.token1Price.toString(), 0);
//                   const token1PriceVsToken0 = formatBigNumberToNumber(pool.token0Price.toString(), 0);

//                   if (TokenDexBase[factoryConfig.chain] && TokenDexBase[factoryConfig.chain].includes(token0Address)) {
//                     const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                       chain: factoryConfig.chain,
//                       address: token0Address,
//                       timestamp: timestamp,
//                     });

//                     const balance0Usd =
//                       formatBigNumberToNumber(balances[i * 2].toString(), Number(pool.token0.decimals)) *
//                       token0PriceUsd;
//                     result.liquidityUsd += balance0Usd;

//                     if (balance0Usd > 10000) {
//                       const token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;
//                       const balance1Usd =
//                         formatBigNumberToNumber(balances[i * 2 + 1].toString(), Number(pool.token1.decimals)) *
//                         token1PriceUsd;

//                       result.liquidityUsd += balance1Usd;
//                     }
//                   } else if (
//                     TokenDexBase[factoryConfig.chain] &&
//                     TokenDexBase[factoryConfig.chain].includes(token1Address)
//                   ) {
//                     const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                       chain: factoryConfig.chain,
//                       address: token1Address,
//                       timestamp: timestamp,
//                     });

//                     const balance1Usd =
//                       formatBigNumberToNumber(balances[i * 2 + 1].toString(), Number(pool.token1.decimals)) *
//                       token1PriceUsd;
//                     result.liquidityUsd += balance1Usd;

//                     if (balance1Usd > 10000) {
//                       const token0PriceUsd = token0PriceVsToken1 * token1PriceUsd;
//                       const balance0Usd =
//                         formatBigNumberToNumber(balances[i * 2].toString(), Number(pool.token0.decimals)) *
//                         token0PriceUsd;

//                       result.liquidityUsd += balance0Usd;
//                     }
//                   }
//                 }
//               }

//               if (pools.length < poolQueryRange) {
//                 break;
//               } else {
//                 startPoolId = normalizeAddress(pools[pools.length - 1].id);
//               }
//             } while (true);
//           }

//           // query mint/burn events
//           const processedId: { [key: string]: boolean } = {};
//           const mintEvents: Array<any> = [];
//           const burnEvents: Array<any> = [];

//           let startTime = fromTime;
//           do {
//             const response = await querySubgraph(
//               endpoint,
//               `
//               {
//                 mints(first: ${eventQueryRange}, where: {timestamp_gte: ${startTime}, timestamp_lte: ${toTime}}, orderBy: timestamp, orderDirection: asc) {
//                   id
//                   timestamp
//                   amount0
//                   amount1
//                   amountUSD
//                   token0 {
//                     id
//                     decimals
//                   }
//                   token1 {
//                     id
//                     decimals
//                   }
//                 }
//               }
//             `,
//             );

//             const events: Array<any> = response && response.mints ? response.mints : [];
//             for (const event of events) {
//               if (!processedId[event.id]) {
//                 mintEvents.push({
//                   ...event,
//                   event: 'Mint',
//                 });
//                 processedId[event.id] = true;
//               }
//             }

//             if (events.length < eventQueryRange) {
//               break;
//             } else {
//               startTime = Number(events[events.length - 1].timestamp);
//             }
//           } while (true);

//           startTime = fromTime;
//           do {
//             const response = await querySubgraph(
//               endpoint,
//               `
//               {
//                 burns(first: ${eventQueryRange}, where: {timestamp_gte: ${startTime}, timestamp_lte: ${toTime}}, orderBy: timestamp, orderDirection: asc) {
//                   id
//                   timestamp
//                   amount0
//                   amount1
//                   amountUSD
//                   token0 {
//                     id
//                   }
//                   token1 {
//                     id
//                   }
//                 }
//               }
//             `,
//             );

//             const events: Array<any> = response && response.burns ? response.burns : [];
//             for (const event of events) {
//               if (!processedId[event.id]) {
//                 burnEvents.push({
//                   ...event,
//                   event: 'Burn',
//                 });
//                 processedId[event.id] = true;
//               }
//             }

//             if (events.length < eventQueryRange) {
//               break;
//             } else {
//               startTime = Number(events[events.length - 1].timestamp);
//             }
//           } while (true);

//           for (const event of mintEvents.concat(burnEvents)) {
//             if (factoryConfig.blacklistEventIds && factoryConfig.blacklistEventIds.includes(event.id)) {
//               continue;
//             }

//             const token0Address = normalizeAddress(event.token0.id);
//             const token1Address = normalizeAddress(event.token1.id);

//             let liquidityAmountUsd = 0;
//             if (TokenDexBase[factoryConfig.chain] && TokenDexBase[factoryConfig.chain].includes(token0Address)) {
//               const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                 chain: factoryConfig.chain,
//                 address: token0Address,
//                 timestamp: timestamp,
//               });
//               liquidityAmountUsd = formatBigNumberToNumber(event.amount0.toString(), 0) * tokenPriceUsd;
//             } else if (TokenDexBase[factoryConfig.chain] && TokenDexBase[factoryConfig.chain].includes(token1Address)) {
//               const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                 chain: factoryConfig.chain,
//                 address: token1Address,
//                 timestamp: timestamp,
//               });
//               liquidityAmountUsd = formatBigNumberToNumber(event.amount1.toString(), 0) * tokenPriceUsd;
//             } else {
//               liquidityAmountUsd = formatBigNumberToNumber(event.amountUSD.toString(), 0);
//             }

//             if (event.event === 'Mint') {
//               result.volumeAddLiquidityUsd += liquidityAmountUsd * 2;
//             } else if (event.event === 'Burn') {
//               result.volumeRemoveLiquidityUsd += liquidityAmountUsd * 2;
//             }
//           }

//           return result;
//         }
//       }
//     }

//     return null;
//   }
// }
