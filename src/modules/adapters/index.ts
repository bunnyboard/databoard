import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';
import AjnaAdapter from './ajna/ajna';
import BenqiAdapter from './benqi/benqi';
import CompoundAdapter from './compound/compound';
import MakerAdapter from './maker/maker';
import MoonwellAdapter from './moonwell/moonwell';
import MorphoAdapter from './morpho/morpho';
import SushiAdapter from './sushi/sushi';
import UniswapAdapter from './uniswap/uniswap';
import VenusAdapter from './venus/venus';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    aave: new AaveAdapter(services, storages, ProtocolConfigs.aave),
    ajna: new AjnaAdapter(services, storages, ProtocolConfigs.ajna),
    avalon: new AaveAdapter(services, storages, ProtocolConfigs.avalon),
    benqi: new BenqiAdapter(services, storages, ProtocolConfigs.benqi),
    colend: new AaveAdapter(services, storages, ProtocolConfigs.colend),
    compound: new CompoundAdapter(services, storages, ProtocolConfigs.compound),
    hana: new AaveAdapter(services, storages, ProtocolConfigs.hana),
    ionic: new CompoundAdapter(services, storages, ProtocolConfigs.ionic),
    // ironbank: new CompoundAdapter(services, storages, ProtocolConfigs.ironbank),
    ironclad: new CompoundAdapter(services, storages, ProtocolConfigs.ironclad),
    kinza: new AaveAdapter(services, storages, ProtocolConfigs.kinza),
    lendle: new AaveAdapter(services, storages, ProtocolConfigs.lendle),
    maker: new MakerAdapter(services, storages, ProtocolConfigs.maker),
    mendi: new CompoundAdapter(services, storages, ProtocolConfigs.mendi),
    moonwell: new MoonwellAdapter(services, storages, ProtocolConfigs.moonwell),
    morpho: new MorphoAdapter(services, storages, ProtocolConfigs.morpho),
    orbit: new CompoundAdapter(services, storages, ProtocolConfigs.orbit),
    pac: new AaveAdapter(services, storages, ProtocolConfigs.pac),
    polter: new AaveAdapter(services, storages, ProtocolConfigs.polter),
    radiant: new AaveAdapter(services, storages, ProtocolConfigs.radiant),
    rho: new CompoundAdapter(services, storages, ProtocolConfigs.rho),
    seamless: new AaveAdapter(services, storages, ProtocolConfigs.seamless),
    sonne: new CompoundAdapter(services, storages, ProtocolConfigs.sonne),
    spark: new AaveAdapter(services, storages, ProtocolConfigs.spark),
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
    tectonic: new CompoundAdapter(services, storages, ProtocolConfigs.tectonic),
    uniswap: new UniswapAdapter(services, storages, ProtocolConfigs.uniswap),
    uwulend: new AaveAdapter(services, storages, ProtocolConfigs.uwulend),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    yeifinance: new AaveAdapter(services, storages, ProtocolConfigs.yeifinance),
    zerolend: new AaveAdapter(services, storages, ProtocolConfigs.zerolend),
  };
}
