import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, SolidityUnits, TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { StaderProtocolConfig } from '../../../configs/protocols/stader';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import StakingPoolManagerAbi from '../../../configs/abi/stader/StakingPoolManager.json';
import StakingPoolManagerV2Abi from '../../../configs/abi/stader/StakeManagerV2.json';
import MaticXAbi from '../../../configs/abi/stader/MaticX.json';

const Events = {
  // ETH StakeManager
  Deposited: '0xf5681f9d0db1b911ac18ee83d515a1cf1051853a9eae418316a2fdf7dea427c5',
  TransferredETHToUserWithdrawManager: '0xfcf1373cbfb78832a864dcce3862324e51116876bd08423a61b5ed6d5c03f421',

  // BNB StakeManagerV2
  Delegated: '0x83b3f5ce88736f0128f880f5cac19836da52ea5c5ca7704c7b38f3b06fffd7ab',
  ClaimedWithdrawal: '0x8b6f8b3a27aa9cc5b1bf962040c137889a5fcb88f77aa0a33fa0a55c8cd2402f',

  // MaticX
  Submit: '0xc205a922ce10fe082feabd05c9b000dd57cbf54ebce16cf596ec84a2df65122f',
  ClaimWithdrawal: '0x63bfb3a58e0713d68e49dda62c223fab04fb534eeef8ac6356cec78e691c092a',
};

export default class StaderAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.stader';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const config = this.protocolConfig as StaderProtocolConfig;

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
        bnbchain: {
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

    // ETH staking
    if (options.timestamp >= config.ethx.birthday) {
      const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: config.ethx.chain,
        address: AddressZero,
        timestamp: options.timestamp,
      });

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethx.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethx.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethx.chain,
        options.endTime,
      );

      const [getExchangeRate, totalSupply] = await this.services.blockchain.evm.multicall({
        chain: config.ethx.chain,
        blockNumber: blockNumber,
        calls: [
          {
            target: config.ethx.stakingPoolManager,
            abi: StakingPoolManagerAbi,
            method: 'getExchangeRate',
            params: [],
          },
          {
            target: config.ethx.ethx,
            abi: Erc20Abi,
            method: 'totalSupply',
            params: [],
          },
        ],
      });

      // estimate staking APR beased last 7 day rewards
      const last7DaysTime =
        options.timestamp - TimeUnits.SecondsPerDay * 7 < config.ethx.birthday
          ? config.ethx.birthday
          : options.timestamp - TimeUnits.SecondsPerDay * 7;
      const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethx.chain,
        last7DaysTime,
      );
      const getPreExchangeRate = await this.services.blockchain.evm.readContract({
        chain: config.ethx.chain,
        target: config.ethx.stakingPoolManager,
        abi: StakingPoolManagerAbi,
        method: 'getExchangeRate',
        params: [],
        blockNumber: last7DaysBlock,
      });
      const getPostExchangeRate = await this.services.blockchain.evm.readContract({
        chain: config.ethx.chain,
        target: config.ethx.stakingPoolManager,
        abi: StakingPoolManagerAbi,
        method: 'getExchangeRate',
        params: [],
        blockNumber: blockNumber,
      });

      let stakingApr = 0;
      if (getPreExchangeRate && getPostExchangeRate) {
        const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
        const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

        stakingApr =
          (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
          (options.endTime - last7DaysTime);
      }

      const totalDeposited =
        formatBigNumberToNumber(getExchangeRate.toString(), 18) * formatBigNumberToNumber(totalSupply.toString(), 18);
      const totalDepositedUsd = totalDeposited * ethPriceUsd;

      // rewards were distribute on-chain to ETHx holders
      const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
      const protocolRevenue = (supplySideRevenue / (1 - config.ethx.protocolFeeRate)) * config.ethx.protocolFeeRate;
      const totalFees = supplySideRevenue + protocolRevenue;

      protocolData.totalAssetDeposited += totalDepositedUsd;
      protocolData.totalValueLocked += totalDepositedUsd;
      (protocolData.totalSupplied as number) += totalDepositedUsd;
      protocolData.totalFees += totalFees;
      protocolData.protocolRevenue += protocolRevenue;
      protocolData.supplySideRevenue += supplySideRevenue;
      protocolData.liquidStakingApr = stakingApr * 100;

      protocolData.breakdown[config.ethx.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
      protocolData.breakdown[config.ethx.chain][AddressZero].totalValueLocked += totalDepositedUsd;
      (protocolData.breakdown[config.ethx.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;
      protocolData.breakdown[config.ethx.chain][AddressZero].totalFees += totalFees;
      protocolData.breakdown[config.ethx.chain][AddressZero].protocolRevenue += protocolRevenue;
      protocolData.breakdown[config.ethx.chain][AddressZero].supplySideRevenue += supplySideRevenue;
      protocolData.breakdown[config.ethx.chain][AddressZero].liquidStakingApr = stakingApr * 100;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: config.ethx.chain,
        address: config.ethx.stakingPoolManager,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.Deposited || log.topics[0] === Events.TransferredETHToUserWithdrawManager) {
          const event: any = decodeEventLog({
            abi: StakingPoolManagerAbi,
            topics: log.topics,
            data: log.data,
          });

          const amountUsd =
            formatBigNumberToNumber(
              event.args.assets ? event.args.assets.toString() : event.args.amount.toString(),
              18,
            ) * ethPriceUsd;
          if (log.topics[0] === Events.Deposited) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[config.ethx.chain][AddressZero].volumes.deposit as number) += amountUsd;
          } else {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[config.ethx.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    // BNB staking
    if (options.timestamp >= config.bnbx.birthday) {
      const bnbPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: config.bnbx.chain,
        address: AddressZero,
        timestamp: options.timestamp,
      });

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.bnbx.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.bnbx.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.bnbx.chain,
        options.endTime,
      );

      const totalDelegated = await this.services.blockchain.evm.readContract({
        chain: config.bnbx.chain,
        blockNumber: blockNumber,
        target: config.bnbx.stakingPoolManager,
        abi: StakingPoolManagerV2Abi,
        method: 'totalDelegated',
        params: [],
      });

      // estimate staking APR beased last 7 day rewards
      const last7DaysTime =
        options.timestamp - TimeUnits.SecondsPerDay * 7 < config.bnbx.birthday
          ? config.bnbx.birthday
          : options.timestamp - TimeUnits.SecondsPerDay * 7;
      const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.bnbx.chain,
        last7DaysTime,
      );
      const getPreExchangeRate = await this.services.blockchain.evm.readContract({
        chain: config.bnbx.chain,
        target: config.bnbx.stakingPoolManager,
        abi: StakingPoolManagerV2Abi,
        method: 'convertBnbXToBnb',
        params: [SolidityUnits.OneWad],
        blockNumber: last7DaysBlock,
      });
      const getPostExchangeRate = await this.services.blockchain.evm.readContract({
        chain: config.bnbx.chain,
        target: config.bnbx.stakingPoolManager,
        abi: StakingPoolManagerV2Abi,
        method: 'convertBnbXToBnb',
        params: [SolidityUnits.OneWad],
        blockNumber: blockNumber,
      });

      let stakingApr = 0;
      if (getPreExchangeRate && getPostExchangeRate) {
        const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
        const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

        stakingApr =
          (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
          (options.endTime - last7DaysTime);
      }

      const totalDepositedUsd = formatBigNumberToNumber(totalDelegated.toString(), 18) * bnbPriceUsd;

      // rewards were distribute on-chain to BNBx holders
      const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
      const protocolRevenue = (supplySideRevenue / (1 - config.bnbx.protocolFeeRate)) * config.bnbx.protocolFeeRate;
      const totalFees = supplySideRevenue + protocolRevenue;

      protocolData.totalAssetDeposited += totalDepositedUsd;
      protocolData.totalValueLocked += totalDepositedUsd;
      (protocolData.totalSupplied as number) += totalDepositedUsd;
      protocolData.totalFees += totalFees;
      protocolData.protocolRevenue += protocolRevenue;
      protocolData.supplySideRevenue += supplySideRevenue;

      protocolData.breakdown[config.bnbx.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
      protocolData.breakdown[config.bnbx.chain][AddressZero].totalValueLocked += totalDepositedUsd;
      (protocolData.breakdown[config.bnbx.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;
      protocolData.breakdown[config.bnbx.chain][AddressZero].totalFees += totalFees;
      protocolData.breakdown[config.bnbx.chain][AddressZero].protocolRevenue += protocolRevenue;
      protocolData.breakdown[config.bnbx.chain][AddressZero].supplySideRevenue += supplySideRevenue;
      protocolData.breakdown[config.bnbx.chain][AddressZero].liquidStakingApr = stakingApr * 100;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: config.bnbx.chain,
        address: config.bnbx.stakingPoolManager,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.Delegated || log.topics[0] === Events.ClaimedWithdrawal) {
          const event: any = decodeEventLog({
            abi: StakingPoolManagerV2Abi,
            topics: log.topics,
            data: log.data,
          });

          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * bnbPriceUsd;
          if (log.topics[0] === Events.Delegated) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[config.bnbx.chain][AddressZero].volumes.deposit as number) += amountUsd;
          } else {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[config.bnbx.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    // MATIC staking
    if (options.timestamp >= config.maticx.birthday) {
      const maticToken = normalizeAddress(config.maticx.token);
      if (!protocolData.breakdown[config.maticx.chain][maticToken]) {
        protocolData.breakdown[config.maticx.chain][maticToken] = {
          ...getInitialProtocolCoreMetrics(),
          totalSupplied: 0,
          volumes: {
            deposit: 0,
            withdraw: 0,
          },
        };
      }

      const maticPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: config.maticx.chain,
        address: maticToken,
        timestamp: options.timestamp,
      });

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.maticx.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.maticx.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.maticx.chain,
        options.endTime,
      );

      const totalPooledMatic = await this.services.blockchain.evm.readContract({
        chain: config.maticx.chain,
        blockNumber: blockNumber,
        target: config.maticx.maticx,
        abi: MaticXAbi,
        method: 'getTotalPooledMatic',
        params: [],
      });

      // estimate staking APR beased last 7 day rewards
      const last7DaysTime =
        options.timestamp - TimeUnits.SecondsPerDay * 7 < config.maticx.birthday
          ? config.maticx.birthday
          : options.timestamp - TimeUnits.SecondsPerDay * 7;
      const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.maticx.chain,
        last7DaysTime,
      );
      const [getPreExchangeRate, ,] = await this.services.blockchain.evm.readContract({
        chain: config.maticx.chain,
        target: config.maticx.maticx,
        abi: MaticXAbi,
        method: 'convertMaticXToMatic',
        params: [SolidityUnits.OneWad],
        blockNumber: last7DaysBlock,
      });
      const [getPostExchangeRate, ,] = await this.services.blockchain.evm.readContract({
        chain: config.maticx.chain,
        target: config.maticx.maticx,
        abi: MaticXAbi,
        method: 'convertMaticXToMatic',
        params: [SolidityUnits.OneWad],
        blockNumber: blockNumber,
      });

      let stakingApr = 0;
      if (getPreExchangeRate && getPostExchangeRate) {
        const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
        const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

        stakingApr =
          (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
          (options.endTime - last7DaysTime);
      }

      const totalDepositedUsd = formatBigNumberToNumber(totalPooledMatic.toString(), 18) * maticPriceUsd;

      // rewards were distribute on-chain to MaticX holders
      const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
      const protocolRevenue = (supplySideRevenue / (1 - config.maticx.protocolFeeRate)) * config.maticx.protocolFeeRate;
      const totalFees = supplySideRevenue + protocolRevenue;

      protocolData.totalAssetDeposited += totalDepositedUsd;
      protocolData.totalValueLocked += totalDepositedUsd;
      (protocolData.totalSupplied as number) += totalDepositedUsd;
      protocolData.totalFees += totalFees;
      protocolData.protocolRevenue += protocolRevenue;
      protocolData.supplySideRevenue += supplySideRevenue;

      protocolData.breakdown[config.maticx.chain][maticToken].totalAssetDeposited += totalDepositedUsd;
      protocolData.breakdown[config.maticx.chain][maticToken].totalValueLocked += totalDepositedUsd;
      (protocolData.breakdown[config.maticx.chain][maticToken].totalSupplied as number) += totalDepositedUsd;
      protocolData.breakdown[config.maticx.chain][maticToken].totalFees += totalFees;
      protocolData.breakdown[config.maticx.chain][maticToken].protocolRevenue += protocolRevenue;
      protocolData.breakdown[config.maticx.chain][maticToken].supplySideRevenue += supplySideRevenue;
      protocolData.breakdown[config.maticx.chain][maticToken].liquidStakingApr = stakingApr * 100;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: config.maticx.chain,
        address: config.maticx.maticx,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.Submit || log.topics[0] === Events.ClaimWithdrawal) {
          const event: any = decodeEventLog({
            abi: MaticXAbi,
            topics: log.topics,
            data: log.data,
          });

          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * maticPriceUsd;
          if (log.topics[0] === Events.Submit) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[config.maticx.chain][maticToken].volumes.deposit as number) += amountUsd;
          } else {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[config.maticx.chain][maticToken].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
