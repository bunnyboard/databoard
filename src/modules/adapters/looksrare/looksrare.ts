// import { ProtocolConfig } from '../../../types/base';
// import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import { GetProtocolDataOptions } from '../../../types/options';
// import { decodeEventLog } from 'viem';
// import AdapterDataHelper from '../helpers';
// import ProtocolAdapter from '../protocol';
// import ExchangeV1Abi from '../../../configs/abi/looksrare/LooksRareExchange.json';
// import ExchangeV2Abi from '../../../configs/abi/looksrare/LooksRareExchangeV2.json';
// import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
// import { LooksrareProtocolConfig } from '../../../configs/protocols/looksrare';
// import ExchangeV1StrategyAbi from '../../../configs/abi/looksrare/Strategy.json';

// const v1Events = {
//   TakerAsk: '0x68cd251d4d267c6e2034ff0088b990352b97b2002c0476587d0c4da889c11330',
//   TakerBid: '0x95fb6205e23ff6bda16a2d1dba56b9ad7c783f67c96fa149785052f47696f2be',
// };

// const v2Events = {
//   TakerAsk: '0x9aaa45d6db2ef74ead0751ea9113263d1dec1b50cea05f0ca2002cb8063564a4',
//   TakerBid: '0x3ee3de4684413690dee6fff1a0a4f92916a1b97d1c5a83cdf24671844306b2e3',
// };

// export default class LooksrareAdapter extends ProtocolAdapter {
//   public readonly name: string = 'adapter.looksrare';

//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }

//   public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
//     const looksrareConfig = this.protocolConfig as LooksrareProtocolConfig;

//     const protocolData: ProtocolData = {
//       protocol: this.protocolConfig.protocol,
//       birthday: this.protocolConfig.birthday,
//       timestamp: options.timestamp,
//       breakdown: {
//         [looksrareConfig.chain]: {},
//       },
//       ...getInitialProtocolCoreMetrics(),
//       marketplace: {
//         volumeTrade: 0,
//         numberOfTrades: 0,
//       },
//     };

//     if (looksrareConfig.birthday > options.timestamp) {
//       return null;
//     }

//     const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//       looksrareConfig.chain,
//       options.beginTime,
//     );
//     const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//       looksrareConfig.chain,
//       options.endTime,
//     );

//     const v1Logs = await this.services.blockchain.evm.getContractLogs({
//       chain: looksrareConfig.chain,
//       address: looksrareConfig.exchangeV1,
//       fromBlock: beginBlock,
//       toBlock: endBlock,
//     });
//     const v2Logs = await this.services.blockchain.evm.getContractLogs({
//       chain: looksrareConfig.chain,
//       address: looksrareConfig.exchangeV2,
//       fromBlock: beginBlock,
//       toBlock: endBlock,
//     });

//     const strategyFeeCaching: { [key: string]: number } = {};
//     for (const log of v1Logs.filter((log) => Object.values(v1Events).includes(log.topics[0]))) {
//       const event: any = decodeEventLog({
//         abi: ExchangeV1Abi,
//         topics: log.topics,
//         data: log.data,
//       });

//       const token = await this.services.blockchain.evm.getTokenInfo({
//         chain: looksrareConfig.chain,
//         address: event.args.currency,
//       });
//       if (token) {
//         const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//           chain: token.chain,
//           address: token.address,
//           timestamp: options.timestamp,
//         });

//         let feeRate = 0;
//         if (strategyFeeCaching[normalizeAddress(event.args.strategy)] !== undefined) {
//           feeRate = strategyFeeCaching[normalizeAddress(event.args.strategy)];
//         } else {
//           const protocolFee = await this.services.blockchain.evm.readContract({
//             chain: looksrareConfig.chain,
//             abi: ExchangeV1StrategyAbi,
//             target: event.args.strategy,
//             method: 'viewProtocolFee',
//             params: [],
//           });
//           feeRate = formatBigNumberToNumber(protocolFee ? protocolFee.toString() : '0', 6);
//           strategyFeeCaching[normalizeAddress(event.args.strategy)] = feeRate;
//         }

//         const priceUsd = formatBigNumberToNumber(event.args.price.toString(), token.decimals) * tokenPriceUsd;
//         const protocolFeeUsd = priceUsd * feeRate;

//         protocolData.totalFees += protocolFeeUsd;
//         protocolData.protocolRevenue += protocolFeeUsd;
//         (protocolData.marketplace as any).volumeTrade += priceUsd;
//         (protocolData.marketplace as any).numberOfTrades += 1;
//         if (!protocolData.breakdown[token.chain][token.address]) {
//           protocolData.breakdown[token.chain][token.address] = {
//             ...getInitialProtocolCoreMetrics(),
//             marketplace: {
//               volumeTrade: 0,
//               numberOfTrades: 0,
//             },
//           };
//         }
//         protocolData.breakdown[token.chain][token.address].totalFees += protocolFeeUsd;
//         protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;
//         (protocolData.breakdown[token.chain][token.address].marketplace as any).volumeTrade += priceUsd;
//         (protocolData.breakdown[token.chain][token.address].marketplace as any).numberOfTrades += 1;
//       }
//     }

//     for (const log of v2Logs.filter((log) => Object.values(v2Events).includes(log.topics[0]))) {
//       const event: any = decodeEventLog({
//         abi: ExchangeV2Abi,
//         topics: log.topics,
//         data: log.data,
//       });
//       const token = await this.services.blockchain.evm.getTokenInfo({
//         chain: looksrareConfig.chain,
//         address: event.args.currency,
//       });
//       if (token) {
//         const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//           chain: token.chain,
//           address: token.address,
//           timestamp: options.timestamp,
//         });

//         let saleVolumeUsd = 0;
//         for (const feeItem of event.args.feeAmounts) {
//           saleVolumeUsd += formatBigNumberToNumber(feeItem.toString(), token.decimals) * tokenPriceUsd;
//         }

//         // https://etherscan.io/address/0x0000000000e655fae4d56241588680f86e3b2377#code#F5#L264
//         const protocolFeeUsd =
//           formatBigNumberToNumber(
//             event.args.feeAmounts[2] ? event.args.feeAmounts[2].toString() : '0',
//             token.decimals,
//           ) * tokenPriceUsd;

//         protocolData.totalFees += protocolFeeUsd;
//         protocolData.protocolRevenue += protocolFeeUsd;
//         (protocolData.marketplace as any).volumeTrade += saleVolumeUsd;
//         (protocolData.marketplace as any).numberOfTrades += 1;
//         if (!protocolData.breakdown[token.chain][token.address]) {
//           protocolData.breakdown[token.chain][token.address] = {
//             ...getInitialProtocolCoreMetrics(),
//             marketplace: {
//               volumeTrade: 0,
//               numberOfTrades: 0,
//             },
//           };
//         }
//         protocolData.breakdown[token.chain][token.address].totalFees += protocolFeeUsd;
//         protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;
//         (protocolData.breakdown[token.chain][token.address].marketplace as any).volumeTrade += saleVolumeUsd;
//         (protocolData.breakdown[token.chain][token.address].marketplace as any).numberOfTrades += 1;
//       }
//     }

//     return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
//   }
// }
