import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { SuperformProtocolConfig } from '../../../configs/protocols/superform';
import SuperformFactoryAbi from '../../../configs/abi/superform/SuperformFactory.json';
import SuperformAbi from '../../../configs/abi/superform/ERC4626Form.json';
import Erc4624Abi from '../../../configs/abi/ERC4626.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { getChainNameById } from '../../../lib/helpers';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { SolidityUnits } from '../../../configs/constants';

const blacklistVaults: Array<string> = [
  '0xcc7bb162e24e7ebc4b617ab1b8d16ee4d7e1bd53',
  '0x9160922b08c6953ce17547bb62f6f38ad0a1615e',
];

// no fees from superform
// https://help.superform.xyz/en/articles/8689310-does-superform-have-fees
export default class SuperformAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.superform';

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

    const superformConfig = this.protocolConfig as SuperformProtocolConfig;
    for (const factoryConfig of superformConfig.factories) {
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
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.endTime,
      );

      const getSuperformCount = await this.services.blockchain.evm.readContract({
        chain: factoryConfig.chain,
        abi: SuperformFactoryAbi,
        target: factoryConfig.factory,
        method: 'getSuperformCount',
        params: [],
        blockNumber: blockNumber,
      });

      const getSuperformIdCalls: Array<ContractCall> = [];
      for (let i = 0; i < Number(getSuperformCount); i++) {
        getSuperformIdCalls.push({
          abi: SuperformFactoryAbi,
          target: factoryConfig.factory,
          method: 'superforms',
          params: [i],
        });
      }
      const getSuperformIdResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        calls: getSuperformIdCalls,
      });

      const getSuperformCalls: Array<ContractCall> = [];
      for (const superformId of getSuperformIdResults) {
        getSuperformCalls.push({
          abi: SuperformFactoryAbi,
          target: factoryConfig.factory,
          method: 'getSuperform',
          params: [BigInt(superformId)],
        });
      }
      const getSuperformResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        calls: getSuperformCalls,
      });

      const superformAddresses = getSuperformResults
        .filter((item: any) => {
          const chainName = getChainNameById(Number(item[2]));
          return chainName === factoryConfig.chain && !blacklistVaults.includes(normalizeAddress(item[0]));
        })
        .map((item: any) => item[0]);

      const getSuperformInfoCalls: Array<ContractCall> = [];
      const getSuperformPricePerShareCalls: Array<ContractCall> = [];
      for (const address of superformAddresses) {
        getSuperformInfoCalls.push({
          abi: SuperformAbi,
          target: address,
          method: 'asset',
          params: [],
        });
        getSuperformInfoCalls.push({
          abi: SuperformAbi,
          target: address,
          method: 'getVaultDecimals',
          params: [],
        });
        getSuperformInfoCalls.push({
          abi: SuperformAbi,
          target: address,
          method: 'getVaultShareBalance',
          params: [],
        });
        getSuperformInfoCalls.push({
          abi: SuperformAbi,
          target: address,
          method: 'getPricePerVaultShare',
          params: [],
        });

        getSuperformPricePerShareCalls.push({
          abi: SuperformAbi,
          target: address,
          method: 'getPricePerVaultShare',
          params: [],
        });
      }
      const getSuperformInfoResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        calls: getSuperformInfoCalls,
        blockNumber: blockNumber,
      });

      const before_getSuperformPricePerShareResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        calls: getSuperformPricePerShareCalls,
        blockNumber: beginBlock,
      });
      const after_getSuperformPricePerShareResults = await this.services.blockchain.evm.multicall({
        chain: factoryConfig.chain,
        calls: getSuperformPricePerShareCalls,
        blockNumber: endBlock,
      });

      for (let i = 0; i < superformAddresses.length; i++) {
        const asset = getSuperformInfoResults[i * 4];
        const getVaultDecimals = Number(getSuperformInfoResults[i * 4 + 1]);
        const getVaultShareBalance = getSuperformInfoResults[i * 4 + 2];
        const getPricePerVaultShare = getSuperformInfoResults[i * 4 + 3];

        const priceShareBefore = formatBigNumberToNumber(
          before_getSuperformPricePerShareResults[i]
            ? before_getSuperformPricePerShareResults[i].toString()
            : SolidityUnits.OneWad,
          18,
        );
        const priceShareAfter = formatBigNumberToNumber(
          after_getSuperformPricePerShareResults[i]
            ? after_getSuperformPricePerShareResults[i].toString()
            : SolidityUnits.OneWad,
          18,
        );
        const priceShareDiff = priceShareAfter > priceShareBefore ? priceShareAfter - priceShareBefore : 0;

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: factoryConfig.chain,
          address: asset,
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          const vaultShareBalance = formatBigNumberToNumber(
            getVaultShareBalance ? getVaultShareBalance.toString() : '0',
            getVaultDecimals,
          );
          const vaultBalance =
            vaultShareBalance *
            formatBigNumberToNumber(getPricePerVaultShare ? getPricePerVaultShare.toString() : '0', token.decimals);
          const totalDepositUsd = vaultBalance * tokenPriceUsd;
          const totalFees = totalDepositUsd * priceShareDiff;

          if (totalDepositUsd > 0) {
            protocolData.totalAssetDeposited += totalDepositUsd;
            protocolData.totalValueLocked += totalDepositUsd;
            protocolData.totalFees += totalFees;
            protocolData.supplySideRevenue += totalFees;
            (protocolData.totalSupplied as number) += totalDepositUsd;
            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositUsd;
            protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
            protocolData.breakdown[token.chain][token.address].supplySideRevenue += totalFees;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositUsd;
          }
        }
      }
    }

    for (const superVaultConfig of superformConfig.superVaults) {
      if (superVaultConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[superVaultConfig.chain]) {
        protocolData.breakdown[superVaultConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        superVaultConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        superVaultConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        superVaultConfig.chain,
        options.endTime,
      );

      const asset = await this.services.blockchain.evm.readContract({
        chain: superVaultConfig.chain,
        abi: Erc4624Abi,
        target: superVaultConfig.vault,
        method: 'asset',
        params: [],
      });
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: superVaultConfig.chain,
        address: asset,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const totalAssets = await this.services.blockchain.evm.readContract({
          chain: superVaultConfig.chain,
          abi: Erc4624Abi,
          target: superVaultConfig.vault,
          method: 'totalAssets',
          params: [],
          blockNumber: blockNumber,
        });

        const before_priceShare = await this.services.blockchain.evm.readContract({
          chain: superVaultConfig.chain,
          abi: Erc4624Abi,
          target: superVaultConfig.vault,
          method: 'convertToAssets',
          params: [SolidityUnits.OneWad],
          blockNumber: beginBlock,
        });
        const after_priceShare = await this.services.blockchain.evm.readContract({
          chain: superVaultConfig.chain,
          abi: Erc4624Abi,
          target: superVaultConfig.vault,
          method: 'convertToAssets',
          params: [SolidityUnits.OneWad],
          blockNumber: endBlock,
        });

        const totalDepositUsd =
          formatBigNumberToNumber(totalAssets ? totalAssets.toString() : '0', token.decimals) * tokenPriceUsd;

        if (totalDepositUsd > 0) {
          const priceShareBefore = formatBigNumberToNumber(
            before_priceShare ? before_priceShare.toString() : SolidityUnits.OneWad,
            18,
          );
          const priceShareAfter = formatBigNumberToNumber(
            after_priceShare ? after_priceShare.toString() : SolidityUnits.OneWad,
            18,
          );
          const priceShareDiff = priceShareAfter > priceShareBefore ? priceShareAfter - priceShareBefore : 0;

          // superform charge 0% performance fees
          const totalFees = totalDepositUsd * priceShareDiff;

          protocolData.totalAssetDeposited += totalDepositUsd;
          protocolData.totalValueLocked += totalDepositUsd;
          protocolData.totalFees += totalFees;
          protocolData.supplySideRevenue += totalFees;
          (protocolData.totalSupplied as number) += totalDepositUsd;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositUsd;
          protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
          protocolData.breakdown[token.chain][token.address].supplySideRevenue += totalFees;
          (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
