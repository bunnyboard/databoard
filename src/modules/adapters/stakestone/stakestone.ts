import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { StakeStoneProtocolConfig } from '../../../configs/protocols/stakestone';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import StoneVaultAbi from '../../../configs/abi/stakestone/StoneVault.json';

export default class StakeStoneAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.stakestone';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const config = this.protocolConfig as StakeStoneProtocolConfig;

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

    const latestRoundID = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.vault,
      abi: StoneVaultAbi,
      method: 'latestRoundID',
      params: [],
      blockNumber: blockNumber,
    });
    const [roundPricePerShare, totalSupply] = await this.services.blockchain.evm.multicall({
      chain: config.chain,
      blockNumber: blockNumber,
      calls: [
        {
          target: config.vault,
          abi: StoneVaultAbi,
          method: 'roundPricePerShare',
          params: [Number(latestRoundID) - 1],
        },
        {
          target: config.stone,
          abi: Erc20Abi,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    // estimate staking APR beased last 15 day rewards
    const estimateApyDays = 15;
    const last30DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * estimateApyDays < config.birthday
        ? config.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * estimateApyDays;
    const last30DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      config.chain,
      last30DaysTime,
    );
    const preLatestRoundID = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.vault,
      abi: StoneVaultAbi,
      method: 'latestRoundID',
      params: [],
      blockNumber: last30DaysBlock,
    });
    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.vault,
      abi: StoneVaultAbi,
      method: 'roundPricePerShare',
      params: [Number(preLatestRoundID) - 1],
      blockNumber: last30DaysBlock,
    });

    const postLatestRoundID = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.vault,
      abi: StoneVaultAbi,
      method: 'latestRoundID',
      params: [],
      blockNumber: endBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: config.chain,
      target: config.vault,
      abi: StoneVaultAbi,
      method: 'roundPricePerShare',
      params: [Number(postLatestRoundID) - 1],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last30DaysTime);

    const totalDepositedUsd =
      formatBigNumberToNumber(roundPricePerShare.toString(), 18) *
      formatBigNumberToNumber(totalSupply.toString(), 18) *
      ethPriceUsd;

    // rewards were distribute on-chain to STONE holders
    const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
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
      address: config.stone,
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
          const getLatestRoundID = await this.services.blockchain.evm.readContract({
            chain: config.chain,
            target: config.vault,
            abi: StoneVaultAbi,
            method: 'latestRoundID',
            params: [],
            blockNumber: Number(log.blockNumber) - 1,
          });
          const exchangeRate = await this.services.blockchain.evm.readContract({
            chain: config.chain,
            abi: StoneVaultAbi,
            target: config.vault,
            method: 'roundPricePerShare',
            params: [Number(getLatestRoundID) - 1],
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
