import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { KelpdaoProtocolConfig } from '../../../configs/protocols/kelpdao';
import LrtConfigAbi from '../../../configs/abi/kelpdao/LRTConfig.json';
import LrtDepositPoolAbi from '../../../configs/abi/kelpdao/LRTDepositPool.json';
import LrtOracleAbi from '../../../configs/abi/kelpdao/LRTOracle.json';
import { decodeEventLog } from 'viem';
import { ChainNames } from '../../../configs/names';

const Events = {
  AssetDeposit: '0x07c31fccf51996f0f4ea01c3a55191786b3a8cd89f696db4d42adaa99b0e15f1',
  ETHDeposit: '0x8b0422d41caf5eb583695377e98b5041a1d241a7c80483cf182b1311c48c93b7',
  EthTransferred: '0xcec1f18c3ab8ddaaa107a1591e3c369667eec613626611a8deaedef43069fcdd',
};

export default class KelpdaoAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.kelpdao';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const kelpdaoConfig = this.protocolConfig as KelpdaoProtocolConfig;

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
      kelpdaoConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      kelpdaoConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      kelpdaoConfig.chain,
      options.endTime,
    );

    const assetAddresses: Array<string> | null = await this.services.blockchain.evm.readContract({
      chain: kelpdaoConfig.chain,
      abi: LrtConfigAbi,
      target: kelpdaoConfig.lrtConfig,
      method: 'getSupportedAssetList',
      params: [],
      blockNumber: blockNumber,
    });
    if (assetAddresses) {
      const balances = await this.services.blockchain.evm.multicall({
        chain: kelpdaoConfig.chain,
        blockNumber: blockNumber,
        calls: assetAddresses.map((address) => {
          return {
            abi: LrtDepositPoolAbi,
            target: kelpdaoConfig.lrtDepositPool,
            method: 'getTotalAssetDeposits',
            params: [address],
          };
        }),
      });

      for (let i = 0; i < assetAddresses.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: kelpdaoConfig.chain,
          address: assetAddresses[i],
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const balanceUsd =
            formatBigNumberToNumber(balances[i] ? balances[i].toString() : '0', token.decimals) * tokenPriceUsd;

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
      }
    }

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: ChainNames.ethereum,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: kelpdaoConfig.chain,
      address: kelpdaoConfig.lrtDepositPool,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (Object.values(Events).includes(log.topics[0])) {
        const event: any = decodeEventLog({
          abi: LrtDepositPoolAbi,
          topics: log.topics,
          data: log.data,
        });

        if (log.topics[0] === Events.AssetDeposit) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: kelpdaoConfig.chain,
            address: event.args.asset,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const amountUsd =
              formatBigNumberToNumber(event.args.depositAmount.toString(), token.decimals) * tokenPriceUsd;

            (protocolData.volumes.deposit as number) += amountUsd;

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
            (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
          }
        } else {
          const amountUsd =
            formatBigNumberToNumber(
              event.args.depositAmount ? event.args.depositAmount.toString() : event.args.amount.toString(),
              18,
            ) * ethPriceUsd;
          if (log.topics[0] === Events.ETHDeposit) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[kelpdaoConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
          } else {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[kelpdaoConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < kelpdaoConfig.birthday
        ? kelpdaoConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      kelpdaoConfig.chain,
      last7DaysTime,
    );
    const preConvertToAssets = await this.services.blockchain.evm.readContract({
      chain: kelpdaoConfig.chain,
      abi: LrtOracleAbi,
      target: kelpdaoConfig.lrtOracle,
      method: 'rsETHPrice',
      params: [],
      blockNumber: last7DaysBlock,
    });
    const postConvertToAssets = await this.services.blockchain.evm.readContract({
      chain: kelpdaoConfig.chain,
      abi: LrtOracleAbi,
      target: kelpdaoConfig.lrtOracle,
      method: 'rsETHPrice',
      params: [],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(preConvertToAssets.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(postConvertToAssets.toString(), 18);

    const stakingApr = preExchangeRate
      ? (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
        (options.endTime - last7DaysTime)
      : 0;

    const totalFees = (protocolData.totalAssetDeposited * stakingApr) / TimeUnits.DaysPerYear;
    const protocolRevenue = totalFees * 0.1; // 10%

    protocolData.totalFees += totalFees;
    protocolData.supplySideRevenue += totalFees - protocolRevenue;
    protocolData.protocolRevenue += protocolRevenue;

    protocolData.liquidStakingApr = stakingApr * 100;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
