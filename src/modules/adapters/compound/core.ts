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
import { ProtocolData } from '../../../types/domains/protocol';
import { AddressZero, ChainBlockPeriods, TimeUnits } from '../../../configs/constants';
import BigNumber from 'bignumber.js';
import logger from '../../../lib/logger';
import { getInitialLendingData, getInitialLendingDataMetrics, LendingData } from '../../../types/domains/lending';
import { CompoundEventSignatures } from './abis';
import { decodeEventLog } from 'viem';
import envConfig from '../../../configs/envConfig';

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
      timestamp: options.timestamp,
    };

    // init LendingData dataset
    let lendingData: LendingData = {
      ...getInitialLendingData(),

      // have supply-side deposit/withdraw
      volumeDeposited: 0,
      volumeWithdrawn: 0,
    };

    const config = this.protocolConfig as CompoundProtocolConfig;
    for (const comptrollerConfig of config.comptrollers) {
      if (comptrollerConfig.birthday > options.timestamp) {
        // market was not deployed yet
        continue;
      }

      if (!lendingData.breakdown.blockchains[comptrollerConfig.chain]) {
        lendingData.breakdown.blockchains[comptrollerConfig.chain] = {
          ...getInitialLendingDataMetrics(),
          volumeDeposited: 0,
          volumeWithdrawn: 0,
        };
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

        lendingData.totalAssetDeposited += totalDeposited;
        lendingData.totalSupplied += totalDeposited;
        lendingData.totalBorrowed += totalBorrowed;
        lendingData.totalValueLocked += totalDeposited - totalBorrowed;
        lendingData.borrowFees += (totalBorrowed * borrowRate) / TimeUnits.DaysPerYear;
        lendingData.revenue += (totalBorrowed * borrowRate * reserveFactor) / TimeUnits.DaysPerYear;

        lendingData.breakdown.blockchains[comptrollerConfig.chain].totalAssetDeposited += totalDeposited;
        lendingData.breakdown.blockchains[comptrollerConfig.chain].totalSupplied += totalDeposited;
        lendingData.breakdown.blockchains[comptrollerConfig.chain].totalBorrowed += totalBorrowed;
        lendingData.breakdown.blockchains[comptrollerConfig.chain].totalValueLocked += totalDeposited - totalBorrowed;
        lendingData.breakdown.blockchains[comptrollerConfig.chain].borrowFees +=
          (totalBorrowed * borrowRate) / TimeUnits.DaysPerYear;
        lendingData.breakdown.blockchains[comptrollerConfig.chain].revenue +=
          (totalBorrowed * borrowRate * reserveFactor) / TimeUnits.DaysPerYear;

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

            if (signature === CompoundEventSignatures.Borrow) {
              console.log(event);
            }

            switch (signature) {
              case CompoundEventSignatures.Mint: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.mintAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (lendingData.volumeDeposited as number) += amountUsd;
                (lendingData.breakdown.blockchains[comptrollerConfig.chain].volumeDeposited as number) += amountUsd;
                lendingData.moneyFlowIn += amountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].moneyFlowIn += amountUsd;

                break;
              }
              case CompoundEventSignatures.Redeem: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.redeemAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                (lendingData.volumeWithdrawn as number) += amountUsd;
                (lendingData.breakdown.blockchains[comptrollerConfig.chain].volumeWithdrawn as number) += amountUsd;
                lendingData.moneyFlowOut += amountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].moneyFlowOut += amountUsd;

                break;
              }
              case CompoundEventSignatures.Borrow: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.borrowAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                lendingData.volumeBorrowed += amountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].volumeBorrowed += amountUsd;
                lendingData.moneyFlowOut += amountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].moneyFlowOut += amountUsd;

                break;
              }
              case CompoundEventSignatures.Repay: {
                const amountUsd =
                  formatBigNumberToNumber(event.args.repayAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                lendingData.volumeRepaid += amountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].volumeRepaid += amountUsd;
                lendingData.moneyFlowIn += amountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].moneyFlowIn += amountUsd;

                break;
              }
              case CompoundEventSignatures.Liquidate: {
                // repay debt
                const repayAmountUsd =
                  formatBigNumberToNumber(event.args.repayAmount.toString(), marketAndPrice.underlying.decimals) *
                  marketAndPrice.underlyingPrice;
                lendingData.volumeRepaid += repayAmountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].volumeRepaid += repayAmountUsd;
                lendingData.moneyFlowIn += repayAmountUsd;
                lendingData.breakdown.blockchains[comptrollerConfig.chain].moneyFlowIn += repayAmountUsd;

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
                    lendingData.volumeLiquidation += collateralAmountUsd;
                    lendingData.breakdown.blockchains[comptrollerConfig.chain].volumeLiquidation += collateralAmountUsd;
                    lendingData.moneyFlowOut += collateralAmountUsd;
                    lendingData.breakdown.blockchains[comptrollerConfig.chain].moneyFlowOut += collateralAmountUsd;
                  }
                }

                break;
              }
            }
          }
        }
      }
    }

    protocolData.lending = lendingData;

    return protocolData;
  }
}
