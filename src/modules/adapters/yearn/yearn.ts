import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { YearnProtocolConfig } from '../../../configs/protocols/yearn';
import VaultRegistryV2Abi from '../../../configs/abi/yearn/VaultRegistryV2.json';
import VaultV2Abi from '../../../configs/abi/yearn/VaultV2.json';
import VaultV3Abi from '../../../configs/abi/yearn/VaultV3.json';
import LensOracleV2Abi from '../../../configs/abi/yearn/LensOracleV2.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import UniswapLibs from '../../libs/uniswap';
import yEthPoolAbi from '../../../configs/abi/yearn/yETHPool.json';

export default class YearnAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.yearn';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
    };

    const yearnConfig = this.protocolConfig as YearnProtocolConfig;

    const yethConfig = yearnConfig.yeth;
    if (yethConfig.birthday <= options.timestamp) {
      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        yethConfig.chain,
        options.timestamp,
      );

      protocolData.breakdown[yethConfig.chain] = {};

      for (const poolAddress of yethConfig.pools) {
        const numAssets = await this.services.blockchain.evm.readContract({
          chain: yethConfig.chain,
          abi: yEthPoolAbi,
          target: poolAddress,
          method: 'num_assets',
          params: [],
          blockNumber: blockNumber,
        });

        const getAssetsCalls: Array<ContractCall> = [];
        const getVirtualBalanceCalls: Array<ContractCall> = [];
        for (let i = 0; i < Number(numAssets); i++) {
          getAssetsCalls.push({
            abi: yEthPoolAbi,
            target: poolAddress,
            method: 'assets',
            params: [i],
          });
          getVirtualBalanceCalls.push({
            abi: yEthPoolAbi,
            target: poolAddress,
            method: 'virtual_balance',
            params: [i],
          });
        }
        const getAssetsResults = await this.services.blockchain.evm.multicall({
          chain: yethConfig.chain,
          calls: getAssetsCalls,
          blockNumber: blockNumber,
        });
        const getVirtualBalanceResults = await this.services.blockchain.evm.multicall({
          chain: yethConfig.chain,
          calls: getVirtualBalanceCalls,
          blockNumber: blockNumber,
        });

        for (let i = 0; i < Number(numAssets); i++) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: yethConfig.chain,
            address: getAssetsResults[i],
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const balanceUsd =
              formatBigNumberToNumber(
                getVirtualBalanceResults[i] ? getVirtualBalanceResults[i].toString() : '0',
                token.decimals,
              ) * tokenPriceUsd;

            protocolData.totalAssetDeposited += balanceUsd;
            protocolData.totalValueLocked += balanceUsd;
            (protocolData.totalSupplied as number) += balanceUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
          }
        }
      }
    }

    for (const v2Config of yearnConfig.v2Vaults) {
      if (v2Config.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[v2Config.chain]) {
        protocolData.breakdown[v2Config.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        v2Config.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        v2Config.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(v2Config.chain, options.endTime);

      const numTokens = await this.services.blockchain.evm.readContract({
        chain: v2Config.chain,
        abi: VaultRegistryV2Abi,
        target: v2Config.vaultRegistry,
        method: 'numTokens',
        params: [],
        blockNumber: blockNumber,
      });

      // get all tokens
      const getTokensCalls: Array<ContractCall> = [];
      for (let i = 0; i < Number(numTokens); i++) {
        getTokensCalls.push({
          abi: VaultRegistryV2Abi,
          target: v2Config.vaultRegistry,
          method: 'tokens',
          params: [i],
        });
      }
      const getTokensResults = await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        blockNumber: blockNumber,
        calls: getTokensCalls,
      });

      // for every token, we get number of vault
      const getNumVaultsCalls: Array<ContractCall> = getTokensResults.map((tokenAddress: string) => {
        return {
          abi: VaultRegistryV2Abi,
          target: v2Config.vaultRegistry,
          method: 'numVaults',
          params: [tokenAddress],
        };
      });
      const getNumVaultsResults = await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        blockNumber: blockNumber,
        calls: getNumVaultsCalls,
      });

      // get token price in USDC from yearn oracle
      const getTokenPricesCalls: Array<ContractCall> = getTokensResults.map((tokenAddress: string) => {
        return {
          abi: LensOracleV2Abi,
          target: v2Config.lensOracle,
          method: 'getPriceUsdcRecommended',
          params: [tokenAddress],
        };
      });
      const getTokenPricesResults = await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        blockNumber: blockNumber,
        calls: getTokenPricesCalls,
      });

      // token address => price usd
      const tokenPriceMap: {
        [key: string]: number;
      } = {};

      // vault address => token address
      const vaultTokenMap: {
        [key: string]: string;
      } = {};

      // now, we get all vaults of given token address
      const getTokenVaultsCalls: Array<ContractCall> = [];
      for (let i = 0; i < getTokensResults.length; i++) {
        const numVaults = Number(getNumVaultsResults[i]);
        const tokenAddress = normalizeAddress(getTokensResults[i]);

        for (let v = 0; v < numVaults; v++) {
          getTokenVaultsCalls.push({
            abi: VaultRegistryV2Abi,
            target: v2Config.vaultRegistry,
            method: 'vaults',
            params: [tokenAddress, v],
          });
        }
      }

      const getTokenVaultsResults = await await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        blockNumber: blockNumber,
        calls: getTokenVaultsCalls,
      });

      let vaultIndex = 0;
      for (let i = 0; i < getTokensResults.length; i++) {
        const numVaults = Number(getNumVaultsResults[i]);
        const tokenAddress = normalizeAddress(getTokensResults[i]);

        tokenPriceMap[tokenAddress] = formatBigNumberToNumber(
          getTokenPricesResults[i] ? getTokenPricesResults[i].toString() : '0',
          6,
        );

        if (tokenPriceMap[tokenAddress] === 0) {
          tokenPriceMap[tokenAddress] = await UniswapLibs.getPool2LpPriceUsd({
            chain: v2Config.chain,
            address: tokenAddress,
            blockNumber: blockNumber,
            timestamp: options.timestamp,
          });
        }

        const vaultAddresses = getTokenVaultsResults.slice(vaultIndex, vaultIndex + numVaults);
        for (const vaultAddress of vaultAddresses) {
          vaultTokenMap[normalizeAddress(vaultAddress)] = tokenAddress;
        }

        vaultIndex = vaultIndex + numVaults;
      }

      // to calculate fees were generated
      // we count the change of vault pricePerShare
      const vaultAddresses = Object.keys(vaultTokenMap);
      const getTotalAssetsCalls: Array<ContractCall> = vaultAddresses.map((vaultAddress: string) => {
        return {
          abi: VaultV2Abi,
          target: vaultAddress,
          method: 'totalAssets',
          params: [],
        };
      });
      const begin_getPricePerShareCalls: Array<ContractCall> = vaultAddresses.map((vaultAddress: string) => {
        return {
          abi: VaultV2Abi,
          target: vaultAddress,
          method: 'pricePerShare',
          params: [],
        };
      });
      const after_getPricePerShareCalls: Array<ContractCall> = vaultAddresses.map((vaultAddress: string) => {
        return {
          abi: VaultV2Abi,
          target: vaultAddress,
          method: 'pricePerShare',
          params: [],
        };
      });
      const getTotalAssetsResults = await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        calls: getTotalAssetsCalls,
        blockNumber: blockNumber,
      });
      const begin_getPricePerShareResults = await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        calls: begin_getPricePerShareCalls,
        blockNumber: beginBlock,
      });
      const after_getPricePerShareResults = await this.services.blockchain.evm.multicall({
        chain: v2Config.chain,
        calls: after_getPricePerShareCalls,
        blockNumber: endBlock,
      });

      for (let i = 0; i < vaultAddresses.length; i++) {
        const vaultAddress = vaultAddresses[i];
        const vaultAsset = vaultTokenMap[vaultAddress];

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: v2Config.chain,
          address: vaultAsset,
        });
        if (token) {
          const tokenPriceUsd = tokenPriceMap[vaultAsset] ? tokenPriceMap[vaultAsset] : 0;

          const totalDepositedUsd =
            formatBigNumberToNumber(getTotalAssetsResults[i] ? getTotalAssetsResults[i] : '0', token.decimals) *
            tokenPriceUsd;

          const begin_getPricePerShare = formatBigNumberToNumber(
            begin_getPricePerShareResults[i] ? begin_getPricePerShareResults[i].toString() : '0',
            18,
          );
          const after_getPricePerShare = formatBigNumberToNumber(
            after_getPricePerShareResults[i] ? after_getPricePerShareResults[i].toString() : '0',
            18,
          );
          const priceShareIncrease =
            after_getPricePerShare > begin_getPricePerShare ? after_getPricePerShare - begin_getPricePerShare : 0;
          const rewardCollectedUsd = priceShareIncrease * totalDepositedUsd;

          // performance fee go tor Yearn
          const protocolRevenue = rewardCollectedUsd * v2Config.performanceFeeRate;

          protocolData.totalAssetDeposited += totalDepositedUsd;
          protocolData.totalValueLocked += totalDepositedUsd;
          (protocolData.totalSupplied as number) += totalDepositedUsd;
          protocolData.totalFees += rewardCollectedUsd;
          protocolData.protocolRevenue += protocolRevenue;
          protocolData.supplySideRevenue += rewardCollectedUsd - protocolRevenue;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositedUsd;
          (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
          protocolData.breakdown[token.chain][token.address].totalFees += rewardCollectedUsd;
          protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
          protocolData.breakdown[token.chain][token.address].supplySideRevenue += rewardCollectedUsd - protocolRevenue;
        }
      }
    }

    for (const v3Config of yearnConfig.v3Vaults) {
      if (v3Config.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[v3Config.chain]) {
        protocolData.breakdown[v3Config.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        v3Config.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        v3Config.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(v3Config.chain, options.endTime);

      // token
      const getVaultsTokensCalls: Array<ContractCall> = v3Config.vaults.map((vaultAddress) => {
        return {
          abi: VaultV3Abi,
          target: vaultAddress,
          method: 'asset',
          params: [],
        };
      });
      const getVaultsTokensResults = await this.services.blockchain.evm.multicall({
        chain: v3Config.chain,
        calls: getVaultsTokensCalls,
        blockNumber: blockNumber,
      });

      // total assets
      const getTotalAssetsCalls: Array<ContractCall> = v3Config.vaults.map((vaultAddress) => {
        return {
          abi: VaultV3Abi,
          target: vaultAddress,
          method: 'totalAssets',
          params: [],
        };
      });
      const getTotalAssetsResults = await this.services.blockchain.evm.multicall({
        chain: v3Config.chain,
        calls: getTotalAssetsCalls,
        blockNumber: blockNumber,
      });

      // get price per share
      const begin_getPricePerShareCalls: Array<ContractCall> = v3Config.vaults.map((vaultAddress: string) => {
        return {
          abi: VaultV3Abi,
          target: vaultAddress,
          method: 'pricePerShare',
          params: [],
        };
      });
      const after_getPricePerShareCalls: Array<ContractCall> = v3Config.vaults.map((vaultAddress: string) => {
        return {
          abi: VaultV3Abi,
          target: vaultAddress,
          method: 'pricePerShare',
          params: [],
        };
      });
      const begin_getPricePerShareResults = await this.services.blockchain.evm.multicall({
        chain: v3Config.chain,
        calls: begin_getPricePerShareCalls,
        blockNumber: beginBlock,
      });
      const after_getPricePerShareResults = await this.services.blockchain.evm.multicall({
        chain: v3Config.chain,
        calls: after_getPricePerShareCalls,
        blockNumber: endBlock,
      });

      for (let i = 0; i < v3Config.vaults.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: v3Config.chain,
          address: getVaultsTokensResults[i],
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          const totalDepositedUsd =
            formatBigNumberToNumber(
              getTotalAssetsResults[i] ? getTotalAssetsResults[i].toString() : '0',
              token.decimals,
            ) * tokenPriceUsd;

          const begin_getPricePerShare = formatBigNumberToNumber(
            begin_getPricePerShareResults[i] ? begin_getPricePerShareResults[i].toString() : '0',
            18,
          );
          const after_getPricePerShare = formatBigNumberToNumber(
            after_getPricePerShareResults[i] ? after_getPricePerShareResults[i].toString() : '0',
            18,
          );
          const priceShareIncrease =
            after_getPricePerShare > begin_getPricePerShare ? after_getPricePerShare - begin_getPricePerShare : 0;
          const rewardCollectedUsd = priceShareIncrease * totalDepositedUsd;

          // performance fee go tor Yearn
          const protocolRevenue = rewardCollectedUsd * v3Config.performanceFeeRate;

          protocolData.totalAssetDeposited += totalDepositedUsd;
          protocolData.totalValueLocked += totalDepositedUsd;
          (protocolData.totalSupplied as number) += totalDepositedUsd;
          protocolData.totalFees += rewardCollectedUsd;
          protocolData.protocolRevenue += protocolRevenue;
          protocolData.supplySideRevenue += rewardCollectedUsd - protocolRevenue;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositedUsd;
          (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
          protocolData.breakdown[token.chain][token.address].totalFees += rewardCollectedUsd;
          protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
          protocolData.breakdown[token.chain][token.address].supplySideRevenue += rewardCollectedUsd - protocolRevenue;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
