import { EulerProtocolConfig } from '../../../configs/protocols/euler';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import EVaultAbi from '../../../configs/abi/euler/EVault.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { SolidityUnits, TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';

const EulerEvents = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  Borrow: '0xcbc04eca7e9da35cb1393a6135a199ca52e450d5e9251cbd99f7847d33a36750',
  Repay: '0x5c16de4f8b59bd9caf0f49a545f25819a895ed223294290b408242e72a594231',
  Liquidate: '0x8246cc71ab01533b5bebc672a636df812f10637ad720797319d5741d5ebb3962',
};

export default class EulerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.euler 📐';

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

    const eulerConfig = this.protocolConfig as EulerProtocolConfig;
    for (const factoryConfig of eulerConfig.factories) {
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

      for (const vault of factoryConfig.vaults) {
        if (!protocolData.breakdown[factoryConfig.chain]) {
          protocolData.breakdown[factoryConfig.chain] = {};
        }

        const [asset, totalAssets, totalBorrows, interestRate, protocolFeeShare] =
          await this.services.blockchain.evm.multicall({
            chain: factoryConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: EVaultAbi,
                target: vault,
                method: 'asset',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'totalAssets',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'totalBorrows',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'interestRate',
                params: [],
              },
              {
                abi: EVaultAbi,
                target: vault,
                method: 'protocolFeeShare',
                params: [],
              },
            ],
          });

        if (asset) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: factoryConfig.chain,
            address: asset,
          });
          if (token) {
            if (!protocolData.breakdown[factoryConfig.chain][token.address]) {
              protocolData.breakdown[factoryConfig.chain][token.address] = {
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

            const priceRaw = await this.services.oracle.getTokenPriceUsd({
              chain: factoryConfig.chain,
              address: asset,
              timestamp: options.timestamp,
            });
            const tokenPriceUsd = priceRaw ? Number(priceRaw) : 0;

            const totalDepositUsd = formatBigNumberToNumber(totalAssets.toString(), token.decimals) * tokenPriceUsd;
            const totalBorrowUsd = formatBigNumberToNumber(totalBorrows.toString(), token.decimals) * tokenPriceUsd;

            const borrowRate =
              formatBigNumberToNumber(interestRate.toString(), SolidityUnits.RayDecimals) * TimeUnits.SecondsPerYear;
            const protocolFeeRate = formatBigNumberToNumber(protocolFeeShare.toString(), 6);

            const borrowFees = (borrowRate * totalBorrowUsd) / TimeUnits.DaysPerYear;
            const protocolRevenue = borrowFees * protocolFeeRate;
            const supplySideRevenue = borrowFees - protocolRevenue;

            protocolData.totalAssetDeposited += totalDepositUsd;
            protocolData.totalValueLocked += totalDepositUsd - totalBorrowUsd;
            (protocolData.totalSupplied as number) += totalDepositUsd;
            (protocolData.totalBorrowed as number) += totalBorrowUsd;
            protocolData.totalFees += borrowFees;
            protocolData.supplySideRevenue += supplySideRevenue;
            protocolData.protocolRevenue += protocolRevenue;

            protocolData.breakdown[factoryConfig.chain][token.address].totalAssetDeposited += totalDepositUsd;
            protocolData.breakdown[factoryConfig.chain][token.address].totalValueLocked +=
              totalDepositUsd - totalBorrowUsd;
            (protocolData.breakdown[factoryConfig.chain][token.address].totalSupplied as number) += totalDepositUsd;
            (protocolData.breakdown[factoryConfig.chain][token.address].totalBorrowed as number) += totalBorrowUsd;
            protocolData.breakdown[factoryConfig.chain][token.address].totalFees += borrowFees;
            protocolData.breakdown[factoryConfig.chain][token.address].supplySideRevenue += supplySideRevenue;
            protocolData.breakdown[factoryConfig.chain][token.address].protocolRevenue += protocolRevenue;

            // process vault events
            const vaultLogs = await this.services.blockchain.evm.getContractLogs({
              chain: factoryConfig.chain,
              address: vault,
              fromBlock: beginBlock,
              toBlock: endBlock,
            });
            for (const log of vaultLogs) {
              const signature = log.topics[0];
              if (Object.values(EulerEvents).includes(signature)) {
                const event: any = decodeEventLog({
                  abi: EVaultAbi,
                  topics: log.topics,
                  data: log.data,
                });

                if (signature === EulerEvents.Liquidate) {
                  const repayAmountUsd =
                    formatBigNumberToNumber(event.args.repayAssets.toString(), token.decimals) * tokenPriceUsd;

                  (protocolData.volumes.repay as number) += repayAmountUsd;
                  (protocolData.breakdown[factoryConfig.chain][token.address].volumes.repay as number) +=
                    repayAmountUsd;

                  // liquidator will reveive collateral vault token
                  const collateralAddress = await this.services.blockchain.evm.readContract({
                    chain: factoryConfig.chain,
                    abi: EVaultAbi,
                    target: event.args.collateral,
                    method: 'asset',
                    params: [],
                  });
                  const collateralToken = await this.services.blockchain.evm.getTokenInfo({
                    chain: factoryConfig.chain,
                    address: collateralAddress,
                  });
                  if (collateralToken) {
                    const rawPrice = await this.services.oracle.getTokenPriceUsd({
                      chain: factoryConfig.chain,
                      address: collateralToken.address,
                      timestamp: options.timestamp,
                    });
                    const collateralPriceUsd = rawPrice ? Number(rawPrice) : 0;
                    const collateralAmount = await this.services.blockchain.evm.readContract({
                      chain: factoryConfig.chain,
                      abi: EVaultAbi,
                      target: event.args.collateral,
                      method: 'convertToAssets',
                      params: [event.args.yieldBalance.toString()],
                    });
                    const collateralAmountUsd =
                      formatBigNumberToNumber(collateralAmount.toString(), collateralToken.decimals) *
                      collateralPriceUsd;

                    (protocolData.volumes.liquidation as number) += collateralAmountUsd;
                    (protocolData.breakdown[factoryConfig.chain][token.address].volumes.liquidation as number) +=
                      collateralAmountUsd;
                  }
                } else {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.assets.toString(), token.decimals) * tokenPriceUsd;
                  switch (signature) {
                    case EulerEvents.Deposit: {
                      (protocolData.volumes.deposit as number) += amountUsd;
                      (protocolData.breakdown[factoryConfig.chain][token.address].volumes.deposit as number) +=
                        amountUsd;
                      break;
                    }
                    case EulerEvents.Withdraw: {
                      (protocolData.volumes.withdraw as number) += amountUsd;
                      (protocolData.breakdown[factoryConfig.chain][token.address].volumes.withdraw as number) +=
                        amountUsd;
                      break;
                    }
                    case EulerEvents.Borrow: {
                      (protocolData.volumes.borrow as number) += amountUsd;
                      (protocolData.breakdown[factoryConfig.chain][token.address].volumes.borrow as number) +=
                        amountUsd;
                      break;
                    }
                    case EulerEvents.Repay: {
                      (protocolData.volumes.repay as number) += amountUsd;
                      (protocolData.breakdown[factoryConfig.chain][token.address].volumes.repay as number) += amountUsd;
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

    protocolData.moneyFlowIn = (protocolData.volumes.deposit as number) + (protocolData.volumes.repay as number);
    protocolData.moneyFlowOut =
      (protocolData.volumes.withdraw as number) +
      (protocolData.volumes.borrow as number) +
      (protocolData.volumes.liquidation as number);
    protocolData.moneyFlowNet = protocolData.moneyFlowIn - protocolData.moneyFlowOut;
    for (const value of Object.values(protocolData.volumes)) {
      protocolData.totalVolume += value;
    }

    for (const [chain, tokens] of Object.entries(protocolData.breakdown)) {
      for (const [address, token] of Object.entries(tokens)) {
        protocolData.breakdown[chain][address].moneyFlowIn =
          (token.volumes.deposit as number) + (token.volumes.repay as number);
        protocolData.breakdown[chain][address].moneyFlowOut =
          (token.volumes.withdraw as number) + (token.volumes.borrow as number) + (token.volumes.liquidation as number);
        protocolData.breakdown[chain][address].moneyFlowNet =
          protocolData.breakdown[chain][address].moneyFlowIn - protocolData.breakdown[chain][address].moneyFlowOut;

        for (const value of Object.values(token.volumes)) {
          protocolData.breakdown[chain][address].totalVolume += value;
        }
      }
    }

    return protocolData;
  }
}
