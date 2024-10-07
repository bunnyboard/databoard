import { AddressZero, TimeUnits } from '../../../configs/constants';
import { BenqiStakingAvaxProtocolConfig } from '../../../configs/protocols/benqi';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import StakedAvaxAbi from '../../../configs/abi/benqi/StakedAvax.json';
import BigNumber from 'bignumber.js';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';

const Events = {
  Submitted: '0xbb0070894135d02edfa550b04d7e5e141aa8090b46e57597ad45bfedd6554498',
  Withdraw: '0x884edad9ce6fa2440d8a54cc123490eb96d2768479d49ff9c7366125a9424364',
};

export default class BenqiStakingAvaxAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.savax 💧';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const config = this.protocolConfig as BenqiStakingAvaxProtocolConfig;

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

    const avaxPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
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

    const [totalSupply, totalAssets] = await this.services.blockchain.evm.multicall({
      chain: config.chain,
      blockNumber: blockNumber,
      calls: [
        {
          target: config.savax,
          abi: StakedAvaxAbi,
          method: 'totalSupply',
          params: [],
        },
        {
          target: config.savax,
          abi: StakedAvaxAbi,
          method: 'totalPooledAvax',
          params: [],
        },
      ],
    });

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < config.birthday
        ? config.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, last7DaysTime);
    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.savax,
      abi: StakedAvaxAbi,
      method: 'getPooledAvaxByShares',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.savax,
      abi: StakedAvaxAbi,
      method: 'getPooledAvaxByShares',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const totalDepositedUsd = formatBigNumberToNumber(totalSupply.toString(), 18) * avaxPriceUsd;
    const totalStakingUsd = formatBigNumberToNumber(totalAssets.toString(), 18) * avaxPriceUsd;

    // rewards were distribute on-chain to sAVAX holders ONLY
    const supplySideRevenue = (stakingApr * totalStakingUsd) / TimeUnits.DaysPerYear;
    const protocolRevenue = (supplySideRevenue / (1 - config.protocolFeeRate)) * config.protocolFeeRate;
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
      address: config.savax,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (log.topics[0] === Events.Submitted || log.topics[0] === Events.Withdraw) {
        const event: any = decodeEventLog({
          abi: StakedAvaxAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = formatBigNumberToNumber(
          event.args.amount ? event.args.amount.toString() : event.args.avaxAmount.toString(),
          18,
        );

        if (log.topics[0] === Events.Submitted) {
          (protocolData.volumes.deposit as number) += amountUsd;
          (protocolData.breakdown[config.chain][AddressZero].volumes.deposit as number) += amountUsd;
        } else {
          (protocolData.volumes.withdraw as number) += amountUsd;
          (protocolData.breakdown[config.chain][AddressZero].volumes.withdraw as number) += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
