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
import { EulerConfigs, EulerdaoConfigs } from './protocols/euler';
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
import { SparkConfigs, SparkdaoConfigs } from './protocols/spark';
import { TectonicConfigs } from './protocols/tectonic';
import { UwulendConfigs } from './protocols/uwulend';
import { VenusConfigs } from './protocols/venus';
import { YeifinanceConfigs } from './protocols/yeifinance';
import { ZerolendConfigs } from './protocols/zerolend';
import { MethConfigs } from './protocols/mantle';
import { StaderConfigs } from './protocols/stader';
import { FraxEtherConfigs } from './protocols/frax';
import { StakeStoneConfigs } from './protocols/stakestone';
import { StakewiseConfigs } from './protocols/stakewise';
import { LiquidCollectiveConfigs } from './protocols/liquidcollective';
import { DineroConfigs } from './protocols/dinero';
import { AcrossConfigs } from './protocols/across';
import { LayerbankConfigs } from './protocols/layerbank';
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
import { HyphenConfigs } from './protocols/hyphen';
import { CbridgeConfigs } from './protocols/celer';
import { ZksyncNativeBridgeConfigs } from './protocols/zksync';
import { PolygonNativeBridgeConfigs, PolygonZkevmNativeBridgeConfigs } from './protocols/polygon';
import { HopConfigs } from './protocols/hop';
import { GnosisNativeBridgeConfigs } from './protocols/gnosis';
import { LfjConfigs, LfjlendConfigs } from './protocols/lfj';
import { EigenLayerConfigs } from './protocols/eigenlayer';
import { SymbioticConfigs } from './protocols/symbiotic';
import { KarakConfigs, Karakk2NativeBridgeConfigs } from './protocols/karak';
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
import { SwellchainNativeBridgeConfigs, SwellConfigs } from './protocols/swell';
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
import { MellowConfigs } from './protocols/mellow';
import { EclipseL2NativeConfigs } from './protocols/eclipsel2';
import { MantaNativeBridgeConfigs } from './protocols/manta';
import { ShapeNativeBridgeConfigs } from './protocols/shape';
import { DbkchainNativeBridgeConfigs } from './protocols/dbkchain';
import { OptopiaNativeBridgeConfigs } from './protocols/optopia';
import { DeriveNativeBridgeConfigs } from './protocols/derive';
import { AevoNativeBridgeConfigs } from './protocols/aevo';
import { CyberNativeBridgeConfigs } from './protocols/cyber';
import { OrderlyNativeBridgeConfigs } from './protocols/orderly';
import { OpbnbNativeBridgeConfigs } from './protocols/opbnb';
import { LoopringNativeBridgeConfigs } from './protocols/loopring';
import { AnkrConfigs } from './protocols/ankr';
import { BedrockConfigs } from './protocols/bedrock';
import { GmxConfigs } from './protocols/gmx';
import { WasabiConfigs } from './protocols/wasabi';
import { WoofiConfigs } from './protocols/woofi';
import { ZeroNetworkNativeBridgeConfigs } from './protocols/zeronetwork';
import { TreasureNativeBridgeConfigs } from './protocols/treasure';
import { CronosZkEvmNativeBridgeConfigs } from './protocols/cronos';
import { InkNativeBridgeConfigs } from './protocols/ink';
import { HyperLiquidNativeBridgeConfigs } from './protocols/hyperliquid';
import { SophonNativeBridgeConfigs } from './protocols/sophon';
import { ChainlinkCcipConfigs } from './protocols/chainlink';
import { GearboxConfigs } from './protocols/gearbox';
import { EthenaConfigs } from './protocols/ethena';
import { ResolvConfigs } from './protocols/resolv';
import { UsualConfigs } from './protocols/usual';
import { AxelarConfigs } from './protocols/axelar';
import { LombardConfigs } from './protocols/lombard';
import { AnzenConfigs } from './protocols/anzen';
import { SonicNativeBridgeConfigs } from './protocols/sonic';
import { ThresholdBtcConfigs } from './protocols/threshold';
import { Okxweb3Configs } from './protocols/okxweb3';
import { SoneiumNativeBridgeConfigs } from './protocols/soneium';
import { MidasConfigs } from './protocols/midas';
import { SolvConfigs } from './protocols/solv';
import { Usdt0Configs } from './protocols/usdt0';
import { ZerionConfigs } from './protocols/zerion';
import { AbstractNativeBridgeConfigs } from './protocols/abstract';
import { SushiConfigs } from './protocols/sushi';
import { UniswapConfigs } from './protocols/uniswap';
import { UnichainNativeBridgeConfigs } from './protocols/unichain';
import { SilofinanceConfigs } from './protocols/silofinance';
import { SakefinanceConfigs } from './protocols/sakefinance';
import { DolomiteConfigs } from './protocols/dolomite';
import { BerachaindexConfigs } from './protocols/berachain';
import { DebridgeConfigs } from './protocols/debridge';
import { YearnConfigs } from './protocols/yearn';
import { SuperseedNativeBridgeConfigs } from './protocols/superseed';
import { RangoConfigs } from './protocols/rango';
import { GauntletConfigs } from './protocols/gauntlet';
import { MevcapitalConfigs } from './protocols/mevcapital';
import { SteakhouseConfigs } from './protocols/steakhouse';
import { BprotocolConfigs } from './protocols/bprotocol';
import { RelendnetworkConfigs } from './protocols/relendnetwork';
import { HakutoraConfigs } from './protocols/hakutora';
import { Re7capitalConfigs } from './protocols/re7capital';
import { ApostroConfigs } from './protocols/apostro';
import { NinesummitsConfigs } from './protocols/ninesummits';
import { BlockanaliticaConfigs } from './protocols/blockanalitica';
import { LlamariskConfigs } from './protocols/llamarisk';
import { TulipacapitalConfigs } from './protocols/tulipacapital';
import { K3capitalConfigs } from './protocols/k3capital';
import { OpenseaConfigs } from './protocols/opensea';
import { MagicedenConfigs } from './protocols/magiceden';
import { JoepegsConfigs } from './protocols/joepegs';
import { SuperrareConfigs } from './protocols/superrare';
import { X2y2Configs } from './protocols/x2y2';
import { LooksrareConfigs } from './protocols/looksrare';
import { BlurConfigs } from './protocols/blur';
import { PancakenftConfigs } from './protocols/pancake';
import { MovementNativeBridgeConfigs } from './protocols/movement';

export const DefaultQueryContractLogsBlockRange = 1000;
export const CustomQueryContractLogsBlockRange: { [key: string]: number } = {
  polygon: 200,
  merlin: 100,
  ronin: 400,
  zklinknova: 5000,
  fantom: 1000,
  arbitrum: 5000,
  optimism: 1000,
  base: 1000,
  xlayer: 100,
};

export const DefaultQueryChainLogsBlockRange = 100;
export const CustomQueryChainLogsBlockRange: { [key: string]: number } = {
  ronin: 10,
  base: 50,
  arbitrum: 1000,
  optimism: 1000,
};

// use multiple workers to index blocks data
// for example
// when use 3 workers to index block from 0 -> 2
// worker 1 get block 0
// worker 2 get block 1
// worker 3 get block 2
// at the same time, reduce index blocks time 3 times
// this should be considered to config per blockchain
export const DefaultChainIndexWorkers = 3;
export const CustomChainIndexWorkers: { [key: string]: number } = {
  arbitrum: 5,
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
  tectonic: TectonicConfigs,
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
  bungee: BungeeConfigs,
  lifi: LifiConfigs,
  rocketpool: RocketpoolConfigs,
  wbeth: WbethConfigs,
  meth: MethConfigs,
  swell: SwellConfigs,
  stader: StaderConfigs,
  fraxether: FraxEtherConfigs,
  stakestone: StakeStoneConfigs,
  stakewise: StakewiseConfigs,
  liquidcollective: LiquidCollectiveConfigs,
  dinero: DineroConfigs,
  across: AcrossConfigs,
  layerbank: LayerbankConfigs,
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
  hyphen: HyphenConfigs,
  cbridge: CbridgeConfigs,
  zksyncNativeBridge: ZksyncNativeBridgeConfigs,
  polygonNativeBridge: PolygonNativeBridgeConfigs,
  polygonzkevmNativeBridge: PolygonZkevmNativeBridgeConfigs,
  hop: HopConfigs,
  gnosisNativeBridge: GnosisNativeBridgeConfigs,
  lfj: LfjConfigs,
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
  mellow: MellowConfigs,
  eclipsel2NativeBridge: EclipseL2NativeConfigs,
  mantaNativeBridge: MantaNativeBridgeConfigs,
  shapeNativeBridge: ShapeNativeBridgeConfigs,
  dbkchainNativeBridge: DbkchainNativeBridgeConfigs,
  optopiaNativeBridge: OptopiaNativeBridgeConfigs,
  deriveNativeBridge: DeriveNativeBridgeConfigs,
  aevoNativeBridge: AevoNativeBridgeConfigs,
  karakk2NativeBridge: Karakk2NativeBridgeConfigs,
  cyberNativeBridge: CyberNativeBridgeConfigs,
  orderlyNativeBridge: OrderlyNativeBridgeConfigs,
  opbnbNativeBridge: OpbnbNativeBridgeConfigs,
  loopringNativeBridge: LoopringNativeBridgeConfigs,
  ankr: AnkrConfigs,
  bedrock: BedrockConfigs,
  gmx: GmxConfigs,
  wasabi: WasabiConfigs,
  woofi: WoofiConfigs,
  zeronetworkNativeBridge: ZeroNetworkNativeBridgeConfigs,
  treasureNativeBridge: TreasureNativeBridgeConfigs,
  cronoszkevmNativeBridge: CronosZkEvmNativeBridgeConfigs,
  inkNativeBridge: InkNativeBridgeConfigs,
  hyperliquidNativeBridge: HyperLiquidNativeBridgeConfigs,
  sophonNativeBridge: SophonNativeBridgeConfigs,
  chainlinkccip: ChainlinkCcipConfigs,
  gearbox: GearboxConfigs,
  ethena: EthenaConfigs,
  resolv: ResolvConfigs,
  usual: UsualConfigs,
  axelar: AxelarConfigs,
  lombard: LombardConfigs,
  swellchainNativeBridge: SwellchainNativeBridgeConfigs,
  anzen: AnzenConfigs,
  sonicNativeBridge: SonicNativeBridgeConfigs,
  thresholdbtc: ThresholdBtcConfigs,
  okxweb3: Okxweb3Configs,
  soneiumNativeBridge: SoneiumNativeBridgeConfigs,
  midas: MidasConfigs,
  solv: SolvConfigs,
  usdt0: Usdt0Configs,
  zerion: ZerionConfigs,
  abstractNativeBridge: AbstractNativeBridgeConfigs,
  uniswap: UniswapConfigs,
  sushi: SushiConfigs,
  unichainNativeBridge: UnichainNativeBridgeConfigs,
  silofinance: SilofinanceConfigs,
  sakefinance: SakefinanceConfigs,
  dolomite: DolomiteConfigs,
  berachaindex: BerachaindexConfigs,
  debridge: DebridgeConfigs,
  yearn: YearnConfigs,
  superseedNativeBridge: SuperseedNativeBridgeConfigs,
  rango: RangoConfigs,
  gauntlet: GauntletConfigs,
  sparkdao: SparkdaoConfigs,
  mevcapital: MevcapitalConfigs,
  steakhouse: SteakhouseConfigs,
  bprotocol: BprotocolConfigs,
  relendnetwork: RelendnetworkConfigs,
  hakutora: HakutoraConfigs,
  re7capital: Re7capitalConfigs,
  apostro: ApostroConfigs,
  ninesummits: NinesummitsConfigs,
  blockanalitica: BlockanaliticaConfigs,
  llamarisk: LlamariskConfigs,
  tulipacapital: TulipacapitalConfigs,
  eulerdao: EulerdaoConfigs,
  k3capital: K3capitalConfigs,
  opensea: OpenseaConfigs,
  magiceden: MagicedenConfigs,
  joepegs: JoepegsConfigs,
  superrare: SuperrareConfigs,
  x2y2: X2y2Configs,
  looksrare: LooksrareConfigs,
  blur: BlurConfigs,
  pancakenft: PancakenftConfigs,
  movementNativeBridge: MovementNativeBridgeConfigs,
};
