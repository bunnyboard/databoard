// import { ProtocolConfig } from '../../../types/base';
// import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import { GetProtocolDataOptions } from '../../../types/options';
// import { decodeEventLog } from 'viem';
// import AdapterDataHelper from '../helpers';
// import ProtocolAdapter from '../protocol';
// import SeaportAbi from '../../../configs/abi/opensea/Seaport.json';
// import { OpenseaProtocolConfig } from '../../../configs/protocols/opensea';
// import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';

// const Events = {
//   OrderFulfilled: '0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31',
// };

// export default class OpenseaAdapter extends ProtocolAdapter {
//   public readonly name: string = 'adapter.opensea';

//   constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
//     super(services, storages, protocolConfig);
//   }

//   public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
//     const protocolData: ProtocolData = {
//       protocol: this.protocolConfig.protocol,
//       birthday: this.protocolConfig.birthday,
//       timestamp: options.timestamp,
//       breakdown: {},
//       ...getInitialProtocolCoreMetrics(),
//       marketplace: {
//         volumeTrade: 0,
//         numberOfTrades: 0,
//       },
//     };

//     const openseaConfig = this.protocolConfig as OpenseaProtocolConfig;
//     for (const seaportConfig of openseaConfig.seaports) {
//       if (seaportConfig.birthday > options.timestamp) {
//         continue;
//       }

//       if (!protocolData.breakdown[seaportConfig.chain]) {
//         protocolData.breakdown[seaportConfig.chain] = {};
//       }

//       const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//         seaportConfig.chain,
//         options.beginTime,
//       );
//       const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//         seaportConfig.chain,
//         options.endTime,
//       );

//       const logs = await this.services.blockchain.evm.getContractLogs({
//         chain: seaportConfig.chain,
//         address: seaportConfig.seaport,
//         fromBlock: beginBlock,
//         toBlock: endBlock,
//       });

//       for (const log of logs.filter((log) => log.topics[0] === Events.OrderFulfilled)) {
//         const event: any = decodeEventLog({
//           abi: SeaportAbi,
//           topics: log.topics,
//           data: log.data,
//         });

//         for (const offer of event.args.offer.concat(event.args.consideration)) {
//           // native ETH or ERC20 tokens
//           // https://etherscan.io/address/0x00000000006c3852cbef3e08e8df289169ede581#code#F11#L5
//           if (offer.itemType === 0 || offer.itemType === 1) {
//             const token = await this.services.blockchain.evm.getTokenInfo({
//               chain: seaportConfig.chain,
//               address: offer.token,
//             });
//             if (token) {
//               const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                 chain: token.chain,
//                 address: token.address,
//                 timestamp: options.timestamp,
//               });

//               const tokenAmountUsd = formatBigNumberToNumber(offer.amount.toString(), token.decimals) * tokenPriceUsd;

//               (protocolData.marketplace as any).volumeTrade += tokenAmountUsd;
//               (protocolData.marketplace as any).numberOfTrades += 1;
//               if (!protocolData.breakdown[token.chain][token.address]) {
//                 protocolData.breakdown[token.chain][token.address] = {
//                   ...getInitialProtocolCoreMetrics(),
//                   marketplace: {
//                     volumeTrade: 0,
//                     numberOfTrades: 0,
//                   },
//                 };
//               }
//               (protocolData.breakdown[token.chain][token.address].marketplace as any).volumeTrade += tokenAmountUsd;
//               (protocolData.breakdown[token.chain][token.address].marketplace as any).numberOfTrades += 1;

//               if (offer.recipient && openseaConfig.feeRecipients.includes(normalizeAddress(offer.recipient))) {
//                 protocolData.totalFees += tokenAmountUsd;
//                 protocolData.protocolRevenue += tokenAmountUsd;
//                 protocolData.breakdown[token.chain][token.address].totalFees += tokenAmountUsd;
//                 protocolData.breakdown[token.chain][token.address].protocolRevenue += tokenAmountUsd;
//               }
//             }
//           }
//         }
//       }
//     }

//     return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
//   }
// }
