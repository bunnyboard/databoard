// import { CowswapProtocolConfig } from '../../../configs/protocols/cowswap';
// import { ProtocolConfig } from '../../../types/base';
// import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import { GetProtocolDataOptions } from '../../../types/options';
// import ProtocolAdapter from '../protocol';
// import GPv2SettlementAbi from '../../../configs/abi/cowswap/GPv2Settlement.json';
// import { decodeEventLog } from 'viem';
// import { formatBigNumberToNumber } from '../../../lib/utils';

// const TradeEvent = '0xa07a543ab8a018198e99ca0184c93fe9050a79400a0a723441f84de1d972cc17';

// export default class CowswapAdapter extends ProtocolAdapter {
//   public readonly name: string = 'adapter.cowswap 🐮';

//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }

//   public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
//     const protocolData: ProtocolData = {
//       protocol: this.protocolConfig.protocol,
//       category: this.protocolConfig.category,
//       birthday: this.protocolConfig.birthday,
//       timestamp: options.timestamp,
//       breakdown: {},
//       ...getInitialProtocolCoreMetrics(),
//       volumes: {
//         sellToken: 0,
//         buyToken: 0,
//       },
//     };

//     const cowswapConfig = this.protocolConfig as CowswapProtocolConfig;
//     for (const settlementConfig of cowswapConfig.settlements) {
//       const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//         settlementConfig.chain,
//         options.beginTime,
//       );
//       const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//         settlementConfig.chain,
//         options.endTime,
//       );
//       const logs = await this.services.blockchain.evm.getContractLogs({
//         chain: settlementConfig.chain,
//         address: settlementConfig.settlement,
//         fromBlock: beginBlock,
//         toBlock: endBlock,
//       });

//       for (const log of logs) {
//         if (log.topics[0] === TradeEvent) {
//           const event: any = decodeEventLog({
//             abi: GPv2SettlementAbi,
//             topics: log.topics,
//             data: log.data,
//           });

//           let amountUsd = 0;
//           let feesUsd = 0;

//           const sellToken = await this.services.blockchain.evm.getTokenInfo({
//             chain: settlementConfig.chain,
//             address: event.args.sellToken,
//           });
//           const buyToken = await this.services.blockchain.evm.getTokenInfo({
//             chain: settlementConfig.chain,
//             address: event.args.buyToken,
//           });

//           if (sellToken && buyToken) {
//             const sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//               chain: sellToken.chain,
//               address: sellToken.address,
//               timestamp: options.timestamp,
//             });
//             amountUsd =
//               formatBigNumberToNumber(event.args.sellAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
//             feesUsd = formatBigNumberToNumber(event.args.feeAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;

//             if (sellTokenPriceUsd === 0) {
//               const buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                 chain: buyToken.chain,
//                 address: buyToken.address,
//                 timestamp: options.timestamp,
//               });
//               amountUsd =
//                 formatBigNumberToNumber(event.args.buyAmount.toString(), buyToken.decimals) * buyTokenPriceUsd;
//             }

//             if (!protocolData.breakdown[sellToken.chain][sellToken.address]) {
//               protocolData.breakdown[sellToken.chain][sellToken.address] = {
//                 ...getInitialProtocolCoreMetrics(),
//                 volumes: {
//                   sellToken: 0,
//                   buyToken: 0,
//                 },
//               };
//             }
//             if (!protocolData.breakdown[buyToken.chain][buyToken.address]) {
//               protocolData.breakdown[buyToken.chain][buyToken.address] = {
//                 ...getInitialProtocolCoreMetrics(),
//                 volumes: {
//                   sellToken: 0,
//                   buyToken: 0,
//                 },
//               };
//             }

//             // fees collected from input tokens
//             protocolData.breakdown[sellToken.chain][sellToken.address].totalFees += feesUsd;

//             // buy/sell volumes
//             (protocolData.breakdown[sellToken.chain][sellToken.address].volumes.sellToken as number) += amountUsd;
//             (protocolData.breakdown[sellToken.chain][sellToken.address].volumes.buyToken as number) += amountUsd;

//             protocolData.totalFees += feesUsd;
//             protocolData.protocolRevenue += feesUsd;
//             (protocolData.volumes.buyToken as number) += amountUsd;
//             (protocolData.volumes.sellToken as number) += amountUsd;
//           }
//         }
//       }
//     }

//     return protocolData;
//   }
// }
