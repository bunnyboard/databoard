import { Token } from '../types/base';
import { TokenBookDexBase, TokensBook } from './data';
import { AaveConfigs } from './protocols/aave';
import { AjnaConfigs } from './protocols/ajna';
import { AvalonConfigs } from './protocols/avalon';
import { BenqiConfigs, BenqiStakingAvaxConfigs } from './protocols/benqi';
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
import { IronbankConfigs } from './protocols/ironbank';
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
import { MethConfigs } from './protocols/mantle';
import { EthxConfigs } from './protocols/stader';
import { FraxEtherConfigs } from './protocols/frax';
import { StakeStoneConfigs } from './protocols/stakestone';
import { StakewiseConfigs } from './protocols/stakewise';
import { LiquidCollectiveConfigs } from './protocols/liquidcollective';
import { DineroConfigs } from './protocols/dinero';
import { AcrossConfigs } from './protocols/across';
import { LayerbankConfigs } from './protocols/layerbank';
import { PancakeConfigs } from './protocols/pancake';
import { CircleCctpConfigs } from './protocols/circle';
import { SynapseConfigs } from './protocols/synapse';
import { StargateConfigs } from './protocols/stargate';
import { OptimismNativeBridgeConfigs } from './protocols/optimism';
import { BaseNativeBridgeConfigs } from './protocols/base';
import { ModeNativeBridgeConfigs } from './protocols/mode';
import { FraxtalNativeBridgeConfigs } from './protocols/fraxtal';
import { LiskNativeBridgeConfigs } from './protocols/lisk';
import { BobNativeBridgeConfigs } from './protocols/bob';
import { RedstoneNativeBridgeConfigs } from './protocols/redstone';
import { ArbitrumNativeBridgeConfigs } from './protocols/arbitrum';
import { ScrollNativeBridgeConfigs } from './protocols/scroll';
import { KatanaConfigs } from './protocols/katana';
import { CamelotConfigs } from './protocols/camelot';
import { HyphenConfigs } from './protocols/hyphen';
import { CbridgeConfigs } from './protocols/celer';
import { ZksyncNativeBridgeConfigs } from './protocols/zksync';
import { PolygonNativeBridgeConfigs, PolygonZkevmNativeBridgeConfigs } from './protocols/polygon';
import { HopConfigs } from './protocols/hop';
import { GnosisNativeBridgeConfigs } from './protocols/gnosis';
import { LfjlendConfigs } from './protocols/lfj';
import { EigenLayerConfigs } from './protocols/eigenlayer';
import { SymbioticConfigs } from './protocols/symbiotic';
import { KarakConfigs } from './protocols/karak';
import { LineaNativeBridgeConfigs } from './protocols/linea';
import { ZoraNativeBridgeConfigs } from './protocols/zora';
import { WorldchainativeBridgeConfigs } from './protocols/worldchain';
import { KromaNativeBridgeConfigs } from './protocols/kroma';
import { MintNativeBridgeConfigs } from './protocols/mint';
import { EthereumConfigs } from './protocols/ethereum';
import { ParaswapConfigs } from './protocols/paraswap';
import { MetisNativeBridgeConfigs } from './protocols/metis';
import { KyberswapConfigs } from './protocols/kyberswap';
import { ZeroxConfigs } from './protocols/zerox';
import { MantleNativeBridgeConfigs } from './protocols/mantle';
import { PellNetworkConfigs } from './protocols/pellnetwork';
import { RubicConfigs } from './protocols/rubic';
import { ZircuitNativeBridgeConfigs } from './protocols/zircuit';
import { DodoexConfigs } from './protocols/dodoex';
import { SwellConfigs } from './protocols/swell';
import { OdosConfigs } from './protocols/odos';
import { RenzoConfigs } from './protocols/renzo';
import { EigenpieConfigs } from './protocols/eigenpie';
import { StarknetNativeBridgeConfigs } from './protocols/starknet';
import { BlastNativeBridgeConfigs } from './protocols/blast';
import { FuelNativeBridgeConfigs } from './protocols/fuel';
import { TaikoNativeBridgeConfigs } from './protocols/taiko';
import { BobaNativeBridgeConfigs } from './protocols/boba';
import { CbethConfigs } from './protocols/coinbase';
import { EtherfiConfigs } from './protocols/etherfi';
import { PufferConfigs } from './protocols/puffer';
import { KelpdaoConfigs } from './protocols/kelpdao';
import { MorphL2NativeBridgeConfigs } from './protocols/morphl2';
import { BalancerConfigs } from './protocols/balancer';
import { BeetsConfigs } from './protocols/beets';
import { SlisBnbConfigs } from './protocols/slisbnb';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
  merlin: 200,
  ronin: 400,
  zklinknova: 5000,
  fantom: 1000,
  arbitrum: 5000,
  optimism: 1000,
  base: 1000,
};

export const DefaultQueryChainLogsBlockRange = 100;
export const CustomQueryChainLogsBlockRange: { [key: string]: number } = {
  ronin: 10,
  arbitrum: 1000,
  optimism: 1000,
};

export const DefaultMemcacheTime = 300; // 5 minutes
export const DefaultLocaldbDir = '.localdb';

export const TokenList: { [key: string]: { [key: string]: Token } } = TokensBook;
export const TokenDexBase: { [key: string]: Array<string> } = TokenBookDexBase;

export const ProtocolConfigs = {
  ethereum: EthereumConfigs,
  aave: AaveConfigs,
  ajna: AjnaConfigs,
  avalon: AvalonConfigs,
  benqi: BenqiConfigs,
  colend: ColendConfigs,
  compound: CompoundConfigs,
  cowswap: CowswapConfigs,
  hana: HanaConfigs,
  ionic: IonicConfigs,
  ironbank: IronbankConfigs,
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
  swell: SwellConfigs,
  ethx: EthxConfigs,
  fraxether: FraxEtherConfigs,
  stakestone: StakeStoneConfigs,
  stakewise: StakewiseConfigs,
  liquidcollective: LiquidCollectiveConfigs,
  dinero: DineroConfigs,
  across: AcrossConfigs,
  layerbank: LayerbankConfigs,
  pancake: PancakeConfigs,
  savax: BenqiStakingAvaxConfigs,
  circlecctp: CircleCctpConfigs,
  synapse: SynapseConfigs,
  stargate: StargateConfigs,
  arbitrumNativeBridge: ArbitrumNativeBridgeConfigs,
  optimismNativeBridge: OptimismNativeBridgeConfigs,
  baseNativeBridge: BaseNativeBridgeConfigs,
  modeNativeBridge: ModeNativeBridgeConfigs,
  fraxtalNativeBridge: FraxtalNativeBridgeConfigs,
  liskNativeBridge: LiskNativeBridgeConfigs,
  bobNativeBridge: BobNativeBridgeConfigs,
  redstoneNativeBridge: RedstoneNativeBridgeConfigs,
  scrollNativeBridge: ScrollNativeBridgeConfigs,
  katana: KatanaConfigs,
  camelot: CamelotConfigs,
  hyphen: HyphenConfigs,
  cbridge: CbridgeConfigs,
  zksyncNativeBridge: ZksyncNativeBridgeConfigs,
  polygonNativeBridge: PolygonNativeBridgeConfigs,
  polygonzkevmNativeBridge: PolygonZkevmNativeBridgeConfigs,
  hop: HopConfigs,
  gnosisNativeBridge: GnosisNativeBridgeConfigs,
  lfjlend: LfjlendConfigs,
  eigenlayer: EigenLayerConfigs,
  symbiotic: SymbioticConfigs,
  karak: KarakConfigs,
  lineaNativeBridge: LineaNativeBridgeConfigs,
  zoraNativeBridge: ZoraNativeBridgeConfigs,
  worldchainNativeBridge: WorldchainativeBridgeConfigs,
  kromaNativeBridge: KromaNativeBridgeConfigs,
  mintNativeBridge: MintNativeBridgeConfigs,
  metisNativeBridge: MetisNativeBridgeConfigs,
  mantleNativeBridge: MantleNativeBridgeConfigs,
  paraswap: ParaswapConfigs,
  kyberswap: KyberswapConfigs,
  zerox: ZeroxConfigs,
  pellnetwork: PellNetworkConfigs,
  rubic: RubicConfigs,
  zircuitNativeBridge: ZircuitNativeBridgeConfigs,
  dodoex: DodoexConfigs,
  odos: OdosConfigs,
  renzo: RenzoConfigs,
  eigenpie: EigenpieConfigs,
  starknetNativeBridge: StarknetNativeBridgeConfigs,
  blastNativeBridge: BlastNativeBridgeConfigs,
  fuelNativeBridge: FuelNativeBridgeConfigs,
  taikoNativeBridge: TaikoNativeBridgeConfigs,
  bobaNativeBridge: BobaNativeBridgeConfigs,
  cbeth: CbethConfigs,
  etherfi: EtherfiConfigs,
  puffer: PufferConfigs,
  kelpdao: KelpdaoConfigs,
  morphl2NativeBridge: MorphL2NativeBridgeConfigs,
  balancer: BalancerConfigs,
  beets: BeetsConfigs,
  slisbnb: SlisBnbConfigs,
};
