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
import { SolidityUnits } from '../../../configs/constants';

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
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        registryConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        registryConfig.chain,
        options.endTime,
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
      const getPriceShareCalls: Array<ContractCall> = [];
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

        getPriceShareCalls.push({
          abi: PrincialTokenAbi,
          target: ptTokenAddress,
          method: 'convertToUnderlying',
          params: [SolidityUnits.OneWad],
        });
      }
      const getPtTokensInfoResults = await this.services.blockchain.evm.multicall({
        chain: registryConfig.chain,
        blockNumber: blockNumber,
        calls: getPtTokensInfoCalls,
      });

      const before_getPriceShareResults = await this.services.blockchain.evm.multicall({
        chain: registryConfig.chain,
        blockNumber: beginBlock,
        calls: getPriceShareCalls,
      });
      const after_getPriceShareResults = await this.services.blockchain.evm.multicall({
        chain: registryConfig.chain,
        blockNumber: endBlock,
        calls: getPriceShareCalls,
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

          if (totalDepositedUsd > 0) {
            const priceShareBefore = formatBigNumberToNumber(
              before_getPriceShareResults[i] ? before_getPriceShareResults[i].toString() : SolidityUnits.OneWad,
              18,
            );
            const priceShareAfter = formatBigNumberToNumber(
              after_getPriceShareResults[i] ? after_getPriceShareResults[i].toString() : SolidityUnits.OneWad,
              18,
            );
            const priceShareDiff = priceShareAfter > priceShareBefore ? priceShareAfter - priceShareBefore : 0;

            // Spectra get 3% yeild from all ptTokens
            // https://docs.spectra.finance/tokenomics/fees
            const totalYieldDistributed = totalDepositedUsd * priceShareDiff;
            const totalFees = totalYieldDistributed / 0.97;
            const protocolRevenue = totalFees * 0.03;
            const supplySideRevenue = totalFees - protocolRevenue;

            protocolData.totalAssetDeposited += totalDepositedUsd;
            protocolData.totalValueLocked += totalDepositedUsd;
            (protocolData.totalSupplied as number) += totalDepositedUsd;
            protocolData.totalFees += totalFees;
            protocolData.protocolRevenue += protocolRevenue;
            protocolData.supplySideRevenue += supplySideRevenue;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositedUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
            protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
            protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
            protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
