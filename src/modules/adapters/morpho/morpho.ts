import { MorphoBlueConfig, MorphoProtocolConfig } from '../../../configs/protocols/morpho';
import logger from '../../../lib/logger';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import MorphoIndexerAdapter, { MorphoBlueMarketMetadata } from './indexer';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import MorphoOracleAbi from '../../../configs/abi/morpho/MorphoOracle.json';
import AdapterCurveIrmAbi from '../../../configs/abi/morpho/AdapterCurveIrm.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import BigNumber from 'bignumber.js';
import { TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import { ChainNames } from '../../../configs/names';
import envConfig from '../../../configs/envConfig';

export const MorphoBlueEvents = {
  // MorphoBlue contract
  Supply: '0xedf8870433c83823eb071d3df1caa8d008f12f6440918c20d75a3602cda30fe0',
  Withdraw: '0xa56fc0ad5702ec05ce63666221f796fb62437c32db1aa1aa075fc6484cf58fbf',
  Borrow: '0x570954540bed6b1304a87dfe815a5eda4a648f7097a16240dcd85c9b5fd42a43',
  Repay: '0x52acb05cebbd3cd39715469f22afbf5a17496295ef3bc9bb5944056c63ccaa09',
  SupplyCollateral: '0xa3b9472a1399e17e123f3c2e6586c23e504184d504de59cdaa2b375e880c6184',
  WithdrawCollateral: '0xe80ebd7cc9223d7382aab2e0d1d6155c65651f83d53c8b9b06901d167e321142',
  Liquidate: '0xa4946ede45d0c6f06a0f5ce92c9ad3b4751452d2fe0e25010783bcab57a67e41',
};

interface GetMarketDataOptions {
  morphoBlueConfig: MorphoBlueConfig;
  marketMetadata: MorphoBlueMarketMetadata;

  timestamp: number;
  blockNumber: number;
  beginBlock: number;
  endBlock: number;

  morphoBlueLogs: Array<any>;
  morphoBlueDatabaseLogs: Array<any>;
}

export default class MorphoAdapter extends MorphoIndexerAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getMarketData(options: GetMarketDataOptions): Promise<ProtocolData> {
    logger.debug('getting morpho market data', {
      service: this.name,
      chain: options.morphoBlueConfig.chain,
      poolId: options.marketMetadata.marketId,
      tokens: `${options.marketMetadata.debtToken.symbol}-${options.marketMetadata.collateralToken.symbol}`,
      time: options.timestamp,
      blockNumber: options.blockNumber,
    });

    const marketLendingData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
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

    marketLendingData.breakdown[options.marketMetadata.chain] = {};
    marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address] = {
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
    marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.collateralToken.address] = {
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

    const getTokenPriceResult = await this.services.oracle.getTokenPriceUsd({
      chain: options.marketMetadata.debtToken.chain,
      address: options.marketMetadata.debtToken.address,
      timestamp: options.timestamp,
    });
    const debtTokenPrice = getTokenPriceResult ? Number(getTokenPriceResult) : 0;

    if (debtTokenPrice) {
      const [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee] =
        await this.services.blockchain.evm.readContract({
          chain: options.morphoBlueConfig.chain,
          abi: MorphoBlueAbi,
          target: options.morphoBlueConfig.morphoBlue,
          method: 'market',
          params: [options.marketMetadata.marketId],
          blockNumber: options.blockNumber,
        });

      const [borrowRateView, collateralPrice] = await this.services.blockchain.evm.multicall({
        chain: options.morphoBlueConfig.chain,
        calls: [
          {
            abi: AdapterCurveIrmAbi,
            target: options.marketMetadata.irm,
            method: 'borrowRateView',
            params: [
              [
                options.marketMetadata.debtToken.address, // loanToken
                options.marketMetadata.collateralToken.address, // collateralToken
                options.marketMetadata.oracle, // oracle
                options.marketMetadata.irm, // irm
                options.marketMetadata.ltv, // ltv
              ],
              [
                totalSupplyAssets.toString(),
                totalSupplyShares.toString(),
                totalBorrowAssets.toString(),
                totalBorrowShares.toString(),
                lastUpdate.toString(),
                fee.toString(),
              ],
            ],
          },
          {
            abi: MorphoOracleAbi,
            target: options.marketMetadata.oracle,
            method: 'price',
            params: [],
          },
        ],
        blockNumber: options.blockNumber,
      });

      // https://docs.morpho.org/morpho-blue/contracts/oracles/#price
      const collateralPriceUsd = collateralPrice
        ? formatBigNumberToNumber(
            collateralPrice.toString(),
            36 + options.marketMetadata.debtToken.decimals - options.marketMetadata.collateralToken.decimals,
          ) * debtTokenPrice
        : 0;

      // https://docs.morpho.org/morpho/contracts/irm/#calculations
      // borrowRatePerSecond from Morpho Irm
      const borrowRate = new BigNumber(borrowRateView ? borrowRateView.toString() : '0').dividedBy(1e18);
      const feeRate = formatBigNumberToNumber(fee.toString(), 18);
      // compound per day
      const borrowAPY = new BigNumber(1)
        .plus(borrowRate.multipliedBy(TimeUnits.SecondsPerYear).dividedBy(TimeUnits.DaysPerYear))
        .pow(TimeUnits.DaysPerYear)
        .minus(1)
        .toNumber();

      const totalDeposited =
        formatBigNumberToNumber(totalSupplyAssets.toString(), options.marketMetadata.debtToken.decimals) *
        debtTokenPrice;
      const totalBorrowed =
        formatBigNumberToNumber(totalBorrowAssets.toString(), options.marketMetadata.debtToken.decimals) *
        debtTokenPrice;

      // 24h borrow fees
      const borrowFees = (totalBorrowed * borrowAPY) / TimeUnits.DaysPerYear;
      const protocolRevenue = borrowFees * feeRate;
      const supplySideRevenue = borrowFees - protocolRevenue;

      marketLendingData.breakdown[options.marketMetadata.chain][
        options.marketMetadata.debtToken.address
      ].totalAssetDeposited += totalDeposited;
      marketLendingData.breakdown[options.marketMetadata.chain][
        options.marketMetadata.debtToken.address
      ].totalValueLocked += totalDeposited - totalBorrowed;
      (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
        .totalSupplied as number) += totalDeposited;
      (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
        .totalBorrowed as number) += totalBorrowed;
      marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address].totalFees +=
        borrowFees;
      marketLendingData.breakdown[options.marketMetadata.chain][
        options.marketMetadata.debtToken.address
      ].supplySideRevenue += supplySideRevenue;
      marketLendingData.breakdown[options.marketMetadata.chain][
        options.marketMetadata.debtToken.address
      ].protocolRevenue += protocolRevenue;

      // process historical logs to cal total collateral deposited
      for (const log of options.morphoBlueDatabaseLogs) {
        const signature = log.topics[0];

        const event: any = decodeEventLog({
          abi: MorphoBlueAbi,
          topics: log.topics,
          data: log.data,
        });

        if (event.args.id === options.marketMetadata.marketId) {
          if (signature === MorphoBlueEvents.SupplyCollateral || signature === MorphoBlueEvents.WithdrawCollateral) {
            const collateralAmountUsd =
              formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.collateralToken.decimals) *
              collateralPriceUsd;
            if (signature === MorphoBlueEvents.SupplyCollateral) {
              marketLendingData.totalAssetDeposited += collateralAmountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.collateralToken.address
              ].totalAssetDeposited += collateralAmountUsd;
            } else {
              marketLendingData.totalAssetDeposited -= collateralAmountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.collateralToken.address
              ].totalAssetDeposited -= collateralAmountUsd;
            }
          } else if (signature === MorphoBlueEvents.Liquidate) {
            const collateralAmountUsd =
              formatBigNumberToNumber(
                event.args.seizedAssets.toString(),
                options.marketMetadata.collateralToken.decimals,
              ) * collateralPriceUsd;
            marketLendingData.totalAssetDeposited -= collateralAmountUsd;
            marketLendingData.breakdown[options.marketMetadata.chain][
              options.marketMetadata.collateralToken.address
            ].totalAssetDeposited -= collateralAmountUsd;
          }
        }
      }

      // process new event logs for volumes
      for (const log of options.morphoBlueLogs) {
        const signature = log.topics[0];
        const event: any = decodeEventLog({
          abi: MorphoBlueAbi,
          topics: log.topics,
          data: log.data,
        });

        if (event.args.id === options.marketMetadata.marketId) {
          switch (signature) {
            case MorphoBlueEvents.Supply: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.deposit as number) += amountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
                .volumes.deposit as number) += amountUsd;
              marketLendingData.moneyFlowIn += amountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.debtToken.address
              ].moneyFlowIn += amountUsd;
              break;
            }
            case MorphoBlueEvents.Withdraw: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.withdraw as number) += amountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
                .volumes.withdraw as number) += amountUsd;
              marketLendingData.moneyFlowOut += amountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.debtToken.address
              ].moneyFlowOut += amountUsd;
              break;
            }
            case MorphoBlueEvents.Borrow: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.borrow as number) += amountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
                .volumes.borrow as number) += amountUsd;
              marketLendingData.moneyFlowOut += amountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.debtToken.address
              ].moneyFlowOut += amountUsd;
              break;
            }
            case MorphoBlueEvents.Repay: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.repay as number) += amountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
                .volumes.repay as number) += amountUsd;
              marketLendingData.moneyFlowIn += amountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.debtToken.address
              ].moneyFlowIn += amountUsd;
              break;
            }
            case MorphoBlueEvents.SupplyCollateral: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.collateralToken.decimals) *
                collateralPriceUsd;
              (marketLendingData.volumes.deposit as number) += amountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.collateralToken.address]
                .volumes.deposit as number) += amountUsd;
              marketLendingData.moneyFlowIn += amountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.collateralToken.address
              ].moneyFlowIn += amountUsd;
              break;
            }
            case MorphoBlueEvents.WithdrawCollateral: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.marketMetadata.collateralToken.decimals) *
                collateralPriceUsd;
              (marketLendingData.volumes.withdraw as number) += amountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.collateralToken.address]
                .volumes.withdraw as number) += amountUsd;
              marketLendingData.moneyFlowOut += amountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.collateralToken.address
              ].moneyFlowOut += amountUsd;
              break;
            }
            case MorphoBlueEvents.Liquidate: {
              const repayAmountUsd =
                formatBigNumberToNumber(event.args.repaidAssets.toString(), options.marketMetadata.debtToken.decimals) *
                debtTokenPrice;
              const liquidateAmountUsd =
                formatBigNumberToNumber(
                  event.args.seizedAssets.toString(),
                  options.marketMetadata.collateralToken.decimals,
                ) * collateralPriceUsd;

              (marketLendingData.volumes.repay as number) += repayAmountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.debtToken.address]
                .volumes.repay as number) += repayAmountUsd;
              marketLendingData.moneyFlowIn += repayAmountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.debtToken.address
              ].moneyFlowIn += repayAmountUsd;

              (marketLendingData.volumes.liquidation as number) += repayAmountUsd;
              (marketLendingData.breakdown[options.marketMetadata.chain][options.marketMetadata.collateralToken.address]
                .volumes.liquidation as number) += liquidateAmountUsd;
              marketLendingData.moneyFlowOut += liquidateAmountUsd;
              marketLendingData.breakdown[options.marketMetadata.chain][
                options.marketMetadata.collateralToken.address
              ].moneyFlowOut += liquidateAmountUsd;

              break;
            }
          }
        }
      }

      marketLendingData.totalAssetDeposited += totalDeposited;
      marketLendingData.totalFees += borrowFees;
      marketLendingData.supplySideRevenue += supplySideRevenue;
      marketLendingData.protocolRevenue += protocolRevenue;
      (marketLendingData.totalSupplied as number) += totalDeposited;
      (marketLendingData.totalBorrowed as number) += totalBorrowed;
      marketLendingData.totalValueLocked += totalDeposited - totalBorrowed;
    }

    return marketLendingData;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const morphoBlueConfig = this.protocolConfig as MorphoProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
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

    for (const morphoBlue of morphoBlueConfig.morphoBlues) {
      await this.indexMarketsFromContractLogs(morphoBlue);

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        morphoBlue.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        morphoBlue.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        morphoBlue.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: morphoBlue.chain,
        address: morphoBlue.morphoBlue,
        fromBlock: beginBlock,
        toBlock: endBlock,
        blockRange: morphoBlue.chain === ChainNames.ethereum ? 200 : undefined,
      });
      const databaseLogs = await this.storages.database.query({
        collection: envConfig.mongodb.collections.contractLogs.name,
        query: {
          chain: morphoBlue.chain,
          address: normalizeAddress(morphoBlue.morphoBlue),
          blockNumber: {
            $gte: 0,
            $lte: endBlock,
          },
        },
      });

      const markets = await this.getMarkets(morphoBlue);

      for (const marketMetadata of markets) {
        if (
          !morphoBlue.blacklistPoolIds[marketMetadata.marketId] &&
          marketMetadata.birthday <= options.timestamp &&
          marketMetadata.birthblock <= blockNumber
        ) {
          const marketLendingData = await this.getMarketData({
            morphoBlueConfig: morphoBlue,
            marketMetadata: marketMetadata,
            timestamp: options.timestamp,
            blockNumber: blockNumber,
            beginBlock: beginBlock,
            endBlock: endBlock,
            morphoBlueLogs: logs,
            morphoBlueDatabaseLogs: databaseLogs,
          });

          if (marketLendingData) {
            protocolData.totalAssetDeposited += marketLendingData.totalAssetDeposited;
            (protocolData.totalSupplied as number) += marketLendingData.totalSupplied as number;
            (protocolData.totalBorrowed as number) += marketLendingData.totalBorrowed as number;
            protocolData.totalValueLocked += marketLendingData.totalValueLocked;
            protocolData.totalFees += marketLendingData.totalFees;
            protocolData.supplySideRevenue += marketLendingData.supplySideRevenue;
            protocolData.protocolRevenue += marketLendingData.protocolRevenue;
            protocolData.moneyFlowIn += marketLendingData.moneyFlowIn;
            protocolData.moneyFlowOut += marketLendingData.moneyFlowOut;
            (protocolData.volumes.deposit as number) += marketLendingData.volumes.deposit as number;
            (protocolData.volumes.withdraw as number) += marketLendingData.volumes.withdraw as number;
            (protocolData.volumes.borrow as number) += marketLendingData.volumes.borrow as number;
            (protocolData.volumes.repay as number) += marketLendingData.volumes.repay as number;
            (protocolData.volumes.liquidation as number) += marketLendingData.volumes.liquidation as number;

            for (const [chain, tokens] of Object.entries(marketLendingData.breakdown)) {
              if (!protocolData.breakdown[chain]) {
                protocolData.breakdown[chain] = tokens;
              } else {
                for (const [address, metrics] of Object.entries(tokens)) {
                  if (!protocolData.breakdown[chain][address]) {
                    protocolData.breakdown[chain][address] = metrics;
                  } else {
                    protocolData.breakdown[chain][address].totalAssetDeposited += metrics.totalAssetDeposited;
                    (protocolData.breakdown[chain][address].totalSupplied as number) += metrics.totalSupplied as number;
                    (protocolData.breakdown[chain][address].totalBorrowed as number) += metrics.totalBorrowed as number;
                    protocolData.breakdown[chain][address].totalValueLocked += metrics.totalValueLocked;
                    protocolData.breakdown[chain][address].totalFees += metrics.totalFees;
                    protocolData.breakdown[chain][address].supplySideRevenue += metrics.supplySideRevenue;
                    protocolData.breakdown[chain][address].protocolRevenue += metrics.protocolRevenue;
                    protocolData.breakdown[chain][address].moneyFlowIn += metrics.moneyFlowIn;
                    protocolData.breakdown[chain][address].moneyFlowOut += metrics.moneyFlowOut;
                    (protocolData.breakdown[chain][address].volumes.deposit as number) += metrics.volumes
                      .deposit as number;
                    (protocolData.breakdown[chain][address].volumes.withdraw as number) += metrics.volumes
                      .withdraw as number;
                    (protocolData.breakdown[chain][address].volumes.borrow as number) += metrics.volumes
                      .borrow as number;
                    (protocolData.breakdown[chain][address].volumes.repay as number) += metrics.volumes.repay as number;
                    (protocolData.breakdown[chain][address].volumes.liquidation as number) += metrics.volumes
                      .liquidation as number;
                  }
                }
              }
            }
          }
        }
      }
    }

    for (const value of Object.values(protocolData.volumes)) {
      protocolData.totalVolume += value;
      protocolData.moneyFlowNet = protocolData.moneyFlowIn - protocolData.moneyFlowOut;
    }
    for (const [chain, tokens] of Object.entries(protocolData.breakdown)) {
      for (const [address, token] of Object.entries(tokens)) {
        for (const value of Object.values(token.volumes)) {
          protocolData.breakdown[chain][address].totalVolume += value;
          protocolData.breakdown[chain][address].moneyFlowNet =
            protocolData.breakdown[chain][address].moneyFlowIn - protocolData.breakdown[chain][address].moneyFlowOut;
        }
      }
    }

    return protocolData;
  }

  // public async runTest(options: TestAdapterOptions): Promise<void> {
  //   const morphoBlueConfig = this.protocolConfig as MorphoProtocolConfig;

  //   const pools: { [key: string]: MorphoBlueMarketMetadata } = {
  //     ethereum: {
  //       chain: 'ethereum',
  //       morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
  //       poolId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
  //       debtToken: {
  //         chain: 'ethereum',
  //         symbol: 'WETH',
  //         decimals: 18,
  //         address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  //       },
  //       collateralToken: {
  //         chain: 'ethereum',
  //         symbol: 'WSTETH',
  //         decimals: 18,
  //         address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
  //       },
  //       oracle: '0x2a01eb9496094da03c4e364def50f5ad1280ad72',
  //       irm: '0x870ac11d48b15db9a138cf899d20f13f79ba00bc',
  //       ltv: '945000000000000000',
  //       birthblock: 18919623,
  //       birthday: 1704240000,
  //     },
  //   };

  //   const timestamp = options.timestamp ? options.timestamp : getTimestamp();
  //   for (const morphoBlue of morphoBlueConfig.morphoBlues) {
  //     if (pools[morphoBlue.chain]) {
  //       const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
  //         morphoBlue.chain,
  //         timestamp - TimeUnits.SecondsPerDay,
  //       );
  //       const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(morphoBlue.chain, timestamp);

  //       const logs = await this.services.blockchain.evm.getContractLogs({
  //         chain: morphoBlue.chain,
  //         address: morphoBlue.morphoBlue,
  //         fromBlock: beginBlock,
  //         toBlock: endBlock,
  //         blockRange: morphoBlue.chain === ChainNames.ethereum ? 200 : undefined,
  //       });

  //       const marketData = await this.getMarketData({
  //         morphoBlueConfig: morphoBlue,
  //         marketMetadata: pools[morphoBlue.chain],
  //         timestamp: timestamp,
  //         blockNumber: endBlock,
  //         beginBlock: beginBlock,
  //         endBlock: endBlock,
  //         morphoBlueLogs: logs,
  //         morphoBlueDatabaseLogs: [],
  //       });

  //       if (marketData) {
  //         if (options.output === 'json') {
  //           console.log(JSON.stringify(marketData));
  //         } else {
  //           console.log(marketData);
  //         }
  //       }
  //     }
  //   }
  // }
}
