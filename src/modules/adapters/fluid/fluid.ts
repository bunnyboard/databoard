import { FluidProtocolConfig } from '../../../configs/protocols/fluid';
import { ProtocolConfig } from '../../../types/base';
import { ProtocolData, getInitialProtocolCoreMetrics } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import LiquidityResolverAbi from '../../../configs/abi/fluid/LiquidityResolver.json';
import VaultResolverAbi from '../../../configs/abi/fluid/VaultResolver.json';
import UserMudoleAbi from '../../../configs/abi/fluid/UserModule.json';
import VaultAbi from '../../../configs/abi/fluid/FluidVaultT1.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { AddressE, AddressZero, TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';

export const FluidVaultEvents = {
  // event on Liquidity contract
  LogOperate: '0x4d93b232a24e82b284ced7461bf4deacffe66759d5c24513e6f29e571ad78d15',

  // events on vault contracts
  LogLiquidate: '0x80fd9cc6b1821f4a510e45ffce6852ea3404807b5d3d833ffa85664408afcb66',
};

export default class FluidAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.fluid 🌊';

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

    const fluidConfig = this.protocolConfig as FluidProtocolConfig;
    for (const marketConfig of fluidConfig.markets) {
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

      const [listedTokens, getAllOverallTokensData, getVaultsEntireData] = await this.services.blockchain.evm.multicall(
        {
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
            {
              target: marketConfig.vaultResolver,
              abi: VaultResolverAbi,
              method: 'getVaultsEntireData',
              params: [],
            },
          ],
        },
      );

      if (listedTokens && getAllOverallTokensData && getVaultsEntireData) {
        const liquidityLogs = await this.services.blockchain.evm.getContractLogs({
          chain: marketConfig.chain,
          address: marketConfig.liquidity, // liquidity contract
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        let liquidationLogs: Array<any> = [];
        for (const vault of getVaultsEntireData) {
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

        for (let i = 0; i < listedTokens.length; i++) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: marketConfig.chain,
            address: listedTokens[i],
          });
          if (token) {
            const rawPrice = await this.services.oracle.getTokenPriceUsd({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const tokenPriceUsd = rawPrice ? Number(rawPrice) : 0;

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
                  } else {
                    (protocolData.volumes.withdraw as number) += Math.abs(supplyAmountUsd);
                  }
                  if (borrowAamountUsd >= 0) {
                    (protocolData.volumes.borrow as number) += borrowAamountUsd;
                  } else {
                    (protocolData.volumes.repay as number) += Math.abs(borrowAamountUsd);
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

              const vaultData = getVaultsEntireData.filter((item: any) => compareAddress(item.vault, log.address))[0];

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
                  (protocolData.volumes.liquidation as number) +=
                    formatBigNumberToNumber(event.args.colAmt_.toString(10), token.decimals) * tokenPriceUsd;
                } else if (compareAddress(borrowToken, token.address)) {
                  // liquidator repay debt
                  (protocolData.volumes.repay as number) +=
                    formatBigNumberToNumber(event.args.debtAmt_.toString(10), token.decimals) * tokenPriceUsd;
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

    return protocolData;
  }
}
