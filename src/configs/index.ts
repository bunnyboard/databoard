import { Token } from '../types/base';
import { ChainBoardConfigs } from './chainboards';
import { TokenBookDexBase, TokensBook } from './data';
import { AaveConfigs } from './protocols/aave';
import { AjnaConfigs } from './protocols/ajna';
import { AvalonConfigs } from './protocols/avalon';
import { BenqiConfigs } from './protocols/benqi';
import { WbethConfigs } from './protocols/wbeth';
import { BungeeConfigs } from './protocols/bungee';
import { ColendConfigs } from './protocols/colend';
import { CompoundConfigs } from './protocols/compound';
import { CowswapConfigs } from './protocols/cowswap';
import { CurvelendConfigs } from './protocols/curvelend';
import { CurveusdConfigs } from './protocols/curveusd';
import { EulerConfigs } from './protocols/euler';
import { FluidConfigs } from './protocols/fluid';
import { FraxlendConfigs } from './protocols/fraxlend';
import { HanaConfigs } from './protocols/hana';
import { IonicConfigs } from './protocols/ionic';
import { IronabnkConfigs } from './protocols/ironbank';
import { IroncladConfigs } from './protocols/ironclad';
import { KinzaConfigs } from './protocols/kinza';
import { LendleConfigs } from './protocols/lendle';
import { LidoConfigs } from './protocols/lido';
import { LifiConfigs } from './protocols/lifi';
import { LiquityConfigs } from './protocols/liquity';
import { MakerConfigs } from './protocols/maker';
import { MendiConfigs } from './protocols/mendi';
import { MoonwellConfigs } from './protocols/moonwell';
import { MorphoConfigs } from './protocols/morpho';
import { OrbitConfigs } from './protocols/orbit';
import { PacConfigs } from './protocols/pac';
import { PolterConfigs } from './protocols/polter';
import { RadiantConfigs } from './protocols/radiant';
import { RhoConfigs } from './protocols/rho';
import { RocketpoolConfigs } from './protocols/rocketpool';
import { SeamlessConfigs } from './protocols/seamless';
import { SonneConfigs } from './protocols/sonne';
import { SparkConfigs } from './protocols/spark';
import { SpookyConfigs } from './protocols/spooky';
import { SushiConfigs } from './protocols/sushi';
import { TectonicConfigs } from './protocols/tectonic';
import { UniswapConfigs } from './protocols/uniswap';
import { UwulendConfigs } from './protocols/uwulend';
import { VenusConfigs } from './protocols/venus';
import { YeifinanceConfigs } from './protocols/yeifinance';
import { ZerolendConfigs } from './protocols/zerolend';
import { MethConfigs } from './protocols/meth';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
  merlin: 200,
  zklinknova: 50,
  ronin: 400,
  fantom: 5000,
};

export const DefaultMemcacheTime = 300; // 5 minutes

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenDexBase: { [key: string]: Array<string> } = TokenBookDexBase;

export const ProtocolConfigs = {
  aave: AaveConfigs,
  ajna: AjnaConfigs,
  avalon: AvalonConfigs,
  benqi: BenqiConfigs,
  colend: ColendConfigs,
  compound: CompoundConfigs,
  cowswap: CowswapConfigs,
  hana: HanaConfigs,
  ionic: IonicConfigs,
  ironbank: IronabnkConfigs,
  ironclad: IroncladConfigs,
  kinza: KinzaConfigs,
  lendle: LendleConfigs,
  lido: LidoConfigs,
  maker: MakerConfigs,
  mendi: MendiConfigs,
  moonwell: MoonwellConfigs,
  morpho: MorphoConfigs,
  orbit: OrbitConfigs,
  pac: PacConfigs,
  polter: PolterConfigs,
  radiant: RadiantConfigs,
  rho: RhoConfigs,
  seamless: SeamlessConfigs,
  sonne: SonneConfigs,
  spark: SparkConfigs,
  sushi: SushiConfigs,
  tectonic: TectonicConfigs,
  uniswap: UniswapConfigs,
  uwulend: UwulendConfigs,
  venus: VenusConfigs,
  yeifinance: YeifinanceConfigs,
  zerolend: ZerolendConfigs,
  euler: EulerConfigs,
  liquity: LiquityConfigs,
  fluid: FluidConfigs,
  fraxlend: FraxlendConfigs,
  curveusd: CurveusdConfigs,
  curvelend: CurvelendConfigs,
  spooky: SpookyConfigs,
  bungee: BungeeConfigs,
  lifi: LifiConfigs,
  rocketpool: RocketpoolConfigs,
  wbeth: WbethConfigs,
  meth: MethConfigs,
};

export const ChainConfigs = ChainBoardConfigs;
