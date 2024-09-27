import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import swETHAbi from '../../../configs/abi/swellnetwork/swETH.json';
import { SwethProtocolConfig } from '../../../configs/protocols/swellnetwork';

export default class SwethAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.sweth';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const swethConfig = this.protocolConfig as SwethProtocolConfig;

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
      swethConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      swethConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      swethConfig.chain,
      options.endTime,
    );

    const [getRate, totalSupply] = await this.services.blockchain.evm.multicall({
      chain: swethConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          target: swethConfig.address,
          abi: swETHAbi,
          method: 'getRate',
          params: [],
        },
        {
          target: swethConfig.address,
          abi: swETHAbi,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < swethConfig.birthday
        ? swethConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      swethConfig.chain,
      last7DaysTime,
    );
    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: swethConfig.chain,
      target: swethConfig.address,
      abi: swETHAbi,
      method: 'getRate',
      params: [],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: swethConfig.chain,
      target: swethConfig.address,
      abi: swETHAbi,
      method: 'getRate',
      params: [],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const totalDeposited =
      formatBigNumberToNumber(getRate.toString(), 18) * formatBigNumberToNumber(totalSupply.toString(), 18);
    const totalDepositedUsd = totalDeposited * ethPriceUsd;

    // rewards were distribute on-chain to swETH holders
    const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
    const protocolRevenue = (supplySideRevenue / (1 - swethConfig.protocolFeeRate)) * swethConfig.protocolFeeRate;
    const totalFees = supplySideRevenue + protocolRevenue;

    protocolData.totalAssetDeposited += totalDepositedUsd;
    protocolData.totalValueLocked += totalDepositedUsd;
    (protocolData.totalSupplied as number) += totalDepositedUsd;
    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.liquidStakingApr = stakingApr * 100;

    protocolData.breakdown[swethConfig.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
    protocolData.breakdown[swethConfig.chain][AddressZero].totalValueLocked += totalDepositedUsd;
    (protocolData.breakdown[swethConfig.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;
    protocolData.breakdown[swethConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[swethConfig.chain][AddressZero].protocolRevenue += protocolRevenue;
    protocolData.breakdown[swethConfig.chain][AddressZero].supplySideRevenue += supplySideRevenue;
    protocolData.breakdown[swethConfig.chain][AddressZero].liquidStakingApr = stakingApr * 100;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: swethConfig.chain,
      address: swethConfig.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: swETHAbi,
          topics: log.topics,
          data: log.data,
        });
        if (compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero)) {
          // deposit
          const exchangeRate = await this.services.blockchain.evm.readContract({
            chain: swethConfig.chain,
            abi: swETHAbi,
            target: swethConfig.address,
            method: 'getRate',
            params: [],
            blockNumber: Number(log.blockNumber) - 1,
          });
          const amountUsd =
            formatBigNumberToNumber(exchangeRate.toString(), 18) *
            formatBigNumberToNumber(event.args.value.toString(), 18) *
            ethPriceUsd;

          if (compareAddress(event.args.from, AddressZero)) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[swethConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
          }
          if (compareAddress(event.args.to, AddressZero)) {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[swethConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
