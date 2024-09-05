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
              if (!protocolData.breakdown[factoryConfig.chain][debtToken.address]) {
                protocolData.breakdown[factoryConfig.chain][debtToken.address] = {
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

              protocolData.totalAssetDeposited += totalDeposited + totalCollateralDeposited;
              (protocolData.totalSupplied as number) += totalDeposited;
              (protocolData.totalBorrowed as number) += totalBorrowed;
              protocolData.totalValueLocked += totalDeposited + totalCollateralDeposited - totalBorrowed;
              protocolData.totalFees += borrowFees;

              protocolData.breakdown[factoryConfig.chain][debtToken.address].totalAssetDeposited += totalDeposited;
              (protocolData.breakdown[factoryConfig.chain][debtToken.address].totalSupplied as number) +=
                totalDeposited;
              (protocolData.breakdown[factoryConfig.chain][debtToken.address].totalBorrowed as number) += totalBorrowed;
              protocolData.breakdown[factoryConfig.chain][debtToken.address].totalValueLocked +=
                totalDeposited - totalBorrowed;
              protocolData.breakdown[factoryConfig.chain][debtToken.address].totalFees += borrowFees;

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
                          protocolData.moneyFlowIn += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.deposit as number) +=
                            amountUsd;
                          protocolData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowIn += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RemoveQuoteToken: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          (protocolData.volumes.withdraw as number) += amountUsd;
                          protocolData.moneyFlowOut += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.withdraw as number) +=
                            amountUsd;
                          protocolData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowOut += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.AddCollateral: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (protocolData.volumes.deposit as number) += amountUsd;
                          protocolData.moneyFlowIn += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][collateralToken.address].volumes
                            .deposit as number) += amountUsd;
                          protocolData.breakdown[factoryConfig.chain][collateralToken.address].moneyFlowIn += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RemoveCollateral: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (protocolData.volumes.withdraw as number) += amountUsd;
                          protocolData.moneyFlowOut += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][collateralToken.address].volumes
                            .withdraw as number) += amountUsd;
                          protocolData.breakdown[factoryConfig.chain][collateralToken.address].moneyFlowOut +=
                            amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.DrawDebt: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.amountBorrowed.toString(), debtToken.decimals) *
                            debtTokenPrice;
                          (protocolData.volumes.borrow as number) += amountUsd;
                          protocolData.moneyFlowOut += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.borrow as number) +=
                            amountUsd;
                          protocolData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowOut += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.RepayDebt: {
                          const amountUsd =
                            formatBigNumberToNumber(event.args.quoteRepaid.toString(), debtToken.decimals) *
                            debtTokenPrice;
                          (protocolData.volumes.repay as number) += amountUsd;
                          protocolData.moneyFlowIn += amountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.repay as number) +=
                            amountUsd;
                          protocolData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowIn += amountUsd;
                          break;
                        }
                        case AjnaPoolEvents.Take: {
                          const repayAmountUsd =
                            formatBigNumberToNumber(event.args.amount.toString(), debtToken.decimals) * debtTokenPrice;
                          (protocolData.volumes.repay as number) += repayAmountUsd;
                          protocolData.moneyFlowIn += repayAmountUsd;
                          (protocolData.breakdown[factoryConfig.chain][debtToken.address].volumes.repay as number) +=
                            repayAmountUsd;
                          protocolData.breakdown[factoryConfig.chain][debtToken.address].moneyFlowIn += repayAmountUsd;

                          const collateralAmountUsd =
                            formatBigNumberToNumber(event.args.collateral.toString(), collateralToken.decimals) *
                            collateralTokenPrice;
                          (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                          protocolData.moneyFlowOut += collateralAmountUsd;
                          (protocolData.breakdown[factoryConfig.chain][collateralToken.address].volumes
                            .liquidation as number) += collateralAmountUsd;
                          protocolData.breakdown[factoryConfig.chain][collateralToken.address].moneyFlowOut +=
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
