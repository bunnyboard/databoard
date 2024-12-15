// import envConfig from '../../../configs/envConfig';
// import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
// import { ProtocolConfig } from '../../../types/base';
// import { Pool2 } from '../../../types/domains/pool2';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import { GetDexDataDataOptions, GetDexDataResult } from '../uniswap/types';
// import UniswapAdapter from '../uniswap/uniswap';
// import PancakeV3PoolAbi from '../../../configs/abi/pancake/PancakeV3Pool.json';
// import { decodeEventLog } from 'viem';

// const PancakeV3Events = {
//   Swap: '0x19b47279256b2a23a1665c810c8d55a1758940ee09377d4f8d26497a3577dc83',
//   Mint: '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
//   Burn: '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c',
// };

// export default class PancakeAdapter extends UniswapAdapter {
//   public readonly name: string = 'adapter.pancake 🥞';

//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }

//   protected async parseDexV3Events(options: GetDexDataDataOptions, logs: Array<any>): Promise<GetDexDataResult> {
//     const result: GetDexDataResult = {
//       totalLiquidityUsd: 0,
//       totalSwapFeeUsdForLps: 0,
//       totalSwapFeeUsdForProtocol: 0,
//       volumeAddLiquidityUsd: 0,
//       volumeRemoveLiquidityUsd: 0,
//       volumeSwapUsd: 0,
//     };

//     for (const log of logs) {
//       const signature = log.topics[0];

//       if (
//         // v3 pair events
//         signature === PancakeV3Events.Swap ||
//         signature === PancakeV3Events.Mint ||
//         signature === PancakeV3Events.Burn
//       ) {
//         const pool2: Pool2 | undefined = await this.storages.database.find({
//           collection: envConfig.mongodb.collections.metadataPool2.name,
//           query: {
//             chain: options.chainConfig.chain,
//             address: normalizeAddress(log.address),
//           },
//         });

//         if (pool2) {
//           // make sure the address is the pool of this dex config
//           const dexConfig = options.chainConfig.dexes.filter((dexConfig) =>
//             compareAddress(dexConfig.factory, pool2.factory),
//           )[0];
//           if (dexConfig) {
//             // v3 events
//             const event: any = decodeEventLog({
//               abi: PancakeV3PoolAbi,
//               topics: log.topics,
//               data: log.data,
//             });

//             const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
//             if (baseTokenAddress) {
//               const baseTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                 chain: options.chainConfig.chain,
//                 address: baseTokenAddress,
//                 timestamp: options.timestamp,
//               });

//               if (signature === PancakeV3Events.Swap) {
//                 const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
//                 const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

//                 let volumeUsd = 0;
//                 if (compareAddress(baseTokenAddress, pool2.token0.address)) {
//                   if (amount0 > 0) {
//                     // swap token0 for token1
//                     volumeUsd = amount0 * baseTokenPriceUsd;
//                   } else if (amount0 < 0) {
//                     // swap token1 for token0
//                     volumeUsd = (Math.abs(amount0) * baseTokenPriceUsd) / (1 - pool2.feeRate);
//                   }
//                 } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
//                   if (amount1 > 0) {
//                     // swap token1 for token0
//                     volumeUsd = amount1 * baseTokenPriceUsd;
//                   } else if (amount1 < 0) {
//                     // swap token0 for token1
//                     volumeUsd = (Math.abs(amount1) * baseTokenPriceUsd) / (1 - pool2.feeRate);
//                   }
//                 }

//                 const totalSwapFees = volumeUsd * pool2.feeRate;
//                 const feeRateProtocol = dexConfig.feeRateForProtocol ? dexConfig.feeRateForProtocol : 0;
//                 const feeRateForLps = 1 - feeRateProtocol;

//                 result.volumeSwapUsd += volumeUsd;
//                 result.totalSwapFeeUsdForLps += totalSwapFees * feeRateForLps;
//                 result.totalSwapFeeUsdForProtocol += totalSwapFees * feeRateProtocol;
//               } else {
//                 const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
//                 const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

//                 let amountUsd = 0;
//                 if (compareAddress(baseTokenAddress, pool2.token0.address)) {
//                   amountUsd = amount0 * baseTokenPriceUsd;
//                 } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
//                   amountUsd = amount1 * baseTokenPriceUsd;
//                 }

//                 if (signature === PancakeV3Events.Mint) {
//                   result.volumeAddLiquidityUsd += amountUsd;
//                 } else if (signature === PancakeV3Events.Burn) {
//                   result.volumeRemoveLiquidityUsd += amountUsd;
//                 }
//               }
//             }
//           }
//         }
//       }
//     }

//     return result;
//   }
// }
