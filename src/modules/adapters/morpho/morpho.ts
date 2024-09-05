import { ProtocolConfig, Token } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import MorphoBlueAbi from '../../../configs/abi/morpho/MorphoBlue.json';
import AdapterCurveIrmAbi from '../../../configs/abi/morpho/AdapterCurveIrm.json';
import MorphoOracleAbi from '../../../configs/abi/morpho/MorphoOracle.json';
import { MorphoBlueConfig, MorphoProtocolConfig } from '../../../configs/protocols/morpho';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber, getTimestamp, normalizeAddress } from '../../../lib/utils';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import envConfig from '../../../configs/envConfig';
import logger from '../../../lib/logger';
import { MorphoBlueEvents } from './abis';
import BigNumber from 'bignumber.js';
import { TimeUnits } from '../../../configs/constants';
import { ChainNames } from '../../../configs/names';

interface MorphoBlueMarketMetadata {
  chain: string;
  morphoBlue: string;
  poolId: string;
  debtToken: Token;
  collateralToken: Token;
  oracle: string;
  irm: string;
  ltv: string;
  birthday: number;
  birthblock: number;
}

interface GetMarketInfoOptions {
  morphoBlueConfig: MorphoBlueConfig;

  // contract event log
  log: any;
}

interface GetMarketDataOptions {
  morphoBlueConfig: MorphoBlueConfig;
  poolMetadata: MorphoBlueMarketMetadata;

  timestamp: number;
  blockNumber: number;
  beginBlock: number;
  endBlock: number;

  morphoBlueLogs: Array<any>;
  morphoBlueDatabaseLogs: Array<any>;
}

export default class MorphoAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getMarketInfoFromLog(options: GetMarketInfoOptions): Promise<MorphoBlueMarketMetadata | null> {
    const event: any = decodeEventLog({
      abi: MorphoBlueAbi,
      topics: options.log.topics,
      data: options.log.data,
    });

    const block = await this.services.blockchain.evm.getBlock(
      options.morphoBlueConfig.chain,
      Number(options.log.blockNumber),
    );
    const marketId = event.args.id;
    const debtToken = await this.services.blockchain.evm.getTokenInfo({
      chain: options.morphoBlueConfig.chain,
      address: event.args.marketParams.loanToken.toString(),
    });
    const collateral = await this.services.blockchain.evm.getTokenInfo({
      chain: options.morphoBlueConfig.chain,
      address: event.args.marketParams.collateralToken.toString(),
    });
    if (debtToken && collateral) {
      const lendingPool: MorphoBlueMarketMetadata = {
        chain: options.morphoBlueConfig.chain,
        morphoBlue: normalizeAddress(options.morphoBlueConfig.morphoBlue),
        poolId: marketId,
        birthblock: Number(options.log.blockNumber),
        birthday: Number(block.timestamp),
        debtToken,
        collateralToken: collateral,
        oracle: normalizeAddress(event.args.marketParams.oracle.toString()),
        irm: normalizeAddress(event.args.marketParams.irm.toString()),
        ltv: event.args.marketParams.lltv.toString(),
      };

      return lendingPool;
    }

    return null;
  }

  public async getMarketsMetadata(config: MorphoBlueConfig): Promise<Array<MorphoBlueMarketMetadata> | null> {
    // marketId => MorphoBlueMarketMetadata
    const lendingPools: { [key: string]: MorphoBlueMarketMetadata } = {};

    // find the latest block number when events was synced from database
    let startFromBlock = config.birthblock ? config.birthblock : 0;
    const latestBlock = await this.services.blockchain.evm.getLastestBlockNumber(config.chain);

    const databaseConnected = await this.storages.database.isConnected();
    if (databaseConnected) {
      // get existed pools from database
      const pools: Array<any> = await this.storages.database.query({
        collection: envConfig.mongodb.collections.caching.name,
        query: {
          name: `morpho-blue-markets-${config.chain}-${this.protocolConfig.protocol}-${normalizeAddress(config.morphoBlue)}`,
        },
      });

      for (const existedPool of pools) {
        lendingPools[existedPool.poolId] = {
          chain: existedPool.chain,
          morphoBlue: existedPool.address,
          poolId: existedPool.poolId,
          birthblock: existedPool.birthblock,
          birthday: existedPool.birthday,
          debtToken: existedPool.debtToken,
          collateralToken: existedPool.collateralToken,
          oracle: existedPool.oracle,
          irm: existedPool.irm,
          ltv: existedPool.ltv,
        };

        if (lendingPools[existedPool.poolId].birthblock > startFromBlock) {
          startFromBlock = lendingPools[existedPool.poolId].birthblock + 1;
        }
      }
    }

    logger.info('getting morpho blue pools metadata', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      chain: config.chain,
      address: config.morphoBlue,
      fromBlock: startFromBlock,
      toBlock: latestBlock,
    });

    const chunkSize = 5000;
    while (startFromBlock < latestBlock) {
      const toBlock = startFromBlock + chunkSize > latestBlock ? latestBlock : startFromBlock + chunkSize;
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: config.chain,
        address: config.morphoBlue,
        fromBlock: startFromBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === MorphoBlueEvents.CreateMarket) {
          const poolMetadata = await this.getMarketInfoFromLog({
            morphoBlueConfig: config,
            log: log,
          });
          if (poolMetadata) {
            lendingPools[poolMetadata.poolId] = poolMetadata;

            if (databaseConnected) {
              await this.storages.database.update({
                collection: envConfig.mongodb.collections.caching.name,
                keys: {
                  name: `morpho-blue-markets-${config.chain}-${this.protocolConfig.protocol}-${normalizeAddress(config.morphoBlue)}`,
                  poolId: poolMetadata.poolId,
                },
                updates: {
                  name: `morpho-blue-markets-${config.chain}-${this.protocolConfig.protocol}-${normalizeAddress(config.morphoBlue)}`,
                  ...poolMetadata,
                },
                upsert: true,
              });
            }

            logger.debug('got morpho blue pool metadata', {
              service: this.name,
              protocol: this.protocolConfig.protocol,
              chain: config.chain,
              address: poolMetadata.morphoBlue,
              debtToken: poolMetadata.debtToken.symbol,
              collateral: poolMetadata.collateralToken.symbol,
            });
          }
        }
      }

      startFromBlock = toBlock + 1;
    }

    return Object.values(lendingPools);
  }

  public async getMarketData(options: GetMarketDataOptions): Promise<ProtocolData> {
    logger.debug('getting morpho market data', {
      service: this.name,
      chain: options.morphoBlueConfig.chain,
      poolId: options.poolMetadata.poolId,
      tokens: `${options.poolMetadata.debtToken.symbol}-${options.poolMetadata.collateralToken.symbol}`,
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
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
      },
    };

    const getTokenPriceResult = await this.services.oracle.getTokenPriceUsd({
      chain: options.poolMetadata.debtToken.chain,
      address: options.poolMetadata.debtToken.address,
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
          params: [options.poolMetadata.poolId],
          blockNumber: options.blockNumber,
        });

      const [borrowRateView, collateralPrice] = await this.services.blockchain.evm.multicall({
        chain: options.morphoBlueConfig.chain,
        calls: [
          {
            abi: AdapterCurveIrmAbi,
            target: options.poolMetadata.irm,
            method: 'borrowRateView',
            params: [
              [
                options.poolMetadata.debtToken.address, // loanToken
                options.poolMetadata.collateralToken.address, // collateralToken
                options.poolMetadata.oracle, // oracle
                options.poolMetadata.irm, // irm
                options.poolMetadata.ltv, // ltv
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
            target: options.poolMetadata.oracle,
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
            36 + options.poolMetadata.debtToken.decimals - options.poolMetadata.collateralToken.decimals,
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
        formatBigNumberToNumber(totalSupplyAssets.toString(), options.poolMetadata.debtToken.decimals) * debtTokenPrice;
      const totalBorrowed =
        formatBigNumberToNumber(totalBorrowAssets.toString(), options.poolMetadata.debtToken.decimals) * debtTokenPrice;

      // 24h borrow fees
      const borrowFees = (totalBorrowed * borrowAPY) / TimeUnits.DaysPerYear;
      const revenue = borrowFees * feeRate;

      // process historical logs to cal total collateral deposited
      for (const log of options.morphoBlueDatabaseLogs) {
        const signature = log.topics[0];

        const event: any = decodeEventLog({
          abi: MorphoBlueAbi,
          topics: log.topics,
          data: log.data,
        });

        if (event.args.id === options.poolMetadata.poolId) {
          if (signature === MorphoBlueEvents.SupplyCollateral || signature === MorphoBlueEvents.WithdrawCollateral) {
            const collateralAmountUsd =
              formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.collateralToken.decimals) *
              collateralPriceUsd;
            if (signature === MorphoBlueEvents.SupplyCollateral) {
              marketLendingData.totalAssetDeposited += collateralAmountUsd;
            } else {
              marketLendingData.totalAssetDeposited -= collateralAmountUsd;
            }
          } else if (signature === MorphoBlueEvents.Liquidate) {
            const collateralAmountUsd =
              formatBigNumberToNumber(
                event.args.seizedAssets.toString(),
                options.poolMetadata.collateralToken.decimals,
              ) * collateralPriceUsd;
            marketLendingData.totalAssetDeposited -= collateralAmountUsd;
          }
        }
      }

      if (!marketLendingData.breakdown[options.poolMetadata.chain]) {
        marketLendingData.breakdown[options.poolMetadata.chain] = {};
      }
      if (!marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address]) {
        marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            deposit: 0,
            withdraw: 0,
            borrow: 0,
            repay: 0,
            liquidation: 0,
          },
        };
      }
      if (!marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.collateralToken.address]) {
        marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.collateralToken.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            deposit: 0,
            withdraw: 0,
            borrow: 0,
            repay: 0,
            liquidation: 0,
          },
        };
      }

      // process new event logs for volumes
      for (const log of options.morphoBlueLogs) {
        const signature = log.topics[0];
        const event: any = decodeEventLog({
          abi: MorphoBlueAbi,
          topics: log.topics,
          data: log.data,
        });

        if (event.args.id === options.poolMetadata.poolId) {
          switch (signature) {
            case MorphoBlueEvents.Supply: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.deposit as number) += amountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address].volumes
                .deposit as number) += amountUsd;
              marketLendingData.moneyFlowIn += amountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.debtToken.address
              ].moneyFlowIn += amountUsd;
              break;
            }
            case MorphoBlueEvents.Withdraw: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.withdraw as number) += amountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address].volumes
                .withdraw as number) += amountUsd;
              marketLendingData.moneyFlowOut += amountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.debtToken.address
              ].moneyFlowOut += amountUsd;
              break;
            }
            case MorphoBlueEvents.Borrow: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.borrow as number) += amountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address].volumes
                .borrow as number) += amountUsd;
              marketLendingData.moneyFlowOut += amountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.debtToken.address
              ].moneyFlowOut += amountUsd;
              break;
            }
            case MorphoBlueEvents.Repay: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.debtToken.decimals) *
                debtTokenPrice;
              (marketLendingData.volumes.repay as number) += amountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address].volumes
                .repay as number) += amountUsd;
              marketLendingData.moneyFlowIn += amountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.debtToken.address
              ].moneyFlowIn += amountUsd;
              break;
            }
            case MorphoBlueEvents.SupplyCollateral: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.collateralToken.decimals) *
                collateralPriceUsd;
              (marketLendingData.volumes.deposit as number) += amountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.collateralToken.address]
                .volumes.deposit as number) += amountUsd;
              marketLendingData.moneyFlowIn += amountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.collateralToken.address
              ].moneyFlowIn += amountUsd;
              break;
            }
            case MorphoBlueEvents.WithdrawCollateral: {
              const amountUsd =
                formatBigNumberToNumber(event.args.assets.toString(), options.poolMetadata.collateralToken.decimals) *
                collateralPriceUsd;
              (marketLendingData.volumes.withdraw as number) += amountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.collateralToken.address]
                .volumes.withdraw as number) += amountUsd;
              marketLendingData.moneyFlowOut += amountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.collateralToken.address
              ].moneyFlowOut += amountUsd;
              break;
            }
            case MorphoBlueEvents.Liquidate: {
              const repayAmountUsd =
                formatBigNumberToNumber(event.args.repaidAssets.toString(), options.poolMetadata.debtToken.decimals) *
                debtTokenPrice;
              const liquidateAmountUsd =
                formatBigNumberToNumber(
                  event.args.seizedAssets.toString(),
                  options.poolMetadata.collateralToken.decimals,
                ) * collateralPriceUsd;

              (marketLendingData.volumes.repay as number) += repayAmountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.debtToken.address].volumes
                .repay as number) += repayAmountUsd;
              marketLendingData.moneyFlowIn += repayAmountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.debtToken.address
              ].moneyFlowIn += repayAmountUsd;

              (marketLendingData.volumes.liquidation as number) += repayAmountUsd;
              (marketLendingData.breakdown[options.poolMetadata.chain][options.poolMetadata.collateralToken.address]
                .volumes.liquidation as number) += liquidateAmountUsd;
              marketLendingData.moneyFlowOut += liquidateAmountUsd;
              marketLendingData.breakdown[options.poolMetadata.chain][
                options.poolMetadata.collateralToken.address
              ].moneyFlowOut += liquidateAmountUsd;

              break;
            }
          }
        }
      }

      marketLendingData.totalAssetDeposited += totalDeposited;
      (marketLendingData.totalSupplied as number) += totalDeposited;
      (marketLendingData.totalBorrowed as number) += totalBorrowed;
      marketLendingData.totalValueLocked += totalDeposited - totalBorrowed;
      marketLendingData.totalFees += borrowFees;
      marketLendingData.protocolRevenue += revenue;
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
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
      },
    };

    for (const morphoBlue of morphoBlueConfig.morphoBlues) {
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

      logger.info('indexing historical morpho blue logs', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: morphoBlue.chain,
        address: morphoBlue.morphoBlue,
      });

      // we indexed these collateral supply/withdraw/liquidate events
      // to build current collateral state of the market
      await this.services.blockchain.evm.indexContractLogs(this.storages, {
        chain: morphoBlue.chain,
        address: morphoBlue.morphoBlue,
        fromBlock: morphoBlue.birthblock as number,
        toBlock: endBlock,
        signatures: [
          MorphoBlueEvents.SupplyCollateral,
          MorphoBlueEvents.WithdrawCollateral,
          MorphoBlueEvents.Liquidate,
        ],
        blockRange: morphoBlue.chain === ChainNames.ethereum ? 500 : undefined,
      });

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

      const lendingPools = await this.getMarketsMetadata(morphoBlue);
      if (lendingPools) {
        for (const lendingPool of lendingPools) {
          if (
            !morphoBlue.blacklistPoolIds[lendingPool.poolId] &&
            lendingPool.birthday <= options.timestamp &&
            lendingPool.birthblock <= blockNumber
          ) {
            const marketLendingData = await this.getMarketData({
              morphoBlueConfig: morphoBlue,
              poolMetadata: lendingPool,
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
                      (protocolData.breakdown[chain][address].totalSupplied as number) +=
                        metrics.totalSupplied as number;
                      (protocolData.breakdown[chain][address].totalBorrowed as number) +=
                        metrics.totalBorrowed as number;
                      protocolData.breakdown[chain][address].totalValueLocked += metrics.totalValueLocked;
                      protocolData.breakdown[chain][address].totalFees += metrics.totalFees;
                      protocolData.breakdown[chain][address].protocolRevenue += metrics.protocolRevenue;
                      protocolData.breakdown[chain][address].moneyFlowIn += metrics.moneyFlowIn;
                      protocolData.breakdown[chain][address].moneyFlowOut += metrics.moneyFlowOut;
                      (protocolData.breakdown[chain][address].volumes.deposit as number) += metrics.volumes
                        .deposit as number;
                      (protocolData.breakdown[chain][address].volumes.withdraw as number) += metrics.volumes
                        .withdraw as number;
                      (protocolData.breakdown[chain][address].volumes.borrow as number) += metrics.volumes
                        .borrow as number;
                      (protocolData.breakdown[chain][address].volumes.repay as number) += metrics.volumes
                        .repay as number;
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

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const morphoBlueConfig = this.protocolConfig as MorphoProtocolConfig;

    const pools: { [key: string]: MorphoBlueMarketMetadata } = {
      ethereum: {
        chain: 'ethereum',
        morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
        poolId: '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        debtToken: {
          chain: 'ethereum',
          symbol: 'WETH',
          decimals: 18,
          address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        },
        collateralToken: {
          chain: 'ethereum',
          symbol: 'WSTETH',
          decimals: 18,
          address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        },
        oracle: '0x2a01eb9496094da03c4e364def50f5ad1280ad72',
        irm: '0x870ac11d48b15db9a138cf899d20f13f79ba00bc',
        ltv: '945000000000000000',
        birthblock: 18919623,
        birthday: 1704240000,
      },
    };

    const timestamp = options.timestamp ? options.timestamp : getTimestamp();
    for (const morphoBlue of morphoBlueConfig.morphoBlues) {
      if (pools[morphoBlue.chain]) {
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          morphoBlue.chain,
          timestamp - TimeUnits.SecondsPerDay,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(morphoBlue.chain, timestamp);

        const marketData = await this.getMarketData({
          morphoBlueConfig: morphoBlue,
          poolMetadata: pools[morphoBlue.chain],
          timestamp: timestamp,
          blockNumber: endBlock,
          beginBlock: beginBlock,
          endBlock: endBlock,
          morphoBlueLogs: [],
          morphoBlueDatabaseLogs: [],
        });

        if (marketData) {
          if (options.output === 'json') {
            console.log(JSON.stringify(marketData));
          } else {
            console.log(marketData);
          }
        }
      }
    }
  }
}
