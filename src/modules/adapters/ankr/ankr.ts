import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, SolidityUnits, TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import { AnkrProtocolConfig } from '../../../configs/protocols/ankr';
import aAVAXbAbi from '../../../configs/abi/ankr/FutureBondAVAX.json';
import ankrBnbAbi from '../../../configs/abi/ankr/aBNBc.json';
import AvaxPoolAbi from '../../../configs/abi/ankr/AvalanchePool.json';
import BnbPoolAbi from '../../../configs/abi/ankr/BNBStakingPool.json';
import EthPoolAbi from '../../../configs/abi/ankr/EthStakingPool.json';
import FtmPoolAbi from '../../../configs/abi/ankr/FtmStakingPool.json';

const AnkrEvents = {
  // EthStakingPool:StakeConfirmed
  Staking_StakeConfirmed: '0x995d6cdbf356b73aa4dff24e951558cc155c9bb0397786ec4a142f9470f50007',
  // EthStakingPool:PendingUnstake
  Staking_PendingUnstake: '0xc5130045b6f6c9e2944ccea448ad17c279db68237b8aa856ee12cbfaa25f7715',

  // BnbStakingPool:Staked
  Staking_Staked: '0x3df45cb339f96ae4bdb793efcb6e22100dd0dc4fd739a4ee2033fe67ea35af96',
  // BnbStakingPool:Unstaked
  Staking_Unstaked: '0xad145f1b26afda04058ac140badd5b2ae9369e46bf2e2a519fcdb40b65289c4a',

  // AvalanchePool:StakePending
  Avax_StakePending: '0xe3793bcc10f32ca770f843c90d78e93c924a2da9be5357f58e5d44b0d83ee180',
  // AvalanchePool:IntermediaryClaimed
  Avax_IntermediaryClaimed: '0x6d39be3b9cf86cae2f2d9a0fa98cce19a0750d816c0e2db9f0d4ecb912f2cc24',

  // FtmStakingPool:StakeReceived
  Ftm_StakeReceived: '0x85ca1943c20501f52a51dade608849218a28cdf3afb59ef35e0c77bb8223cf60',
  // FtmStakingPool:StakeReceived2
  Ftm_StakeReceived2: '0x5d611757875b1d53cf201259c1593404dff012a7873bfec5f92f28de7746ba96',
  // FtmStakingPool:Withdrawn
  Ftm_Withdrawn: '0x92ccf450a286a957af52509bc1c9939d1a6a481783e142e41e2499f0bb66ebc6',
};

export default class AnkrAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ankr';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const ankrConfig = this.protocolConfig as AnkrProtocolConfig;

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
            liquidStakingApr: 0,
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
            liquidStakingApr: 0,
          },
        },
        avalanche: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
            liquidStakingApr: 0,
          },
        },
        fantom: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
            liquidStakingApr: 0,
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

    for (const stakingConfig of [ankrConfig.ethStaking, ankrConfig.bnbStaking]) {
      if (stakingConfig.birthday <= options.timestamp) {
        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          options.endTime,
        );

        // count total native token deposited
        const [sharesToBonds, totalSupply] = await this.services.blockchain.evm.multicall({
          chain: stakingConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: ankrBnbAbi,
              target: stakingConfig.ankrToken,
              method: 'sharesToBonds',
              params: [SolidityUnits.OneWad], // 1e18
            },
            {
              abi: ankrBnbAbi,
              target: stakingConfig.ankrToken,
              method: 'totalSupply',
              params: [],
            },
          ],
        });
        const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: stakingConfig.chain,
          address: AddressZero,
          timestamp: options.timestamp,
        });

        const totalDepositedUsd =
          formatBigNumberToNumber(sharesToBonds.toString(), 18) *
          formatBigNumberToNumber(totalSupply.toString(), 18) *
          nativeTokenPriceUsd;

        protocolData.totalAssetDeposited += totalDepositedUsd;
        protocolData.totalValueLocked += totalDepositedUsd;
        (protocolData.totalSupplied as number) += totalDepositedUsd;

        protocolData.breakdown[stakingConfig.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
        protocolData.breakdown[stakingConfig.chain][AddressZero].totalValueLocked += totalDepositedUsd;
        (protocolData.breakdown[stakingConfig.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;

        // estimate staking APR beased last 7 day rewards
        const last7DaysTime =
          options.timestamp - TimeUnits.SecondsPerDay * 7 < stakingConfig.birthday
            ? stakingConfig.birthday
            : options.timestamp - TimeUnits.SecondsPerDay * 7;
        const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          last7DaysTime,
        );
        const preSharesToBonds = await this.services.blockchain.evm.readContract({
          chain: stakingConfig.chain,
          blockNumber: last7DaysBlock,
          abi: ankrBnbAbi,
          target: stakingConfig.ankrToken,
          method: 'sharesToBonds',
          params: [SolidityUnits.OneWad], // 1e18
        });
        const postSharesToBonds = await this.services.blockchain.evm.readContract({
          chain: stakingConfig.chain,
          blockNumber: blockNumber,
          abi: ankrBnbAbi,
          target: stakingConfig.ankrToken,
          method: 'sharesToBonds',
          params: [SolidityUnits.OneWad], // 1e18
        });

        const preExchangeRate = formatBigNumberToNumber(preSharesToBonds.toString(), 18);
        const postExchangeRate = formatBigNumberToNumber(postSharesToBonds.toString(), 18);
        const stakingApr =
          (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
          (options.endTime - last7DaysTime);

        // rewards were distribute on-chain to ankr(TOKEN) holders
        const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
        const protocolRevenue = (supplySideRevenue / (1 - 0.1)) * 0.1; // 10% ankr fee
        const totalFees = supplySideRevenue + protocolRevenue;

        protocolData.totalFees += totalFees;
        protocolData.supplySideRevenue += supplySideRevenue;
        protocolData.protocolRevenue += protocolRevenue;
        protocolData.breakdown[stakingConfig.chain][AddressZero].liquidStakingApr = stakingApr * 100;
        protocolData.breakdown[stakingConfig.chain][AddressZero].totalFees += totalFees;
        protocolData.breakdown[stakingConfig.chain][AddressZero].supplySideRevenue += supplySideRevenue;
        protocolData.breakdown[stakingConfig.chain][AddressZero].protocolRevenue += protocolRevenue;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: stakingConfig.chain,
          address: stakingConfig.stakingPool,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          const signature = log.topics[0];
          if (
            signature === AnkrEvents.Staking_Staked ||
            signature === AnkrEvents.Staking_Unstaked ||
            signature === AnkrEvents.Staking_StakeConfirmed ||
            signature === AnkrEvents.Staking_PendingUnstake
          ) {
            const event: any = decodeEventLog({
              abi:
                signature === AnkrEvents.Staking_Staked || signature === AnkrEvents.Staking_Unstaked
                  ? BnbPoolAbi
                  : EthPoolAbi,
              topics: log.topics,
              data: log.data,
            });

            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * nativeTokenPriceUsd;

            if (signature === AnkrEvents.Staking_Staked || signature === AnkrEvents.Staking_StakeConfirmed) {
              (protocolData.volumes.deposit as number) += amountUsd;
              (protocolData.breakdown[stakingConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
            } else {
              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[stakingConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
            }
          }
        }
      }
    }

    for (const stakingConfig of [ankrConfig.avaxStaking, ankrConfig.ftmStaking, ankrConfig.polStaking]) {
      if (stakingConfig.birthday <= options.timestamp) {
        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          options.endTime,
        );

        // count total native deposited
        const [sharesToBalance, totalSharesSupply] = await this.services.blockchain.evm.multicall({
          chain: stakingConfig.chain,
          blockNumber: blockNumber,
          calls: [
            {
              abi: aAVAXbAbi,
              target: stakingConfig.bondToken,
              method: 'sharesToBalance',
              params: [SolidityUnits.OneWad], // 1e18
            },
            {
              abi: aAVAXbAbi,
              target: stakingConfig.bondToken,
              method: 'totalSharesSupply',
              params: [],
            },
          ],
        });

        const tokenAddress = normalizeAddress(stakingConfig.token ? stakingConfig.token : AddressZero);

        // incase POL staking on ethereum
        if (!protocolData.breakdown[stakingConfig.chain][tokenAddress]) {
          protocolData.breakdown[stakingConfig.chain][tokenAddress] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
            liquidStakingApr: 0,
          };
        }

        const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: stakingConfig.chain,
          address: tokenAddress,
          timestamp: options.timestamp,
        });

        const totalDepositedUsd =
          formatBigNumberToNumber(sharesToBalance.toString(), 18) *
          formatBigNumberToNumber(totalSharesSupply.toString(), 18) *
          nativeTokenPriceUsd;

        protocolData.totalAssetDeposited += totalDepositedUsd;
        protocolData.totalValueLocked += totalDepositedUsd;
        (protocolData.totalSupplied as number) += totalDepositedUsd;

        protocolData.breakdown[stakingConfig.chain][tokenAddress].totalAssetDeposited += totalDepositedUsd;
        protocolData.breakdown[stakingConfig.chain][tokenAddress].totalValueLocked += totalDepositedUsd;
        (protocolData.breakdown[stakingConfig.chain][tokenAddress].totalSupplied as number) += totalDepositedUsd;

        // estimate staking APR beased last 7 day rewards
        const last7DaysTime =
          options.timestamp - TimeUnits.SecondsPerDay * 7 < stakingConfig.birthday
            ? stakingConfig.birthday
            : options.timestamp - TimeUnits.SecondsPerDay * 7;
        const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          stakingConfig.chain,
          last7DaysTime,
        );
        const preSharesToBalance = await this.services.blockchain.evm.readContract({
          chain: stakingConfig.chain,
          blockNumber: last7DaysBlock,
          abi: aAVAXbAbi,
          target: stakingConfig.bondToken,
          method: 'sharesToBalance',
          params: [SolidityUnits.OneWad], // 1e18
        });
        const postSharesToBalance = await this.services.blockchain.evm.readContract({
          chain: stakingConfig.chain,
          blockNumber: blockNumber,
          abi: aAVAXbAbi,
          target: stakingConfig.bondToken,
          method: 'sharesToBalance',
          params: [SolidityUnits.OneWad], // 1e18
        });

        const preExchangeRate = formatBigNumberToNumber(preSharesToBalance.toString(), 18);
        const postExchangeRate = formatBigNumberToNumber(postSharesToBalance.toString(), 18);
        const stakingApr =
          (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
          (options.endTime - last7DaysTime);

        // rewards were distribute on-chain to ankr(TOKEN) holders
        const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
        const protocolRevenue = (supplySideRevenue / (1 - 0.1)) * 0.1; // 10% ankr fee
        const totalFees = supplySideRevenue + protocolRevenue;

        protocolData.totalFees += totalFees;
        protocolData.supplySideRevenue += supplySideRevenue;
        protocolData.protocolRevenue += protocolRevenue;
        protocolData.breakdown[stakingConfig.chain][tokenAddress].liquidStakingApr = stakingApr * 100;
        protocolData.breakdown[stakingConfig.chain][tokenAddress].totalFees += totalFees;
        protocolData.breakdown[stakingConfig.chain][tokenAddress].supplySideRevenue += supplySideRevenue;
        protocolData.breakdown[stakingConfig.chain][tokenAddress].protocolRevenue += protocolRevenue;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: stakingConfig.chain,
          address: stakingConfig.stakingPool,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          const signature = log.topics[0];
          if (
            signature === AnkrEvents.Avax_StakePending ||
            signature === AnkrEvents.Avax_IntermediaryClaimed ||
            signature === AnkrEvents.Ftm_StakeReceived ||
            signature === AnkrEvents.Ftm_StakeReceived2 ||
            signature === AnkrEvents.Ftm_Withdrawn
          ) {
            const event: any = decodeEventLog({
              abi:
                signature === AnkrEvents.Avax_StakePending || signature === AnkrEvents.Avax_IntermediaryClaimed
                  ? AvaxPoolAbi
                  : FtmPoolAbi,
              topics: log.topics,
              data: log.data,
            });

            if (
              signature === AnkrEvents.Avax_StakePending ||
              signature === AnkrEvents.Ftm_StakeReceived ||
              signature === AnkrEvents.Ftm_StakeReceived2
            ) {
              const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * nativeTokenPriceUsd;
              (protocolData.volumes.deposit as number) += amountUsd;
              (protocolData.breakdown[stakingConfig.chain][tokenAddress].volumes.deposit as number) += amountUsd;
            } else if (signature === AnkrEvents.Avax_IntermediaryClaimed) {
              let amountUsd = 0;
              for (const amount of event.args.amounts) {
                amountUsd += formatBigNumberToNumber(amount.toString(), 18) * nativeTokenPriceUsd;
              }
              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[stakingConfig.chain][tokenAddress].volumes.withdraw as number) += amountUsd;
            } else if (signature === AnkrEvents.Ftm_Withdrawn) {
              const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * nativeTokenPriceUsd;
              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[stakingConfig.chain][tokenAddress].volumes.withdraw as number) += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
