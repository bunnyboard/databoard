import { FluidMarketConfig, FluidProtocolConfig } from '../../../configs/protocols/fluid';
import { ProtocolConfig } from '../../../types/base';
import { ProtocolData, getInitialProtocolCoreMetrics } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import LiquidityResolverAbi from '../../../configs/abi/fluid/LiquidityResolver.json';
import VaultResolverAbi from '../../../configs/abi/fluid/VaultResolver.json';
import UserMudoleAbi from '../../../configs/abi/fluid/UserModule.json';
import VaultAbi from '../../../configs/abi/fluid/FluidVaultT1.json';
import DexAbi from '../../../configs/abi/fluid/FluidDexT1.json';
import DexResolverAbi from '../../../configs/abi/fluid/FluidDexResolver.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { AddressE, AddressZero, TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import { ContractCall } from '../../../services/blockchains/domains';

export const FluidVaultEvents = {
  // event on Liquidity contract
  LogOperate: '0x4d93b232a24e82b284ced7461bf4deacffe66759d5c24513e6f29e571ad78d15',

  // events on vault contracts
  LogLiquidate: '0x80fd9cc6b1821f4a510e45ffce6852ea3404807b5d3d833ffa85664408afcb66',

  // dex swap
  Swap: '0xdc004dbca4ef9c966218431ee5d9133d337ad018dd5b5c5493722803f75c64f7',
};

export default class FluidAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.fluid 🌊';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getAllVaults(marketConfig: FluidMarketConfig, blockNumber: number): Promise<Array<any>> {
    let vaults: Array<any> = [];

    const allVaultAddresses = await this.services.blockchain.evm.readContract({
      chain: marketConfig.chain,
      target: marketConfig.vaultResolverV2,
      abi: VaultResolverAbi,
      method: 'getAllVaultsAddresses',
      params: [],
      blockNumber: blockNumber,
    });

    if (allVaultAddresses) {
      const calls: Array<ContractCall> = allVaultAddresses
        .filter((address: string) => !compareAddress(address, AddressZero))
        .map((vaultAddress: string) => {
          return {
            target: marketConfig.vaultResolverV2,
            abi: VaultResolverAbi,
            method: 'getVaultEntireData',
            params: [vaultAddress],
          };
        });

      vaults = await this.services.blockchain.evm.multicall({
        chain: marketConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });
    } else if (marketConfig.vaultResolverV1) {
      return await this.services.blockchain.evm.readContract({
        chain: marketConfig.chain,
        target: marketConfig.vaultResolverV1,
        abi: VaultResolverAbi,
        method: 'getVaultsEntireData',
        params: [],
        blockNumber: blockNumber,
      });
    }

    return vaults;
  }

  private async getAllDexes(marketConfig: FluidMarketConfig, blockNumber: number): Promise<Array<any>> {
    let dexes: Array<any> = [];

    if (marketConfig.dexResolver) {
      const allDexAddresses = await this.services.blockchain.evm.readContract({
        chain: marketConfig.chain,
        target: marketConfig.dexResolver,
        abi: DexResolverAbi,
        method: 'getAllDexAddresses',
        params: [],
        blockNumber: blockNumber,
      });
      if (allDexAddresses) {
        const getDexTokensCalls: Array<ContractCall> = allDexAddresses.map((dexAddress: string) => {
          return {
            target: marketConfig.dexResolver,
            abi: DexResolverAbi,
            method: 'getDexTokens',
            params: [dexAddress],
          };
        });

        const getDexConfigsCalls: Array<ContractCall> = allDexAddresses.map((dexAddress: string) => {
          return {
            target: marketConfig.dexResolver,
            abi: DexResolverAbi,
            method: 'getDexConfigs',
            params: [dexAddress],
          };
        });

        const dexTokens: Array<any> = await this.services.blockchain.evm.multicall({
          chain: marketConfig.chain,
          blockNumber: blockNumber,
          calls: getDexTokensCalls,
        });
        const dexConfigs: Array<any> = await this.services.blockchain.evm.multicall({
          chain: marketConfig.chain,
          blockNumber: blockNumber,
          calls: getDexConfigsCalls,
        });

        for (let i = 0; i < allDexAddresses.length; i++) {
          const [token0, token1] = await Promise.all([
            this.services.blockchain.evm.getTokenInfo({
              chain: marketConfig.chain,
              address: dexTokens[i][0],
            }),
            this.services.blockchain.evm.getTokenInfo({
              chain: marketConfig.chain,
              address: dexTokens[i][1],
            }),
          ]);
          if (token0 && token1) {
            const fee = formatBigNumberToNumber(dexConfigs[i].fee ? dexConfigs[i].fee.toString() : '0', 6);
            const revenueCut = formatBigNumberToNumber(
              dexConfigs[i].revenueCut ? dexConfigs[i].revenueCut.toString() : '0',
              6,
            );
            dexes.push({
              address: allDexAddresses[i],
              token0,
              token1,
              fee,
              revenueCut,
            });
          }
        }
      }
    }

    return dexes;
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
        swap: 0,
      },
    };

    const fluidConfig = this.protocolConfig as FluidProtocolConfig;
    for (const marketConfig of fluidConfig.markets) {
      if (marketConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[marketConfig.chain]) {
        protocolData.breakdown[marketConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        marketConfig.chain,
        options.endTime,
      );

      const allDexes = await this.getAllDexes(marketConfig, blockNumber);
      for (const dex of allDexes) {
        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: marketConfig.chain,
          address: dex.address,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        const events: Array<any> = logs
          .filter((log) => log.topics[0] === FluidVaultEvents.Swap)
          .map((log) =>
            decodeEventLog({
              abi: DexAbi,
              topics: log.topics,
              data: log.data,
            }),
          );
        for (const event of events) {
          let volumeUsd = 0;

          const swap0to1 = event.args.swap0to1;
          if (swap0to1) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: marketConfig.chain,
              address: dex.token0.address,
              timestamp: options.timestamp,
            });
            volumeUsd = formatBigNumberToNumber(event.args.amountIn.toString(), dex.token0.decimals) * tokenPriceUsd;
          } else {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: marketConfig.chain,
              address: dex.token1.address,
              timestamp: options.timestamp,
            });
            volumeUsd = formatBigNumberToNumber(event.args.amountIn.toString(), dex.token1.decimals) * tokenPriceUsd;
          }

          const swapFeeusd = volumeUsd * dex.fee;
          const protocolRevenue = swapFeeusd * dex.revenueCut;
          const supplySideRevenue = swapFeeusd - protocolRevenue;

          protocolData.totalFees += swapFeeusd;
          protocolData.protocolRevenue += protocolRevenue;
          protocolData.supplySideRevenue += supplySideRevenue;
          (protocolData.volumes.swap as number) += volumeUsd;
        }
      }

      let [listedTokens, getAllOverallTokensData] = await this.services.blockchain.evm.multicall({
        chain: marketConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            target: marketConfig.liquidityResolver,
            abi: LiquidityResolverAbi,
            method: 'listedTokens',
            params: [],
          },
          {
            target: marketConfig.liquidityResolver,
            abi: LiquidityResolverAbi,
            method: 'getAllOverallTokensData',
            params: [],
          },
        ],
      });

      const getVaultsEntireData: Array<any> = await this.getAllVaults(marketConfig, blockNumber);

      if (listedTokens && getAllOverallTokensData) {
        const liquidityLogs = await this.services.blockchain.evm.getContractLogs({
          chain: marketConfig.chain,
          address: marketConfig.liquidity, // liquidity contract
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        let liquidationLogs: Array<any> = [];
        for (const vault of getVaultsEntireData) {
          if (vault) {
            const rawlogs = await this.services.blockchain.evm.getContractLogs({
              chain: marketConfig.chain,
              address: vault.vault,
              fromBlock: beginBlock,
              toBlock: endBlock,
            });
            liquidationLogs = liquidationLogs.concat(
              rawlogs.filter((item) => item.topics[0] === FluidVaultEvents.LogLiquidate),
            );
          }
        }

        for (let i = 0; i < listedTokens.length; i++) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: marketConfig.chain,
            address: listedTokens[i],
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

            const borrowRate = formatBigNumberToNumber(getAllOverallTokensData[i].borrowRate.toString(), 4);
            const reserveFactorRate = formatBigNumberToNumber(getAllOverallTokensData[i].fee.toString(), 4);

            const totalDeposited =
              formatBigNumberToNumber(getAllOverallTokensData[i].totalSupply.toString(), token.decimals) *
              tokenPriceUsd;
            const totalBorrowed =
              formatBigNumberToNumber(getAllOverallTokensData[i].totalBorrow.toString(), token.decimals) *
              tokenPriceUsd;

            const totalFees = (totalBorrowed * borrowRate) / TimeUnits.DaysPerYear;
            const protocolRevenue = totalFees * reserveFactorRate;
            const supplySideRevenue = totalFees - protocolRevenue;

            protocolData.totalAssetDeposited += totalDeposited;
            protocolData.totalValueLocked += totalDeposited - totalBorrowed;
            (protocolData.totalSupplied as number) += totalDeposited;
            (protocolData.totalBorrowed as number) += totalBorrowed;
            protocolData.totalFees += totalFees;
            protocolData.supplySideRevenue += supplySideRevenue;
            protocolData.protocolRevenue += protocolRevenue;

            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDeposited;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDeposited - totalBorrowed;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDeposited;
            (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += totalBorrowed;
            protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
            protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
            protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;

            for (const log of liquidityLogs) {
              const signature = log.topics[0];
              if (signature === FluidVaultEvents.LogOperate) {
                const event: any = decodeEventLog({
                  abi: UserMudoleAbi,
                  topics: log.topics,
                  data: log.data,
                });

                let tokenAddress = normalizeAddress(event.args.token);
                if (compareAddress(tokenAddress, AddressE)) {
                  tokenAddress = AddressZero;
                }

                if (compareAddress(token.address, tokenAddress)) {
                  const supplyAmountUsd =
                    formatBigNumberToNumber(event.args.supplyAmount.toString(), token.decimals) * tokenPriceUsd;
                  const borrowAamountUsd =
                    formatBigNumberToNumber(event.args.borrowAmount.toString(), token.decimals) * tokenPriceUsd;

                  if (supplyAmountUsd >= 0) {
                    (protocolData.volumes.deposit as number) += supplyAmountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += supplyAmountUsd;
                  } else {
                    (protocolData.volumes.withdraw as number) += Math.abs(supplyAmountUsd);
                    (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += supplyAmountUsd;
                  }
                  if (borrowAamountUsd >= 0) {
                    (protocolData.volumes.borrow as number) += borrowAamountUsd;
                    (protocolData.breakdown[token.chain][token.address].volumes.borrow as number) += borrowAamountUsd;
                  } else {
                    (protocolData.volumes.repay as number) += Math.abs(borrowAamountUsd);
                    (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += borrowAamountUsd;
                  }
                }
              }
            }

            for (const log of liquidationLogs) {
              const event: any = decodeEventLog({
                abi: VaultAbi,
                topics: log.topics,
                data: log.data,
              });

              const vaultData = getVaultsEntireData.filter(
                (item: any) => item && compareAddress(item.vault, log.address),
              )[0];

              if (vaultData) {
                let supplyToken = normalizeAddress(vaultData.constantVariables.supplyToken);
                if (compareAddress(supplyToken, AddressE)) {
                  supplyToken = AddressZero;
                }

                let borrowToken = normalizeAddress(vaultData.constantVariables.borrowToken);
                if (compareAddress(borrowToken, AddressE)) {
                  borrowToken = AddressZero;
                }

                if (compareAddress(supplyToken, token.address)) {
                  // liquidator liquidate collateral
                  const colAmountUsd =
                    formatBigNumberToNumber(event.args.colAmt_.toString(10), token.decimals) * tokenPriceUsd;
                  (protocolData.volumes.liquidation as number) += colAmountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.liquidation as number) += colAmountUsd;
                } else if (compareAddress(borrowToken, token.address)) {
                  // liquidator repay debt
                  const debtAmountUsd =
                    formatBigNumberToNumber(event.args.debtAmt_.toString(10), token.decimals) * tokenPriceUsd;
                  (protocolData.volumes.repay as number) += debtAmountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += debtAmountUsd;
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
