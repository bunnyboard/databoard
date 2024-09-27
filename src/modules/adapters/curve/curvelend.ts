import { CurvelendProtocolConfig } from '../../../configs/protocols/curvelend';
import { ProtocolConfig } from '../../../types/base';
import { ProtocolData, getInitialProtocolCoreMetrics } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import OneWayLendingFactoryAbi from '../../../configs/abi/curve/OneWayLendingFactory.json';
import VaultAbi from '../../../configs/abi/curve/CurvelendVault.json';
import ControllerAbi from '../../../configs/abi/curve/CurvelendController.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import LlammaAbi from '../../../configs/abi/curve/Llamma.json';
import PriceOracleAbi from '../../../configs/abi/curve/PriceOracle.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';

const VaultEvents = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
};

const ControllerEvents = {
  Borrow: '0xe1979fe4c35e0cef342fef5668e2c8e7a7e9f5d5d1ca8fee0ac6c427fa4153af',
  Repay: '0x77c6871227e5d2dec8dadd5354f78453203e22e669cd0ec4c19d9a8c5edb31d0',
  RemoveCollateral: '0xe25410a4059619c9594dc6f022fe231b02aaea733f689e7ab0cd21b3d4d0eb54',
  Liquidate: '0x642dd4d37ddd32036b9797cec464c0045dd2118c549066ae6b0f88e32240c2d0',
};

export default class CurvelendAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.curvelend';

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

    const curvelendConfig = this.protocolConfig as CurvelendProtocolConfig;
    for (const factoryConfig of curvelendConfig.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
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

      const marketCount = await this.services.blockchain.evm.readContract({
        chain: factoryConfig.chain,
        abi: OneWayLendingFactoryAbi,
        target: factoryConfig.factory,
        method: 'market_count',
        params: [],
        blockNumber: blockNumber,
      });

      for (let i = 0; i < Number(marketCount); i++) {
        const [borrowed_token, collateral_token, price_oracle, vault, controller, amm] =
          await this.services.blockchain.evm.multicall({
            chain: factoryConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: OneWayLendingFactoryAbi,
                target: factoryConfig.factory,
                method: 'borrowed_tokens',
                params: [i],
              },
              {
                abi: OneWayLendingFactoryAbi,
                target: factoryConfig.factory,
                method: 'collateral_tokens',
                params: [i],
              },
              {
                abi: OneWayLendingFactoryAbi,
                target: factoryConfig.factory,
                method: 'price_oracles',
                params: [i],
              },
              {
                abi: OneWayLendingFactoryAbi,
                target: factoryConfig.factory,
                method: 'vaults',
                params: [i],
              },
              {
                abi: OneWayLendingFactoryAbi,
                target: factoryConfig.factory,
                method: 'controllers',
                params: [i],
              },
              {
                abi: OneWayLendingFactoryAbi,
                target: factoryConfig.factory,
                method: 'amms',
                params: [i],
              },
            ],
          });

        if (factoryConfig.blacklists && factoryConfig.blacklists.includes(normalizeAddress(vault))) {
          continue;
        }

        const borrowToken = await this.services.blockchain.evm.getTokenInfo({
          chain: factoryConfig.chain,
          address: borrowed_token,
        });
        const collateralToken = await this.services.blockchain.evm.getTokenInfo({
          chain: factoryConfig.chain,
          address: collateral_token,
        });

        if (borrowToken && collateralToken) {
          const borrowTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: factoryConfig.chain,
            address: borrowed_token,
            timestamp: options.timestamp,
          });

          const [borrow_apr, totalAssets, total_debt, collateralBalance, price, admin_fee] =
            await this.services.blockchain.evm.multicall({
              chain: factoryConfig.chain,
              blockNumber: blockNumber,
              calls: [
                {
                  abi: VaultAbi,
                  target: vault,
                  method: 'borrow_apr',
                  params: [],
                },
                {
                  abi: VaultAbi,
                  target: vault,
                  method: 'totalAssets',
                  params: [],
                },
                {
                  abi: ControllerAbi,
                  target: controller,
                  method: 'total_debt',
                  params: [],
                },
                {
                  abi: Erc20Abi,
                  target: collateralToken.address,
                  method: 'balanceOf',
                  params: [amm],
                },
                {
                  abi: PriceOracleAbi,
                  target: price_oracle,
                  method: 'price',
                  params: [],
                },
                {
                  abi: LlammaAbi,
                  target: amm,
                  method: 'admin_fee',
                  params: [],
                },
              ],
            });

          const totalSuppliedUsd =
            formatBigNumberToNumber(totalAssets.toString(), borrowToken.decimals) * borrowTokenPriceUsd;
          const totalBorrowedUsd =
            formatBigNumberToNumber(total_debt.toString(), borrowToken.decimals) * borrowTokenPriceUsd;

          const collateralPriceUsd = formatBigNumberToNumber(price.toString(), 18) * borrowTokenPriceUsd;
          const collateralBalanceUsd =
            formatBigNumberToNumber(collateralBalance.toString(), collateralToken.decimals) * collateralPriceUsd;

          const borrowRate = formatBigNumberToNumber(borrow_apr.toString(), 18);
          const adminFees = formatBigNumberToNumber(admin_fee.toString(), 18);
          const borrowFees = (totalBorrowedUsd * borrowRate) / TimeUnits.DaysPerYear;
          const protocolRevenue = borrowFees * adminFees;
          const supplySideRevenue = borrowFees - protocolRevenue;

          protocolData.totalAssetDeposited += totalSuppliedUsd + collateralBalanceUsd;
          protocolData.totalValueLocked += totalSuppliedUsd + collateralBalanceUsd - totalBorrowedUsd;
          (protocolData.totalSupplied as number) += totalSuppliedUsd;
          (protocolData.totalBorrowed as number) += totalBorrowedUsd;
          protocolData.totalFees += borrowFees;
          protocolData.supplySideRevenue += supplySideRevenue;
          protocolData.protocolRevenue += protocolRevenue;

          if (!protocolData.breakdown[factoryConfig.chain]) {
            protocolData.breakdown[factoryConfig.chain] = {};
          }
          if (!protocolData.breakdown[factoryConfig.chain][borrowToken.address]) {
            protocolData.breakdown[factoryConfig.chain][borrowToken.address] = {
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
          if (!protocolData.breakdown[factoryConfig.chain][collateralToken.address]) {
            protocolData.breakdown[factoryConfig.chain][collateralToken.address] = {
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

          // borrowToken
          protocolData.breakdown[factoryConfig.chain][borrowToken.address].totalAssetDeposited += totalSuppliedUsd;
          protocolData.breakdown[factoryConfig.chain][borrowToken.address].totalValueLocked +=
            totalSuppliedUsd - totalBorrowedUsd;
          (protocolData.breakdown[factoryConfig.chain][borrowToken.address].totalSupplied as number) +=
            totalSuppliedUsd;
          (protocolData.breakdown[factoryConfig.chain][borrowToken.address].totalBorrowed as number) +=
            totalBorrowedUsd;
          protocolData.breakdown[factoryConfig.chain][borrowToken.address].totalFees += borrowFees;
          protocolData.breakdown[factoryConfig.chain][borrowToken.address].supplySideRevenue += supplySideRevenue;
          protocolData.breakdown[factoryConfig.chain][borrowToken.address].protocolRevenue += protocolRevenue;

          // collateralToken
          protocolData.breakdown[factoryConfig.chain][collateralToken.address].totalAssetDeposited +=
            collateralBalanceUsd;
          protocolData.breakdown[factoryConfig.chain][collateralToken.address].totalValueLocked += collateralBalanceUsd;

          let logs = await this.services.blockchain.evm.getContractLogs({
            chain: factoryConfig.chain,
            address: vault,
            fromBlock: beginBlock,
            toBlock: endBlock,
            blockRange: factoryConfig.chain === 'arbitrum' ? 10000 : undefined,
          });
          logs = logs.concat(
            await this.services.blockchain.evm.getContractLogs({
              chain: factoryConfig.chain,
              address: controller,
              fromBlock: beginBlock,
              toBlock: endBlock,
              blockRange: factoryConfig.chain === 'arbitrum' ? 10000 : undefined,
            }),
          );
          for (const log of logs) {
            const signature = log.topics[0];
            if (Object.values(VaultEvents).includes(signature)) {
              const event: any = decodeEventLog({
                abi: VaultAbi,
                topics: log.topics,
                data: log.data,
              });

              if (signature === VaultEvents.Deposit) {
                const amountUsd =
                  formatBigNumberToNumber(event.args.assets.toString(), borrowToken.decimals) * borrowTokenPriceUsd;

                (protocolData.volumes.deposit as number) += amountUsd;
                (protocolData.breakdown[borrowToken.chain][borrowToken.address].volumes.deposit as number) += amountUsd;
              }
              if (signature === VaultEvents.Withdraw) {
                const amountUsd =
                  formatBigNumberToNumber(event.args.assets.toString(), borrowToken.decimals) * borrowTokenPriceUsd;

                (protocolData.volumes.withdraw as number) += amountUsd;
                (protocolData.breakdown[borrowToken.chain][borrowToken.address].volumes.withdraw as number) +=
                  amountUsd;
              }
            }

            if (Object.values(ControllerEvents).includes(signature)) {
              const event: any = decodeEventLog({
                abi: ControllerAbi,
                topics: log.topics,
                data: log.data,
              });

              switch (signature) {
                case ControllerEvents.Borrow: {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.loan_increase.toString(), borrowToken.decimals) *
                    borrowTokenPriceUsd;
                  const collateralUsd =
                    formatBigNumberToNumber(event.args.collateral_increase.toString(), collateralToken.decimals) *
                    collateralPriceUsd;

                  (protocolData.volumes.borrow as number) += amountUsd;
                  (protocolData.volumes.deposit as number) += collateralUsd;
                  (protocolData.breakdown[borrowToken.chain][borrowToken.address].volumes.borrow as number) +=
                    amountUsd;
                  (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.deposit as number) +=
                    collateralUsd;

                  break;
                }
                case ControllerEvents.Repay: {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.loan_decrease.toString(), borrowToken.decimals) *
                    borrowTokenPriceUsd;
                  const collateralUsd =
                    formatBigNumberToNumber(event.args.collateral_decrease.toString(), collateralToken.decimals) *
                    collateralPriceUsd;

                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.volumes.withdraw as number) += collateralUsd;
                  (protocolData.breakdown[borrowToken.chain][borrowToken.address].volumes.repay as number) += amountUsd;
                  (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.withdraw as number) +=
                    collateralUsd;

                  break;
                }
                case ControllerEvents.RemoveCollateral: {
                  const collateralUsd =
                    formatBigNumberToNumber(event.args.collateral_decrease.toString(), collateralToken.decimals) *
                    collateralPriceUsd;

                  (protocolData.volumes.withdraw as number) += collateralUsd;
                  (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.withdraw as number) +=
                    collateralUsd;

                  break;
                }
                case ControllerEvents.Liquidate: {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.debt.toString(), borrowToken.decimals) * borrowTokenPriceUsd;
                  const collateralUsd =
                    formatBigNumberToNumber(event.args.collateral_received.toString(), collateralToken.decimals) *
                    collateralPriceUsd;

                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.volumes.liquidation as number) += collateralUsd;
                  (protocolData.breakdown[borrowToken.chain][borrowToken.address].volumes.repay as number) += amountUsd;
                  (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes
                    .liquidation as number) += collateralUsd;

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
