import { Token } from '../types/base';
import { TokenBookDexBase, TokensBook } from './data';
import { AaveConfigs } from './protocols/aave';
import { AvalonConfigs } from './protocols/avalon';
import { BenqiConfigs } from './protocols/benqi';
import { ColendConfigs } from './protocols/colend';
import { CompoundConfigs } from './protocols/compound';
import { HanaConfigs } from './protocols/hana';
import { IonicConfigs } from './protocols/ionic';
import { IroncladConfigs } from './protocols/ironclad';
import { KinzaConfigs } from './protocols/kinza';
import { LendleConfigs } from './protocols/lendle';
import { MendiConfigs } from './protocols/mendi';
import { MoonwellConfigs } from './protocols/moonwell';
import { OrbitConfigs } from './protocols/orbit';
import { PacConfigs } from './protocols/pac';
import { PolterConfigs } from './protocols/polter';
import { RadiantConfigs } from './protocols/radiant';
import { RhoConfigs } from './protocols/rho';
import { SeamlessConfigs } from './protocols/seamless';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { TectonicConfigs } from './protocols/tectonic';
import { UwulendConfigs } from './protocols/uwulend';
import { VenusConfigs } from './protocols/venus';
import { YeifinanceConfigs } from './protocols/yeifinance';
import { ZerolendConfigs } from './protocols/zerolend';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
  merlin: 200,
  zklinknova: 50,
  ronin: 400,
};

export const DefaultMemcacheTime = 300; // 5 minutes

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenDexBase = TokenBookDexBase;

export const ProtocolConfigs = {
  aave: AaveConfigs,
  avalon: AvalonConfigs,
  benqi: BenqiConfigs,
  colend: ColendConfigs,
  compound: CompoundConfigs,
  hana: HanaConfigs,
  ionic: IonicConfigs,
  // ironbank: IronabnkConfigs,
  ironclad: IroncladConfigs,
  kinza: KinzaConfigs,
  lendle: LendleConfigs,
  mendi: MendiConfigs,
  moonwell: MoonwellConfigs,
  orbit: OrbitConfigs,
  pac: PacConfigs,
  polter: PolterConfigs,
  radiant: RadiantConfigs,
  rho: RhoConfigs,
  seamless: SeamlessConfigs,
  sonne: SonneConfigs,
  spark: SparkConfigs,
  tectonic: TectonicConfigs,
  uwulend: UwulendConfigs,
  venus: VenusConfigs,
  yeifinance: YeifinanceConfigs,
  zerolend: ZerolendConfigs,
};
