import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { GauntletProtocolConfig } from '../../../configs/protocols/gauntlet';
import MorphoLibs, { GetMorphoVaultDataResult } from '../../libs/morpho';
import EulerLibs, { GetEulerVaultDataResult } from '../../libs/euler';

export default class GauntletAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.gauntlet';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const gauntletConfig = this.protocolConfig as GauntletProtocolConfig;

    if (gauntletConfig.birthday > options.timestamp) {
      return null;
    }

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),

      // total assets deposited by suppilers
      totalSupplied: 0,
    };

    for (const curatorConfig of gauntletConfig.curators) {
      if (curatorConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[curatorConfig.chain]) {
        protocolData.breakdown[curatorConfig.chain] = {};
      }

      let vaultsData: Array<GetMorphoVaultDataResult | GetEulerVaultDataResult> = [];

      if (curatorConfig.morphoVaults.length > 0) {
        vaultsData = vaultsData.concat(
          await MorphoLibs.getMorphoVaultsData({
            chain: curatorConfig.chain,
            vaults: curatorConfig.morphoVaults,
            timestamp: options.timestamp,
            fromTime: options.beginTime,
            toTime: options.endTime,
          }),
        );
      }

      if (curatorConfig.eulerVaults.length > 0) {
        vaultsData = vaultsData.concat(
          await EulerLibs.getEulerVaultsData({
            chain: curatorConfig.chain,
            vaults: curatorConfig.eulerVaults,
            timestamp: options.timestamp,
            fromTime: options.beginTime,
            toTime: options.endTime,
          }),
        );
      }

      for (const vaultData of vaultsData) {
        // https://docs.euler.finance/concepts/interest-rates#fees
        const protocolRevenueUsd =
          vaultData.type === 'eulerVault' ? vaultData.protocolRevenueUsd / 2 : vaultData.protocolRevenueUsd;

        protocolData.totalAssetDeposited += vaultData.totalDepositedUsd;
        protocolData.totalValueLocked += vaultData.totalDepositedUsd;
        (protocolData.totalSupplied as number) += vaultData.totalDepositedUsd;
        protocolData.totalFees += vaultData.totalFeesUsd;
        protocolData.supplySideRevenue += vaultData.totalFeesUsd - protocolRevenueUsd;
        protocolData.protocolRevenue += protocolRevenueUsd;

        if (!protocolData.breakdown[vaultData.token.chain][vaultData.token.address]) {
          protocolData.breakdown[vaultData.token.chain][vaultData.token.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
          };
        }
        protocolData.breakdown[vaultData.token.chain][vaultData.token.address].totalAssetDeposited +=
          vaultData.totalDepositedUsd;
        protocolData.breakdown[vaultData.token.chain][vaultData.token.address].totalValueLocked +=
          vaultData.totalDepositedUsd;
        (protocolData.breakdown[vaultData.token.chain][vaultData.token.address].totalSupplied as number) +=
          vaultData.totalDepositedUsd;
        protocolData.breakdown[vaultData.token.chain][vaultData.token.address].totalFees += vaultData.totalFeesUsd;
        protocolData.breakdown[vaultData.token.chain][vaultData.token.address].supplySideRevenue +=
          vaultData.totalFeesUsd - protocolRevenueUsd;
        protocolData.breakdown[vaultData.token.chain][vaultData.token.address].protocolRevenue += protocolRevenueUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
