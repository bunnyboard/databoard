import { MorphoBlueConfig, MorphoProtocolConfig } from '../../../configs/protocols/morpho';
import logger from '../../../lib/logger';
import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import MorphoIndexerAdapter from './indexer';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import MorphoOracleAbi from '../../../configs/abi/morpho/MorphoOracle.json';
import AdapterCurveIrmAbi from '../../../configs/abi/morpho/AdapterCurveIrm.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import envConfig from '../../../configs/envConfig';
import { decodeEventLog } from 'viem';
import MorphoOptimizerAdapter from './optimizer';
import AdapterDataHelper from '../helpers';

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

export interface MorphoBlueMarketMetadata {
  chain: string;
  morphoBlue: string;
  marketId: string;
  debtToken: Token;
  collateralToken: Token;
}

interface GetMarketDataOptions {
  morphoBlueConfig: MorphoBlueConfig;
  marketId: string;
  timestamp: number;
  blockNumber: number;
  beginBlock: number;
  endBlock: number;
}

interface MarketBasicData {
  marketMetadata: MorphoBlueMarketMetadata;

  debtTokenPriceUsd: number;
  collateralTokenPriceUsd: number;

  totalSuppliedUsd: number;
  totalBorrowedUsd: number;
  totalFees: number;
  supplySideRevenue: number;
  protocolRevenue: number;
}

export default class MorphoAdapter extends MorphoIndexerAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getMarketData(options: GetMarketDataOptions): Promise<MarketBasicData | null> {
    const marketInfo = await this.services.blockchain.evm.readContract({
      chain: options.morphoBlueConfig.chain,
      abi: MorphoBlueAbi,
      target: options.morphoBlueConfig.morphoBlue,
      method: 'idToMarketParams',
      params: [options.marketId],
      blockNumber: options.blockNumber,
    });

    // market not found, return null
    if (!marketInfo) {
      return null;
    }

    const [loanTokenAddress, collateralTokenAddress, oracle, irm, ltv] = marketInfo;

    const debtToken = await this.services.blockchain.evm.getTokenInfo({
      chain: options.morphoBlueConfig.chain,
      address: loanTokenAddress,
    });
    const collateralToken = await this.services.blockchain.evm.getTokenInfo({
      chain: options.morphoBlueConfig.chain,
      address: collateralTokenAddress,
    });

    // can not get debt/collateral token info, return null
    if (!debtToken || !collateralToken) {
      return null;
    }

    const debtTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: debtToken.chain,
      address: debtToken.address,
      timestamp: options.timestamp,
    });

    if (debtTokenPriceUsd > 0) {
      const [totalSupplyAssets, totalSupplyShares, totalBorrowAssets, totalBorrowShares, lastUpdate, fee] =
        await this.services.blockchain.evm.readContract({
          chain: options.morphoBlueConfig.chain,
          abi: MorphoBlueAbi,
          target: options.morphoBlueConfig.morphoBlue,
          method: 'market',
          params: [options.marketId],
          blockNumber: options.blockNumber,
        });

      const [borrowRateView, collateralPrice] = await this.services.blockchain.evm.multicall({
        chain: options.morphoBlueConfig.chain,
        calls: [
          {
            abi: AdapterCurveIrmAbi,
            target: irm,
            method: 'borrowRateView',
            params: [
              [
                loanTokenAddress, // loanToken
                collateralTokenAddress, // collateralToken
                oracle, // oracle
                irm, // irm
                ltv, // ltv
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
            target: oracle,
            method: 'price',
            params: [],
          },
        ],
        blockNumber: options.blockNumber,
      });

      // https://docs.morpho.org/morpho-blue/contracts/oracles/#price
      const collateralPriceUsd = collateralPrice
        ? formatBigNumberToNumber(collateralPrice.toString(), 36 + debtToken.decimals - collateralToken.decimals) *
          debtTokenPriceUsd
        : 0;

      // https://docs.morpho.org/morpho/contracts/irm/#calculations
      // borrowRatePerSecond from Morpho Irm
      const borrowRate =
        formatBigNumberToNumber(borrowRateView ? borrowRateView.toString() : '0', 18) * TimeUnits.SecondsPerYear;
      const feeRate = formatBigNumberToNumber(fee.toString(), 18);

      const totalDeposited =
        formatBigNumberToNumber(totalSupplyAssets.toString(), debtToken.decimals) * debtTokenPriceUsd;
      const totalBorrowed =
        formatBigNumberToNumber(totalBorrowAssets.toString(), debtToken.decimals) * debtTokenPriceUsd;

      // 24h borrow fees
      const borrowFees = (totalBorrowed * borrowRate) / TimeUnits.DaysPerYear;
      const protocolRevenue = borrowFees * feeRate;
      const supplySideRevenue = borrowFees - protocolRevenue;

      return {
        marketMetadata: {
          chain: options.morphoBlueConfig.chain,
          morphoBlue: options.morphoBlueConfig.morphoBlue,
          marketId: options.marketId,
          debtToken: debtToken,
          collateralToken: collateralToken,
        },
        debtTokenPriceUsd: debtTokenPriceUsd,
        collateralTokenPriceUsd: collateralPriceUsd,
        totalSuppliedUsd: totalDeposited,
        totalBorrowedUsd: totalBorrowed,
        totalFees: borrowFees,
        supplySideRevenue: supplySideRevenue,
        protocolRevenue: protocolRevenue,
      };
    }

    return null;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const morphoConfig = this.protocolConfig as MorphoProtocolConfig;

    const optimizerAdapter = new MorphoOptimizerAdapter(this.services, this.storages, this.protocolConfig);
    let protocolData: ProtocolData | null = await optimizerAdapter.getProtocolData(options);
    if (!protocolData) {
      protocolData = {
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
          flashloan: 0,
        },
      };
    }

    for (const morphoBlue of morphoConfig.morphoBlues) {
      if (morphoBlue.birthday > options.timestamp) {
        continue;
      }

      await this.indexHistoricalLogs(morphoBlue);

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

      if (!protocolData.breakdown[morphoBlue.chain]) {
        protocolData.breakdown[morphoBlue.chain] = {};
      }

      logger.debug('getting morpho markets data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: morphoBlue.chain,
        morphoBlue: morphoBlue.morphoBlue,
        markets: morphoBlue.whitelistedMarketIds.length,
      });

      const marketsData: Array<MarketBasicData> = [];
      for (const marketId of morphoBlue.whitelistedMarketIds) {
        const marketLendingData = await this.getMarketData({
          morphoBlueConfig: morphoBlue,
          marketId: marketId,
          timestamp: options.timestamp,
          blockNumber: blockNumber,
          beginBlock: beginBlock,
          endBlock: endBlock,
        });

        if (marketLendingData) {
          marketsData.push(marketLendingData);

          if (
            !protocolData.breakdown[marketLendingData.marketMetadata.chain][
              marketLendingData.marketMetadata.debtToken.address
            ]
          ) {
            protocolData.breakdown[marketLendingData.marketMetadata.chain][
              marketLendingData.marketMetadata.debtToken.address
            ] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              totalBorrowed: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                borrow: 0,
                repay: 0,
                liquidation: 0,
                flashloan: 0,
              },
            };
          }
          if (
            !protocolData.breakdown[marketLendingData.marketMetadata.chain][
              marketLendingData.marketMetadata.collateralToken.address
            ]
          ) {
            protocolData.breakdown[marketLendingData.marketMetadata.chain][
              marketLendingData.marketMetadata.collateralToken.address
            ] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              totalBorrowed: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                borrow: 0,
                repay: 0,
                liquidation: 0,
                flashloan: 0,
              },
            };
          }

          if (marketLendingData.totalSuppliedUsd > 10000000000) {
            console.log(marketLendingData);
            process.exit(1);
          }

          protocolData.totalAssetDeposited += marketLendingData.totalSuppliedUsd;
          protocolData.totalValueLocked += marketLendingData.totalSuppliedUsd - marketLendingData.totalBorrowedUsd;
          (protocolData.totalSupplied as number) += marketLendingData.totalSuppliedUsd;
          (protocolData.totalBorrowed as number) += marketLendingData.totalBorrowedUsd;
          protocolData.totalFees += marketLendingData.totalFees;
          protocolData.supplySideRevenue += marketLendingData.supplySideRevenue;
          protocolData.protocolRevenue += marketLendingData.protocolRevenue;

          protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].totalAssetDeposited = marketLendingData.totalSuppliedUsd;
          protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].totalValueLocked = marketLendingData.totalSuppliedUsd - marketLendingData.totalBorrowedUsd;
          (protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].totalSupplied as number) = marketLendingData.totalSuppliedUsd;
          (protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].totalBorrowed as number) = marketLendingData.totalBorrowedUsd;
          protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].totalFees = marketLendingData.totalFees;
          protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].supplySideRevenue = marketLendingData.supplySideRevenue;
          protocolData.breakdown[marketLendingData.marketMetadata.chain][
            marketLendingData.marketMetadata.debtToken.address
          ].protocolRevenue = marketLendingData.protocolRevenue;
        }
      }

      // process historical logs to cal total collateral deposited
      const historicalLogs = await this.storages.database.query({
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
      logger.debug('processing morpho historical contract logs', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: morphoBlue.chain,
        morphoBlue: morphoBlue.morphoBlue,
        logs: historicalLogs.length,
      });

      let totalCollateralUsd = 0;
      for (const log of historicalLogs) {
        const signature = log.topics[0];

        if (
          signature === MorphoBlueEvents.SupplyCollateral ||
          signature === MorphoBlueEvents.WithdrawCollateral ||
          signature === MorphoBlueEvents.Liquidate
        ) {
          const event: any = decodeEventLog({
            abi: MorphoBlueAbi,
            topics: log.topics,
            data: log.data,
          });

          const marketData = marketsData.filter((item) => item.marketMetadata.marketId === event.args.id)[0];
          if (marketData) {
            if (event.args.id === marketData.marketMetadata.marketId) {
              if (
                signature === MorphoBlueEvents.SupplyCollateral ||
                signature === MorphoBlueEvents.WithdrawCollateral
              ) {
                const collateralAmountUsd =
                  formatBigNumberToNumber(
                    event.args.assets.toString(),
                    marketData.marketMetadata.collateralToken.decimals,
                  ) * marketData.collateralTokenPriceUsd;

                if (signature === MorphoBlueEvents.SupplyCollateral) {
                  totalCollateralUsd += collateralAmountUsd;
                  protocolData.breakdown[marketData.marketMetadata.chain][
                    marketData.marketMetadata.collateralToken.address
                  ].totalAssetDeposited += collateralAmountUsd;
                  protocolData.breakdown[marketData.marketMetadata.chain][
                    marketData.marketMetadata.collateralToken.address
                  ].totalValueLocked += collateralAmountUsd;
                } else {
                  totalCollateralUsd -= collateralAmountUsd;
                  protocolData.breakdown[marketData.marketMetadata.chain][
                    marketData.marketMetadata.collateralToken.address
                  ].totalAssetDeposited -= collateralAmountUsd;
                  protocolData.breakdown[marketData.marketMetadata.chain][
                    marketData.marketMetadata.collateralToken.address
                  ].totalValueLocked -= collateralAmountUsd;
                }
              } else if (signature === MorphoBlueEvents.Liquidate) {
                const collateralAmountUsd =
                  formatBigNumberToNumber(
                    event.args.seizedAssets.toString(),
                    marketData.marketMetadata.collateralToken.decimals,
                  ) * marketData.collateralTokenPriceUsd;

                totalCollateralUsd -= collateralAmountUsd;
                protocolData.breakdown[marketData.marketMetadata.chain][
                  marketData.marketMetadata.collateralToken.address
                ].totalAssetDeposited -= collateralAmountUsd;
                protocolData.breakdown[marketData.marketMetadata.chain][
                  marketData.marketMetadata.collateralToken.address
                ].totalValueLocked -= collateralAmountUsd;
              }
            }
          }
        }
      }

      // process activity logs
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: morphoBlue.chain,
        address: morphoBlue.morphoBlue,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      logger.debug('processing morpho new contract logs', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: morphoBlue.chain,
        morphoBlue: morphoBlue.morphoBlue,
        logs: logs.length,
      });

      for (const log of logs) {
        const signature = log.topics[0];
        const event: any = decodeEventLog({
          abi: MorphoBlueAbi,
          topics: log.topics,
          data: log.data,
        });

        const marketData = marketsData.filter((item) => item.marketMetadata.marketId === event.args.id)[0];
        if (marketData) {
          switch (signature) {
            case MorphoBlueEvents.Supply: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), marketData.marketMetadata.debtToken.decimals) *
                marketData.debtTokenPriceUsd;

              (protocolData.volumes.deposit as number) += amountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][marketData.marketMetadata.debtToken.address]
                .volumes.deposit as number) += amountUsd;

              break;
            }
            case MorphoBlueEvents.Withdraw: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), marketData.marketMetadata.debtToken.decimals) *
                marketData.debtTokenPriceUsd;

              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][marketData.marketMetadata.debtToken.address]
                .volumes.withdraw as number) += amountUsd;

              break;
            }
            case MorphoBlueEvents.Borrow: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), marketData.marketMetadata.debtToken.decimals) *
                marketData.debtTokenPriceUsd;

              (protocolData.volumes.borrow as number) += amountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][marketData.marketMetadata.debtToken.address]
                .volumes.borrow as number) += amountUsd;

              break;
            }
            case MorphoBlueEvents.Repay: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), marketData.marketMetadata.debtToken.decimals) *
                marketData.debtTokenPriceUsd;

              (protocolData.volumes.repay as number) += amountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][marketData.marketMetadata.debtToken.address]
                .volumes.repay as number) += amountUsd;

              break;
              break;
            }
            case MorphoBlueEvents.SupplyCollateral: {
              const amountUsd =
                formatBigNumberToNumber(
                  event.args.assets.toString(),
                  marketData.marketMetadata.collateralToken.decimals,
                ) * marketData.collateralTokenPriceUsd;

              (protocolData.volumes.deposit as number) += amountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][
                marketData.marketMetadata.collateralToken.address
              ].volumes.deposit as number) += amountUsd;

              break;
            }
            case MorphoBlueEvents.WithdrawCollateral: {
              const amountUsd =
                formatBigNumberToNumber(
                  event.args.assets.toString(),
                  marketData.marketMetadata.collateralToken.decimals,
                ) * marketData.collateralTokenPriceUsd;

              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][
                marketData.marketMetadata.collateralToken.address
              ].volumes.withdraw as number) += amountUsd;

              break;
            }
            case MorphoBlueEvents.Liquidate: {
              const repayAmountUsd =
                formatBigNumberToNumber(
                  event.args.repaidAssets.toString(),
                  marketData.marketMetadata.debtToken.decimals,
                ) * marketData.debtTokenPriceUsd;
              const liquidateAmountUsd =
                formatBigNumberToNumber(
                  event.args.seizedAssets.toString(),
                  marketData.marketMetadata.collateralToken.decimals,
                ) * marketData.collateralTokenPriceUsd;

              (protocolData.volumes.repay as number) += repayAmountUsd;
              (protocolData.volumes.liquidation as number) += liquidateAmountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][marketData.marketMetadata.debtToken.address]
                .volumes.repay as number) += repayAmountUsd;
              (protocolData.breakdown[marketData.marketMetadata.chain][
                marketData.marketMetadata.collateralToken.address
              ].volumes.liquidation as number) += liquidateAmountUsd;

              break;
            }
          }
        }
      }

      protocolData.totalAssetDeposited += totalCollateralUsd;
      protocolData.totalValueLocked += totalCollateralUsd;
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const optimizerAdapter = new MorphoOptimizerAdapter(this.services, this.storages, this.protocolConfig);

    console.log(
      await optimizerAdapter.getProtocolData({
        timestamp: 1672617600,
        beginTime: 1672531200,
        endTime: 1672617600,
      }),
    );

    // const morphoBlueConfig = this.protocolConfig as MorphoProtocolConfig;

    // const pools: { [key: string]: MorphoBlueMarketMetadata } = {
    //   ethereum: {
    //     chain: 'ethereum',
    //     morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
    //     marketId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
    //     debtToken: {
    //       chain: 'ethereum',
    //       symbol: 'WETH',
    //       decimals: 18,
    //       address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    //     },
    //     collateralToken: {
    //       chain: 'ethereum',
    //       symbol: 'WSTETH',
    //       decimals: 18,
    //       address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    //     },
    //     oracle: '0x2a01eb9496094da03c4e364def50f5ad1280ad72',
    //     irm: '0x870ac11d48b15db9a138cf899d20f13f79ba00bc',
    //     ltv: '945000000000000000',
    //     birthblock: 18919623,
    //     birthday: 1704240000,
    //   },
    // };

    // const timestamp = options.timestamp ? options.timestamp : getTimestamp();
    // for (const morphoBlue of morphoBlueConfig.morphoBlues) {
    //   if (pools[morphoBlue.chain]) {
    //     const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
    //       morphoBlue.chain,
    //       timestamp - TimeUnits.SecondsPerDay,
    //     );
    //     const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(morphoBlue.chain, timestamp);

    //     const marketData = await this.getMarketData({
    //       morphoBlueConfig: morphoBlue,
    //       marketMetadata: pools[morphoBlue.chain],
    //       timestamp: timestamp,
    //       blockNumber: endBlock,
    //       beginBlock: beginBlock,
    //       endBlock: endBlock,
    //     });

    //     if (marketData) {
    //       if (options.output === 'json') {
    //         console.log(JSON.stringify(marketData));
    //       } else {
    //         console.log(marketData);
    //       }
    //     }
    //   }
    // }
  }
}
