import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { SpectraProtocolConfig } from '../../../configs/protocols/spectra';
import RegistryAbi from '../../../configs/abi/spectra/Registry.json';
import PrincialTokenAbi from '../../../configs/abi/spectra/PrincipalToken.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { formatBigNumberToNumber } from '../../../lib/utils';

export default class SpectraAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.spectra';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    if (this.protocolConfig.birthday > options.timestamp) {
      return null;
    }

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
    };

    const spectraConfig = this.protocolConfig as SpectraProtocolConfig;
    for (const registryConfig of spectraConfig.registries) {
      if (registryConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[registryConfig.chain]) {
        protocolData.breakdown[registryConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        registryConfig.chain,
        options.timestamp,
      );

      const ptTokensCount = await this.services.blockchain.evm.readContract({
        chain: registryConfig.chain,
        abi: RegistryAbi,
        target: registryConfig.registry,
        method: 'pTCount',
        params: [],
        blockNumber: blockNumber,
      });

      const getPtCalls: Array<ContractCall> = [];
      for (let i = 0; i < Number(ptTokensCount); i++) {
        getPtCalls.push({
          abi: RegistryAbi,
          target: registryConfig.registry,
          method: 'getPTAt',
          params: [i],
        });
      }
      const getPtResults: Array<string> = await this.services.blockchain.evm.multicall({
        chain: registryConfig.chain,
        blockNumber: blockNumber,
        calls: getPtCalls,
      });

      const getPtTokensInfoCalls: Array<ContractCall> = [];
      for (const ptTokenAddress of getPtResults) {
        getPtTokensInfoCalls.push({
          abi: PrincialTokenAbi,
          target: ptTokenAddress,
          method: 'underlying',
          params: [],
        });
        getPtTokensInfoCalls.push({
          abi: PrincialTokenAbi,
          target: ptTokenAddress,
          method: 'totalAssets',
          params: [],
        });
      }
      const getPtTokensInfoResults = await this.services.blockchain.evm.multicall({
        chain: registryConfig.chain,
        blockNumber: blockNumber,
        calls: getPtTokensInfoCalls,
      });

      for (let i = 0; i < Number(ptTokensCount); i++) {
        const underlying = getPtTokensInfoResults[i * 2];
        const totalAssets = getPtTokensInfoResults[i * 2 + 1];

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: registryConfig.chain,
          address: underlying,
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          const totalDepositedUsd =
            formatBigNumberToNumber(totalAssets ? totalAssets.toString() : '0', token.decimals) * tokenPriceUsd;

          protocolData.totalAssetDeposited += totalDepositedUsd;
          protocolData.totalValueLocked += totalDepositedUsd;
          (protocolData.totalSupplied as number) += totalDepositedUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
