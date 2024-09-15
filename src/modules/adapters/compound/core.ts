import { CompoundProtocolConfig, ComptrollerConfig } from '../../../configs/protocols/compound';
import { ProtocolConfig, Token } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import CompoundOracleAbi from '../../../configs/abi/compound/Oracle.json';
import CompoundComptrollerAbi from '../../../configs/abi/compound/Comptroller.json';
import CompoundComptrollerV1Abi from '../../../configs/abi/compound/ComptrollerV1.json';
import IronbankComptrollerOldAbi from '../../../configs/abi/ironbank/FirstComptroller.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { GetProtocolDataOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { AddressZero, ChainBlockPeriods, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import BigNumber from 'bignumber.js';
import logger from '../../../lib/logger';
import { CompoundEventSignatures, Compoundv3EventSignatures } from './abis';
import { decodeEventLog } from 'viem';
import envConfig from '../../../configs/envConfig';
import CometAbi from '../../../configs/abi/compound/Comet.json';
import { ContractCall } from '../../../services/blockchains/domains';

interface MarketTokenAndPrice {
  cToken: string;
  underlying: Token;
  underlyingPrice: number;
}

export default class CompoundCore extends ProtocolAdapter {
  public readonly name: string = 'adapter.compound';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected decodeEventLog(config: ComptrollerConfig, log: any): any {
    try {
      const event: any = decodeEventLog({
        abi: cErc20Abi,
        topics: log.topics,
        data: log.data,
      });
      if (event) {
        return event;
      }
    } catch (e: any) {
      logger.warn('failed to decode event log', {
        service: this.name,
        chain: config.chain,
        comptroller: config.comptroller,
        signature: log.topics[0],
        txn: log.transactionHash,
      });
    }

    return null;
  }

  protected async getAllMarkets(config: ComptrollerConfig, blockNumber: number): Promise<Array<string>> {
    // some protocol use modified version of original UniController from compound
    // we just try with all possibility abis
    const abis: Array<any> = [CompoundComptrollerAbi, CompoundComptrollerV1Abi, IronbankComptrollerOldAbi];

    for (const abi of abis) {
      const allMarkets = await this.services.blockchain.evm.readContract({
        chain: config.chain,
        abi: abi,
        target: config.comptroller,
        method: 'getAllMarkets',
        params: [],
        blockNumber,
      });
      if (allMarkets) {
        return allMarkets as Array<string>;
      }
    }

    return config.preDefinedMarkets ? config.preDefinedMarkets : [];
  }

  protected async getMarketTokensAndPrices(
    config: ComptrollerConfig,
    blockNumber: number,
    timestamp: number,
  ): Promise<Array<MarketTokenAndPrice>> {
    const markets: Array<MarketTokenAndPrice> = [];

    const allMarkets = await this.getAllMarkets(config, blockNumber);
    if (allMarkets) {
      const oracleAddress = await this.services.blockchain.evm.readContract({
        chain: config.chain,
        target: config.comptroller,
        abi: CompoundComptrollerAbi,
        method: 'oracle',
        params: [],
        blockNumber: blockNumber,
      });

      for (const cTokenAddress of allMarkets) {
        let underlying = null;
        if (config.cTokenMappings && config.cTokenMappings[normalizeAddress(cTokenAddress)]) {
          underlying = config.cTokenMappings[normalizeAddress(cTokenAddress)];
        } else {
          const underlyingAddress = await this.services.blockchain.evm.readContract({
            chain: config.chain,
            abi: cErc20Abi,
            target: cTokenAddress,
            method: 'underlying',
            params: [],
            blockNumber,
          });

          if (underlyingAddress) {
            underlying = await this.services.blockchain.evm.getTokenInfo({
              chain: config.chain,
              address: underlyingAddress.toString(),
            });
          } else {
            underlying = envConfig.blockchains[config.chain].nativeToken;
          }
        }

        if (config.blacklists) {
          for (const blacklist of config.blacklists) {
            if (
              compareAddress(blacklist, cTokenAddress) ||
              (underlying && compareAddress(blacklist, underlying.address))
            ) {
              // ignore this market
              continue;
            }
          }
        }

        if (underlying) {
          let underlyingPrice = null;

          if (config.oracleSource === 'external') {
            underlyingPrice = await this.services.oracle.getTokenPriceUsd({
              chain: underlying.chain,
              address: underlying.address,
              timestamp: timestamp,
            });
          } else if (config.oracleSource === 'oracleUsd' || config.oracleSource === 'oracleEth') {
            try {
              const oraclePrice = await this.services.blockchain.evm.readContract({
                chain: config.chain,
                target: oracleAddress,
                abi: CompoundOracleAbi,
                method: 'getUnderlyingPrice',
                params: [cTokenAddress],
                blockNumber: blockNumber,
              });

              if (oraclePrice) {
                // Comptroller needs prices in the format: ${raw price} * 1e36 / baseUnit
                // The baseUnit of an asset is the amount of the smallest denomination of that asset per whole.
                // For example, the baseUnit of ETH is 1e18.
                // Since the prices in this view have 6 decimals, we must scale them by 1e(36 - 6)/baseUnit
                underlyingPrice = formatBigNumberToNumber(oraclePrice.toString(), 36 - underlying.decimals);

                if (config.oracleSource === 'oracleEth') {
                  const ethPrice = await this.services.oracle.getTokenPriceUsd({
                    chain: 'ethereum',
                    address: AddressZero,
                    timestamp: timestamp,
                  });

                  underlyingPrice = underlyingPrice * (ethPrice ? Number(ethPrice) : 0);
                }
              }
            } catch (e: any) {}
          }

          markets.push({
            cToken: normalizeAddress(cTokenAddress),
            underlying: underlying,
            underlyingPrice: underlyingPrice !== null ? Number(underlyingPrice) : 0,
          });
        }
      }
    }

    return markets;
  }

  public async getBorrowRate(chain: string, cTokenContract: string, blockNumber: number): Promise<number> {
    const borrowRatePerBlock = await this.services.blockchain.evm.readContract({
      chain: chain,
      abi: cErc20Abi,
      target: cTokenContract,
      method: 'borrowRatePerBlock',
      params: [],
      blockNumber: blockNumber,
    });

    const borrowRate = new BigNumber(borrowRatePerBlock ? borrowRatePerBlock : '0')
      .multipliedBy(Math.floor(TimeUnits.SecondsPerYear / ChainBlockPeriods[chain]))
      .toString(10);

    return formatBigNumberToNumber(borrowRate, 18);
  }

  protected async getMarketReserveFactorRate(
    config: ComptrollerConfig,
    cTokenContract: string,
    blockNumber: number,
  ): Promise<number> {
    const reserveFactorMantissa = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      abi: cErc20Abi,
      target: cTokenContract,
      method: 'reserveFactorMantissa',
      params: [],
      blockNumber,
    });
    if (reserveFactorMantissa) {
      return formatBigNumberToNumber(reserveFactorMantissa.toString(), 18);
    }

    return 0;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    logger.info('getting compound protocol data', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      blockTime: options.timestamp,
      beginTime: options.beginTime,
      endTime: options.endTime,
    });

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

    const config = this.protocolConfig as CompoundProtocolConfig;
    for (const comptrollerConfig of config.comptrollers) {
      if (comptrollerConfig.birthday > options.timestamp) {
        // market was not deployed yet
        continue;
      }

      if (!protocolData.breakdown[comptrollerConfig.chain]) {
        protocolData.breakdown[comptrollerConfig.chain] = {};
      }

      logger.debug('getting compound market data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: comptrollerConfig.chain,
        comptroller: comptrollerConfig.comptroller,
      });

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        comptrollerConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        comptrollerConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        comptrollerConfig.chain,
        options.endTime,
      );

      const marketTokensAndPrices = await this.getMarketTokensAndPrices(
        comptrollerConfig,
        blockNumber,
        options.timestamp,
      );
      for (const marketAndPrice of marketTokensAndPrices) {
        if (!protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address]) {
          protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address] = {
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

        const borrowRate = await this.getBorrowRate(comptrollerConfig.chain, marketAndPrice.cToken, blockNumber);

        const [totalCash, totalBorrows, totalReserves] = await this.services.blockchain.evm.multicall({
          chain: comptrollerConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: cErc20Abi,
              target: marketAndPrice.cToken,
              method: 'getCash',
              params: [],
            },
            {
              abi: cErc20Abi,
              target: marketAndPrice.cToken,
              method: 'totalBorrows',
              params: [],
            },
            {
              abi: cErc20Abi,
              target: marketAndPrice.cToken,
              method: 'totalReserves',
              params: [],
            },
          ],
        });

        const reserveFactor = await this.getMarketReserveFactorRate(
          comptrollerConfig,
          marketAndPrice.cToken,
          blockNumber,
        );

        const totalDepositedRaw = new BigNumber(totalCash ? totalCash.toString() : '0')
          .plus(new BigNumber(totalBorrows ? totalBorrows.toString() : '0'))
          .minus(new BigNumber(totalReserves ? totalReserves.toString() : '0'))
          .toString(10);
        const totalBorrowedRaw = new BigNumber(totalBorrows ? totalBorrows.toString() : '0').toString(10);

        const totalDeposited =
          formatBigNumberToNumber(totalDepositedRaw, marketAndPrice.underlying.decimals) *
          marketAndPrice.underlyingPrice;
        const totalBorrowed =
          formatBigNumberToNumber(totalBorrowedRaw, marketAndPrice.underlying.decimals) *
          marketAndPrice.underlyingPrice;

        const borrowFees = (totalBorrowed * borrowRate) / TimeUnits.DaysPerYear;
        const protocolRevenue = borrowFees * reserveFactor;
        const supplySideRevenue = borrowFees - protocolRevenue;

        protocolData.totalAssetDeposited += totalDeposited;
        (protocolData.totalSupplied as number) += totalDeposited;
        (protocolData.totalBorrowed as number) += totalBorrowed;
        protocolData.totalValueLocked += totalDeposited - totalBorrowed;
        protocolData.totalFees += borrowFees;
        protocolData.supplySideRevenue += supplySideRevenue;
        protocolData.protocolRevenue += protocolRevenue;

        // add to breakdown
        protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].totalAssetDeposited +=
          totalDeposited;
        (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].totalSupplied as number) +=
          totalDeposited;
        (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].totalBorrowed as number) +=
          totalBorrowed;
        protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].totalValueLocked +=
          totalDeposited - totalBorrowed;
        protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].totalFees += borrowFees;
        protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].supplySideRevenue +=
          supplySideRevenue;
        protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].protocolRevenue +=
          protocolRevenue;

        // process logs
        const contractLogs: Array<any> = await this.services.blockchain.evm.getContractLogs({
          chain: comptrollerConfig.chain,
          address: marketAndPrice.cToken,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of contractLogs) {
          const signature = log.topics[0];

          if (Object.values(CompoundEventSignatures).includes(signature)) {
            const event: any = this.decodeEventLog(comptrollerConfig, log);

            switch (signature) {
              case CompoundEventSignatures.Mint: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.mintAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (protocolData.volumes.deposit as number) += amountUsd;
                (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].volumes
                  .deposit as number) += amountUsd;
                protocolData.moneyFlowIn += amountUsd;
                protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].moneyFlowIn +=
                  amountUsd;

                break;
              }
              case CompoundEventSignatures.Redeem: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.redeemAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (protocolData.volumes.withdraw as number) += amountUsd;
                (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].volumes
                  .withdraw as number) += amountUsd;
                protocolData.moneyFlowOut += amountUsd;
                protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].moneyFlowOut +=
                  amountUsd;

                break;
              }
              case CompoundEventSignatures.Borrow: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.borrowAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (protocolData.volumes.borrow as number) += amountUsd;
                (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].volumes
                  .borrow as number) += amountUsd;
                protocolData.moneyFlowOut += amountUsd;
                protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].moneyFlowOut +=
                  amountUsd;

                break;
              }
              case CompoundEventSignatures.Repay: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.repayAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (protocolData.volumes.repay as number) += amountUsd;
                (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].volumes
                  .repay as number) += amountUsd;
                protocolData.moneyFlowIn += amountUsd;
                protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].moneyFlowIn +=
                  amountUsd;

                break;
              }
              case CompoundEventSignatures.Liquidate: {
                // repay debt
                const repayAmountUsd =
                  formatBigNumberToNumber(event.args.repayAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (protocolData.volumes.repay as number) += repayAmountUsd;
                (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].volumes
                  .repay as number) += repayAmountUsd;
                protocolData.moneyFlowIn += repayAmountUsd;
                protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].moneyFlowIn +=
                  repayAmountUsd;

                // liquidate collateral
                const collateral = marketTokensAndPrices.filter((item) =>
                  compareAddress(event.args.cTokenCollateral, item.cToken),
                )[0];
                if (collateral) {
                  const currentExechangeRate = await this.services.blockchain.evm.readContract({
                    chain: comptrollerConfig.chain,
                    abi: cErc20Abi,
                    target: collateral.cToken,
                    method: 'exchangeRateCurrent',
                    params: [],
                    blockNumber: Number(log.blockNumber),
                  });
                  if (currentExechangeRate) {
                    const seizeTokens = new BigNumber(event.args.seizeTokens.toString());
                    const mantissa = 18 + collateral.underlying.decimals - 8;
                    const oneCTokenInUnderlying = new BigNumber(currentExechangeRate).dividedBy(
                      new BigNumber(10).pow(mantissa),
                    );
                    const collateralAmount = seizeTokens.multipliedBy(oneCTokenInUnderlying).dividedBy(1e8).toNumber();
                    const collateralAmountUsd = collateralAmount * collateral.underlyingPrice;
                    (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                    (protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].volumes
                      .liquidation as number) += collateralAmountUsd;
                    protocolData.moneyFlowOut += collateralAmountUsd;
                    protocolData.breakdown[comptrollerConfig.chain][marketAndPrice.underlying.address].moneyFlowOut +=
                      collateralAmountUsd;
                  }
                }

                break;
              }
            }
          }
        }
      }
    }

    if (config.comets) {
      for (const cometConfig of config.comets) {
        if (cometConfig.birthday > options.timestamp) {
          continue;
        }

        logger.info('get compound comet info', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          category: this.protocolConfig.category,
          chain: cometConfig.chain,
          comet: cometConfig.comet,
        });

        if (!protocolData.breakdown[cometConfig.chain]) {
          protocolData.breakdown[cometConfig.chain] = {};
        }

        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          cometConfig.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          cometConfig.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          cometConfig.chain,
          options.endTime,
        );

        const [baseTokenAddress, numAssets] = await this.services.blockchain.evm.multicall({
          chain: cometConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: CometAbi,
              target: cometConfig.comet,
              method: 'baseToken',
              params: [],
            },
            {
              abi: CometAbi,
              target: cometConfig.comet,
              method: 'numAssets',
              params: [],
            },
          ],
        });

        const baseToken = await this.services.blockchain.evm.getTokenInfo({
          chain: cometConfig.chain,
          address: baseTokenAddress,
        });

        if (baseToken) {
          if (!protocolData.breakdown[cometConfig.chain][baseToken.address]) {
            protocolData.breakdown[cometConfig.chain][baseToken.address] = {
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

          const baseTokenPriceRaw = await this.services.oracle.getTokenPriceUsd({
            chain: cometConfig.chain,
            address: baseToken.address,
            timestamp: options.timestamp,
          });
          const baseTokenPriceUsd = baseTokenPriceRaw ? Number(baseTokenPriceRaw) : 0;

          const [totalSupply, totalBorrow, utilization] = await this.services.blockchain.evm.multicall({
            chain: cometConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: CometAbi,
                target: cometConfig.comet,
                method: 'totalSupply',
                params: [],
              },
              {
                abi: CometAbi,
                target: cometConfig.comet,
                method: 'totalBorrow',
                params: [],
              },
              {
                abi: CometAbi,
                target: cometConfig.comet,
                method: 'getUtilization',
                params: [],
              },
            ],
          });
          const [borrowRate] = await this.services.blockchain.evm.multicall({
            chain: cometConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: CometAbi,
                target: cometConfig.comet,
                method: 'getBorrowRate',
                params: [utilization.toString()],
              },
            ],
          });

          const totalSuppliedUsd =
            formatBigNumberToNumber(totalSupply.toString(), baseToken.decimals) * baseTokenPriceUsd;
          const totalBorrowedUsd =
            formatBigNumberToNumber(totalBorrow.toString(), baseToken.decimals) * baseTokenPriceUsd;

          const borrowApy = formatBigNumberToNumber(borrowRate.toString(), 18) * TimeUnits.SecondsPerYear;
          const feesUsd = (totalBorrowedUsd * borrowApy) / TimeUnits.DaysPerYear;

          let totalCollateralUsd = 0;
          const calls: Array<ContractCall> = [];
          for (let i = 0; i < Number(numAssets); i++) {
            calls.push({
              abi: CometAbi,
              target: cometConfig.comet,
              method: 'getAssetInfo',
              params: [i],
            });
          }

          const assetInfos = await this.services.blockchain.evm.multicall({
            chain: cometConfig.chain,
            calls: calls,
            blockNumber: blockNumber,
          });

          const collaterals: {
            [key: string]: {
              token: Token;
              priceUsd: number;
            };
          } = {};
          for (const assetInfo of assetInfos) {
            const collateral = await this.services.blockchain.evm.getTokenInfo({
              chain: cometConfig.chain,
              address: assetInfo.asset.toString(),
            });

            if (collateral) {
              collaterals[collateral.address] = {
                token: collateral,
                priceUsd: 0,
              };

              if (!protocolData.breakdown[cometConfig.chain][collateral.address]) {
                protocolData.breakdown[cometConfig.chain][collateral.address] = {
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

              const collateralPriceRaw = await this.services.blockchain.evm.readContract({
                chain: cometConfig.chain,
                abi: CometAbi,
                target: cometConfig.comet,
                method: 'getPrice',
                params: [assetInfo.priceFeed],
                blockNumber: blockNumber,
              });

              // price vs base token - in 8 decimals
              const collateralPriceVsBase = formatBigNumberToNumber(collateralPriceRaw.toString(), 8);
              const collateralPriceUsd = collateralPriceVsBase * baseTokenPriceUsd;
              collaterals[collateral.address].priceUsd = collateralPriceUsd;

              const [totalSupplyAsset] = await this.services.blockchain.evm.readContract({
                chain: cometConfig.chain,
                abi: CometAbi,
                target: cometConfig.comet,
                method: 'totalsCollateral',
                params: [collateral.address],
                blockNumber: blockNumber,
              });
              const collateralUsd =
                formatBigNumberToNumber(totalSupplyAsset.toString(), collateral.decimals) * collateralPriceUsd;

              totalCollateralUsd += collateralUsd;

              protocolData.breakdown[cometConfig.chain][collateral.address].totalAssetDeposited += collateralUsd;
              protocolData.breakdown[cometConfig.chain][collateral.address].totalValueLocked += collateralUsd;
            }
          }

          const totalAssetDeposited = totalSuppliedUsd + totalCollateralUsd;
          const totalValueLocked = totalSuppliedUsd + totalCollateralUsd - totalBorrowedUsd;

          protocolData.totalAssetDeposited += totalAssetDeposited;
          protocolData.totalValueLocked += totalValueLocked;
          (protocolData.totalSupplied as number) += totalSuppliedUsd;
          (protocolData.totalBorrowed as number) += totalBorrowedUsd;
          protocolData.totalFees += feesUsd;

          protocolData.breakdown[cometConfig.chain][baseToken.address].totalAssetDeposited += totalSuppliedUsd;
          protocolData.breakdown[cometConfig.chain][baseToken.address].totalValueLocked +=
            totalSuppliedUsd - totalBorrowedUsd;
          (protocolData.breakdown[cometConfig.chain][baseToken.address].totalSupplied as number) += totalSuppliedUsd;
          (protocolData.breakdown[cometConfig.chain][baseToken.address].totalBorrowed as number) += totalBorrowedUsd;
          protocolData.breakdown[cometConfig.chain][baseToken.address].totalFees += feesUsd;

          const logs = await this.services.blockchain.evm.getContractLogs({
            chain: cometConfig.chain,
            address: cometConfig.comet,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of logs) {
            const signature = log.topics[0];
            if (Object.values(Compoundv3EventSignatures).includes(signature)) {
              const event: any = decodeEventLog({
                abi: CometAbi,
                topics: log.topics,
                data: log.data,
              });
              switch (signature) {
                case Compoundv3EventSignatures.Supply:
                case Compoundv3EventSignatures.Withdraw: {
                  // on compound v3, we detect supply transaction by looking Comet Transfer event from the same transaction
                  // when user deposit base asset, if there is a Transfer event emitted on transaction,
                  // the transaction action is deposit, otherwise, the transaction action is repay.
                  const amountUsd =
                    formatBigNumberToNumber(event.args.amount.toString(), baseToken.decimals) * baseTokenPriceUsd;
                  const cometTransferEvent = logs.filter(
                    (item) =>
                      item.transactionHash === log.transactionHash &&
                      item.topics[0] === Erc20TransferEventSignature &&
                      compareAddress(item.address, cometConfig.comet),
                  )[0];
                  if (signature === Compoundv3EventSignatures.Supply) {
                    protocolData.moneyFlowIn += amountUsd;
                    protocolData.breakdown[cometConfig.chain][baseToken.address].moneyFlowIn += amountUsd;

                    if (cometTransferEvent) {
                      (protocolData.volumes.deposit as number) += amountUsd;
                      (protocolData.breakdown[cometConfig.chain][baseToken.address].volumes.deposit as number) +=
                        amountUsd;
                    } else {
                      (protocolData.volumes.repay as number) += amountUsd;
                      (protocolData.breakdown[cometConfig.chain][baseToken.address].volumes.repay as number) +=
                        amountUsd;
                    }
                  } else {
                    protocolData.moneyFlowOut += amountUsd;
                    protocolData.breakdown[cometConfig.chain][baseToken.address].moneyFlowOut += amountUsd;

                    if (cometTransferEvent) {
                      (protocolData.volumes.withdraw as number) += amountUsd;
                      (protocolData.breakdown[cometConfig.chain][baseToken.address].volumes.withdraw as number) +=
                        amountUsd;
                    } else {
                      (protocolData.volumes.borrow as number) += amountUsd;
                      (protocolData.breakdown[cometConfig.chain][baseToken.address].volumes.borrow as number) +=
                        amountUsd;
                    }
                  }
                  break;
                }
                case Compoundv3EventSignatures.AbsorbDebt: {
                  // repay debts by liquidators
                  const repayAmountUsd =
                    formatBigNumberToNumber(event.args.basePaidOut.toString(), baseToken.decimals) * baseTokenPriceUsd;
                  protocolData.moneyFlowIn += repayAmountUsd;
                  protocolData.breakdown[cometConfig.chain][baseToken.address].moneyFlowIn += repayAmountUsd;
                  (protocolData.volumes.repay as number) += repayAmountUsd;
                  (protocolData.breakdown[cometConfig.chain][baseToken.address].volumes.repay as number) +=
                    repayAmountUsd;
                  break;
                }
                case Compoundv3EventSignatures.SupplyCollateral:
                case Compoundv3EventSignatures.WithdrawCollateral: {
                  const asset = normalizeAddress(event.args.asset);
                  const collateralAmountUsd =
                    formatBigNumberToNumber(event.args.amount.toString(), collaterals[asset].token.decimals) *
                    collaterals[asset].priceUsd;
                  if (signature === Compoundv3EventSignatures.SupplyCollateral) {
                    protocolData.moneyFlowIn += collateralAmountUsd;
                    protocolData.breakdown[cometConfig.chain][asset].moneyFlowIn += collateralAmountUsd;
                    (protocolData.volumes.deposit as number) += collateralAmountUsd;
                    (protocolData.breakdown[cometConfig.chain][asset].volumes.deposit as number) += collateralAmountUsd;
                  } else {
                    protocolData.moneyFlowOut += collateralAmountUsd;
                    protocolData.breakdown[cometConfig.chain][asset].moneyFlowOut += collateralAmountUsd;
                    (protocolData.volumes.withdraw as number) += collateralAmountUsd;
                    (protocolData.breakdown[cometConfig.chain][asset].volumes.withdraw as number) +=
                      collateralAmountUsd;
                  }
                  break;
                }
                case Compoundv3EventSignatures.AbsorbCollateral: {
                  const asset = normalizeAddress(event.args.asset);
                  const collateralAmountUsd =
                    formatBigNumberToNumber(
                      event.args.collateralAbsorbed.toString(),
                      collaterals[asset].token.decimals,
                    ) * collaterals[asset].priceUsd;
                  protocolData.moneyFlowOut += collateralAmountUsd;
                  protocolData.breakdown[cometConfig.chain][asset].moneyFlowOut += collateralAmountUsd;
                  (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                  (protocolData.breakdown[cometConfig.chain][asset].volumes.liquidation as number) +=
                    collateralAmountUsd;
                  break;
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
}
