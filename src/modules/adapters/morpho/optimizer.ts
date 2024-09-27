import { MorphoProtocolConfig } from '../../../configs/protocols/morpho';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import MorphoOptimizerCompoundAbi from '../../../configs/abi/morpho/MorphoOptimizerCompound.json';
import MorphoOptimizerPositionManagerAbi from '../../../configs/abi/morpho/OptimizerPositionManager.json';
import MorphoOptimizerAavev2Abi from '../../../configs/abi/morpho/MorphoOptimizerAavev2.json';
import MorphoOptimizerAavev3Abi from '../../../configs/abi/morpho/MorphoOptimizerAavev3.json';
import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV2.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import cTokenAbi from '../../../configs/abi/compound/cErc20.json';
import { ChainBlockPeriods, SolidityUnits, TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';

const Events = {
  Supplied: '0x11adb3570ba55fd255b1f04252ca0071ae6639c86d4fd69e7c1bf1688afb493f',
  Withdrawn: '0x378f9d375cd79e36c19c26a9e57791fe7cd5953b61986c01ebf980c0efb92801',
  Borrowed: '0xc1cba78646fef030830d099fc25cb498953709c9d47d883848f81fd207174c9f',
  Repaid: '0x7b417e520d2b905fc5a1689d29d329358dd55efc60ed115aa165b0a2b64232c6',
  Liquidated: '0xc2c75a73164c2efcbb9f74bfa511cd0866489d90687831a7217b3dbeeb697088',
};

const Aavev2DataProvider = '0x057835ad21a177dbdd3090bb1cae03eacf78fc6d';
const Aavev3DataProvider = '0x7b4eb56e7cd4b454ba8ff71e4518426369a138a3';

export default class MorphoOptimizerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.morpho 🦋';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const morphoConfig = this.protocolConfig as MorphoProtocolConfig;

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

    for (const optimizerConfig of morphoConfig.optimizers) {
      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        optimizerConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        optimizerConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        optimizerConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: optimizerConfig.chain,
        address: optimizerConfig.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      // caching for process event logs later
      const marketInfo: any = {};

      if (!protocolData.breakdown[optimizerConfig.chain]) {
        protocolData.breakdown[optimizerConfig.chain] = {};
      }

      if (optimizerConfig.version === 'compound') {
        const getAllMarkets = await this.services.blockchain.evm.readContract({
          chain: optimizerConfig.chain,
          abi: MorphoOptimizerCompoundAbi,
          target: optimizerConfig.address,
          method: 'getAllMarkets',
          params: [],
          blockNumber: blockNumber,
        });
        if (getAllMarkets) {
          for (const marketAddress of getAllMarkets) {
            if (optimizerConfig.marketAssets[normalizeAddress(marketAddress)]) {
              const underlying = await this.services.blockchain.evm.getTokenInfo({
                chain: optimizerConfig.chain,
                address: optimizerConfig.marketAssets[normalizeAddress(marketAddress)],
              });
              if (underlying) {
                if (!protocolData.breakdown[optimizerConfig.chain][underlying.address]) {
                  protocolData.breakdown[optimizerConfig.chain][underlying.address] = {
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

                const underlyingPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: underlying.chain,
                  address: underlying.address,
                  timestamp: options.timestamp,
                });
                const [exchangeRate, cTokenBalance, borrowBalanceStored, borrowRatePerBlock] =
                  await this.services.blockchain.evm.multicall({
                    chain: optimizerConfig.chain,
                    blockNumber: blockNumber,
                    calls: [
                      {
                        abi: cTokenAbi,
                        target: marketAddress,
                        method: 'exchangeRateStored',
                        params: [],
                      },
                      {
                        abi: cTokenAbi,
                        target: marketAddress,
                        method: 'balanceOf',
                        params: [optimizerConfig.address],
                      },
                      {
                        abi: cTokenAbi,
                        target: marketAddress,
                        method: 'borrowBalanceStored',
                        params: [optimizerConfig.address],
                      },
                      {
                        abi: cTokenAbi,
                        target: marketAddress,
                        method: 'borrowRatePerBlock',
                        params: [],
                      },
                    ],
                  });
                const mantissa = 18 + underlying.decimals - 8;
                const balanceUnderlying =
                  formatBigNumberToNumber(exchangeRate.toString(), mantissa) *
                  formatBigNumberToNumber(cTokenBalance.toString(), 8);
                const balanceUnderlyingUsd = balanceUnderlying * underlyingPriceUsd;
                const borrowAmountUsd =
                  formatBigNumberToNumber(borrowBalanceStored.toString(), underlying.decimals) * underlyingPriceUsd;
                const borrowRate =
                  formatBigNumberToNumber(borrowRatePerBlock.toString(), 18) *
                  Math.floor(TimeUnits.SecondsPerYear / ChainBlockPeriods[optimizerConfig.chain]);
                const borrowFees = (borrowAmountUsd * borrowRate) / TimeUnits.DaysPerYear;

                protocolData.totalAssetDeposited += balanceUnderlyingUsd;
                protocolData.totalValueLocked += balanceUnderlyingUsd - borrowAmountUsd;
                (protocolData.totalSupplied as number) += balanceUnderlyingUsd;
                (protocolData.totalBorrowed as number) += borrowAmountUsd;
                protocolData.totalFees += borrowFees;
                protocolData.supplySideRevenue += borrowFees;

                protocolData.breakdown[underlying.chain][underlying.address].totalAssetDeposited +=
                  balanceUnderlyingUsd;
                protocolData.breakdown[underlying.chain][underlying.address].totalValueLocked +=
                  balanceUnderlyingUsd - borrowAmountUsd;
                (protocolData.breakdown[underlying.chain][underlying.address].totalSupplied as number) +=
                  balanceUnderlyingUsd;
                (protocolData.breakdown[underlying.chain][underlying.address].totalBorrowed as number) +=
                  borrowAmountUsd;
                protocolData.breakdown[underlying.chain][underlying.address].totalFees += borrowFees;
                protocolData.breakdown[underlying.chain][underlying.address].supplySideRevenue += borrowFees;

                marketInfo[normalizeAddress(marketAddress)] = {
                  underlying: underlying,
                  underlyingPriceUsd: underlyingPriceUsd,
                };
              }
            }
          }
        }
      } else if (optimizerConfig.version === 'aavev2') {
        const getMarketsCreated = await this.services.blockchain.evm.readContract({
          chain: optimizerConfig.chain,
          abi: MorphoOptimizerAavev2Abi,
          target: optimizerConfig.address,
          method: 'getMarketsCreated',
          params: [],
          blockNumber: blockNumber,
        });

        if (getMarketsCreated) {
          for (const aTokenAddress of getMarketsCreated) {
            if (optimizerConfig.marketAssets[normalizeAddress(aTokenAddress)]) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: optimizerConfig.chain,
                address: optimizerConfig.marketAssets[normalizeAddress(aTokenAddress)],
              });
              if (token) {
                if (!protocolData.breakdown[optimizerConfig.chain][token.address]) {
                  protocolData.breakdown[optimizerConfig.chain][token.address] = {
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

                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                const [userReserveData, reserveData] = await this.services.blockchain.evm.multicall({
                  chain: optimizerConfig.chain,
                  blockNumber: blockNumber,
                  calls: [
                    {
                      abi: AaveDataProviderV2Abi,
                      target: Aavev2DataProvider,
                      method: 'getUserReserveData',
                      params: [token.address, optimizerConfig.address],
                    },
                    {
                      abi: AaveDataProviderV2Abi,
                      target: Aavev2DataProvider,
                      method: 'getReserveData',
                      params: [token.address],
                    },
                  ],
                });
                if (userReserveData) {
                  const totalSuppliedUsd =
                    formatBigNumberToNumber(userReserveData[0].toString(), token.decimals) * tokenPriceUsd;
                  const variableDebt =
                    formatBigNumberToNumber(userReserveData[2].toString(), token.decimals) * tokenPriceUsd;
                  const stableDebt =
                    formatBigNumberToNumber(userReserveData[1].toString(), token.decimals) * tokenPriceUsd;
                  const totalBorrowedUsd = variableDebt + stableDebt;

                  const variableBorrowRate = formatBigNumberToNumber(
                    reserveData[4].toString(),
                    SolidityUnits.RayDecimals,
                  );
                  const stableBorrowRate = formatBigNumberToNumber(
                    reserveData[5].toString(),
                    SolidityUnits.RayDecimals,
                  );
                  const totalFees =
                    (variableDebt * variableBorrowRate + stableDebt * stableBorrowRate) / TimeUnits.DaysPerYear;

                  protocolData.totalAssetDeposited += totalSuppliedUsd;
                  protocolData.totalValueLocked += totalSuppliedUsd - totalBorrowedUsd;
                  (protocolData.totalSupplied as number) += totalSuppliedUsd;
                  (protocolData.totalBorrowed as number) += totalBorrowedUsd;
                  protocolData.totalFees += totalFees;
                  protocolData.supplySideRevenue += totalFees;

                  protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalSuppliedUsd;
                  protocolData.breakdown[token.chain][token.address].totalValueLocked +=
                    totalSuppliedUsd - totalBorrowedUsd;
                  (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalSuppliedUsd;
                  (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowedUsd;
                  protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
                  protocolData.breakdown[token.chain][token.address].supplySideRevenue += totalFees;
                }

                marketInfo[normalizeAddress(aTokenAddress)] = {
                  underlying: token,
                  underlyingPriceUsd: tokenPriceUsd,
                };
              }
            }
          }
        }
      } else if (optimizerConfig.version === 'aavev3') {
        const marketInfo: any = {};

        const marketsCreated = await this.services.blockchain.evm.readContract({
          chain: optimizerConfig.chain,
          abi: MorphoOptimizerAavev3Abi,
          target: optimizerConfig.address,
          method: 'marketsCreated',
          params: [],
          blockNumber: blockNumber,
        });

        if (marketsCreated) {
          for (const tokenAddress of marketsCreated) {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: optimizerConfig.chain,
              address: tokenAddress,
            });
            if (token) {
              if (!protocolData.breakdown[optimizerConfig.chain][token.address]) {
                protocolData.breakdown[optimizerConfig.chain][token.address] = {
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

              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });
              const [userReserveData, reserveData] = await this.services.blockchain.evm.multicall({
                chain: optimizerConfig.chain,
                blockNumber: blockNumber,
                calls: [
                  {
                    abi: AaveDataProviderV3Abi,
                    target: Aavev3DataProvider,
                    method: 'getUserReserveData',
                    params: [token.address, optimizerConfig.address],
                  },
                  {
                    abi: AaveDataProviderV3Abi,
                    target: Aavev3DataProvider,
                    method: 'getReserveData',
                    params: [token.address],
                  },
                ],
              });
              if (userReserveData) {
                const totalSuppliedUsd =
                  formatBigNumberToNumber(userReserveData[0].toString(), token.decimals) * tokenPriceUsd;
                const variableDebt =
                  formatBigNumberToNumber(userReserveData[2].toString(), token.decimals) * tokenPriceUsd;
                const stableDebt =
                  formatBigNumberToNumber(userReserveData[1].toString(), token.decimals) * tokenPriceUsd;
                const totalBorrowedUsd = variableDebt + stableDebt;

                const variableBorrowRate = formatBigNumberToNumber(
                  reserveData[4].toString(),
                  SolidityUnits.RayDecimals,
                );
                const stableBorrowRate = formatBigNumberToNumber(reserveData[5].toString(), SolidityUnits.RayDecimals);
                const totalFees =
                  (variableDebt * variableBorrowRate + stableDebt * stableBorrowRate) / TimeUnits.DaysPerYear;

                protocolData.totalAssetDeposited += totalSuppliedUsd;
                protocolData.totalValueLocked += totalSuppliedUsd - totalBorrowedUsd;
                (protocolData.totalSupplied as number) += totalSuppliedUsd;
                (protocolData.totalBorrowed as number) += totalBorrowedUsd;
                protocolData.totalFees += totalFees;
                protocolData.supplySideRevenue += totalFees;

                protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalSuppliedUsd;
                protocolData.breakdown[token.chain][token.address].totalValueLocked +=
                  totalSuppliedUsd - totalBorrowedUsd;
                (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalSuppliedUsd;
                (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowedUsd;
                protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
                protocolData.breakdown[token.chain][token.address].supplySideRevenue += totalFees;
              }

              marketInfo[normalizeAddress(token.address)] = {
                underlying: token,
                underlyingPriceUsd: tokenPriceUsd,
              };
            }
          }
        }
      }

      for (const log of logs) {
        if (Object.values(Events).includes(log.topics[0])) {
          const event: any = decodeEventLog({
            abi: MorphoOptimizerPositionManagerAbi,
            topics: log.topics,
            data: log.data,
          });

          if (log.topics[0] === Events.Liquidated) {
            const poolTokenBorrowed = marketInfo[normalizeAddress(event.args._poolTokenBorrowed)];
            const poolTokenCollateral = marketInfo[normalizeAddress(event.args._poolTokenCollateral)];

            if (poolTokenBorrowed) {
              const amountRepayUsd =
                formatBigNumberToNumber(event.args._amountRepaid.toString(), poolTokenBorrowed.underlying.decimals) *
                poolTokenBorrowed.underlyingPriceUsd;
              (protocolData.volumes.repay as number) += amountRepayUsd;
              (protocolData.breakdown[poolTokenBorrowed.underlying.chain][poolTokenBorrowed.underlying.address].volumes
                .repay as number) += amountRepayUsd;
            }

            if (poolTokenCollateral) {
              const amountLiquidateUsd =
                formatBigNumberToNumber(event.args._amountSeized.toString(), poolTokenCollateral.underlying.decimals) *
                poolTokenCollateral.underlyingPriceUsd;
              (protocolData.volumes.liquidation as number) += amountLiquidateUsd;
              (protocolData.breakdown[poolTokenBorrowed.underlying.chain][poolTokenBorrowed.underlying.address].volumes
                .liquidation as number) += amountLiquidateUsd;
            }
          } else {
            const poolToken = marketInfo[normalizeAddress(event.args._poolToken)];
            if (poolToken) {
              const amountUsd =
                formatBigNumberToNumber(event.args._amount.toString(), poolToken.underlying.decimals) *
                poolToken.underlyingPriceUsd;

              switch (log.topics[0]) {
                case Events.Supplied: {
                  (protocolData.volumes.deposit as number) += amountUsd;
                  (protocolData.breakdown[poolToken.underlying.chain][poolToken.underlying.address].volumes
                    .deposit as number) += amountUsd;
                  break;
                }
                case Events.Withdrawn: {
                  (protocolData.volumes.withdraw as number) += amountUsd;
                  (protocolData.breakdown[poolToken.underlying.chain][poolToken.underlying.address].volumes
                    .withdraw as number) += amountUsd;
                  break;
                }
                case Events.Borrowed: {
                  (protocolData.volumes.borrow as number) += amountUsd;
                  (protocolData.breakdown[poolToken.underlying.chain][poolToken.underlying.address].volumes
                    .borrow as number) += amountUsd;
                  break;
                }
                case Events.Repaid: {
                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.breakdown[poolToken.underlying.chain][poolToken.underlying.address].volumes
                    .repay as number) += amountUsd;
                  break;
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
