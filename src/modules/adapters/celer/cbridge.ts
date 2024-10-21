// import { ProtocolConfig } from '../../../types/base';
// import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
// import { ContextServices, ContextStorages } from '../../../types/namespaces';
// import { GetProtocolDataOptions } from '../../../types/options';
// import ProtocolAdapter from '../protocol';
// import { formatBigNumberToNumber } from '../../../lib/utils';
// import AdapterDataHelper from '../helpers';
// import { CbridgeProtocolConfig } from '../../../configs/protocols/celer';
// import { ContractCall } from '../../../services/blockchains/domains';
// import Erc20Abi from '../../../configs/abi/ERC20.json';

// export default class CbridgeAdapter extends ProtocolAdapter {
//   public readonly name: string = 'adapter.cbridge 🌈';

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
//       totalSupplied: 0,
//       volumes: {
//         bridge: 0,
//         deposit: 0,
//         withdraw: 0,
//       },
//       volumeBridgePaths: {},
//     };

//     const cbridgeConfig = this.protocolConfig as CbridgeProtocolConfig;
//     for (const bridgeConfig of cbridgeConfig.bridges) {
//       if (bridgeConfig.birthday > options.timestamp) {
//         continue;
//       }

//       if (!protocolData.breakdown[bridgeConfig.chain]) {
//         protocolData.breakdown[bridgeConfig.chain] = {};
//       }

//       if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain]) {
//         (protocolData.volumeBridgePaths as any)[bridgeConfig.chain] = {};
//       }

//       const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//         bridgeConfig.chain,
//         options.timestamp,
//       );
//       // const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//       //   bridgeConfig.chain,
//       //   options.beginTime,
//       // );
//       // const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
//       //   bridgeConfig.chain,
//       //   options.endTime,
//       // );

//       // count total value locked
//       const addresses: Array<string> = [bridgeConfig.bridge];
//       if (bridgeConfig.originTokenVaultV1) {
//         addresses.push(bridgeConfig.originTokenVaultV1);
//       }
//       if (bridgeConfig.originTokenVaultV2) {
//         addresses.push(bridgeConfig.originTokenVaultV2);
//       }

//       for (const addressToCount of addresses) {
//         const calls: Array<ContractCall> = bridgeConfig.tokens.map((token) => {
//           return {
//             abi: Erc20Abi,
//             target: token.address,
//             method: 'balanceOf',
//             params: [addressToCount],
//           };
//         });
//         const results: any = await this.services.blockchain.evm.multicall({
//           chain: bridgeConfig.chain,
//           blockNumber: blockNumber,
//           calls: calls,
//         });
//         if (results) {
//           for (let i = 0; i < bridgeConfig.tokens.length; i++) {
//             const token = bridgeConfig.tokens[i];
//             if (token) {
//               const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//                 chain: token.chain,
//                 address: token.address,
//                 timestamp: options.timestamp,
//               });
//               const balanceUsd =
//                 formatBigNumberToNumber(results[i] ? results[i].toString() : '0', token.decimals) * tokenPriceUsd;

//               protocolData.totalAssetDeposited += balanceUsd;
//               protocolData.totalValueLocked += balanceUsd;
//               (protocolData.totalSupplied as number) += balanceUsd;

//               if (!protocolData.breakdown[token.chain][token.address]) {
//                 protocolData.breakdown[token.chain][token.address] = {
//                   ...getInitialProtocolCoreMetrics(),
//                   totalSupplied: 0,
//                   volumes: {
//                     bridge: 0,
//                   },
//                 };
//               }
//               protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
//               protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
//               (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
//             }
//           }
//         }

//         for (const token of bridgeConfig.tokens) {
//           if (!protocolData.breakdown[token.chain][token.address]) {
//             protocolData.breakdown[token.chain][token.address] = {
//               ...getInitialProtocolCoreMetrics(),
//               totalSupplied: 0,
//               volumes: {
//                 bridge: 0,
//                 deposit: 0,
//                 withdraw: 0,
//               },
//             };
//           }

//           const tokenBalance = await this.services.blockchain.evm.getTokenBalance({
//             chain: token.chain,
//             address: token.address,
//             owner: addressToCount,
//             blockNumber: blockNumber,
//           });

//           const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
//             chain: token.chain,
//             address: token.address,
//             timestamp: options.timestamp,
//           });

//           const totalLiquidityUsd = formatBigNumberToNumber(tokenBalance, token.decimals) * tokenPriceUsd;

//           protocolData.totalAssetDeposited += totalLiquidityUsd;
//           protocolData.totalValueLocked += totalLiquidityUsd;
//           (protocolData.totalSupplied as number) += totalLiquidityUsd;

//           protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalLiquidityUsd;
//           protocolData.breakdown[token.chain][token.address].totalValueLocked += totalLiquidityUsd;
//           (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalLiquidityUsd;
//         }
//       }
//     }

//     return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
//   }
// }
