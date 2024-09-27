import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import StakewiseVaultControllerAbi from '../../../configs/abi/stakewise/OsTokenVaultController.json';
import { StakewiseProtocolConfig } from '../../../configs/protocols/stakewise';
import BigNumber from 'bignumber.js';

export default class StakewiseAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.stakewise';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const config = this.protocolConfig as StakewiseProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
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

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: 'ethereum',
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      config.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, options.beginTime);
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, options.endTime);

    const totalAssets = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.osTokenVaultController,
      abi: StakewiseVaultControllerAbi,
      method: 'totalAssets',
      params: [],
      blockNumber: blockNumber,
    });
    const totalSETH2Supply = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.v1_sETH2,
      abi: Erc20Abi,
      method: 'totalSupply',
      params: [],
      blockNumber: blockNumber,
    });

    // estimate staking APR beased last 7 day rewards
    const estimateApyDays = 7;
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * estimateApyDays < config.birthday
        ? config.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * estimateApyDays;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, last7DaysTime);
    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.osTokenVaultController,
      abi: StakewiseVaultControllerAbi,
      method: 'convertToAssets',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.osTokenVaultController,
      abi: StakewiseVaultControllerAbi,
      method: 'convertToAssets',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const totalDepositedUsd_v1 = formatBigNumberToNumber(totalSETH2Supply.toString(), 18) * ethPriceUsd;
    const totalDepositedUsd_v2 = formatBigNumberToNumber(totalAssets.toString(), 18) * ethPriceUsd;

    const totalDepositedUsd = totalDepositedUsd_v1 + totalDepositedUsd_v2;

    // rewards were distribute on-chain to osETH holders
    const supplySideRevenue_v1 = (stakingApr * totalDepositedUsd_v1) / TimeUnits.DaysPerYear;
    const supplySideRevenue_v2 = (stakingApr * totalDepositedUsd_v2) / TimeUnits.DaysPerYear;
    const protocolRevenue_v1 = (supplySideRevenue_v1 / (1 - config.v1_protocolFeeRate)) * config.v1_protocolFeeRate;
    const protocolRevenue_v2 = (supplySideRevenue_v2 / (1 - config.protocolFeeRate)) * config.protocolFeeRate;

    const supplySideRevenue = supplySideRevenue_v1 + supplySideRevenue_v2;
    const protocolRevenue = protocolRevenue_v1 + protocolRevenue_v2;
    const totalFees = supplySideRevenue + protocolRevenue;

    protocolData.totalAssetDeposited += totalDepositedUsd;
    protocolData.totalValueLocked += totalDepositedUsd;
    (protocolData.totalSupplied as number) += totalDepositedUsd;
    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.liquidStakingApr = stakingApr * 100;

    protocolData.breakdown[config.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
    protocolData.breakdown[config.chain][AddressZero].totalValueLocked += totalDepositedUsd;
    (protocolData.breakdown[config.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;
    protocolData.breakdown[config.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[config.chain][AddressZero].protocolRevenue += protocolRevenue;
    protocolData.breakdown[config.chain][AddressZero].supplySideRevenue += supplySideRevenue;
    protocolData.breakdown[config.chain][AddressZero].liquidStakingApr = stakingApr * 100;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: config.chain,
      address: config.osEth,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: Erc20Abi,
          topics: log.topics,
          data: log.data,
        });
        if (compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero)) {
          // deposit
          const exchangeRate = await this.services.blockchain.evm.readContract({
            chain: config.chain,
            target: config.osTokenVaultController,
            abi: StakewiseVaultControllerAbi,
            method: 'convertToAssets',
            params: [new BigNumber(1e18).toString(10)],
            blockNumber: Number(log.blockNumber) - 1,
          });
          const amountUsd =
            formatBigNumberToNumber(exchangeRate.toString(), 18) *
            formatBigNumberToNumber(event.args.value.toString(), 18) *
            ethPriceUsd;

          if (compareAddress(event.args.from, AddressZero)) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[config.chain][AddressZero].volumes.deposit as number) += amountUsd;
          }
          if (compareAddress(event.args.to, AddressZero)) {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[config.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
