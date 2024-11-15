import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import cbETHAbi from '../../../configs/abi/coinbase/cbETH.json';
import { decodeEventLog } from 'viem';
import { CbethProtocolConfig } from '../../../configs/protocols/coinbase';
import { ChainNames } from '../../../configs/names';

export default class CbethAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.cbeth';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const cbethConfig = this.protocolConfig as CbethProtocolConfig;

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
      cbethConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      cbethConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      cbethConfig.chain,
      options.endTime,
    );

    const [exchangeRate, totalSupply] = await this.services.blockchain.evm.multicall({
      chain: ChainNames.ethereum,
      blockNumber: blockNumber,
      calls: [
        {
          abi: cbETHAbi,
          target: cbethConfig.cbeth,
          method: 'exchangeRate',
          params: [],
        },
        {
          abi: cbETHAbi,
          target: cbethConfig.cbeth,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    const totalDepositedUsd =
      formatBigNumberToNumber(exchangeRate.toString(), 18) *
      formatBigNumberToNumber(totalSupply.toString(), 18) *
      ethPriceUsd;

    protocolData.totalAssetDeposited += totalDepositedUsd;
    protocolData.totalValueLocked += totalDepositedUsd;
    (protocolData.totalSupplied as number) += totalDepositedUsd;

    protocolData.breakdown[cbethConfig.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
    protocolData.breakdown[cbethConfig.chain][AddressZero].totalValueLocked += totalDepositedUsd;
    (protocolData.breakdown[cbethConfig.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < cbethConfig.birthday
        ? cbethConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      cbethConfig.chain,
      last7DaysTime,
    );

    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: cbethConfig.chain,
      abi: cbETHAbi,
      target: cbethConfig.cbeth,
      method: 'exchangeRate',
      params: [],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: cbethConfig.chain,
      abi: cbETHAbi,
      target: cbethConfig.cbeth,
      method: 'exchangeRate',
      params: [],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    protocolData.liquidStakingApr = stakingApr * 100;
    protocolData.breakdown.ethereum[AddressZero].liquidStakingApr = stakingApr * 100;

    // 25% protocol fees, source: https://defirate.com/staking
    const coinbaseStakingFeeRate = 0.25;

    // rewards were distribute on-chain to cbETH holders
    const supplySideRevenue = (stakingApr * protocolData.totalAssetDeposited) / TimeUnits.DaysPerYear;
    const protocolRevenue = (supplySideRevenue / (1 - coinbaseStakingFeeRate)) * coinbaseStakingFeeRate;
    const totalFees = supplySideRevenue + protocolRevenue;

    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.breakdown[cbethConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[cbethConfig.chain][AddressZero].protocolRevenue += protocolRevenue;
    protocolData.breakdown[cbethConfig.chain][AddressZero].supplySideRevenue += supplySideRevenue;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: cbethConfig.chain,
      address: cbethConfig.cbeth,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: cbETHAbi,
          topics: log.topics,
          data: log.data,
        });
        if (compareAddress(event.args.to, AddressZero) || compareAddress(event.args.from, AddressZero)) {
          const exchangeRate = await this.services.blockchain.evm.readContract({
            chain: cbethConfig.chain,
            abi: cbETHAbi,
            target: cbethConfig.cbeth,
            method: 'exchangeRate',
            params: [],
            blockNumber: Number(log.blockNumber) - 1,
          });
          const amountUsd =
            formatBigNumberToNumber(event.args.value.toString(), 18) *
            formatBigNumberToNumber(exchangeRate.toString(), 18) *
            ethPriceUsd;

          if (compareAddress(event.args.from, AddressZero)) {
            // deposit
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[cbethConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
          } else {
            // withdraw
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[cbethConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
