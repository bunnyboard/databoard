import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import { RocketpoolProtocolConfig } from '../../../configs/protocols/rocketpool';
import rETHAbi from '../../../configs/abi/rocketpool/rETH.json';
import RocketStorageAbi from '../../../configs/abi/rocketpool/RocketStorage.json';
import RocketMinipoolManagerAbi from '../../../configs/abi/rocketpool/MiniPoolManager.json';

export default class RocketpoolAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.rocketpool 🚀';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const rocketpoolConfig = this.protocolConfig as RocketpoolProtocolConfig;

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
      rocketpoolConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      rocketpoolConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      rocketpoolConfig.chain,
      options.endTime,
    );

    const rocketMiniPoolManagerAddress = await this.services.blockchain.evm.readContract({
      chain: rocketpoolConfig.chain,
      abi: RocketStorageAbi,
      target: rocketpoolConfig.rocketStorage,
      method: 'getAddress',
      // keccak_256("contract.addressrocketMinipoolManager")
      params: ['0xe9dfec9339b94a131861a58f1bb4ac4c1ce55c7ffe8550e0b6ebcfde87bb012f'],
      blockNumber: blockNumber,
    });

    // count total ETH deposited in rETH
    const [getExchangeRate, totalSupply, getActiveMinipoolCount] = await this.services.blockchain.evm.multicall({
      chain: rocketpoolConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: rETHAbi,
          target: rocketpoolConfig.rETH,
          method: 'getExchangeRate',
          params: [],
        },
        {
          abi: rETHAbi,
          target: rocketpoolConfig.rETH,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: RocketMinipoolManagerAbi,
          target: rocketMiniPoolManagerAddress,
          method: 'getActiveMinipoolCount',
          params: [],
        },
      ],
    });
    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: rocketpoolConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const poolEth = Number(getActiveMinipoolCount) * 32;
    const totalDepositedUsd =
      (formatBigNumberToNumber(getExchangeRate, 18) * formatBigNumberToNumber(totalSupply, 18) + poolEth) * ethPriceUsd;

    protocolData.totalAssetDeposited += totalDepositedUsd;
    protocolData.totalValueLocked += totalDepositedUsd;
    (protocolData.totalSupplied as number) += totalDepositedUsd;
    protocolData.breakdown[rocketpoolConfig.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
    protocolData.breakdown[rocketpoolConfig.chain][AddressZero].totalValueLocked += totalDepositedUsd;
    (protocolData.breakdown[rocketpoolConfig.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;

    const rEthLogs = await this.services.blockchain.evm.getContractLogs({
      chain: rocketpoolConfig.chain,
      address: rocketpoolConfig.rETH,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of rEthLogs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: rETHAbi,
          topics: log.topics,
          data: log.data,
        });

        if (compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero)) {
          // deposit
          const exchangeRate = await this.services.blockchain.evm.readContract({
            chain: rocketpoolConfig.chain,
            blockNumber: Number(log.blockNumber) - 1,
            abi: rETHAbi,
            target: rocketpoolConfig.rETH,
            method: 'getExchangeRate',
            params: [],
          });
          const amountUsd =
            formatBigNumberToNumber(exchangeRate.toString(), 18) *
            formatBigNumberToNumber(event.args.value.toString(), 18) *
            ethPriceUsd;

          if (compareAddress(event.args.from, AddressZero)) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[rocketpoolConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
          }
          if (compareAddress(event.args.to, AddressZero)) {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[rocketpoolConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < rocketpoolConfig.birthday
        ? rocketpoolConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      rocketpoolConfig.chain,
      last7DaysTime,
    );
    const [preGetExchangeRate] = await this.services.blockchain.evm.multicall({
      chain: rocketpoolConfig.chain,
      blockNumber: last7DaysBlock,
      calls: [
        {
          abi: rETHAbi,
          target: rocketpoolConfig.rETH,
          method: 'getExchangeRate',
          params: [],
        },
      ],
    });
    const [postGetExchangeRate] = await this.services.blockchain.evm.multicall({
      chain: rocketpoolConfig.chain,
      blockNumber: endBlock,
      calls: [
        {
          abi: rETHAbi,
          target: rocketpoolConfig.rETH,
          method: 'getExchangeRate',
          params: [],
        },
      ],
    });

    const preExchangeRate = formatBigNumberToNumber(preGetExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(postGetExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);
    protocolData.liquidStakingApr = stakingApr * 100;
    protocolData.breakdown[rocketpoolConfig.chain][AddressZero].liquidStakingApr = stakingApr * 100;

    // rewards were distribute on-chain to rETH holders
    const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;

    // rETH stakers contribute a fee, approximately 14% of generated rewards,
    // to compensate node operators for maintaining, & operating their nodes.
    const rocketpoolFeeRate = 0.1; // 10%
    const protocolRevenue = (supplySideRevenue / (1 - rocketpoolFeeRate)) * rocketpoolFeeRate;

    const totalFees = supplySideRevenue + protocolRevenue;

    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += totalFees - protocolRevenue;
    protocolData.breakdown[rocketpoolConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[rocketpoolConfig.chain][AddressZero].protocolRevenue += protocolRevenue;
    protocolData.breakdown[rocketpoolConfig.chain][AddressZero].supplySideRevenue += totalFees - protocolRevenue;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
