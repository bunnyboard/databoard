import { AddressZero, SolidityUnits, TimeUnits } from '../../../configs/constants';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { SlisbnbProtocolConfig } from '../../../configs/protocols/slisbnb';
import StakeManagerAbi from '../../../configs/abi/lista/ListaStakeManager.json';

const Events = {
  Deposit: '0xe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c',
  ClaimWithdrawal: '0x63bfb3a58e0713d68e49dda62c223fab04fb534eeef8ac6356cec78e691c092a',
};

export default class SlisbnbAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.slisbnb';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const config = this.protocolConfig as SlisbnbProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [config.chain]: {
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

    const bnbPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: config.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      config.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, options.beginTime);
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, options.endTime);

    const getTotalPooledBnb = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      blockNumber: blockNumber,
      target: config.stakeManager,
      abi: StakeManagerAbi,
      method: 'getTotalPooledBnb',
      params: [],
    });

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < config.birthday
        ? config.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, last7DaysTime);
    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.stakeManager,
      abi: StakeManagerAbi,
      method: 'convertSnBnbToBnb',
      params: [SolidityUnits.OneWad],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.stakeManager,
      abi: StakeManagerAbi,
      method: 'convertSnBnbToBnb',
      params: [SolidityUnits.OneWad],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const totalDepositedUsd = formatBigNumberToNumber(getTotalPooledBnb.toString(), 18) * bnbPriceUsd;

    // https://docs.bsc.lista.org/introduction/liquid-staking-slisbnb/rewards-and-fees
    const protocolFeeRate = 0.05; // 5%
    const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
    const protocolRevenue = (supplySideRevenue / (1 - protocolFeeRate)) * protocolFeeRate;
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
      address: config.stakeManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (log.topics[0] === Events.Deposit || log.topics[0] === Events.ClaimWithdrawal) {
        const event: any = decodeEventLog({
          abi: StakeManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = formatBigNumberToNumber(event.args._amount.toString(), 18);

        if (log.topics[0] === Events.Deposit) {
          (protocolData.volumes.deposit as number) += amountUsd;
          (protocolData.breakdown[config.chain][AddressZero].volumes.deposit as number) += amountUsd;
        } else {
          (protocolData.volumes.withdraw as number) += amountUsd;
          (protocolData.breakdown[config.chain][AddressZero].volumes.withdraw as number) += amountUsd;
        }
      }
    }

    protocolData.liquidStakingApr = stakingApr * 100;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
