import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';
import AjnaAdapter from './ajna/ajna';
import BenqiAdapter from './benqi/benqi';
import BungeeAdapter from './bungee/bungee';
import CompoundAdapter from './compound/compound';
import CowswapAdapter from './cowswap/cowswap';
import CurvelendAdapter from './curve/curvelend';
import CurveusdAdapter from './curve/curveusd';
import EulerAdapter from './euler/euler';
import FluidAdapter from './fluid/fluid';
import FraxlendAdapter from './fraxlend/fraxlend';
import LidoAdapter from './lido/lido';
import LifiAdapter from './lifi/lifi';
import LiquityAdapter from './liquity/liquity';
import MakerAdapter from './maker/maker';
import MoonwellAdapter from './moonwell/moonwell';
import MorphoAdapter from './morpho/morpho';
import RocketpoolAdapter from './rocketpool/rocketpool';
import SpookyAdapter from './spooky/spooky';
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
    cowswap: new CowswapAdapter(services, storages, ProtocolConfigs.cowswap),
    hana: new AaveAdapter(services, storages, ProtocolConfigs.hana),
    ionic: new CompoundAdapter(services, storages, ProtocolConfigs.ionic),
    ironbank: new CompoundAdapter(services, storages, ProtocolConfigs.ironbank),
    ironclad: new AaveAdapter(services, storages, ProtocolConfigs.ironclad),
    kinza: new AaveAdapter(services, storages, ProtocolConfigs.kinza),
    lendle: new AaveAdapter(services, storages, ProtocolConfigs.lendle),
    lido: new LidoAdapter(services, storages, ProtocolConfigs.lido),
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
    euler: new EulerAdapter(services, storages, ProtocolConfigs.euler),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    fluid: new FluidAdapter(services, storages, ProtocolConfigs.fluid),
    fraxlend: new FraxlendAdapter(services, storages, ProtocolConfigs.fraxlend),
    curveusd: new CurveusdAdapter(services, storages, ProtocolConfigs.curveusd),
    curvelend: new CurvelendAdapter(services, storages, ProtocolConfigs.curvelend),
    spooky: new SpookyAdapter(services, storages, ProtocolConfigs.spooky),
    bungee: new BungeeAdapter(services, storages, ProtocolConfigs.bungee),
    lifi: new LifiAdapter(services, storages, ProtocolConfigs.lifi),
    rocketpool: new RocketpoolAdapter(services, storages, ProtocolConfigs.rocketpool),
  };
}
