import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { BedrockProtocolConfig } from '../../../configs/protocols/bedrock';
import BedrockEthStakingAbi from '../../../configs/abi/bedrock/EthStaking.json';
import BedrockBtcVaultAbi from '../../../configs/abi/bedrock/VaultWithoutNative.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { decodeEventLog } from 'viem';
import ProtocolExtendedAdapter from '../extended';

const Events = {
  Minted: '0x30385c845b448a36257a6a1716e6ad2e1bc2cbe333cde1e69fe849ad6511adfe',
};

export default class BedrockAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.bedrock';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const config = this.protocolConfig as BedrockProtocolConfig;

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
      },

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
      liquidStakingApr: 0,
    };

    if (config.birthday > options.timestamp) {
      return protocolData;
    }

    {
      const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: config.ethStaking.chain,
        address: AddressZero,
        timestamp: options.timestamp,
      });

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethStaking.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethStaking.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethStaking.chain,
        options.endTime,
      );

      const getTotalStaked = await this.services.blockchain.evm.readContract({
        chain: config.ethStaking.chain,
        abi: BedrockEthStakingAbi,
        target: config.ethStaking.staking,
        method: 'getTotalStaked',
        params: [],
        blockNumber: blockNumber,
      });
      const totalEthDepositedUsd = formatBigNumberToNumber(getTotalStaked.toString(), 18) * ethPriceUsd;

      protocolData.totalAssetDeposited += totalEthDepositedUsd;
      protocolData.totalValueLocked += totalEthDepositedUsd;
      (protocolData.totalSupplied as number) += totalEthDepositedUsd;
      protocolData.breakdown[config.ethStaking.chain][AddressZero].totalAssetDeposited += totalEthDepositedUsd;
      protocolData.breakdown[config.ethStaking.chain][AddressZero].totalValueLocked += totalEthDepositedUsd;
      (protocolData.breakdown[config.ethStaking.chain][AddressZero].totalSupplied as number) += totalEthDepositedUsd;

      // estimate staking APR beased last 7 day rewards
      const last7DaysTime =
        options.timestamp - TimeUnits.SecondsPerDay * 7 < config.birthday
          ? config.birthday
          : options.timestamp - TimeUnits.SecondsPerDay * 7;
      const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.ethStaking.chain,
        last7DaysTime,
      );

      const getPreExchangeRate = await this.services.blockchain.evm.readContract({
        chain: config.ethStaking.chain,
        abi: BedrockEthStakingAbi,
        target: config.ethStaking.staking,
        method: 'exchangeRatio',
        params: [],
        blockNumber: last7DaysBlock,
      });
      const getPostExchangeRate = await this.services.blockchain.evm.readContract({
        chain: config.ethStaking.chain,
        abi: BedrockEthStakingAbi,
        target: config.ethStaking.staking,
        method: 'exchangeRatio',
        params: [],
        blockNumber: blockNumber,
      });

      const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate ? getPreExchangeRate.toString() : '0', 18);
      const postExchangeRate = getPostExchangeRate
        ? formatBigNumberToNumber(getPostExchangeRate.toString(), 18)
        : preExchangeRate;

      const stakingApr =
        (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
        (options.endTime - last7DaysTime);

      // 10% protocol fees, source: https://docs.bedrock.technology/multi-asset-liquid-staking/unieth/fees
      const protocolFeeRate = 0.1;

      // rewards were distribute on-chain to wbETH holders
      const supplySideRevenue = (stakingApr * protocolData.totalAssetDeposited) / TimeUnits.DaysPerYear;
      const protocolRevenue = (supplySideRevenue / (1 - protocolFeeRate)) * protocolFeeRate;
      const totalFees = supplySideRevenue + protocolRevenue;

      protocolData.totalFees += totalFees;
      protocolData.supplySideRevenue += supplySideRevenue;
      protocolData.protocolRevenue += protocolRevenue;
      protocolData.liquidStakingApr = stakingApr * 100;
      protocolData.breakdown[config.ethStaking.chain][AddressZero].totalFees += totalFees;
      protocolData.breakdown[config.ethStaking.chain][AddressZero].supplySideRevenue += supplySideRevenue;
      protocolData.breakdown[config.ethStaking.chain][AddressZero].protocolRevenue += protocolRevenue;
      protocolData.breakdown[config.ethStaking.chain][AddressZero].liquidStakingApr = stakingApr * 100;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: config.ethStaking.chain,
        address: config.ethStaking.uniETH,
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
            const exchangeRatio = await this.services.blockchain.evm.readContract({
              chain: config.ethStaking.chain,
              abi: BedrockEthStakingAbi,
              target: config.ethStaking.staking,
              method: 'exchangeRatio',
              params: [],
              blockNumber: Number(log.blockNumber) - 1,
            });

            const amountEthUsd =
              formatBigNumberToNumber(exchangeRatio, 18) *
              formatBigNumberToNumber(event.args.value.toString(), 18) *
              ethPriceUsd;

            if (compareAddress(event.args.from, AddressZero)) {
              (protocolData.volumes.deposit as number) += amountEthUsd;
              (protocolData.breakdown[config.ethStaking.chain][AddressZero].volumes.deposit as number) += amountEthUsd;
            } else {
              (protocolData.volumes.withdraw as number) += amountEthUsd;
              (protocolData.breakdown[config.ethStaking.chain][AddressZero].volumes.withdraw as number) += amountEthUsd;
            }
          }
        }
      }
    }

    for (const btcStaking of config.btcStaking) {
      if (btcStaking.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[btcStaking.chain]) {
        protocolData.breakdown[btcStaking.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        btcStaking.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        btcStaking.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        btcStaking.chain,
        options.endTime,
      );

      const tokens: Array<Token> = [];
      for (const address of btcStaking.tokens) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: btcStaking.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: btcStaking.chain,
        ownerAddress: btcStaking.vault,
        tokens: tokens,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;
      (protocolData.totalSupplied as number) += getBalanceResult.totalBalanceUsd;

      for (const [address, balance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        if (!protocolData.breakdown[btcStaking.chain][address]) {
          protocolData.breakdown[btcStaking.chain][address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          };
        }

        protocolData.breakdown[btcStaking.chain][address].totalAssetDeposited += balance.balanceUsd;
        protocolData.breakdown[btcStaking.chain][address].totalValueLocked += balance.balanceUsd;
        (protocolData.breakdown[btcStaking.chain][address].totalSupplied as number) += balance.balanceUsd;
      }

      const vaultLogs = await this.services.blockchain.evm.getContractLogs({
        chain: btcStaking.chain,
        address: btcStaking.vault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of vaultLogs) {
        if (log.topics[0] === Events.Minted) {
          const event: any = decodeEventLog({
            abi: BedrockBtcVaultAbi,
            topics: log.topics,
            data: log.data,
          });

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: btcStaking.chain,
            address: event.args.token,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            (protocolData.volumes.deposit as number) += amountUsd;
            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                volumes: {
                  deposit: 0,
                  withdraw: 0,
                },
              };
            }
            (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
