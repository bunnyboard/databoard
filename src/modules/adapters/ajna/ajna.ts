import { AjnaProtocolConfigs } from '../../../configs/protocols/ajna';
import logger from '../../../lib/logger';
import { ProtocolConfig } from '../../../types/base';
import { getInitialLendingData, getInitialLendingDataMetrics, LendingData } from '../../../types/domains/lending';
import { ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AjnaErc20FactoryAbi from '../../../configs/abi/ajna/ERC20Factory.json';
import AjnaErc20PoolAbi from '../../../configs/abi/ajna/ERC20Pool.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import BigNumber from 'bignumber.js';
import { AjnaPoolEvents } from './abis';
import { decodeEventLog } from 'viem';
import { TimeUnits } from '../../../configs/constants';

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
    };

    // init LendingData dataset
    let lendingData: LendingData = {
      ...getInitialLendingData(),

      // have supply-side deposit/withdraw
      volumeDeposited: 0,
      volumeWithdrawn: 0,

      // collateral deposit/withdraw
      volumeCollateralDeposited: 0,
      volumeCollateralWithdrawn: 0,
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

      if (!lendingData.breakdown[factoryConfig.chain]) {
        lendingData.breakdown[factoryConfig.chain] = {};
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
              if (!lendingData.breakdown[factoryConfig.chain][debtToken.address]) {
                lendingData.breakdown[factoryConfig.chain][debtToken.address] = {
                  ...getInitialLendingDataMetrics(),
                  volumeDeposited: 0,
                  volumeWithdrawn: 0,
                  volumeCollateralDeposited: 0,
                  volumeCollateralWithdrawn: 0,
                };
              }

              const debtTokenPriceRaw = await this.services.oracle.getTokenPriceUsd({
                chain: factoryConfig.chain,
                address: debtToken.address,
                timestamp: options.timestamp,
              });
              const collateralTokenPriceRaw = await this.services.oracle.getTokenPriceUsd({
                chain: factoryConfig.chain,
                address: collateralToken.address,
                timestamp: options.timestamp,
              });
              const debtTokenPrice = debtTokenPriceRaw ? Number(debtTokenPriceRaw) : 0;
              const collateralTokenPrice = collateralTokenPriceRaw ? Number(collateralTokenPriceRaw) : 0;

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

              lendingData.totalAssetDeposited += totalDeposited + totalCollateralDeposited;
              lendingData.totalBorrowed += totalBorrowed;
              lendingData.totalSupplied += totalDeposited;
              lendingData.totalValueLocked += totalDeposited + totalCollateralDeposited - totalBorrowed;
              lendingData.borrowFees += borrowFees;

              lendingData.breakdown[factoryConfig.chain][debtToken.address].totalAssetDeposited += totalDeposited;
              lendingData.breakdown[factoryConfig.chain][debtToken.address].totalSupplied += totalDeposited;
              lendingData.breakdown[factoryConfig.chain][debtToken.address].totalBorrowed += totalBorrowed;
              lendingData.breakdown[factoryConfig.chain][debtToken.address].totalValueLocked +=
                totalDeposited - totalBorrowed;
              lendingData.breakdown[factoryConfig.chain][debtToken.address].borrowFees += borrowFees;

              lendingData.breakdown[factoryConfig.chain][collateralToken.address].totalAssetDeposited +=
                totalCollateralDeposited;
              lendingData.breakdown[factoryConfig.chain][collateralToken.address].totalValueLocked +=
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
                          (lendingData.volumeDeposited as number) += amountUsd;
                          lendingData.moneyFlowIn += amountUsd;
                          (lendingData.breakdown[factoryConfig.chain][debtToken.address].volumeDeposited as number) +=
                            amountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowIn += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RemoveQuoteToken: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          (lendingData.volumeWithdrawn as number) += amountUsd;
                          lendingData.moneyFlowOut += amountUsd;
                          (lendingData.breakdown[factoryConfig.chain][debtToken.address].volumeWithdrawn as number) +=
                            amountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowOut += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.AddCollateral: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (lendingData.volumeCollateralDeposited as number) += amountUsd;
                          lendingData.moneyFlowIn += amountUsd;
                          (lendingData.breakdown[factoryConfig.chain][collateralToken.address]
                            .volumeCollateralDeposited as number) += amountUsd;
                          lendingData.breakdown[factoryConfig.chain][collateralToken.address].moneyFlowIn += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RemoveCollateral: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (lendingData.volumeCollateralWithdrawn as number) += amountUsd;
                          lendingData.moneyFlowOut += amountUsd;
                          (lendingData.breakdown[factoryConfig.chain][collateralToken.address]
                            .volumeCollateralWithdrawn as number) += amountUsd;
                          lendingData.breakdown[factoryConfig.chain][collateralToken.address].moneyFlowOut += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.DrawDebt: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amountBorrowed.toString(), debtToken.decimals) *
                            debtTokenPrice;
                          lendingData.volumeBorrowed += amountUsd;
                          lendingData.moneyFlowOut += amountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].volumeBorrowed += amountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowOut += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RepayDebt: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.quoteRepaid.toString(), debtToken.decimals) *
                            debtTokenPrice;
                          lendingData.volumeRepaid += amountUsd;
                          lendingData.moneyFlowIn += amountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].volumeRepaid += amountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowIn += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.Take: {
                          const repayAmountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          lendingData.volumeRepaid += repayAmountUsd;
                          lendingData.moneyFlowIn += repayAmountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].volumeRepaid += repayAmountUsd;
                          lendingData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowIn += repayAmountUsd;

                          const collateralAmountUsd =
                            formatBigNumberToNumber(event.args.collateral.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          lendingData.volumeLiquidation += collateralAmountUsd;
                          lendingData.moneyFlowOut += collateralAmountUsd;
                          lendingData.breakdown[factoryConfig.chain][collateralToken.address].volumeLiquidation +=
                            collateralAmountUsd;
                          lendingData.breakdown[factoryConfig.chain][collateralToken.address].moneyFlowOut +=
                            collateralAmountUsd;
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

    protocolData.lending = lendingData;

    return protocolData;
  }
}
