import { LidoProtocolConfig } from '../../../configs/protocols/lido';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import LidoStETHAbi from '../../../configs/abi/lido/stETH.json';
import LidoStMATICAbi from '../../../configs/abi/lido/stMATIC.json';
import LidoLegacyOracleAbi from '../../../configs/abi/lido/LegacyOracle.json';
import LidoWithdrawalQueueAbi from '../../../configs/abi/lido/WithdrawalQueue.json';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { LidoEvents } from './abis';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import BigNumber from 'bignumber.js';

export default class LidoAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.lido 💧';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const lidoConfig = this.protocolConfig as LidoProtocolConfig;

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
          [lidoConfig.maticToken]: {
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
      lidoConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lidoConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(lidoConfig.chain, options.endTime);

    // count total ETH deposited
    const getTotalPooledEther = await this.services.blockchain.evm.readContract({
      chain: lidoConfig.chain,
      abi: LidoStETHAbi,
      target: lidoConfig.stETH,
      method: 'getTotalPooledEther',
      params: [],
      blockNumber: blockNumber,
    });
    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: lidoConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const totalEthDepositedUsd = formatBigNumberToNumber(getTotalPooledEther.toString(), 18) * ethPriceUsd;

    // count total MATIC deposited
    const getTotalPooledMatic = await this.services.blockchain.evm.readContract({
      chain: lidoConfig.chain,
      abi: LidoStMATICAbi,
      target: lidoConfig.stMATIC,
      method: 'getTotalPooledMatic',
      params: [],
      blockNumber: blockNumber,
    });
    const maticPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: lidoConfig.chain,
      address: lidoConfig.maticToken,
      timestamp: options.timestamp,
    });

    const totalMaticDepositedUsd = formatBigNumberToNumber(getTotalPooledMatic.toString(), 18) * maticPriceUsd;

    protocolData.totalAssetDeposited += totalEthDepositedUsd + totalMaticDepositedUsd;
    protocolData.totalValueLocked += totalEthDepositedUsd + totalMaticDepositedUsd;
    (protocolData.totalSupplied as number) += totalEthDepositedUsd + totalMaticDepositedUsd;
    protocolData.breakdown[lidoConfig.chain][AddressZero].totalAssetDeposited += totalEthDepositedUsd;
    protocolData.breakdown[lidoConfig.chain][AddressZero].totalValueLocked += totalEthDepositedUsd;
    (protocolData.breakdown[lidoConfig.chain][AddressZero].totalSupplied as number) += totalEthDepositedUsd;
    protocolData.breakdown[lidoConfig.chain][lidoConfig.maticToken].totalAssetDeposited += totalMaticDepositedUsd;
    protocolData.breakdown[lidoConfig.chain][lidoConfig.maticToken].totalValueLocked += totalMaticDepositedUsd;
    (protocolData.breakdown[lidoConfig.chain][lidoConfig.maticToken].totalSupplied as number) += totalMaticDepositedUsd;

    const stEthLogs = await this.services.blockchain.evm.getContractLogs({
      chain: lidoConfig.chain,
      address: lidoConfig.stETH,
      fromBlock: beginBlock,
      toBlock: endBlock,
      blockRange: 100,
    });

    for (const log of stEthLogs) {
      if (log.topics[0] === LidoEvents.Submitted) {
        const event: any = decodeEventLog({
          abi: LidoStETHAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;

        (protocolData.volumes.deposit as number) += amountUsd;
        (protocolData.breakdown[lidoConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
      }
    }

    // https://docs.lido.fi/contracts/legacy-oracle
    let stakingApr = 0;
    if (options.timestamp >= lidoConfig.upgradeV2Timestamp) {
      // using the new method
      for (const log of stEthLogs) {
        if (log.topics[0] === LidoEvents.TokenRebased) {
          const event: any = decodeEventLog({
            abi: LidoStETHAbi,
            topics: log.topics,
            data: log.data,
          });

          const preTotalShares = formatBigNumberToNumber(event.args.preTotalShares.toString(), 18);
          const preTotalEther = formatBigNumberToNumber(event.args.preTotalEther.toString(), 18);
          const postTotalShares = formatBigNumberToNumber(event.args.postTotalShares.toString(), 18);
          const postTotalEther = formatBigNumberToNumber(event.args.postTotalEther.toString(), 18);
          const timeElapsed = Number(event.args.timeElapsed);

          const preShareRate = preTotalEther / preTotalShares;
          const postShareRate = postTotalEther / postTotalShares;

          stakingApr = (TimeUnits.SecondsPerYear * ((postShareRate - preShareRate) / preShareRate)) / timeElapsed;
        }
      }
    } else {
      // using the old method
      const oracleReportLogs = await this.services.blockchain.evm.getContractLogs({
        chain: lidoConfig.chain,
        address: lidoConfig.legacyOracle,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of oracleReportLogs) {
        if (log.topics[0] === LidoEvents.PostTotalShares) {
          const event: any = decodeEventLog({
            abi: LidoLegacyOracleAbi,
            topics: log.topics,
            data: log.data,
          });

          const preTotalPooledEther = formatBigNumberToNumber(event.args.preTotalPooledEther.toString(), 18);
          const postTotalPooledEther = formatBigNumberToNumber(event.args.postTotalPooledEther.toString(), 18);
          const timeElapsed = Number(event.args.timeElapsed);

          stakingApr =
            (TimeUnits.SecondsPerYear * ((postTotalPooledEther - preTotalPooledEther) / preTotalPooledEther)) /
            timeElapsed;
        }
      }
    }

    // rewards were distribute on-chain to stETH holders
    const supplySideRevenue = (stakingApr * totalEthDepositedUsd) / TimeUnits.DaysPerYear;

    // lido takes 10% staking rewards
    const lidoFeeRate = 0.1; // 10%
    const protocolRevenue = (supplySideRevenue / (1 - lidoFeeRate)) * lidoFeeRate;

    const totalFees = supplySideRevenue + protocolRevenue;

    (protocolData.liquidStakingApr as number) = stakingApr * 100;
    (protocolData.breakdown[lidoConfig.chain][AddressZero].liquidStakingApr as number) = stakingApr * 100;

    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.breakdown[lidoConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[lidoConfig.chain][AddressZero].protocolRevenue += protocolRevenue;
    protocolData.breakdown[lidoConfig.chain][AddressZero].supplySideRevenue += supplySideRevenue;

    const withdrawalQueueLogs = await this.services.blockchain.evm.getContractLogs({
      chain: lidoConfig.chain,
      address: lidoConfig.withdrawalQueue,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of withdrawalQueueLogs) {
      if (log.topics[0] === LidoEvents.WithdrawalClaimed) {
        const event: any = decodeEventLog({
          abi: LidoWithdrawalQueueAbi,
          topics: log.topics,
          data: log.data,
        });
        const amountUsd = formatBigNumberToNumber(event.args.amountOfETH.toString(), 18) * ethPriceUsd;
        (protocolData.volumes.withdraw as number) += amountUsd;
        (protocolData.breakdown[lidoConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
      }
    }

    // estimate MATIC staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < lidoConfig.birthdayMaticStaking
        ? lidoConfig.birthdayMaticStaking
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lidoConfig.chain,
      last7DaysTime,
    );
    const [getPreExchangeRate, ,] = await this.services.blockchain.evm.readContract({
      chain: lidoConfig.chain,
      target: lidoConfig.stMATIC,
      abi: LidoStMATICAbi,
      method: 'convertStMaticToMatic',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: last7DaysBlock,
    });
    const [getPostExchangeRate, ,] = await this.services.blockchain.evm.readContract({
      chain: lidoConfig.chain,
      target: lidoConfig.stMATIC,
      abi: LidoStMATICAbi,
      method: 'convertStMaticToMatic',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const maticStakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    protocolData.liquidStakingApr = (Number(protocolData.liquidStakingApr) + maticStakingApr * 100) / 2;
    (protocolData.breakdown[lidoConfig.chain][lidoConfig.maticToken].liquidStakingApr as number) =
      maticStakingApr * 100;

    const stMaticLogs = await this.services.blockchain.evm.getContractLogs({
      chain: lidoConfig.chain,
      address: lidoConfig.stETH,
      fromBlock: beginBlock,
      toBlock: endBlock,
      blockRange: 100,
    });
    for (const log of stMaticLogs) {
      if (log.topics[0] === LidoEvents.stMaticSubmitEvent || log.topics[0] === LidoEvents.stMaticClaimTokensEvent) {
        const event: any = decodeEventLog({
          abi: LidoStMATICAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd =
          formatBigNumberToNumber(
            event.args._amount ? event.args._amount.toString() : event.args._amountClaimed.toString(),
            18,
          ) * maticPriceUsd;

        if (log.topics[0] === LidoEvents.stMaticSubmitEvent) {
          (protocolData.volumes.deposit as number) += amountUsd;
          (protocolData.breakdown[lidoConfig.chain][lidoConfig.maticToken].volumes.deposit as number) += amountUsd;
        } else {
          (protocolData.volumes.withdraw as number) += amountUsd;
          (protocolData.breakdown[lidoConfig.chain][lidoConfig.maticToken].volumes.withdraw as number) += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
