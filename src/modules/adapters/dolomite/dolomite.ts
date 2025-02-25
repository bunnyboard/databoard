import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { DolomiteProtocolConfig } from '../../../configs/protocols/dolomite';
import DolomiteMarginAbi from '../../../configs/abi/dolomite/DolomiteMargin.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
// import { decodeEventLog } from 'viem';

// const MarginEvents = {
//   LogDeposit: '0x2bad8bc95088af2c247b30fa2b2e6a0886f88625e0945cd3051008e0e270198f',
//   LogLiquidate: '0x1b9e65b359b871d74b1af1fc8b13b11635bfb097c4631b091eb762fda7e67dc7',
//   LogTransfer: '0x21281f8d59117d0399dc467dbdd321538ceffe3225e80e2bd4de6f1b3355cbc7',
//   LogWithdraw: '0xbc83c08f0b269b1726990c8348ffdf1ae1696244a14868d766e542a2f18cd7d4',
// }

export default class DolomiteAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.dolomite';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      totalBorrowed: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
      },
    };

    const dolomiteConfig = this.protocolConfig as DolomiteProtocolConfig;
    for (const marketConfig of dolomiteConfig.markets) {
      if (marketConfig.birthday > options.timestamp) {
        // market was not deployed yet
        continue;
      }

      if (!protocolData.breakdown[marketConfig.chain]) {
        protocolData.breakdown[marketConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.timestamp,
      );
      // const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      //   marketConfig.chain,
      //   options.beginTime,
      // );
      // const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      //   marketConfig.chain,
      //   options.endTime,
      // );

      const getNumMarkets = await this.services.blockchain.evm.readContract({
        chain: marketConfig.chain,
        abi: DolomiteMarginAbi,
        target: marketConfig.margin,
        method: 'getNumMarkets',
        params: [],
        blockNumber: blockNumber,
      });

      const getMarketsCalls: Array<ContractCall> = [];
      const getMarketPricesCalls: Array<ContractCall> = [];
      const getMarketsgetInterestRateCalls: Array<ContractCall> = [];

      for (let i = 0; i < Number(getNumMarkets); i++) {
        getMarketsCalls.push({
          abi: DolomiteMarginAbi,
          target: marketConfig.margin,
          method: 'getMarket',
          params: [i],
        });
        getMarketPricesCalls.push({
          abi: DolomiteMarginAbi,
          target: marketConfig.margin,
          method: 'getMarketPrice',
          params: [i],
        });
        getMarketsgetInterestRateCalls.push({
          abi: DolomiteMarginAbi,
          target: marketConfig.margin,
          method: 'getMarketInterestRate',
          params: [i],
        });
      }
      const getMarketResults = await this.services.blockchain.evm.multicall({
        chain: marketConfig.chain,
        blockNumber: blockNumber,
        calls: getMarketsCalls,
      });
      const getMarketPricesResults = await this.services.blockchain.evm.multicall({
        chain: marketConfig.chain,
        blockNumber: blockNumber,
        calls: getMarketPricesCalls,
      });
      const getMarketsgetInterestRateResults = await this.services.blockchain.evm.multicall({
        chain: marketConfig.chain,
        blockNumber: blockNumber,
        calls: getMarketsgetInterestRateCalls,
      });

      for (let i = 0; i < Number(getNumMarkets); i++) {
        const marketResult = getMarketResults[i];
        const marketPrice = getMarketPricesResults[i];
        const marketInterestRate = getMarketsgetInterestRateResults[i];

        if (marketResult) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: marketConfig.chain,
            address: marketResult.token,
          });
          if (token) {
            const tokenPriceUsd = formatBigNumberToNumber(
              marketPrice ? marketPrice.value.toString() : '0',
              18 + 18 - token.decimals,
            );

            const totalSuppliedUsd =
              formatBigNumberToNumber(marketResult.totalPar.supply.toString(), token.decimals) * tokenPriceUsd;
            const totalBorrowedUsd =
              formatBigNumberToNumber(marketResult.totalPar.borrow.toString(), token.decimals) * tokenPriceUsd;

            const borrowRatePerDay =
              formatBigNumberToNumber(marketInterestRate ? marketInterestRate.value.toString() : '0', 18) *
              TimeUnits.SecondsPerDay;
            const totalFeesUsd = totalBorrowedUsd * borrowRatePerDay;

            protocolData.totalAssetDeposited += totalSuppliedUsd;
            protocolData.totalValueLocked += totalSuppliedUsd - totalBorrowedUsd;
            protocolData.totalFees += totalFeesUsd;
            protocolData.supplySideRevenue += totalFeesUsd;
            (protocolData.totalSupplied as number) += totalSuppliedUsd;
            (protocolData.totalBorrowed as number) += totalBorrowedUsd;

            if (totalSuppliedUsd > 0 || totalBorrowedUsd > 0) {
              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  totalSupplied: 0,
                  totalBorrowed: 0,
                  volumes: {
                    deposit: 0,
                    withdraw: 0,
                    borrow: 0,
                    repay: 0,
                    liquidation: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalSuppliedUsd;
              protocolData.breakdown[token.chain][token.address].totalValueLocked += totalSuppliedUsd - totalBorrowedUsd;
              protocolData.breakdown[token.chain][token.address].totalFees += totalFeesUsd;
              protocolData.breakdown[token.chain][token.address].supplySideRevenue += totalFeesUsd;
              (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalSuppliedUsd;
              (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowedUsd;
            }
          }
        }
      }

      // const logs = await this.services.blockchain.evm.getContractLogs({
      //   chain: marketConfig.chain,
      //   address: marketConfig.margin,
      //   fromBlock: beginBlock,
      //   toBlock: endBlock,
      // });

      // const events: Array<any> = logs.filter(
      //   log => Object.values(MarginEvents).includes(log.topics[0])
      // ).map(log => decodeEventLog({
      //   abi: DolomiteMarginAbi,
      //   topics: log.topics,
      //   data: log.data,
      // }))

      // for (const event of events) {
      //   console.log(event);
      // }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
