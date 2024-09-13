import { LidoProtocolConfig } from '../../../configs/protocols/lido';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import LidoStETHAbi from '../../../configs/abi/lido/stETH.json';
import LidoLegacyOracleAbi from '../../../configs/abi/lido/LegacyOracle.json';
import LidoWithdrawalQueueAbi from '../../../configs/abi/lido/WithdrawalQueue.json';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { LidoEvents } from './abis';
import { decodeEventLog } from 'viem';

export default class LidoAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.lido 💧';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const lidoConfig = this.protocolConfig as LidoProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},

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
    const rawPrice = await this.services.oracle.getTokenPriceUsd({
      chain: lidoConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const totalEthDeposited = formatBigNumberToNumber(getTotalPooledEther.toString(), 18);
    const ethPriceUsd = rawPrice ? Number(rawPrice) : 0;

    protocolData.totalAssetDeposited += totalEthDeposited * ethPriceUsd;
    protocolData.totalValueLocked += totalEthDeposited * ethPriceUsd;
    (protocolData.totalSupplied as number) += totalEthDeposited * ethPriceUsd;

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
        (protocolData.volumes.deposit as number) +=
          formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;
        protocolData.moneyFlowIn += formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;
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

    const totalFees = (stakingApr * totalEthDeposited * ethPriceUsd) / TimeUnits.DaysPerYear;
    const protocolRevenue = totalFees * 0.1; // Lido takes 10% staking rewards
    const supplySideRevenue = totalFees - protocolRevenue; // Lido takes 10% staking rewards

    (protocolData.liquidStakingApr as number) = stakingApr * 100;
    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += supplySideRevenue;

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
        protocolData.moneyFlowOut += amountUsd;
      }
    }

    protocolData.moneyFlowNet = protocolData.moneyFlowIn - protocolData.moneyFlowOut;
    protocolData.totalVolume += (protocolData.volumes.deposit as number) + (protocolData.volumes.withdraw as number);

    protocolData.breakdown[lidoConfig.chain] = {};
    protocolData.breakdown[lidoConfig.chain][AddressZero] = {
      totalAssetDeposited: protocolData.totalAssetDeposited,
      totalValueLocked: protocolData.totalValueLocked,
      totalFees: protocolData.totalFees,
      protocolRevenue: protocolData.protocolRevenue,
      supplySideRevenue: protocolData.supplySideRevenue,
      moneyFlowIn: protocolData.moneyFlowIn,
      moneyFlowOut: protocolData.moneyFlowOut,
      moneyFlowNet: protocolData.moneyFlowNet,
      totalVolume: protocolData.totalVolume,
      totalSupplied: protocolData.totalSupplied,
      volumes: protocolData.volumes,
    };

    return protocolData;
  }
}
