import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aave: new AaveAdapter(services, storages, ProtocolConfigs.aave),
    avalon: new AaveAdapter(services, storages, ProtocolConfigs.avalon),
    colend: new AaveAdapter(services, storages, ProtocolConfigs.colend),
    hana: new AaveAdapter(services, storages, ProtocolConfigs.hana),
    ironclad: new AaveAdapter(services, storages, ProtocolConfigs.ironclad),
    kinza: new AaveAdapter(services, storages, ProtocolConfigs.kinza),
    lendle: new AaveAdapter(services, storages, ProtocolConfigs.lendle),
    pac: new AaveAdapter(services, storages, ProtocolConfigs.pac),
    polter: new AaveAdapter(services, storages, ProtocolConfigs.polter),
    radiant: new AaveAdapter(services, storages, ProtocolConfigs.radiant),
    seamless: new AaveAdapter(services, storages, ProtocolConfigs.seamless),
    spark: new AaveAdapter(services, storages, ProtocolConfigs.spark),
    uwulend: new AaveAdapter(services, storages, ProtocolConfigs.uwulend),
    yeifinance: new AaveAdapter(services, storages, ProtocolConfigs.yeifinance),
    zerolend: new AaveAdapter(services, storages, ProtocolConfigs.zerolend),
  };
}
