import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { CurveusdProtocolConfig } from '../../../configs/protocols/curveusd';
import ERC20Abi from '../../../configs/abi/ERC20.json';
import LlammaAbi from '../../../configs/abi/curve/Llamma.json';
import CrvusdControllerAbi from '../../../configs/abi/curve/CrvUsdController.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';

export const CurveusdEvents = {
  Borrow: '0xe1979fe4c35e0cef342fef5668e2c8e7a7e9f5d5d1ca8fee0ac6c427fa4153af',
  Repay: '0x77c6871227e5d2dec8dadd5354f78453203e22e669cd0ec4c19d9a8c5edb31d0',
  RemoveCollateral: '0xe25410a4059619c9594dc6f022fe231b02aaea733f689e7ab0cd21b3d4d0eb54',
  Liquidate: '0x642dd4d37ddd32036b9797cec464c0045dd2118c549066ae6b0f88e32240c2d0',
};

export default class CurveusdAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.curveusd';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalBorrowed: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
      },
    };

    const curveusdConfig = this.protocolConfig as CurveusdProtocolConfig;

    const stablecoinPriceRaw = await this.services.oracle.getTokenPriceUsd({
      chain: curveusdConfig.stablecoin.chain,
      address: curveusdConfig.stablecoin.address,
      timestamp: options.timestamp,
    });
    const stablecoinPriceUsd = stablecoinPriceRaw ? Number(stablecoinPriceRaw) : 0;

    protocolData.breakdown[curveusdConfig.stablecoin.chain] = {};
    protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address] = {
      ...getInitialProtocolCoreMetrics(),
      totalBorrowed: 0,
      volumes: {
        borrow: 0,
        repay: 0,
      },
    };

    for (const llammaConfig of curveusdConfig.llammas) {
      if (llammaConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[llammaConfig.chain]) {
        protocolData.breakdown[llammaConfig.chain] = {};
      }
      if (!protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address]) {
        protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            deposit: 0,
            withdraw: 0,
            liquidation: 0,
          },
        };
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        llammaConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        llammaConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        llammaConfig.chain,
        options.endTime,
      );

      const [total_debt, rate, price_oracle, balance] = await this.services.blockchain.evm.multicall({
        chain: llammaConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: CrvusdControllerAbi,
            target: llammaConfig.controller,
            method: 'total_debt',
            params: [],
          },
          {
            abi: LlammaAbi,
            target: llammaConfig.amm,
            method: 'rate',
            params: [],
          },
          {
            abi: LlammaAbi,
            target: llammaConfig.amm,
            method: 'price_oracle',
            params: [],
          },
          {
            abi: ERC20Abi,
            target: llammaConfig.collateral.address,
            method: 'balanceOf',
            params: [llammaConfig.amm],
          },
        ],
      });

      // https://docs.curve.fi/crvUSD/amm/#rate
      const borrowRate = formatBigNumberToNumber(rate.toString(), 18) * TimeUnits.SecondsPerYear;
      const totalBorrowedUsd =
        formatBigNumberToNumber(total_debt.toString(), curveusdConfig.stablecoin.decimals) * stablecoinPriceUsd;
      const borrowFees = (totalBorrowedUsd * borrowRate) / TimeUnits.DaysPerYear;

      const collateralPriceOracle = formatBigNumberToNumber(price_oracle.toString(), 18);
      const collateralBalanceUsd =
        formatBigNumberToNumber(balance.toString(), llammaConfig.collateral.decimals) * collateralPriceOracle;

      protocolData.totalAssetDeposited += collateralBalanceUsd;
      protocolData.totalValueLocked += collateralBalanceUsd;
      (protocolData.totalBorrowed as number) += totalBorrowedUsd;
      protocolData.totalFees += borrowFees;
      protocolData.protocolRevenue += borrowFees;

      // stablecoin
      protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address].totalFees +=
        borrowFees;
      protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address].protocolRevenue +=
        borrowFees;
      (protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address]
        .totalBorrowed as number) += totalBorrowedUsd;

      // collateral
      protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address].totalAssetDeposited +=
        collateralBalanceUsd;
      protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address].totalValueLocked +=
        collateralBalanceUsd;

      const controllerLogs = await this.services.blockchain.evm.getContractLogs({
        chain: llammaConfig.chain,
        address: llammaConfig.controller,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of controllerLogs) {
        const signature = log.topics[0];
        if (Object.values(CurveusdEvents).includes(signature)) {
          const event: any = decodeEventLog({
            abi: CrvusdControllerAbi,
            topics: log.topics,
            data: log.data,
          });
          switch (signature) {
            case CurveusdEvents.Borrow: {
              const debtAmountUsd =
                formatBigNumberToNumber(event.args.loan_increase.toString(), curveusdConfig.stablecoin.decimals) *
                stablecoinPriceUsd;
              const collateralAmountUsd =
                formatBigNumberToNumber(event.args.collateral_increase.toString(), llammaConfig.collateral.decimals) *
                collateralPriceOracle;

              (protocolData.volumes.borrow as number) += debtAmountUsd;
              (protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address].volumes
                .borrow as number) += debtAmountUsd;
              (protocolData.volumes.deposit as number) += collateralAmountUsd;
              (protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address].volumes.deposit as number) +=
                collateralAmountUsd;

              break;
            }
            case CurveusdEvents.Repay: {
              const debtAmountUsd =
                formatBigNumberToNumber(event.args.loan_decrease.toString(), curveusdConfig.stablecoin.decimals) *
                stablecoinPriceUsd;
              const collateralAmountUsd =
                formatBigNumberToNumber(event.args.collateral_decrease.toString(), llammaConfig.collateral.decimals) *
                collateralPriceOracle;

              (protocolData.volumes.repay as number) += debtAmountUsd;
              (protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address].volumes
                .repay as number) += debtAmountUsd;
              (protocolData.volumes.withdraw as number) += collateralAmountUsd;
              (protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address].volumes
                .withdraw as number) += collateralAmountUsd;

              break;
            }
            case CurveusdEvents.RemoveCollateral: {
              const collateralAmountUsd =
                formatBigNumberToNumber(event.args.collateral_decrease.toString(), llammaConfig.collateral.decimals) *
                collateralPriceOracle;

              (protocolData.volumes.withdraw as number) += collateralAmountUsd;
              (protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address].volumes
                .withdraw as number) += collateralAmountUsd;

              break;
            }
            case CurveusdEvents.Liquidate: {
              const debtAmountUsd =
                formatBigNumberToNumber(event.args.debt.toString(), curveusdConfig.stablecoin.decimals) *
                stablecoinPriceUsd;
              const collateralAmountUsd =
                formatBigNumberToNumber(event.args.collateral_received.toString(), llammaConfig.collateral.decimals) *
                collateralPriceOracle;

              (protocolData.volumes.repay as number) += debtAmountUsd;
              (protocolData.breakdown[curveusdConfig.stablecoin.chain][curveusdConfig.stablecoin.address].volumes
                .repay as number) += debtAmountUsd;
              (protocolData.volumes.liquidation as number) += collateralAmountUsd;
              (protocolData.breakdown[llammaConfig.chain][llammaConfig.collateral.address].volumes
                .liquidation as number) += collateralAmountUsd;

              break;
            }
          }
        }
      }
    }

    protocolData.moneyFlowIn = (protocolData.volumes.deposit as number) + (protocolData.volumes.repay as number);
    protocolData.moneyFlowOut =
      (protocolData.volumes.withdraw as number) +
      (protocolData.volumes.borrow as number) +
      (protocolData.volumes.liquidation as number);
    protocolData.moneyFlowNet = protocolData.moneyFlowIn - protocolData.moneyFlowOut;
    for (const value of Object.values(protocolData.volumes)) {
      protocolData.totalVolume += value;
    }

    // process tokens breakdown
    for (const [chain, tokens] of Object.entries(protocolData.breakdown)) {
      for (const [address, token] of Object.entries(tokens)) {
        protocolData.breakdown[chain][address].moneyFlowIn =
          (token.volumes.deposit as number) + (token.volumes.repay as number);
        protocolData.breakdown[chain][address].moneyFlowOut =
          (token.volumes.withdraw as number) + (token.volumes.borrow as number) + (token.volumes.liquidation as number);
        protocolData.breakdown[chain][address].moneyFlowNet = token.moneyFlowIn - token.moneyFlowOut;
        for (const value of Object.values(token.volumes)) {
          protocolData.breakdown[chain][address].totalVolume += value;
        }
      }
    }

    return protocolData;
  }
}
