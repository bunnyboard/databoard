import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import ProtocolExtendedAdapter from '../extended';
import { GearboxProtocolConfig } from '../../../configs/protocols/gearbox';
import PoolV3Abi from '../../../configs/abi/gearbox/PoolV3.json';
import CreditManagerV3Abi from '../../../configs/abi/gearbox/CreditManagerV3.json';
import CreditFacadeV3Abi from '../../../configs/abi/gearbox/CreditFacadeV3.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { decodeEventLog } from 'viem';
import { SolidityUnits } from '../../../configs/constants';

const PoolV3Events = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  Borrow: '0x312a5e5e1079f5dda4e95dbbd0b908b291fd5b992ef22073643ab691572c5b52',
  Repay: '0x2fe77b1c99aca6b022b8efc6e3e8dd1b48b30748709339b65c50ef3263443e09',
};

const CreditV3Events = {
  AddCollateral: '0xa32435755c235de2976ed44a75a2f85cb01faf0c894f639fe0c32bb9455fea8f',
  WithdrawCollateral: '0xe7655dfddd0226889710c711da4e725dd44525fb5717b2321017a97d32793ab8',
  LiquidateCreditAccount: '0x7dfecd8419723a9d3954585a30c2a270165d70aafa146c11c1e1b88ae1439064',
};

export default class GearboxAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.gearbox';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const gearboxConfig = this.protocolConfig as GearboxProtocolConfig;

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

    if (gearboxConfig.birthday > options.timestamp) {
      return null;
    }

    for (const poolConfig of gearboxConfig.pools) {
      if (poolConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[poolConfig.chain]) {
        protocolData.breakdown[poolConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.endTime,
      );

      const assetCalls: Array<ContractCall> = [];
      for (const poolAddress of poolConfig.v3Configs.liquidityPools) {
        assetCalls.push({
          abi: PoolV3Abi,
          target: poolAddress,
          method: 'asset',
          params: [],
        });
        assetCalls.push({
          abi: PoolV3Abi,
          target: poolAddress,
          method: 'totalAssets',
          params: [],
        });
        assetCalls.push({
          abi: PoolV3Abi,
          target: poolAddress,
          method: 'totalBorrowed',
          params: [],
        });
      }

      const getAssetResults = await this.services.blockchain.evm.multicall({
        chain: poolConfig.chain,
        blockNumber: blockNumber,
        calls: assetCalls,
      });

      const poolAssets: { [key: string]: Token } = {};
      if (getAssetResults) {
        for (let i = 0; i < poolConfig.v3Configs.liquidityPools.length; i += 1) {
          const tokenAddress = getAssetResults[i * 3];
          const tokenBalance = getAssetResults[i * 3 + 1];
          const tokenBorrowed = getAssetResults[i * 3 + 2];

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: poolConfig.chain,
            address: tokenAddress,
          });
          if (token) {
            poolAssets[normalizeAddress(poolConfig.v3Configs.liquidityPools[i])] = token;

            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const balanceUsd = formatBigNumberToNumber(tokenBalance.toString(), token.decimals) * tokenPriceUsd;
            const borrowedUsd = formatBigNumberToNumber(tokenBorrowed.toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalAssetDeposited += balanceUsd;
            protocolData.totalValueLocked += balanceUsd;
            (protocolData.totalSupplied as number) += balanceUsd;
            (protocolData.totalBorrowed as number) += borrowedUsd;

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
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
            (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += borrowedUsd;

            // get fees collect by growth shares
            const preSharePriceRaw = await this.services.blockchain.evm.readContract({
              chain: poolConfig.chain,
              abi: PoolV3Abi,
              target: poolConfig.v3Configs.liquidityPools[i],
              method: 'convertToAssets',
              params: [SolidityUnits.OneWad],
              blockNumber: beginBlock,
            });
            const postSharePriceRaw = await this.services.blockchain.evm.readContract({
              chain: poolConfig.chain,
              abi: PoolV3Abi,
              target: poolConfig.v3Configs.liquidityPools[i],
              method: 'convertToAssets',
              params: [SolidityUnits.OneWad],
              blockNumber: endBlock,
            });
            const preSharePrice = formatBigNumberToNumber(preSharePriceRaw.toString(), 18);
            const postSharePrice = formatBigNumberToNumber(postSharePriceRaw.toString(), 18);
            const supplySideRevenue = ((postSharePrice - preSharePrice) / preSharePrice) * balanceUsd;

            // https://etherscan.io/address/0x3EB95430FdB99439A86d3c6D7D01C3c561393556#readContract#F15
            const protocolRevenue = (supplySideRevenue / (1 - 0.25)) * 0.25;
            const totalFees = supplySideRevenue + protocolRevenue;

            protocolData.totalFees += totalFees;
            protocolData.supplySideRevenue += supplySideRevenue;
            protocolData.protocolRevenue += protocolRevenue;
            protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
            protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
            protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
          }
        }
      }

      for (const poolAddress of poolConfig.v3Configs.liquidityPools) {
        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: poolConfig.chain,
          address: poolAddress,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          const signature = log.topics[0];

          if (Object.values(PoolV3Events).includes(signature)) {
            const token = poolAssets[normalizeAddress(poolAddress)];
            if (token) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });

              const event: any = decodeEventLog({
                abi: PoolV3Abi,
                topics: log.topics,
                data: log.data,
              });

              switch (signature) {
                case PoolV3Events.Deposit:
                case PoolV3Events.Withdraw: {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.assets.toString(), token.decimals) * tokenPriceUsd;

                  if (signature === PoolV3Events.Deposit) {
                    (protocolData.volumes.deposit as number) += amountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
                  } else {
                    (protocolData.volumes.withdraw as number) += amountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                  }

                  break;
                }
                case PoolV3Events.Borrow: {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

                  (protocolData.volumes.borrow as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.borrow as number) += amountUsd;

                  break;
                }
                case PoolV3Events.Repay: {
                  const amountUsd =
                    formatBigNumberToNumber(event.args.borrowedAmount.toString(), token.decimals) * tokenPriceUsd;

                  (protocolData.volumes.repay as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += amountUsd;

                  break;
                }
              }
            }
          }
        }
      }

      const getCreditFacadeResults = await this.services.blockchain.evm.multicall({
        chain: poolConfig.chain,
        blockNumber: blockNumber,
        calls: poolConfig.v3Configs.creditManagers.map((address) => {
          return {
            abi: CreditManagerV3Abi,
            target: address,
            method: 'creditFacade',
            params: [],
          };
        }),
      });
      for (let i = 0; i < poolConfig.v3Configs.creditManagers.length; i++) {
        const creditManager = poolConfig.v3Configs.creditManagers[i];
        const creditFacade = getCreditFacadeResults[i];
        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: poolConfig.chain,
          address: creditFacade,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          const signature = log.topics[0];

          if (Object.values(CreditV3Events).includes(signature)) {
            const event: any = decodeEventLog({
              abi: CreditFacadeV3Abi,
              topics: log.topics,
              data: log.data,
            });

            switch (signature) {
              case CreditV3Events.AddCollateral:
              case CreditV3Events.WithdrawCollateral: {
                const token = await this.services.blockchain.evm.getTokenInfo({
                  chain: poolConfig.chain,
                  address: event.args.token,
                });
                if (token) {
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

                  const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: token.chain,
                    address: token.address,
                    timestamp: options.timestamp,
                  });

                  const amountUsd =
                    formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

                  if (signature === CreditV3Events.AddCollateral) {
                    (protocolData.volumes.deposit as number) += amountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
                  } else {
                    (protocolData.volumes.withdraw as number) += amountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                  }
                }

                break;
              }

              case CreditV3Events.LiquidateCreditAccount: {
                const creditAccountInfo = await this.services.blockchain.evm.multicall({
                  chain: poolConfig.chain,
                  blockNumber: Number(log.blockNumber) - 1,
                  calls: [
                    {
                      abi: CreditManagerV3Abi,
                      target: creditManager,
                      method: 'creditAccountInfo',
                      params: [event.args.creditAccount],
                    },
                    {
                      abi: CreditManagerV3Abi,
                      target: creditManager,
                      method: 'pool',
                      params: [],
                    },
                  ],
                });

                const debtToken = poolAssets[normalizeAddress(creditAccountInfo[1])];
                if (debtToken) {
                  const debtTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: debtToken.chain,
                    address: debtToken.address,
                    timestamp: options.timestamp,
                  });

                  const debtAmountUsd =
                    formatBigNumberToNumber(creditAccountInfo[0][0].toString(), debtToken.decimals) * debtTokenPriceUsd;

                  (protocolData.volumes.repay as number) += debtAmountUsd;
                  (protocolData.volumes.liquidation as number) += debtAmountUsd;
                  (protocolData.breakdown[debtToken.chain][debtToken.address].volumes.repay as number) += debtAmountUsd;
                }

                break;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
