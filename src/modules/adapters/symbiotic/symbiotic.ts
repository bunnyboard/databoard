import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { ContractCall } from '../../../services/blockchains/domains';
import { formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';
import { SymbioticProtocolConfig } from '../../../configs/protocols/symbiotic';
import CollateralAbi from '../../../configs/abi/symbiotic/DefaultCollateral.json';
import FactoryAbi from '../../../configs/abi/symbiotic/DefaultCollateralFactory.json';
import VaultAbi from '../../../configs/abi/symbiotic/Vault.json';

export default class SymbioticAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.symbiotic';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const symbioticConfig = this.protocolConfig as SymbioticProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
    };

    for (const factoryConfig of symbioticConfig.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[factoryConfig.chain]) {
        protocolData.breakdown[factoryConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.timestamp,
      );

      const totalEntities = await this.services.blockchain.evm.readContract({
        chain: factoryConfig.chain,
        abi: FactoryAbi,
        target: factoryConfig.factory,
        method: 'totalEntities',
        params: [],
        blockNumber: blockNumber,
      });

      const getEntitiesCalls: Array<ContractCall> = [];
      for (let i = 0; i < Number(totalEntities); i++) {
        getEntitiesCalls.push({
          abi: FactoryAbi,
          target: factoryConfig.factory,
          method: 'entity',
          params: [i],
        });
      }
      const getEntitiesResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        blockNumber: blockNumber,
        calls: getEntitiesCalls,
      });

      const getVaultInfoCalls: Array<ContractCall> = [];
      for (const entity of getEntitiesResults) {
        getVaultInfoCalls.push({
          abi: factoryConfig.version === 'default' ? CollateralAbi : VaultAbi,
          target: entity,
          method: factoryConfig.version === 'default' ? 'asset' : 'collateral',
          params: [],
        });
        getVaultInfoCalls.push({
          abi: factoryConfig.version === 'default' ? CollateralAbi : VaultAbi,
          target: entity,
          method: factoryConfig.version === 'default' ? 'totalSupply' : 'totalStake',
          params: [],
        });
      }
      const getVaultInfoResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        blockNumber: blockNumber,
        calls: getVaultInfoCalls,
      });

      for (let i = 0; i < getEntitiesResults.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: factoryConfig.chain,
          address: getVaultInfoResults[i * 2],
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          const balance = getVaultInfoResults[i * 2 + 1];
          const totalDepositedUsd =
            formatBigNumberToNumber(balance ? balance.toString() : '0', token.decimals) * tokenPriceUsd;

          if (totalDepositedUsd > 0) {
            protocolData.totalAssetDeposited += totalDepositedUsd;
            protocolData.totalValueLocked += totalDepositedUsd;
            (protocolData.totalSupplied as number) += totalDepositedUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositedUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
