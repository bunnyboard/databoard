import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { EtherfiProtocolConfig } from '../../../configs/protocols/etherfi';
import EtherfiLiquidityPoolAbi from '../../../configs/abi/etherfi/EtherfiLiquidityPool.json';
import EtherfiLensAbi from '../../../configs/abi/etherfi/ArcticArchitectureLens.json';
import BoringVaultAbi from '../../../configs/abi/etherfi/BoringVault.json';
import { decodeEventLog } from 'viem';

const Events = {
  // eETH deposit/withdraw
  Deposit: '0xa241faf62e66ce518d1934ce4c936d806a02289ba483fac23beb8c15755be90d',
  Withdraw: '0xb9da3f3df62c28aca604806cc6ee9678189d7591ef511a77bb040fa8361e9e02',

  // boring vault
  Enter: '0xea00f88768a86184a6e515238a549c171769fe7460a011d6fd0bcd48ca078ea4',
  Exit: '0xe0c82280a1164680e0cf43be7db4c4c9f985423623ad7a544fb76c772bdc6043',
};

export default class EtherfiAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.etherfi';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const etherfiConfig = this.protocolConfig as EtherfiProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        ethereum: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
        },
      },

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      etherfiConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      etherfiConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      etherfiConfig.chain,
      options.endTime,
    );

    // count total ETH deposited
    const getTotalPooledEther = await this.services.blockchain.evm.readContract({
      chain: etherfiConfig.chain,
      abi: EtherfiLiquidityPoolAbi,
      target: etherfiConfig.liquidityPool,
      method: 'getTotalPooledEther',
      params: [],
      blockNumber: blockNumber,
    });
    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: etherfiConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const totalEthDepositedUsd = formatBigNumberToNumber(getTotalPooledEther.toString(), 18) * ethPriceUsd;

    protocolData.totalAssetDeposited += totalEthDepositedUsd;
    protocolData.totalValueLocked += totalEthDepositedUsd;
    (protocolData.totalSupplied as number) += totalEthDepositedUsd;
    protocolData.breakdown[etherfiConfig.chain][AddressZero].totalAssetDeposited += totalEthDepositedUsd;
    protocolData.breakdown[etherfiConfig.chain][AddressZero].totalValueLocked += totalEthDepositedUsd;
    (protocolData.breakdown[etherfiConfig.chain][AddressZero].totalSupplied as number) += totalEthDepositedUsd;

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < etherfiConfig.birthday
        ? etherfiConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      etherfiConfig.chain,
      last7DaysTime,
    );

    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: etherfiConfig.chain,
      target: etherfiConfig.liquidityPool,
      abi: EtherfiLiquidityPoolAbi,
      method: 'amountForShare',
      params: ['1000000000000000000'],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: etherfiConfig.chain,
      target: etherfiConfig.liquidityPool,
      abi: EtherfiLiquidityPoolAbi,
      method: 'amountForShare',
      params: ['1000000000000000000'],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const totalFees = (totalEthDepositedUsd * stakingApr) / TimeUnits.DaysPerYear;

    // https://etherfi.gitbook.io/etherfi/liquid/technical-documentation#fees
    const protocolRevenue = (0.01 * totalEthDepositedUsd) / TimeUnits.DaysPerYear;
    const supplySideRevenue = totalFees > protocolRevenue ? totalFees - protocolRevenue : 0;

    protocolData.totalFees += totalFees;
    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.breakdown[etherfiConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[etherfiConfig.chain][AddressZero].supplySideRevenue += supplySideRevenue;
    protocolData.breakdown[etherfiConfig.chain][AddressZero].protocolRevenue += protocolRevenue;

    const liquidityPoolLogs = await this.services.blockchain.evm.getContractLogs({
      chain: etherfiConfig.chain,
      address: etherfiConfig.liquidityPool,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of liquidityPoolLogs) {
      if (log.topics[0] === Events.Deposit || log.topics[0] === Events.Withdraw) {
        const event: any = decodeEventLog({
          abi: EtherfiLiquidityPoolAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;

        if (log.topics[0] === Events.Deposit) {
          (protocolData.volumes.deposit as number) += amountUsd;
          (protocolData.breakdown[etherfiConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
        } else {
          (protocolData.volumes.withdraw as number) += amountUsd;
          (protocolData.breakdown[etherfiConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
        }
      }
    }

    if (options.timestamp >= etherfiConfig.vaultsBirthtday) {
      const results = await this.services.blockchain.evm.multicall({
        chain: etherfiConfig.chain,
        blockNumber: blockNumber,
        calls: etherfiConfig.vaults.map((item) => {
          return {
            abi: EtherfiLensAbi,
            target: etherfiConfig.lens,
            method: 'totalAssets',
            params: [item.boringVault, item.accountant],
          };
        }),
      });

      for (let i = 0; i < results.length; i++) {
        const result = results[i];

        if (result) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: etherfiConfig.chain,
            address: result[0].toString(),
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const balanceUsd = formatBigNumberToNumber(result[1].toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalAssetDeposited += balanceUsd;
            protocolData.totalValueLocked += balanceUsd;
            (protocolData.totalSupplied as number) += balanceUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                volumes: {
                  deposit: 0,
                  withdraw: 0,
                },
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
          }

          const logs = await this.services.blockchain.evm.getContractLogs({
            chain: etherfiConfig.chain,
            address: etherfiConfig.vaults[i].boringVault,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of logs) {
            if (log.topics[0] === Events.Enter || log.topics[0] === Events.Exit) {
              const event: any = decodeEventLog({
                abi: BoringVaultAbi,
                topics: log.topics,
                data: log.data,
              });

              const eventToken = await this.services.blockchain.evm.getTokenInfo({
                chain: etherfiConfig.chain,
                address: event.args.asset,
              });
              if (eventToken) {
                const eventTokenPriceusd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: eventToken.chain,
                  address: eventToken.address,
                  timestamp: options.timestamp,
                });

                const amountUsd =
                  formatBigNumberToNumber(event.args.amount.toString(), eventToken.decimals) * eventTokenPriceusd;

                if (log.topics[0] === Events.Enter) {
                  (protocolData.volumes.deposit as number) += amountUsd;
                  (protocolData.breakdown[etherfiConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
                } else {
                  (protocolData.volumes.withdraw as number) += amountUsd;
                  (protocolData.breakdown[etherfiConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
                }
              }
            }
          }
        }
      }
    }

    protocolData.liquidStakingApr = stakingApr * 100;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
