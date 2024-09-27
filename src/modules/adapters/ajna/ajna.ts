import { AjnaProtocolConfigs } from '../../../configs/protocols/ajna';
import logger from '../../../lib/logger';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AjnaErc20FactoryAbi from '../../../configs/abi/ajna/ERC20Factory.json';
import AjnaErc20PoolAbi from '../../../configs/abi/ajna/ERC20Pool.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';
import { TimeUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';

export const AjnaPoolEvents = {
  AddQuoteToken: '0x8b24a9808cf05d3d8e48ac09e4f649054994a88cfa657b3f4bf340b62137df1e',
  RemoveQuoteToken: '0x0130a7b525bd6b1e72def1ee0b77f3467028a0e958e30174a0c95eb3860fc221',
  DrawDebt: '0x49a2aab2f4f7ca5c6ba6d413b46a0a09d91d10188fd94b8e23c3225362d12b50',
  RepayDebt: '0xef9d6dc34b1e6893b8746b03ac07fd084909654a5cedab240265a8d1bd584dc2',
  AddCollateral: '0xa9387d09ded47dbc173eb751964c0c7b7e0a1165939b958fafc8109337597f94',
  RemoveCollateral: '0x90895bc82397742e0cea4685e72279103862a03bee6bbe1d71265c7aeb111527',
  Take: '0x4591b2dfbebff121b3ccd19ae2407e59a9cefd959b35e12d82752cb5bc6eb757',
  Flashloan: '0x6b15284fe89dbd5c436c2e0b06b1bf72e3a0a8e96d1b4a2abd61dfae2d7849a6',
};

export default class AjnaAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ajna 👁';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    logger.info('getting ajna protocol data', {
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

    const ajnaConfig = this.protocolConfig as AjnaProtocolConfigs;
    for (const factoryConfig of ajnaConfig.poolFactories) {
      if (factoryConfig.birthday > options.timestamp) {
        // market was not deployed yet
        continue;
      }

      logger.debug('getting ajna factory pools data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        chain: factoryConfig.chain,
        factory: factoryConfig.factory,
      });

      if (!protocolData.breakdown[factoryConfig.chain]) {
        protocolData.breakdown[factoryConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.timestamp,
      );

      // get pool list
      const deployedPools = await this.services.blockchain.evm.readContract({
        chain: factoryConfig.chain,
        abi: AjnaErc20FactoryAbi,
        target: factoryConfig.factory,
        method: 'getDeployedPoolsList',
        params: [],
        blockNumber: blockNumber,
      });

      if (deployedPools) {
        for (const poolAddress of deployedPools) {
          const [
            collateralAddress,
            quoteTokenAddress,
            depositSize,
            [debtInfo, , ,],
            [inflatorInfo],
            [interestRateInfo],
            pledgedCollateral,
          ] = await this.services.blockchain.evm.multicall({
            chain: factoryConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'collateralAddress',
                params: [],
              },
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'quoteTokenAddress',
                params: [],
              },
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'depositSize',
                params: [],
              },
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'debtInfo',
                params: [],
              },
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'inflatorInfo',
                params: [],
              },
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'interestRateInfo',
                params: [],
              },
              {
                abi: AjnaErc20PoolAbi,
                target: poolAddress,
                method: 'pledgedCollateral',
                params: [],
              },
            ],
          });

          if (collateralAddress && quoteTokenAddress) {
            const debtToken = await this.services.blockchain.evm.getTokenInfo({
              chain: factoryConfig.chain,
              address: quoteTokenAddress,
            });
            const collateralToken = await this.services.blockchain.evm.getTokenInfo({
              chain: factoryConfig.chain,
              address: collateralAddress,
            });
            if (debtToken && collateralToken) {
              if (!protocolData.breakdown[debtToken.chain][debtToken.address]) {
                protocolData.breakdown[debtToken.chain][debtToken.address] = {
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
              if (!protocolData.breakdown[collateralToken.chain][collateralToken.address]) {
                protocolData.breakdown[collateralToken.chain][collateralToken.address] = {
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

              const debtTokenPrice = await this.services.oracle.getTokenPriceUsdRounded({
                chain: factoryConfig.chain,
                address: debtToken.address,
                timestamp: options.timestamp,
              });
              const collateralTokenPrice = await this.services.oracle.getTokenPriceUsdRounded({
                chain: factoryConfig.chain,
                address: collateralToken.address,
                timestamp: options.timestamp,
              });

              // totalBorrowed = debtInfo * inflatorInfo
              // NOTE debtInfo has 18 decimal places
              const totalBorrowed =
                formatBigNumberToNumber(
                  new BigNumber(debtInfo.toString()).multipliedBy(new BigNumber(inflatorInfo.toString())).toString(10),
                  36,
                ) * debtTokenPrice;

              // totalDeposited
              // NOTE pledgedCollateral has 18 decimal places
              const totalDeposited = formatBigNumberToNumber(depositSize.toString(), 18) * debtTokenPrice;
              const totalCollateralDeposited =
                formatBigNumberToNumber(pledgedCollateral.toString(), 18) * collateralTokenPrice;

              // 1e18
              const rateBorrow = formatBigNumberToNumber(interestRateInfo.toString(10), 18);

              // borrow fees in 24 hours
              const borrowFees = (totalBorrowed * rateBorrow) / TimeUnits.DaysPerYear;

              protocolData.totalAssetDeposited += totalDeposited + totalCollateralDeposited;
              (protocolData.totalSupplied as number) += totalDeposited;
              (protocolData.totalBorrowed as number) += totalBorrowed;
              protocolData.totalValueLocked += totalDeposited + totalCollateralDeposited - totalBorrowed;
              protocolData.totalFees += borrowFees;
              protocolData.supplySideRevenue += borrowFees;

              protocolData.breakdown[factoryConfig.chain][debtToken.address].totalAssetDeposited += totalDeposited;
              (protocolData.breakdown[factoryConfig.chain][debtToken.address].totalSupplied as number) +=
                totalDeposited;
              (protocolData.breakdown[factoryConfig.chain][debtToken.address].totalBorrowed as number) += totalBorrowed;
              protocolData.breakdown[factoryConfig.chain][debtToken.address].totalValueLocked +=
                totalDeposited - totalBorrowed;
              protocolData.breakdown[factoryConfig.chain][debtToken.address].totalFees += borrowFees;
              protocolData.breakdown[factoryConfig.chain][debtToken.address].supplySideRevenue += borrowFees;

              protocolData.breakdown[factoryConfig.chain][collateralToken.address].totalAssetDeposited +=
                totalCollateralDeposited;
              protocolData.breakdown[factoryConfig.chain][collateralToken.address].totalValueLocked +=
                totalCollateralDeposited;

              // query logs from whitelisted pools only
              for (const whitelisedPool of factoryConfig.whitelistedPools) {
                if (compareAddress(whitelisedPool, poolAddress)) {
                  const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
                    factoryConfig.chain,
                    options.beginTime,
                  );
                  const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
                    factoryConfig.chain,
                    options.endTime,
                  );

                  const poolContractLogs = await this.services.blockchain.evm.getContractLogs({
                    chain: factoryConfig.chain,
                    address: poolAddress,
                    fromBlock: beginBlock,
                    toBlock: endBlock,
                  });

                  for (const log of poolContractLogs) {
                    const signature = log.topics[0];

                    if (Object.values(AjnaPoolEvents).includes(signature)) {
                      const event: any = decodeEventLog({
                        abi: AjnaErc20PoolAbi,
                        topics: log.topics,
                        data: log.data,
                      });

                      switch (signature) {
                        case AjnaPoolEvents.AddQuoteToken: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          (protocolData.volumes.deposit as number) += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.deposit as number) +=
                            amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RemoveQuoteToken: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          (protocolData.volumes.withdraw as number) += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.withdraw as number) +=
                            amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.AddCollateral: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (protocolData.volumes.deposit as number) += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][collateralToken.address].volumes
                            .deposit as number) += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RemoveCollateral: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (protocolData.volumes.withdraw as number) += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][collateralToken.address].volumes
                            .withdraw as number) += amountUsd;
                          amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.DrawDebt: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amountBorrowed.toString(), debtToken.decimals) *
                            debtTokenPrice;
                          (protocolData.volumes.borrow as number) += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.borrow as number) +=
                            amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RepayDebt: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.quoteRepaid.toString(), debtToken.decimals) *
                            debtTokenPrice;
                          (protocolData.volumes.repay as number) += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.repay as number) +=
                            amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.Take: {
                          const repayAmountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          (protocolData.volumes.repay as number) += repayAmountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.repay as number) +=
                            repayAmountUsd;

                          const collateralAmountUsd =
                            formatBigNumberToNumber(event.args.collateral.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                          (protocolData.breakdown[factoryConfig.chain][collateralToken.address].volumes
                            .liquidation as number) += collateralAmountUsd;
                          break;
                        }
                      }
                    }
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
