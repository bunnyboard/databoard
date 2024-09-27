import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManager.json';
import BorrowOperationsAbi from '../../../configs/abi/liquity/BorrowOperations.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { LiquityProtocolConfig } from '../../../configs/protocols/liquity';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';

export const LiquityEvents = {
  // BorrowOperations
  TroveUpdated: '0xc3770d654ed33aeea6bf11ac8ef05d02a6a04ed4686dd2f624d853bbec43cc8b',
  LUSDBorrowingFeePaid: '0xa55c5f48fd29482ad55f4b59bf070cd1ac1a7132a31f7a136ebe8877ae37e1ff',

  // TroveManager
  Redemption: '0x43a3f4082a4dbc33d78e317d2497d3a730bc7fc3574159dcea1056e62e5d9ad8',
  TroveLiquidated: '0xea67486ed7ebe3eea8ab3390efd4a3c8aae48be5bea27df104a8af786c408434',
};

interface GetTroveStateInfo {
  debtAmount: number;
  collAmount: number;
  isBorrow: boolean;
}

export default class LiquityAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.liquity';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getTroveState(
    chain: string,
    troveManager: string,
    decodedEvent: any,
    blockNumber: number,
  ): Promise<GetTroveStateInfo> {
    const troveInfo = await this.services.blockchain.evm.readContract({
      chain: chain,
      target: troveManager,
      abi: TroveManagerAbi,
      method: 'Troves',
      params: [decodedEvent.args._borrower],
      blockNumber: blockNumber - 1,
    });

    const previousDebt = formatBigNumberToNumber(troveInfo[0].toString(), 18);
    const newDebt = formatBigNumberToNumber(decodedEvent.args._debt.toString(), 18);
    const previousColl = formatBigNumberToNumber(troveInfo[1].toString(), 18);
    const newColl = formatBigNumberToNumber(decodedEvent.args._coll.toString(), 18);

    return {
      debtAmount: Math.abs(newDebt - previousDebt),
      collAmount: Math.abs(newColl - previousColl),
      isBorrow: previousDebt < newDebt,
    };
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const liquityConfig = this.protocolConfig as LiquityProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [liquityConfig.chain]: {
          [normalizeAddress(liquityConfig.stablecoin.address)]: {
            ...getInitialProtocolCoreMetrics(),
            totalBorrowed: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              repay: 0,
              liquidation: 0,
              redeemtion: 0,
            },
          },
          [normalizeAddress(liquityConfig.collateral.address)]: {
            ...getInitialProtocolCoreMetrics(),
            totalBorrowed: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              repay: 0,
              liquidation: 0,
              redeemtion: 0,
            },
          },
        },
      },

      ...getInitialProtocolCoreMetrics(),
      totalBorrowed: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
        redeemtion: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      liquityConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      liquityConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      liquityConfig.chain,
      options.endTime,
    );

    const [totalDebt, totalColl] = await this.services.blockchain.evm.multicall({
      chain: liquityConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: BorrowOperationsAbi,
          target: liquityConfig.borrowOperations,
          method: 'getEntireSystemDebt',
          params: [],
        },
        {
          abi: BorrowOperationsAbi,
          target: liquityConfig.borrowOperations,
          method: 'getEntireSystemColl',
          params: [],
        },
      ],
    });

    const debtPrice = await this.services.oracle.getTokenPriceUsdRounded({
      chain: liquityConfig.stablecoin.chain,
      address: liquityConfig.stablecoin.address,
      timestamp: options.timestamp,
    });
    const collateralPrice = await this.services.oracle.getTokenPriceUsdRounded({
      chain: liquityConfig.collateral.chain,
      address: liquityConfig.collateral.address,
      timestamp: options.timestamp,
    });

    const totalBorrowedUsd = debtPrice ? formatBigNumberToNumber(totalDebt.toString(), 18) * debtPrice : 0;
    const totalCollateralUsd = collateralPrice
      ? formatBigNumberToNumber(totalColl.toString(), 18) * collateralPrice
      : 0;

    protocolData.totalAssetDeposited += totalCollateralUsd;
    protocolData.totalValueLocked += totalCollateralUsd;
    (protocolData.totalBorrowed as number) += totalBorrowedUsd;
    protocolData.breakdown[liquityConfig.chain][
      normalizeAddress(liquityConfig.collateral.address)
    ].totalAssetDeposited += totalCollateralUsd;
    protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.collateral.address)].totalValueLocked +=
      totalCollateralUsd;
    (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)]
      .totalBorrowed as number) += totalBorrowedUsd;

    const operationLogs = await this.services.blockchain.evm.getContractLogs({
      chain: liquityConfig.chain,
      address: liquityConfig.borrowOperations,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const troveManagerLogs = await this.services.blockchain.evm.getContractLogs({
      chain: liquityConfig.chain,
      address: liquityConfig.troveManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of operationLogs) {
      const signature = log.topics[0];
      if (signature === LiquityEvents.LUSDBorrowingFeePaid || signature === LiquityEvents.TroveUpdated) {
        const event: any = decodeEventLog({
          abi: BorrowOperationsAbi,
          topics: log.topics,
          data: log.data,
        });

        if (signature === LiquityEvents.LUSDBorrowingFeePaid) {
          const feeUsd = debtPrice
            ? formatBigNumberToNumber(event.args._LUSDFee.toString(), 18) * Number(debtPrice)
            : 0;

          protocolData.totalFees += feeUsd;
          protocolData.protocolRevenue += feeUsd;
          protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].totalFees +=
            feeUsd;
          protocolData.breakdown[liquityConfig.chain][
            normalizeAddress(liquityConfig.stablecoin.address)
          ].protocolRevenue += feeUsd;
        } else {
          const operation = Number(event.args._operation);

          const debtAmountUsd = debtPrice
            ? formatBigNumberToNumber(event.args._debt.toString(), 18) * Number(debtPrice)
            : 0;
          const collateralAmountUsd = collateralPrice
            ? formatBigNumberToNumber(event.args._coll.toString(), 18) * Number(collateralPrice)
            : 0;

          if (operation === 0) {
            // open trove
            (protocolData.volumes.borrow as number) += debtAmountUsd;
            (protocolData.volumes.deposit as number) += collateralAmountUsd;
            (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].volumes
              .borrow as number) += debtAmountUsd;
            (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.collateral.address)].volumes
              .deposit as number) += debtAmountUsd;
          } else if (operation === 1) {
            // close trove
            (protocolData.volumes.repay as number) += debtAmountUsd;
            (protocolData.volumes.withdraw as number) += collateralAmountUsd;
            (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].volumes
              .repay as number) += debtAmountUsd;
            (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.collateral.address)].volumes
              .withdraw as number) += debtAmountUsd;
          } else {
            // update trove
            const troveInfo = await this.getTroveState(
              liquityConfig.chain,
              liquityConfig.troveManager,
              event,
              Number(log.blockNumber),
            );

            const amountUsd = debtPrice ? troveInfo.debtAmount * Number(debtPrice) : 0;
            const collateralUsd = collateralPrice ? troveInfo.collAmount * Number(collateralPrice) : 0;

            if (troveInfo.isBorrow) {
              (protocolData.volumes.borrow as number) += amountUsd;
              (protocolData.volumes.deposit as number) += collateralUsd;
              (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].volumes
                .borrow as number) += amountUsd;
              (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.collateral.address)].volumes
                .deposit as number) += collateralUsd;
            } else {
              (protocolData.volumes.repay as number) += amountUsd;
              (protocolData.volumes.withdraw as number) += collateralUsd;
              (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].volumes
                .repay as number) += amountUsd;
              (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.collateral.address)].volumes
                .withdraw as number) += collateralUsd;
            }
          }
        }
      }
    }
    for (const log of troveManagerLogs) {
      if (log.topics[0] === LiquityEvents.TroveLiquidated) {
        const event: any = decodeEventLog({
          abi: TroveManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        const debtAmountUsd = debtPrice
          ? formatBigNumberToNumber(event.args._debt.toString(), 18) * Number(debtPrice)
          : 0;
        const collateralAmountUsd = collateralPrice
          ? formatBigNumberToNumber(event.args._coll.toString(), 18) * Number(collateralPrice)
          : 0;

        (protocolData.volumes.repay as number) += debtAmountUsd;
        (protocolData.volumes.liquidation as number) += collateralAmountUsd;
      } else if (log.topics[0] === LiquityEvents.Redemption) {
        const event: any = decodeEventLog({
          abi: TroveManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = debtPrice
          ? formatBigNumberToNumber(event.args._actualLUSDAmount.toString(), 18) * Number(debtPrice)
          : 0;
        const collateralUsd = collateralPrice
          ? formatBigNumberToNumber(event.args._ETHSent.toString(), 18) * Number(collateralPrice)
          : 0;
        const feesUsd = collateralPrice
          ? formatBigNumberToNumber(event.args._ETHFee.toString(), 18) * Number(collateralPrice)
          : 0;

        protocolData.totalFees += feesUsd;
        protocolData.protocolRevenue += feesUsd;
        protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].totalFees +=
          feesUsd;
        protocolData.breakdown[liquityConfig.chain][
          normalizeAddress(liquityConfig.stablecoin.address)
        ].protocolRevenue += feesUsd;

        (protocolData.volumes.redeemtion as number) += amountUsd;
        (protocolData.volumes.withdraw as number) += collateralUsd;
        (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.stablecoin.address)].volumes
          .redeemtion as number) += amountUsd;
        (protocolData.breakdown[liquityConfig.chain][normalizeAddress(liquityConfig.collateral.address)].volumes
          .withdraw as number) += collateralUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
