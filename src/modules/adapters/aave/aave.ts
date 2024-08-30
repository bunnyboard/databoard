import { AaveProtocolConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { ProtocolConfig } from '../../../types/base';
import { ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { getInitialLendingData, getInitialLendingDataMetrics, LendingData } from '../../../types/domains/lending';
import AaveCore from './core';
import { Aavev1Events, Aavev2Events, Aavev3Events } from './abis';
import { decodeEventLog } from 'viem';
import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import AaveLendingPoolV3Abi from '../../../configs/abi/aave/LendingPoolV3.json';
import {
  FlashloanData,
  getInitialFlashloanData,
  getInitialFlashloanDataMetrics,
} from '../../../types/domains/flashloan';

export default class AaveAdapter extends AaveCore {
  public readonly name: string = 'adapter.aave 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    logger.info('getting aave protocol data', {
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
    };

    // init LendingData dataset
    let lendingData: LendingData = {
      ...getInitialLendingData(),

      // have supply-side deposit/withdraw
      volumeDeposited: 0,
      volumeWithdrawn: 0,
    };
    let flashloanData: FlashloanData = getInitialFlashloanData();

    const aaveProtocolConfig = this.protocolConfig as AaveProtocolConfig;
    for (const marketConfig of aaveProtocolConfig.lendingMarkets) {
      if (marketConfig.birthday > options.timestamp) {
        // market was not deployed yet
        continue;
      }

      logger.debug('getting aave market data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: marketConfig.chain,
        version: marketConfig.version,
        lendingPool: marketConfig.lendingPool,
      });

      if (!lendingData.breakdown[marketConfig.chain]) {
        lendingData.breakdown[marketConfig.chain] = {};
      }
      if (!flashloanData.breakdown[marketConfig.chain]) {
        flashloanData.breakdown[marketConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.timestamp,
      );

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.endTime,
      );
      const contractLogs: Array<any> = await this.services.blockchain.evm.getContractLogs({
        chain: marketConfig.chain,
        address: marketConfig.lendingPool,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      const reservesAndPrices = await this.getReservesAndPrices({
        config: marketConfig,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      if (reservesAndPrices) {
        for (const reserveAndPrice of reservesAndPrices) {
          if (!lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address]) {
            lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address] = {
              ...getInitialLendingDataMetrics(),
              volumeDeposited: 0,
              volumeWithdrawn: 0,
            };
          }
          if (!flashloanData.breakdown[marketConfig.chain][reserveAndPrice.token.address]) {
            flashloanData.breakdown[marketConfig.chain][reserveAndPrice.token.address] =
              getInitialFlashloanDataMetrics();
          }

          const [reserveData, reserveConfigData] = await this.getReserveData({
            config: marketConfig,
            blockNumber: blockNumber,
            reserveAddress: reserveAndPrice.token.address,
          });

          let totalDeposited = 0;
          let totalBorrowed = 0;
          let borrowFees = 0;
          let revenue = 0;
          if (marketConfig.version === 1) {
            totalDeposited =
              formatBigNumberToNumber(reserveData[0].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;

            const totalStableDebt =
              formatBigNumberToNumber(reserveData[2].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;
            const totalVariableDebt =
              formatBigNumberToNumber(reserveData[3].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;

            const stableBorrowRate = formatBigNumberToNumber(reserveData[6].toString(), SolidityUnits.RayDecimals);
            const variableBorrowRate = formatBigNumberToNumber(reserveData[5].toString(), SolidityUnits.RayDecimals);

            totalBorrowed = totalStableDebt + totalVariableDebt;

            const borrowFeesStable = totalStableDebt * stableBorrowRate;
            const borrowFeesVatiable = totalVariableDebt * variableBorrowRate;

            // daily borrow fees
            borrowFees = (borrowFeesStable + borrowFeesVatiable) / TimeUnits.DaysPerYear;

            // no reserve rate for v1
          } else if (marketConfig.version === 2) {
            const availableLiquidity =
              formatBigNumberToNumber(reserveData[0].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;
            const totalStableDebt =
              formatBigNumberToNumber(reserveData[1].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;
            const totalVariableDebt =
              formatBigNumberToNumber(reserveData[2].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;

            const stableBorrowRate = formatBigNumberToNumber(reserveData[5].toString(), SolidityUnits.RayDecimals);
            const variableBorrowRate = formatBigNumberToNumber(reserveData[4].toString(), SolidityUnits.RayDecimals);

            totalBorrowed = totalStableDebt + totalVariableDebt;

            const borrowFeesStable = totalStableDebt * stableBorrowRate;
            const borrowFeesVatiable = totalVariableDebt * variableBorrowRate;

            // daily borrow fees
            borrowFees = (borrowFeesStable + borrowFeesVatiable) / TimeUnits.DaysPerYear;

            totalDeposited = availableLiquidity + totalBorrowed;

            // 4 decimal places
            const reserveRate = formatBigNumberToNumber(reserveConfigData[4].toString(), 4);
            revenue = borrowFees * reserveRate;
          } else if (marketConfig.version === 3) {
            totalDeposited =
              formatBigNumberToNumber(reserveData[2].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;

            const totalStableDebt =
              formatBigNumberToNumber(reserveData[3].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;
            const totalVariableDebt =
              formatBigNumberToNumber(reserveData[4].toString(), reserveAndPrice.token.decimals) *
              reserveAndPrice.price;

            const stableBorrowRate = formatBigNumberToNumber(reserveData[7].toString(), SolidityUnits.RayDecimals);
            const variableBorrowRate = formatBigNumberToNumber(reserveData[6].toString(), SolidityUnits.RayDecimals);

            totalBorrowed = totalStableDebt + totalVariableDebt;

            const borrowFeesStable = totalStableDebt * stableBorrowRate;
            const borrowFeesVatiable = totalVariableDebt * variableBorrowRate;

            // daily borrow fees
            borrowFees = (borrowFeesStable + borrowFeesVatiable) / TimeUnits.DaysPerYear;

            // 4 decimal places
            const reserveRate = formatBigNumberToNumber(reserveConfigData[4].toString(), 4);
            revenue = borrowFees * reserveRate;
          }

          // process contract logs
          for (const log of contractLogs) {
            const signature = log.topics[0];

            if (
              !Object.values(Aavev1Events)
                .concat(Object.values(Aavev2Events))
                .concat(Object.values(Aavev3Events))
                .includes(signature)
            ) {
              // ignore this log
              continue;
            }

            const event: any = decodeEventLog({
              abi:
                marketConfig.version === 1
                  ? AaveLendingPoolV1Abi
                  : marketConfig.version === 2
                    ? AaveLendingPoolV2Abi
                    : AaveLendingPoolV3Abi,
              topics: log.topics,
              data: log.data,
            });

            if (
              signature === Aavev1Events.Flashloan ||
              signature === Aavev2Events.Flashloan ||
              signature === Aavev3Events.Flashloan
            ) {
              // we count flashloan logs
              if (compareAddress(event.args._reserve, reserveAndPrice.token.address)) {
                // version 1
                const volumeAmountUsd =
                  formatBigNumberToNumber(event.args._amount.toString(), reserveAndPrice.token.decimals) *
                  reserveAndPrice.price;
                flashloanData.volumeFlashloan += volumeAmountUsd;

                // add breakdown data
                flashloanData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeFlashloan +=
                  volumeAmountUsd;

                // v1 flashloan has no fees
              } else if (compareAddress(event.args.asset, reserveAndPrice.token.address)) {
                // version 2, 3
                const volumeAmountUsd =
                  formatBigNumberToNumber(event.args.amount.toString(), reserveAndPrice.token.decimals) *
                  reserveAndPrice.price;
                const feesUsd =
                  formatBigNumberToNumber(event.args.premium.toString(), reserveAndPrice.token.decimals) *
                  reserveAndPrice.price;
                flashloanData.volumeFlashloan += volumeAmountUsd;
                flashloanData.flashloanFees += feesUsd;

                // add to chain breakdown
                flashloanData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeFlashloan +=
                  volumeAmountUsd;
                flashloanData.breakdown[marketConfig.chain][reserveAndPrice.token.address].flashloanFees += feesUsd;
              }
            } else if (
              signature === Aavev1Events.Liquidate ||
              signature === Aavev2Events.Liquidate ||
              signature === Aavev3Events.Liquidate
            ) {
              // we count liquidation logs
              if (marketConfig.version === 1) {
                if (compareAddress(event.args._reserve, reserveAndPrice.token.address)) {
                  // liquidator repay debt
                  const amountUsd =
                    formatBigNumberToNumber(event.args._purchaseAmount.toString(), reserveAndPrice.token.decimals) *
                    reserveAndPrice.price;
                  lendingData.volumeRepaid += amountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeRepaid += amountUsd;
                } else if (compareAddress(event.args._collateral, reserveAndPrice.token.address)) {
                  // liquidate collateral assets
                  const collateralAmountUsd =
                    formatBigNumberToNumber(
                      event.args._liquidatedCollateralAmount.toString(),
                      reserveAndPrice.token.decimals,
                    ) * reserveAndPrice.price;
                  lendingData.volumeLiquidation += collateralAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeLiquidation +=
                    collateralAmountUsd;
                }
              } else {
                // flashloan version 2, 3
                if (compareAddress(event.args.debtAsset, reserveAndPrice.token.address)) {
                  // liquidator repay debt
                  const amountUsd =
                    formatBigNumberToNumber(event.args.debtToCover.toString(), reserveAndPrice.token.decimals) *
                    reserveAndPrice.price;
                  lendingData.volumeRepaid += amountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeRepaid += amountUsd;
                } else if (compareAddress(event.args.collateralAsset, reserveAndPrice.token.address)) {
                  // liquidate collateral assets
                  const collateralAmountUsd =
                    formatBigNumberToNumber(
                      event.args.liquidatedCollateralAmount.toString(),
                      reserveAndPrice.token.decimals,
                    ) * reserveAndPrice.price;
                  lendingData.volumeLiquidation += collateralAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeLiquidation +=
                    collateralAmountUsd;
                }
              }
            } else if (
              compareAddress(event.args._reserve, reserveAndPrice.token.address) ||
              compareAddress(event.args.reserve, reserveAndPrice.token.address)
            ) {
              let volumeAmountUsd = 0;
              if (marketConfig.version === 1) {
                volumeAmountUsd =
                  formatBigNumberToNumber(
                    event.args._amount ? event.args._amount.toString() : event.args._amountMinusFees.toString(),
                    reserveAndPrice.token.decimals,
                  ) * reserveAndPrice.price;
              } else {
                volumeAmountUsd =
                  formatBigNumberToNumber(event.args.amount.toString(), reserveAndPrice.token.decimals) *
                  reserveAndPrice.price;
              }
              switch (signature) {
                case Aavev1Events.Deposit:
                case Aavev2Events.Deposit:
                case Aavev3Events.Deposit: {
                  (lendingData.volumeDeposited as number) += volumeAmountUsd;
                  lendingData.moneyFlowIn += volumeAmountUsd;
                  (lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address]
                    .volumeDeposited as number) += volumeAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].moneyFlowIn +=
                    volumeAmountUsd;
                  break;
                }
                case Aavev1Events.Withdraw:
                case Aavev2Events.Withdraw:
                case Aavev3Events.Withdraw: {
                  (lendingData.volumeWithdrawn as number) += volumeAmountUsd;
                  lendingData.moneyFlowOut += volumeAmountUsd;
                  (lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address]
                    .volumeWithdrawn as number) += volumeAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].moneyFlowOut +=
                    volumeAmountUsd;
                  break;
                }
                case Aavev1Events.Borrow:
                case Aavev2Events.Borrow:
                case Aavev3Events.Borrow: {
                  lendingData.volumeBorrowed += volumeAmountUsd;
                  lendingData.moneyFlowOut += volumeAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeBorrowed +=
                    volumeAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].moneyFlowOut +=
                    volumeAmountUsd;
                  break;
                }
                case Aavev1Events.Repay:
                case Aavev2Events.Repay:
                case Aavev3Events.Repay: {
                  lendingData.volumeRepaid += volumeAmountUsd;
                  lendingData.moneyFlowIn += volumeAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].volumeRepaid +=
                    volumeAmountUsd;
                  lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].moneyFlowIn +=
                    volumeAmountUsd;
                  break;
                }
              }
            }
          }

          lendingData.totalAssetDeposited += totalDeposited;
          lendingData.totalSupplied += totalDeposited;
          lendingData.totalBorrowed += totalBorrowed;
          lendingData.totalValueLocked += totalDeposited - totalBorrowed;
          lendingData.borrowFees += borrowFees;
          lendingData.revenue += revenue;

          // chains breakdown
          lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].totalAssetDeposited +=
            totalDeposited;
          lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].totalSupplied += totalDeposited;
          lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].totalBorrowed += totalBorrowed;
          lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].totalValueLocked +=
            totalDeposited - totalBorrowed;
          lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].borrowFees += borrowFees;
          lendingData.breakdown[marketConfig.chain][reserveAndPrice.token.address].revenue += revenue;
        }
      }
    }

    protocolData.lending = lendingData;
    protocolData.flashloan = flashloanData;

    return protocolData;
  }
}
