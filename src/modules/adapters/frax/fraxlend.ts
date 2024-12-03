import { FraxlendProtocolConfig } from '../../../configs/protocols/fraxlend';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import FraxlendPairAbi from '../../../configs/abi/frax/FraxlendPair.json';
import FraxlendPairV2Abi from '../../../configs/abi/frax/FraxlendPairV2.json';
import FraxlendPairDeployerAbi from '../../../configs/abi/frax/FraxlendPairDeployer.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';

const FraxPairEvents = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  BorrowAsset: '0x01348584ec81ac7acd52b7d66d9ade986dd909f3d513881c190fc31c90527efe',
  RepayAsset: '0x9dc1449a0ff0c152e18e8289d865b47acc6e1b76b1ecb239c13d6ee22a9206a7',
  AddCollateral: '0xa32435755c235de2976ed44a75a2f85cb01faf0c894f639fe0c32bb9455fea8f',
  RemoveCollateral: '0xbc290bb45104f73cf92115c9603987c3f8fd30c182a13603d8cffa49b5f59952',
  Liquidate: '0x35f432a64bd3767447a456650432406c6cacb885819947a202216eeea6820ecf',
};

export default class FraxlendAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.fraxlend 🏦';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
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
      },
    };

    const fraxlendConfig = this.protocolConfig as FraxlendProtocolConfig;
    for (const factoryConfig of fraxlendConfig.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[factoryConfig.chain]) {
        protocolData.breakdown[factoryConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.endTime,
      );

      const allPairAddresses = await this.services.blockchain.evm.readContract({
        chain: factoryConfig.chain,
        abi: FraxlendPairDeployerAbi,
        target: factoryConfig.factory,
        method: 'getAllPairAddresses',
        params: [],
        blockNumber: blockNumber,
      });

      for (const pairAddress of allPairAddresses) {
        for (const whitelistedPair of factoryConfig.whitelistedPairs) {
          if (compareAddress(whitelistedPair, pairAddress)) {
            const [asset, collateralContract, totalAsset, totalBorrow, totalCollateral, currentRateInfo] =
              await this.services.blockchain.evm.multicall({
                chain: factoryConfig.chain,
                blockNumber: blockNumber,
                calls: [
                  {
                    abi: FraxlendPairAbi,
                    target: pairAddress,
                    method: 'asset',
                    params: [],
                  },
                  {
                    abi: FraxlendPairAbi,
                    target: pairAddress,
                    method: 'collateralContract',
                    params: [],
                  },
                  {
                    abi: FraxlendPairAbi,
                    target: pairAddress,
                    method: 'totalAsset',
                    params: [],
                  },
                  {
                    abi: FraxlendPairAbi,
                    target: pairAddress,
                    method: 'totalBorrow',
                    params: [],
                  },
                  {
                    abi: FraxlendPairAbi,
                    target: pairAddress,
                    method: 'totalCollateral',
                    params: [],
                  },
                  {
                    abi: factoryConfig.fraxlendPairVersion === 1 ? FraxlendPairAbi : FraxlendPairV2Abi,
                    target: pairAddress,
                    method: 'currentRateInfo',
                    params: [],
                  },
                ],
              });

            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: factoryConfig.chain,
              address: asset,
            });
            const collateral = await this.services.blockchain.evm.getTokenInfo({
              chain: factoryConfig.chain,
              address: collateralContract,
            });
            if (token && collateral) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: factoryConfig.chain,
                address: token.address,
                timestamp: options.timestamp,
              });

              const collateralPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: factoryConfig.chain,
                address: collateral.address,
                timestamp: options.timestamp,
              });

              const totalDepositedUsd =
                formatBigNumberToNumber(totalAsset[0].toString(), token.decimals) * tokenPriceUsd;
              const totalBorrowededUsd =
                formatBigNumberToNumber(totalBorrow[0].toString(), token.decimals) * tokenPriceUsd;
              const totalCollateralDepositedUsd =
                formatBigNumberToNumber(totalCollateral.toString(), collateral.decimals) * collateralPriceUsd;

              // RatePerSec * SecondsPerYear
              const borrowRate = formatBigNumberToNumber(currentRateInfo[3].toString(), 18) * TimeUnits.SecondsPerYear;
              const protocolFeeRate = formatBigNumberToNumber(currentRateInfo[1].toString(), 5);

              const borrowFees = (totalBorrowededUsd * borrowRate) / TimeUnits.DaysPerYear;
              const protocolRevenue = borrowFees * protocolFeeRate;
              const supplySideRevenue = borrowFees - protocolRevenue;

              protocolData.totalAssetDeposited += totalDepositedUsd + totalCollateralDepositedUsd;
              protocolData.totalValueLocked += totalDepositedUsd + totalCollateralDepositedUsd - totalBorrowededUsd;
              (protocolData.totalSupplied as number) += totalDepositedUsd;
              (protocolData.totalBorrowed as number) += totalBorrowededUsd;
              protocolData.totalFees += borrowFees;
              protocolData.supplySideRevenue += supplySideRevenue;
              protocolData.protocolRevenue += protocolRevenue;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
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
              if (!protocolData.breakdown[collateral.chain][collateral.address]) {
                protocolData.breakdown[collateral.chain][collateral.address] = {
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

              // asset
              protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
              (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
              (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowededUsd;
              protocolData.breakdown[token.chain][token.address].totalValueLocked +=
                totalDepositedUsd - totalBorrowededUsd;

              // colllateral
              protocolData.breakdown[collateral.chain][collateral.address].totalAssetDeposited +=
                totalCollateralDepositedUsd;
              protocolData.breakdown[collateral.chain][collateral.address].totalValueLocked +=
                totalCollateralDepositedUsd;

              const logs = await this.services.blockchain.evm.getContractLogs({
                chain: factoryConfig.chain,
                address: pairAddress,
                fromBlock: beginBlock,
                toBlock: endBlock,
              });
              for (const log of logs) {
                const signature = log.topics[0];
                if (Object.values(FraxPairEvents).includes(signature)) {
                  const event: any = decodeEventLog({
                    abi: factoryConfig.fraxlendPairVersion === 1 ? FraxlendPairAbi : FraxlendPairV2Abi,
                    topics: log.topics,
                    data: log.data,
                  });

                  let tokenAmountUsd = 0;
                  let collateralAmountUsd = 0;
                  if (signature === FraxPairEvents.Deposit || signature === FraxPairEvents.Withdraw) {
                    tokenAmountUsd =
                      formatBigNumberToNumber(event.args.assets.toString(), token.decimals) * tokenPriceUsd;
                  } else if (signature === FraxPairEvents.BorrowAsset) {
                    tokenAmountUsd =
                      formatBigNumberToNumber(event.args._borrowAmount.toString(), token.decimals) * tokenPriceUsd;
                  } else if (signature === FraxPairEvents.RepayAsset) {
                    if (event.args.amountToRepay) {
                      tokenAmountUsd =
                        formatBigNumberToNumber(event.args.amountToRepay.toString(), token.decimals) * tokenPriceUsd;
                    } else {
                      tokenAmountUsd =
                        formatBigNumberToNumber(event.args._amountToRepay.toString(), token.decimals) * tokenPriceUsd;
                    }
                  }

                  if (signature === FraxPairEvents.AddCollateral || signature === FraxPairEvents.RemoveCollateral) {
                    if (event.args.collateralAmount) {
                      collateralAmountUsd =
                        formatBigNumberToNumber(event.args.collateralAmount.toString(), collateral.decimals) *
                        collateralPriceUsd;
                    } else {
                      collateralAmountUsd =
                        formatBigNumberToNumber(event.args._collateralAmount.toString(), collateral.decimals) *
                        collateralPriceUsd;
                    }
                  }

                  switch (signature) {
                    case FraxPairEvents.Deposit: {
                      (protocolData.volumes.deposit as number) += tokenAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += tokenAmountUsd;
                      break;
                    }
                    case FraxPairEvents.Withdraw: {
                      (protocolData.volumes.withdraw as number) += tokenAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += tokenAmountUsd;
                      break;
                    }
                    case FraxPairEvents.AddCollateral: {
                      (protocolData.volumes.deposit as number) += collateralAmountUsd;
                      (protocolData.breakdown[collateral.chain][collateral.address].volumes.deposit as number) +=
                        collateralAmountUsd;
                      break;
                    }
                    case FraxPairEvents.RemoveCollateral: {
                      (protocolData.volumes.withdraw as number) += collateralAmountUsd;
                      (protocolData.breakdown[collateral.chain][collateral.address].volumes.withdraw as number) +=
                        collateralAmountUsd;
                      break;
                    }
                    case FraxPairEvents.BorrowAsset: {
                      (protocolData.volumes.borrow as number) += tokenAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.borrow as number) += tokenAmountUsd;
                      break;
                    }
                    case FraxPairEvents.RepayAsset: {
                      (protocolData.volumes.repay as number) += tokenAmountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += tokenAmountUsd;
                      break;
                    }
                  }

                  if (signature === FraxPairEvents.Liquidate) {
                    const repayAmountUsd =
                      formatBigNumberToNumber(event.args._amountLiquidatorToRepay.toString(), token.decimals) *
                      tokenPriceUsd;
                    const collateralAmountUsd =
                      formatBigNumberToNumber(event.args._collateralForLiquidator.toString(), collateral.decimals) *
                      collateralPriceUsd;

                    (protocolData.volumes.repay as number) += repayAmountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += tokenAmountUsd;

                    (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                    (protocolData.breakdown[collateral.chain][collateral.address].volumes.liquidation as number) +=
                      collateralAmountUsd;
                  }
                }
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
