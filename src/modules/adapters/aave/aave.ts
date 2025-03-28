import { AaveProtocolConfig } from '../../../configs/protocols/aave';
import logger from '../../../lib/logger';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { SolidityUnits } from '../../../configs/constants';
import AaveCore from './core';
import { Aavev1Events, Aavev2Events, Aavev3Events } from './abis';
import { decodeEventLog } from 'viem';
import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import AaveLendingPoolV3Abi from '../../../configs/abi/aave/LendingPoolV3.json';
import AdapterDataHelper from '../helpers';

export default class AaveAdapter extends AaveCore {
  public readonly name: string = 'adapter.aave 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    logger.info('getting aave protocol data', {
      service: this.name,
      protocol: this.protocolConfig.protocol,
      blockTime: options.timestamp,
      beginTime: options.beginTime,
      endTime: options.endTime,
    });

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
        flashloan: 0,
      },
    };

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

      if (!protocolData.breakdown[marketConfig.chain]) {
        protocolData.breakdown[marketConfig.chain] = {};
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

      const reserves = await this.getAllReserveData({
        config: marketConfig,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      const contractLogs: Array<any> = await this.services.blockchain.evm.getContractLogs({
        chain: marketConfig.chain,
        address: marketConfig.lendingPool,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const reserve of reserves) {
        if (!protocolData.breakdown[marketConfig.chain][reserve.token.address]) {
          protocolData.breakdown[marketConfig.chain][reserve.token.address] = {
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

        const reserveData = reserve.data;
        const reserveConfigData = reserve.configData;

        // cal fees by growth liquidityIndex
        const [preReserveData] = await this.getReserveData(marketConfig, reserve.token.address, beginBlock);
        const [postReserveData] = await this.getReserveData(marketConfig, reserve.token.address, endBlock);

        let totalDeposited = 0;
        let totalBorrowed = 0;
        let reserveRate = 0;
        let preLiquidityIndex = 0;
        let postLiquidityIndex = 0;
        if (marketConfig.version === 1) {
          totalDeposited =
            formatBigNumberToNumber(reserveData[0].toString(), reserve.token.decimals) * reserve.priceUsd;

          const totalStableDebt =
            formatBigNumberToNumber(reserveData[2].toString(), reserve.token.decimals) * reserve.priceUsd;
          const totalVariableDebt =
            formatBigNumberToNumber(reserveData[3].toString(), reserve.token.decimals) * reserve.priceUsd;
          totalBorrowed = totalStableDebt + totalVariableDebt;

          preLiquidityIndex = formatBigNumberToNumber(preReserveData[9].toString(), SolidityUnits.RayDecimals);
          postLiquidityIndex = formatBigNumberToNumber(postReserveData[9].toString(), SolidityUnits.RayDecimals);
        } else if (marketConfig.version === 2) {
          const availableLiquidity =
            formatBigNumberToNumber(reserveData[0].toString(), reserve.token.decimals) * reserve.priceUsd;
          const totalStableDebt =
            formatBigNumberToNumber(reserveData[1].toString(), reserve.token.decimals) * reserve.priceUsd;
          const totalVariableDebt =
            formatBigNumberToNumber(reserveData[2].toString(), reserve.token.decimals) * reserve.priceUsd;

          totalBorrowed = totalStableDebt + totalVariableDebt;
          totalDeposited = availableLiquidity + totalBorrowed;

          reserveRate = formatBigNumberToNumber(reserveConfigData[4].toString(), 4);
          preLiquidityIndex = formatBigNumberToNumber(preReserveData[7].toString(), SolidityUnits.RayDecimals);
          postLiquidityIndex = formatBigNumberToNumber(postReserveData[7].toString(), SolidityUnits.RayDecimals);
        } else if (marketConfig.version === 3) {
          totalDeposited =
            formatBigNumberToNumber(reserveData[2].toString(), reserve.token.decimals) * reserve.priceUsd;

          const totalStableDebt =
            formatBigNumberToNumber(reserveData[3].toString(), reserve.token.decimals) * reserve.priceUsd;
          const totalVariableDebt =
            formatBigNumberToNumber(reserveData[4].toString(), reserve.token.decimals) * reserve.priceUsd;
          totalBorrowed = totalStableDebt + totalVariableDebt;

          reserveRate = formatBigNumberToNumber(reserveConfigData ? reserveConfigData[4].toString() : '0', 4);
          preLiquidityIndex = formatBigNumberToNumber(
            preReserveData ? preReserveData[9].toString() : '0',
            SolidityUnits.RayDecimals,
          );
          postLiquidityIndex = formatBigNumberToNumber(
            postReserveData ? postReserveData[9].toString() : '0',
            SolidityUnits.RayDecimals,
          );
        }

        const growthLiquidityIndexRate =
          preLiquidityIndex > 0 ? (postLiquidityIndex - preLiquidityIndex) / preLiquidityIndex : 0;
        const borrowFees = totalDeposited * growthLiquidityIndexRate;
        const protocolRevenue = borrowFees * reserveRate;
        const supplySideRevenue = borrowFees - protocolRevenue;

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
            if (compareAddress(event.args._reserve, reserve.token.address)) {
              // version 1
              const volumeAmountUsd =
                formatBigNumberToNumber(event.args._amount.toString(), reserve.token.decimals) * reserve.priceUsd;
              (protocolData.volumes.flashloan as number) += volumeAmountUsd;
              // add breakdown data
              (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.flashloan as number) +=
                volumeAmountUsd;

              const feesUsd =
                formatBigNumberToNumber(event.args._totalFee.toString(), reserve.token.decimals) * reserve.priceUsd;
              protocolData.totalFees += feesUsd;
            } else if (compareAddress(event.args.asset, reserve.token.address)) {
              // version 2, 3
              const volumeAmountUsd =
                formatBigNumberToNumber(event.args.amount.toString(), reserve.token.decimals) * reserve.priceUsd;
              const feesUsd =
                formatBigNumberToNumber(event.args.premium.toString(), reserve.token.decimals) * reserve.priceUsd;
              (protocolData.volumes.flashloan as number) += volumeAmountUsd;
              protocolData.totalFees += feesUsd;

              // add to chain breakdown
              (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.flashloan as number) +=
                volumeAmountUsd;
              protocolData.breakdown[marketConfig.chain][reserve.token.address].totalFees += feesUsd;
            }
          } else if (
            signature === Aavev1Events.Liquidate ||
            signature === Aavev2Events.Liquidate ||
            signature === Aavev3Events.Liquidate
          ) {
            // we count liquidation logs
            if (marketConfig.version === 1) {
              if (compareAddress(event.args._reserve, reserve.token.address)) {
                // liquidator repay debt
                const amountUsd =
                  formatBigNumberToNumber(event.args._purchaseAmount.toString(), reserve.token.decimals) *
                  reserve.priceUsd;
                (protocolData.volumes.repay as number) += amountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.repay as number) +=
                  amountUsd;
              } else if (compareAddress(event.args._collateral, reserve.token.address)) {
                // liquidate collateral assets
                const collateralAmountUsd =
                  formatBigNumberToNumber(event.args._liquidatedCollateralAmount.toString(), reserve.token.decimals) *
                  reserve.priceUsd;
                (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.liquidation as number) +=
                  collateralAmountUsd;
              }
            } else {
              // liquidation version 2, 3
              if (compareAddress(event.args.debtAsset, reserve.token.address)) {
                // liquidator repay debt
                const amountUsd =
                  formatBigNumberToNumber(event.args.debtToCover.toString(), reserve.token.decimals) * reserve.priceUsd;
                (protocolData.volumes.repay as number) += amountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.repay as number) +=
                  amountUsd;
              } else if (compareAddress(event.args.collateralAsset, reserve.token.address)) {
                // liquidate collateral assets
                const collateralAmountUsd =
                  formatBigNumberToNumber(event.args.liquidatedCollateralAmount.toString(), reserve.token.decimals) *
                  reserve.priceUsd;
                (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.liquidation as number) +=
                  collateralAmountUsd;
              }
            }
          } else if (
            compareAddress(event.args._reserve, reserve.token.address) ||
            compareAddress(event.args.reserve, reserve.token.address)
          ) {
            let volumeAmountUsd = 0;
            if (marketConfig.version === 1) {
              volumeAmountUsd =
                formatBigNumberToNumber(
                  event.args._amount ? event.args._amount.toString() : event.args._amountMinusFees.toString(),
                  reserve.token.decimals,
                ) * reserve.priceUsd;
            } else {
              volumeAmountUsd =
                formatBigNumberToNumber(event.args.amount.toString(), reserve.token.decimals) * reserve.priceUsd;
            }
            switch (signature) {
              case Aavev1Events.Deposit:
              case Aavev2Events.Deposit:
              case Aavev3Events.Deposit: {
                (protocolData.volumes.deposit as number) += volumeAmountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.deposit as number) +=
                  volumeAmountUsd;
                break;
              }
              case Aavev1Events.Withdraw:
              case Aavev2Events.Withdraw:
              case Aavev3Events.Withdraw: {
                (protocolData.volumes.withdraw as number) += volumeAmountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.withdraw as number) +=
                  volumeAmountUsd;
                break;
              }
              case Aavev1Events.Borrow:
              case Aavev2Events.Borrow:
              case Aavev3Events.Borrow: {
                (protocolData.volumes.borrow as number) += volumeAmountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.borrow as number) +=
                  volumeAmountUsd;
                break;
              }
              case Aavev1Events.Repay:
              case Aavev2Events.Repay:
              case Aavev3Events.Repay: {
                (protocolData.volumes.repay as number) += volumeAmountUsd;
                (protocolData.breakdown[marketConfig.chain][reserve.token.address].volumes.repay as number) +=
                  volumeAmountUsd;
                break;
              }
            }
          }
        }

        protocolData.totalAssetDeposited += totalDeposited;
        (protocolData.totalSupplied as number) += totalDeposited;
        (protocolData.totalBorrowed as number) += totalBorrowed;
        protocolData.totalValueLocked += totalDeposited - totalBorrowed;
        protocolData.totalFees += borrowFees;
        protocolData.supplySideRevenue += supplySideRevenue;
        protocolData.protocolRevenue += protocolRevenue;

        // chains breakdown
        protocolData.breakdown[marketConfig.chain][reserve.token.address].totalAssetDeposited += totalDeposited;
        (protocolData.breakdown[marketConfig.chain][reserve.token.address].totalSupplied as number) += totalDeposited;
        (protocolData.breakdown[marketConfig.chain][reserve.token.address].totalBorrowed as number) += totalBorrowed;
        protocolData.breakdown[marketConfig.chain][reserve.token.address].totalValueLocked +=
          totalDeposited - totalBorrowed;
        protocolData.breakdown[marketConfig.chain][reserve.token.address].totalFees += borrowFees;
        protocolData.breakdown[marketConfig.chain][reserve.token.address].supplySideRevenue += supplySideRevenue;
        protocolData.breakdown[marketConfig.chain][reserve.token.address].protocolRevenue += protocolRevenue;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
