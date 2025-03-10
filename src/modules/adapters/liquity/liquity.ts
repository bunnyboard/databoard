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
import CollateralRegistryAbi from '../../../configs/abi/liquity/CollateralRegistry.json';
import TroveManagerV2Abi from '../../../configs/abi/liquity/TroveManagerV2.json';
import StabilityPoolAbi from '../../../configs/abi/liquity/StabilityPoolV2.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { TimeUnits } from '../../../configs/constants';

export const v1Events = {
  // BorrowOperations
  TroveUpdated: '0xc3770d654ed33aeea6bf11ac8ef05d02a6a04ed4686dd2f624d853bbec43cc8b',
  LUSDBorrowingFeePaid: '0xa55c5f48fd29482ad55f4b59bf070cd1ac1a7132a31f7a136ebe8877ae37e1ff',

  // TroveManager
  Redemption: '0x43a3f4082a4dbc33d78e317d2497d3a730bc7fc3574159dcea1056e62e5d9ad8',
  TroveLiquidated: '0xea67486ed7ebe3eea8ab3390efd4a3c8aae48be5bea27df104a8af786c408434',

  // StabilityPool
  ETHGainWithdrawn: '0x51457222ebca92c335c9c86e2baa1cc0e40ffaa9084a51452980d5ba8dec2f63',
  LQTYPaidToDepositor: '0x2608b986a6ac0f6c629ca37018e80af5561e366252ae93602a96d3ab2e73e42d',
  LQTYPaidToFrontEnd: '0xcd2cdc1a4af71051394e9c6facd9a266b2ac5bd65d219a701eeda009f47682bf',
};

export const v2Events = {
  TroveOperation: '0x962110f281c1213763cd97a546b337b3cbfd25a31ea9723e9d8b7376ba45da1a',
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
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      // total stablecoins staking in stability pool
      totalSupplied: 0,

      // total stablecoins borrowed
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

    // get v1 data
    if (liquityConfig.v1Pools) {
      for (const v1Config of liquityConfig.v1Pools) {
        if (!protocolData.breakdown[v1Config.chain]) {
          protocolData.breakdown[v1Config.chain] = {};
        }
        if (!protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)]) {
          protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            totalBorrowed: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              repay: 0,
              redeemtion: 0,
            },
          };
        }
        if (!protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)]) {
          protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              deposit: 0,
              withdraw: 0,
              liquidation: 0,
            },
          };
        }

        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          v1Config.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          v1Config.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          v1Config.chain,
          options.endTime,
        );

        const [totalDebt, totalColl] = await this.services.blockchain.evm.multicall({
          chain: v1Config.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: BorrowOperationsAbi,
              target: v1Config.borrowOperations,
              method: 'getEntireSystemDebt',
              params: [],
            },
            {
              abi: BorrowOperationsAbi,
              target: v1Config.borrowOperations,
              method: 'getEntireSystemColl',
              params: [],
            },
          ],
        });

        const debtPrice = await this.services.oracle.getTokenPriceUsdRounded({
          chain: v1Config.stablecoin.chain,
          address: v1Config.stablecoin.address,
          timestamp: options.timestamp,
        });
        const collateralPrice = await this.services.oracle.getTokenPriceUsdRounded({
          chain: v1Config.collateral.chain,
          address: v1Config.collateral.address,
          timestamp: options.timestamp,
        });

        const totalBorrowedUsd = debtPrice ? formatBigNumberToNumber(totalDebt.toString(), 18) * debtPrice : 0;
        const totalCollateralUsd = collateralPrice
          ? formatBigNumberToNumber(totalColl.toString(), 18) * collateralPrice
          : 0;

        protocolData.totalAssetDeposited += totalCollateralUsd;
        protocolData.totalValueLocked += totalCollateralUsd;
        (protocolData.totalBorrowed as number) += totalBorrowedUsd;
        protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].totalAssetDeposited +=
          totalCollateralUsd;
        protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].totalValueLocked +=
          totalCollateralUsd;
        (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)]
          .totalBorrowed as number) += totalBorrowedUsd;

        const operationLogs = await this.services.blockchain.evm.getContractLogs({
          chain: v1Config.chain,
          address: v1Config.borrowOperations,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        const troveManagerLogs = await this.services.blockchain.evm.getContractLogs({
          chain: v1Config.chain,
          address: v1Config.troveManager,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of operationLogs) {
          const signature = log.topics[0];
          if (signature === v1Events.LUSDBorrowingFeePaid || signature === v1Events.TroveUpdated) {
            const event: any = decodeEventLog({
              abi: BorrowOperationsAbi,
              topics: log.topics,
              data: log.data,
            });

            if (signature === v1Events.LUSDBorrowingFeePaid) {
              const feeUsd = debtPrice
                ? formatBigNumberToNumber(event.args._LUSDFee.toString(), 18) * Number(debtPrice)
                : 0;

              protocolData.totalFees += feeUsd;
              protocolData.protocolRevenue += feeUsd;
              protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].totalFees += feeUsd;
              protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].protocolRevenue +=
                feeUsd;
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
                (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].volumes
                  .borrow as number) += debtAmountUsd;
                (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].volumes
                  .deposit as number) += debtAmountUsd;
              } else if (operation === 1) {
                // close trove
                (protocolData.volumes.repay as number) += debtAmountUsd;
                (protocolData.volumes.withdraw as number) += collateralAmountUsd;
                (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].volumes
                  .repay as number) += debtAmountUsd;
                (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].volumes
                  .withdraw as number) += debtAmountUsd;
              } else {
                // update trove
                const troveInfo = await this.getTroveState(
                  v1Config.chain,
                  v1Config.troveManager,
                  event,
                  Number(log.blockNumber),
                );

                const amountUsd = debtPrice ? troveInfo.debtAmount * Number(debtPrice) : 0;
                const collateralUsd = collateralPrice ? troveInfo.collAmount * Number(collateralPrice) : 0;

                if (troveInfo.isBorrow) {
                  (protocolData.volumes.borrow as number) += amountUsd;
                  (protocolData.volumes.deposit as number) += collateralUsd;
                  (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].volumes
                    .borrow as number) += amountUsd;
                  (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].volumes
                    .deposit as number) += collateralUsd;
                } else {
                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.volumes.withdraw as number) += collateralUsd;
                  (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].volumes
                    .repay as number) += amountUsd;
                  (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].volumes
                    .withdraw as number) += collateralUsd;
                }
              }
            }
          }
        }
        for (const log of troveManagerLogs) {
          if (log.topics[0] === v1Events.TroveLiquidated) {
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
          } else if (log.topics[0] === v1Events.Redemption) {
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
            protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].totalFees += feesUsd;
            protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].protocolRevenue +=
              feesUsd;

            (protocolData.volumes.redeemtion as number) += amountUsd;
            (protocolData.volumes.withdraw as number) += collateralUsd;
            (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].volumes
              .redeemtion as number) += amountUsd;
            (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.collateral.address)].volumes
              .withdraw as number) += collateralUsd;
          }
        }

        // get stability pool data
        if (v1Config.stabilityPool) {
          const getBalance = await this.getAddressBalanceUsd({
            chain: v1Config.chain,
            ownerAddress: v1Config.stabilityPool,
            tokens: [v1Config.stablecoin],
            timestamp: options.timestamp,
            blockNumber: blockNumber,
          });

          protocolData.totalAssetDeposited += getBalance.totalBalanceUsd;
          protocolData.totalValueLocked += getBalance.totalBalanceUsd;
          (protocolData.totalSupplied as number) += getBalance.totalBalanceUsd;
          protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].totalAssetDeposited +=
            getBalance.totalBalanceUsd;
          protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)].totalValueLocked +=
            getBalance.totalBalanceUsd;
          (protocolData.breakdown[v1Config.chain][normalizeAddress(v1Config.stablecoin.address)]
            .totalSupplied as number) += getBalance.totalBalanceUsd;
        }
      }
    }

    if (liquityConfig.v2Pools) {
      for (const v2Config of liquityConfig.v2Pools) {
        if (!protocolData.breakdown[v2Config.chain]) {
          protocolData.breakdown[v2Config.chain] = {};
        }
        if (!protocolData.breakdown[v2Config.chain][normalizeAddress(v2Config.stablecoin.address)]) {
          protocolData.breakdown[v2Config.chain][normalizeAddress(v2Config.stablecoin.address)] = {
            ...getInitialProtocolCoreMetrics(),
            totalBorrowed: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              repay: 0,
              redeemtion: 0,
            },
          };
        }

        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          v2Config.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          v2Config.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          v2Config.chain,
          options.endTime,
        );

        const boldPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: v2Config.stablecoin.chain,
          address: v2Config.stablecoin.address,
          timestamp: options.timestamp,
        });

        const totalCollaterals = await this.services.blockchain.evm.readContract({
          chain: v2Config.chain,
          abi: CollateralRegistryAbi,
          target: v2Config.collateralRegistry,
          method: 'totalCollaterals',
          params: [],
          blockNumber: blockNumber,
        });
        for (let i = 0; i < Number(totalCollaterals); i++) {
          const [tokenAddress, troveManager] = await this.services.blockchain.evm.multicall({
            chain: v2Config.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: CollateralRegistryAbi,
                target: v2Config.collateralRegistry,
                method: 'getToken',
                params: [i],
              },
              {
                abi: CollateralRegistryAbi,
                target: v2Config.collateralRegistry,
                method: 'getTroveManager',
                params: [i],
              },
            ],
          });
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: v2Config.chain,
            address: tokenAddress,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const [getEntireSystemDebt, getEntireSystemColl, stabilityPool, getTroveIdsCount] =
              await this.services.blockchain.evm.multicall({
                chain: v2Config.chain,
                blockNumber: blockNumber,
                calls: [
                  {
                    abi: TroveManagerV2Abi,
                    target: troveManager,
                    method: 'getEntireSystemDebt',
                    params: [],
                  },
                  {
                    abi: TroveManagerV2Abi,
                    target: troveManager,
                    method: 'getEntireSystemColl',
                    params: [],
                  },
                  {
                    abi: TroveManagerV2Abi,
                    target: troveManager,
                    method: 'stabilityPool',
                    params: [],
                  },
                  {
                    abi: TroveManagerV2Abi,
                    target: troveManager,
                    method: 'getTroveIdsCount',
                    params: [],
                  },
                ],
              });

            const getTotalBoldDeposits = await this.services.blockchain.evm.readContract({
              chain: v2Config.chain,
              abi: StabilityPoolAbi,
              target: stabilityPool,
              method: 'getTotalBoldDeposits',
              params: [],
              blockNumber: blockNumber,
            });

            const totalDebtUsd =
              formatBigNumberToNumber(
                getEntireSystemDebt ? getEntireSystemDebt.toString() : '0',
                v2Config.stablecoin.decimals,
              ) * boldPriceUsd;
            const totalCollUsd =
              formatBigNumberToNumber(getEntireSystemColl ? getEntireSystemColl.toString() : '0', token.decimals) *
              tokenPriceUsd;
            const totalBoldStakedUsd =
              formatBigNumberToNumber(
                getTotalBoldDeposits ? getTotalBoldDeposits.toString() : '0',
                v2Config.stablecoin.decimals,
              ) * boldPriceUsd;

            const getTroveIdCalls: Array<ContractCall> = [];
            for (let i = 0; i < Number(getTroveIdsCount); i++) {
              getTroveIdCalls.push({
                abi: TroveManagerV2Abi,
                target: troveManager,
                method: 'getTroveFromTroveIdsArray',
                params: [i],
              });
            }
            const troveIds = await this.services.blockchain.evm.multicall({
              chain: v2Config.chain,
              blockNumber: blockNumber,
              calls: getTroveIdCalls,
            });

            if (troveIds) {
              const getTroveCalls: Array<ContractCall> = troveIds.map((troveId: any) => {
                return {
                  abi: TroveManagerV2Abi,
                  target: troveManager,
                  method: 'getLatestTroveData',
                  params: [troveId.toString()],
                };
              });
              const troves = await this.services.blockchain.evm.multicall({
                chain: v2Config.chain,
                blockNumber: blockNumber,
                calls: getTroveCalls,
              });
              if (troves) {
                for (const trove of troves) {
                  const recordedDebt = formatBigNumberToNumber(trove.recordedDebt.toString(), 18);
                  const annualInterestRate = formatBigNumberToNumber(trove.annualInterestRate.toString(), 18);
                  const borrowFees = ((recordedDebt * annualInterestRate) / TimeUnits.DaysPerYear) * boldPriceUsd;

                  // https://docs.liquity.org/v2-faq/bold-and-earn#where-does-the-yield-for-earn-come-from
                  const suppySideRevenue = borrowFees * 0.75;
                  const protocolRevenue = borrowFees - suppySideRevenue;

                  protocolData.totalFees += borrowFees;
                  protocolData.supplySideRevenue += suppySideRevenue;
                  protocolData.protocolRevenue += protocolRevenue;
                  protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].totalFees +=
                    borrowFees;
                  protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].supplySideRevenue +=
                    suppySideRevenue;
                  protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].protocolRevenue +=
                    protocolRevenue;
                }
              }
            }

            protocolData.totalAssetDeposited += totalCollUsd;
            protocolData.totalValueLocked += totalCollUsd;
            (protocolData.totalSupplied as number) += totalBoldStakedUsd;
            (protocolData.totalBorrowed as number) += totalDebtUsd;
            (protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].totalSupplied as number) +=
              totalBoldStakedUsd;
            (protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].totalBorrowed as number) +=
              totalDebtUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  deposit: 0,
                  withdraw: 0,
                  liquidation: 0,
                },
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalCollUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalCollUsd;

            const logs = await this.services.blockchain.evm.getContractLogs({
              chain: v2Config.chain,
              address: troveManager,
              fromBlock: beginBlock,
              toBlock: endBlock,
            });
            for (const log of logs.filter((log) => log.topics[0] === v2Events.TroveOperation)) {
              const event: any = decodeEventLog({
                abi: TroveManagerV2Abi,
                topics: log.topics,
                data: log.data,
              });

              const debtChangeFromOperation =
                formatBigNumberToNumber(event.args._debtChangeFromOperation.toString(), v2Config.stablecoin.decimals) *
                boldPriceUsd;
              const collChangeFromOperation =
                formatBigNumberToNumber(event.args._collChangeFromOperation.toString(), token.decimals) * tokenPriceUsd;

              if (debtChangeFromOperation < 0) {
                (protocolData.volumes.repay as number) += Math.abs(debtChangeFromOperation);
                (protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].volumes
                  .repay as number) += Math.abs(debtChangeFromOperation);
              } else {
                (protocolData.volumes.borrow as number) += Math.abs(debtChangeFromOperation);
                (protocolData.breakdown[v2Config.stablecoin.chain][v2Config.stablecoin.address].volumes
                  .borrow as number) += Math.abs(debtChangeFromOperation);
              }

              if (collChangeFromOperation < 0) {
                (protocolData.volumes.withdraw as number) += Math.abs(collChangeFromOperation);
                (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) +=
                  Math.abs(collChangeFromOperation);
              } else {
                (protocolData.volumes.deposit as number) += Math.abs(collChangeFromOperation);
                (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) +=
                  Math.abs(collChangeFromOperation);
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
