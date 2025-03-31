import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';
import AcrossAdapter from './across/across';
import AnkrAdapter from './ankr/ankr';
import AnzenAdapter from './anzen/anzen';
import ArbitrumNativeBridgeAdapter from './arbitrum/nativeBridge';
import AvalonAdapter from './avalon/avalon';
import AxelarAdapter from './axelar/axelar';
import BalancerAdapter from './balancer/balancer';
import BedrockAdapter from './bedrock/bedrock';
import BenqiAdapter from './benqi/benqi';
import BenqiStakingAvaxAdapter from './benqi/savax';
import BlackrockusdAdapter from './blackrock/build';
import BlastNativeBridgeAdapter from './blast/nativeBridge';
import BlurAdapter from './blur/blur';
import BungeeAdapter from './bungee/bungee';
import CbridgeAdapter from './celer/cbridge';
import ChainlinkCcipAdapter from './chainlink/ccip';
import CircleCctpAdapter from './circle/circlecctp';
import CbethAdapter from './coinbase/cbeth';
import CompoundAdapter from './compound/compound';
import CowswapAdapter from './cowswap/cowswap';
import CurvelendAdapter from './curve/curvelend';
import CurveusdAdapter from './curve/curveusd';
import DebridgeAdapter from './debridge/debridge';
import DineroAdapter from './dinero/dinero';
import DodoexAdapter from './dodoex/dodoex';
import DolomiteAdapter from './dolomite/dolomite';
import Eclipsel2NativeBridgeAdapter from './eclipsel2/nativeBridge';
import EigenLayerAdapter from './eigenlayer/eigenlayer';
import EigenpieAdapter from './eigenpie/eigenpie';
import EthenaAdapter from './ethena/ethena';
import EthereumAdapter from './ethereum/ethereum';
import EtherfiAdapter from './etherfi/etherfi';
import EulerAdapter from './euler/euler';
import FluidAdapter from './fluid/fluid';
import FraxEtherAdapter from './frax/fraxether';
import FraxlendAdapter from './frax/fraxlend';
import FuelNativeBridgeAdapter from './fuel/nativeBridge';
import GearboxAdapter from './gearbox/gearbox';
import GmxAdapter from './gmx/gmx';
import GnosisNativeBridgeAdapter from './gnosis/nativeBridge';
import GauntletAdapter from './guntlet/gauntlet';
import HopAdapter from './hop/hop';
import HyperLiquidNativeBridgeAdapter from './hyperliquid/nativeBridge';
import HyphenAdapter from './hyphen/hyphen';
import KarakAdapter from './karak/karak';
import KelpdaoAdapter from './kelpdao/kelpdao';
import KyberswapAdapter from './kyberswap/kyberswap';
import LayerbankAdapter from './layerbank/layerbank';
import LevelusdAdapter from './levelusd/levelusd';
import LfjlendAdapter from './lfj/lfjlend';
import LidoAdapter from './lido/lido';
import LifiAdapter from './lifi/lifi';
import LineaNativeBridgeAdapter from './linea/nativeBridge';
import LiquidCollectiveAdapter from './liquidcollective/lseth';
import LiquityAdapter from './liquity/liquity';
import SlisbnbAdapter from './listadao/slisbnb';
import LombardAdapter from './lombard/lombard';
import LooksrareAdapter from './looksrare/looksrare';
import LoopringNativeBridgeAdapter from './loopring/nativeBridge';
import MagicedenAdapter from './magiceden/magiceden';
import MakerAdapter from './maker/maker';
import MethAdapter from './mantle/meth';
import MantleNativeBridgeAdapter from './mantle/nativeBridge';
import MellowAdapter from './mellow/mellow';
import MetisNativeBridgeAdapter from './metis/nativeBridge';
import MoonwellAdapter from './moonwell/moonwell';
import MorphL2NativeBridgeAdapter from './morphl2/nativeBridge';
import MorphoAdapter from './morpho/morpho';
import MovementNativeBridgeAdapter from './movement/nativeBridge';
import OdosAdapter from './odos/odos';
import Okxweb3Adapter from './okx/okxweb3';
import OpenseaAdapter from './opensea/opensea';
import OptimismNativeBridgeAdapter from './optimism/nativeBridge';
import OptimismNativeBridgeLegacyAdapter from './optimism/nativeBridgeLegacy';
import PancakenftAdapter from './pancake/marketplace';
import ParaswapAdapter from './paraswap/paraswap';
import PellNetworkAdapter from './pellnetwork/pellnetwork';
import PendleAdapter from './pendle/pendle';
import PolygonNativeBridgeAdapter from './polygon/nativeBridge';
import PolygonZzkevmNativeBridgeAdapter from './polygon/zkevmNativeBridge';
import PufferAdapter from './puffer/puffer';
import RangoAdapter from './rango/rango';
import RenzoAdapter from './renzo/renzo';
import ResolvAdapter from './resolv/resolv';
import RocketpoolAdapter from './rocketpool/rocketpool';
import RubicAdapter from './rubic/rubic';
import ScrollNativeBridgeAdapter from './scroll/nativeBridge';
import SilofinanceAdapter from './silofinance/silofinance';
import SolvAdapter from './solv/solv';
import SonicNativeBridgeAdapter from './sonic/nativeBridge';
import SpectraAdapter from './spectra/spectra';
import StablecoinAdapter from './stablecoin/stablecoin';
import StaderAdapter from './stader/stader';
import StakewiseAdapter from './stakewise/stakewise';
import StargateAdapter from './stargate/stargate';
import StarknetNativeBridgeAdapter from './starknet/starknetBridge';
import SuperformAdapter from './superform/superform';
import SuperrareAdapter from './superrare/superrare';
import SwellAdapter from './swell/swell';
import SymbioticAdapter from './symbiotic/symbiotic';
import SynapseAdapter from './synapse/synapse';
import TaikoNativeBridgeAdapter from './taiko/nativeBridge';
import ThresholdbtcAdapter from './threshold/thresholdbtc';
import UniswapAdapter from './uniswap/uniswap';
import Usdt0Adapter from './usdt0/usdt0';
import UsualAdapter from './usual/usual';
import VenusAdapter from './venus/venus';
import WbethAdapter from './wbeth/wbeth';
import WoofiAdapter from './woofi/woofi';
import X2y2Adapter from './x2y2/x2y2';
import YearnAdapter from './yearn/yearn';
import ZerionAdapter from './zerion/zerion';
import ZeroxAdapter from './zerox/zerox';
import ZksyncNativeBridgeAdapter from './zksync/nativeBridge';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    ethereum: new EthereumAdapter(services, storages, ProtocolConfigs.ethereum),
    aave: new AaveAdapter(services, storages, ProtocolConfigs.aave),
    // ajna: new AjnaAdapter(services, storages, ProtocolConfigs.ajna),
    avalon: new AvalonAdapter(services, storages, ProtocolConfigs.avalon),
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
    tectonic: new CompoundAdapter(services, storages, ProtocolConfigs.tectonic),
    // uwulend: new AaveAdapter(services, storages, ProtocolConfigs.uwulend),
    venus: new VenusAdapter(services, storages, ProtocolConfigs.venus),
    yeifinance: new AaveAdapter(services, storages, ProtocolConfigs.yeifinance),
    zerolend: new AaveAdapter(services, storages, ProtocolConfigs.zerolend),
    euler: new EulerAdapter(services, storages, ProtocolConfigs.euler),
    liquity: new LiquityAdapter(services, storages, ProtocolConfigs.liquity),
    fluid: new FluidAdapter(services, storages, ProtocolConfigs.fluid),
    fraxlend: new FraxlendAdapter(services, storages, ProtocolConfigs.fraxlend),
    fraxether: new FraxEtherAdapter(services, storages, ProtocolConfigs.fraxether),
    curveusd: new CurveusdAdapter(services, storages, ProtocolConfigs.curveusd),
    curvelend: new CurvelendAdapter(services, storages, ProtocolConfigs.curvelend),
    bungee: new BungeeAdapter(services, storages, ProtocolConfigs.bungee),
    lifi: new LifiAdapter(services, storages, ProtocolConfigs.lifi),
    rocketpool: new RocketpoolAdapter(services, storages, ProtocolConfigs.rocketpool),
    wbeth: new WbethAdapter(services, storages, ProtocolConfigs.wbeth),
    meth: new MethAdapter(services, storages, ProtocolConfigs.meth),
    swell: new SwellAdapter(services, storages, ProtocolConfigs.swell),
    stader: new StaderAdapter(services, storages, ProtocolConfigs.stader),
    stakewise: new StakewiseAdapter(services, storages, ProtocolConfigs.stakewise),
    liquidcollective: new LiquidCollectiveAdapter(services, storages, ProtocolConfigs.liquidcollective),
    dinero: new DineroAdapter(services, storages, ProtocolConfigs.dinero),
    // stakestone: new StakeStoneAdapter(services, storages, ProtocolConfigs.stakestone),
    across: new AcrossAdapter(services, storages, ProtocolConfigs.across),
    layerbank: new LayerbankAdapter(services, storages, ProtocolConfigs.layerbank),
    savax: new BenqiStakingAvaxAdapter(services, storages, ProtocolConfigs.savax),
    circlecctp: new CircleCctpAdapter(services, storages, ProtocolConfigs.circlecctp),
    synapse: new SynapseAdapter(services, storages, ProtocolConfigs.synapse),
    stargate: new StargateAdapter(services, storages, ProtocolConfigs.stargate),
    arbitrumNativeBridge: new ArbitrumNativeBridgeAdapter(services, storages, ProtocolConfigs.arbitrumNativeBridge),
    optimismNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.optimismNativeBridge),
    baseNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.baseNativeBridge),
    modeNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.modeNativeBridge),
    fraxtalNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.fraxtalNativeBridge),
    liskNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.liskNativeBridge),
    bobNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.bobNativeBridge),
    redstoneNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.redstoneNativeBridge),
    scrollNativeBridge: new ScrollNativeBridgeAdapter(services, storages, ProtocolConfigs.scrollNativeBridge),
    zksyncNativeBridge: new ZksyncNativeBridgeAdapter(services, storages, ProtocolConfigs.zksyncNativeBridge),
    polygonNativeBridge: new PolygonNativeBridgeAdapter(services, storages, ProtocolConfigs.polygonNativeBridge),
    polygonzkevmNativeBridge: new PolygonZzkevmNativeBridgeAdapter(
      services,
      storages,
      ProtocolConfigs.polygonzkevmNativeBridge,
    ),
    hyphen: new HyphenAdapter(services, storages, ProtocolConfigs.hyphen),
    cbridge: new CbridgeAdapter(services, storages, ProtocolConfigs.cbridge),
    hop: new HopAdapter(services, storages, ProtocolConfigs.hop),
    gnosisNativeBridge: new GnosisNativeBridgeAdapter(services, storages, ProtocolConfigs.gnosisNativeBridge),
    lfj: new UniswapAdapter(services, storages, ProtocolConfigs.lfj),
    lfjlend: new LfjlendAdapter(services, storages, ProtocolConfigs.lfjlend),
    eigenlayer: new EigenLayerAdapter(services, storages, ProtocolConfigs.eigenlayer),
    symbiotic: new SymbioticAdapter(services, storages, ProtocolConfigs.symbiotic),
    karak: new KarakAdapter(services, storages, ProtocolConfigs.karak),
    lineaNativeBridge: new LineaNativeBridgeAdapter(services, storages, ProtocolConfigs.lineaNativeBridge),
    zoraNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.zoraNativeBridge),
    worldchainNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.worldchainNativeBridge),
    kromaNativeBridge: new OptimismNativeBridgeLegacyAdapter(services, storages, ProtocolConfigs.kromaNativeBridge),
    mintNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.mintNativeBridge),
    metisNativeBridge: new MetisNativeBridgeAdapter(services, storages, ProtocolConfigs.metisNativeBridge),
    mantleNativeBridge: new MantleNativeBridgeAdapter(services, storages, ProtocolConfigs.mantleNativeBridge),
    paraswap: new ParaswapAdapter(services, storages, ProtocolConfigs.paraswap),
    kyberswap: new KyberswapAdapter(services, storages, ProtocolConfigs.kyberswap),
    zerox: new ZeroxAdapter(services, storages, ProtocolConfigs.zerox),
    pellnetwork: new PellNetworkAdapter(services, storages, ProtocolConfigs.pellnetwork),
    rubic: new RubicAdapter(services, storages, ProtocolConfigs.rubic),
    zircuitNativeBridge: new OptimismNativeBridgeLegacyAdapter(services, storages, ProtocolConfigs.zircuitNativeBridge),
    dodoex: new DodoexAdapter(services, storages, ProtocolConfigs.dodoex),
    odos: new OdosAdapter(services, storages, ProtocolConfigs.odos),
    renzo: new RenzoAdapter(services, storages, ProtocolConfigs.renzo),
    eigenpie: new EigenpieAdapter(services, storages, ProtocolConfigs.eigenpie),
    starknetNativeBridge: new StarknetNativeBridgeAdapter(services, storages, ProtocolConfigs.starknetNativeBridge),
    blastNativeBridge: new BlastNativeBridgeAdapter(services, storages, ProtocolConfigs.blastNativeBridge),
    fuelNativeBridge: new FuelNativeBridgeAdapter(services, storages, ProtocolConfigs.fuelNativeBridge),
    taikoNativeBridge: new TaikoNativeBridgeAdapter(services, storages, ProtocolConfigs.taikoNativeBridge),
    bobaNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.bobaNativeBridge),
    cbeth: new CbethAdapter(services, storages, ProtocolConfigs.cbeth),
    etherfi: new EtherfiAdapter(services, storages, ProtocolConfigs.etherfi),
    puffer: new PufferAdapter(services, storages, ProtocolConfigs.puffer),
    kelpdao: new KelpdaoAdapter(services, storages, ProtocolConfigs.kelpdao),
    morphl2NativeBridge: new MorphL2NativeBridgeAdapter(services, storages, ProtocolConfigs.morphl2NativeBridge),
    balancer: new BalancerAdapter(services, storages, ProtocolConfigs.balancer),
    beets: new BalancerAdapter(services, storages, ProtocolConfigs.beets),
    slisbnb: new SlisbnbAdapter(services, storages, ProtocolConfigs.slisbnb),
    mellow: new MellowAdapter(services, storages, ProtocolConfigs.mellow),
    eclipsel2NativeBridge: new Eclipsel2NativeBridgeAdapter(services, storages, ProtocolConfigs.eclipsel2NativeBridge),
    mantaNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.mantaNativeBridge),
    shapeNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.shapeNativeBridge),
    dbkchainNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.dbkchainNativeBridge),
    optopiaNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.optopiaNativeBridge),
    deriveNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.deriveNativeBridge),
    aevoNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.aevoNativeBridge),
    karakk2NativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.karakk2NativeBridge),
    cyberNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.cyberNativeBridge),
    orderlyNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.orderlyNativeBridge),
    opbnbNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.opbnbNativeBridge),
    loopringNativeBridge: new LoopringNativeBridgeAdapter(services, storages, ProtocolConfigs.loopringNativeBridge),
    ankr: new AnkrAdapter(services, storages, ProtocolConfigs.ankr),
    bedrock: new BedrockAdapter(services, storages, ProtocolConfigs.bedrock),
    gmx: new GmxAdapter(services, storages, ProtocolConfigs.gmx),
    woofi: new WoofiAdapter(services, storages, ProtocolConfigs.woofi),
    zeronetworkNativeBridge: new ZksyncNativeBridgeAdapter(services, storages, ProtocolConfigs.zeronetworkNativeBridge),
    treasureNativeBridge: new ZksyncNativeBridgeAdapter(services, storages, ProtocolConfigs.treasureNativeBridge),
    cronoszkevmNativeBridge: new ZksyncNativeBridgeAdapter(services, storages, ProtocolConfigs.cronoszkevmNativeBridge),
    inkNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.inkNativeBridge),
    sophonNativeBridge: new ZksyncNativeBridgeAdapter(services, storages, ProtocolConfigs.sophonNativeBridge),
    hyperliquidNativeBridge: new HyperLiquidNativeBridgeAdapter(
      services,
      storages,
      ProtocolConfigs.hyperliquidNativeBridge,
    ),
    chainlinkccip: new ChainlinkCcipAdapter(services, storages, ProtocolConfigs.chainlinkccip),
    gearbox: new GearboxAdapter(services, storages, ProtocolConfigs.gearbox),
    ethena: new EthenaAdapter(services, storages, ProtocolConfigs.ethena),
    resolv: new ResolvAdapter(services, storages, ProtocolConfigs.resolv),
    usual: new UsualAdapter(services, storages, ProtocolConfigs.usual),
    axelar: new AxelarAdapter(services, storages, ProtocolConfigs.axelar),
    lombard: new LombardAdapter(services, storages, ProtocolConfigs.lombard),
    swellchainNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.swellchainNativeBridge),
    anzen: new AnzenAdapter(services, storages, ProtocolConfigs.anzen),
    sonicNativeBridge: new SonicNativeBridgeAdapter(services, storages, ProtocolConfigs.sonicNativeBridge),
    thresholdbtc: new ThresholdbtcAdapter(services, storages, ProtocolConfigs.thresholdbtc),
    okxweb3: new Okxweb3Adapter(services, storages, ProtocolConfigs.okxweb3),
    soneiumNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.soneiumNativeBridge),
    solv: new SolvAdapter(services, storages, ProtocolConfigs.solv),
    usdt0: new Usdt0Adapter(services, storages, ProtocolConfigs.usdt0),
    zerion: new ZerionAdapter(services, storages, ProtocolConfigs.zerion),
    abstractNativeBridge: new ZksyncNativeBridgeAdapter(services, storages, ProtocolConfigs.abstractNativeBridge),
    uniswap: new UniswapAdapter(services, storages, ProtocolConfigs.uniswap),
    sushi: new UniswapAdapter(services, storages, ProtocolConfigs.sushi),
    unichainNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.unichainNativeBridge),
    silofinance: new SilofinanceAdapter(services, storages, ProtocolConfigs.silofinance),
    sakefinance: new AaveAdapter(services, storages, ProtocolConfigs.sakefinance),
    dolomite: new DolomiteAdapter(services, storages, ProtocolConfigs.dolomite),
    berachaindex: new BalancerAdapter(services, storages, ProtocolConfigs.berachaindex),
    debridge: new DebridgeAdapter(services, storages, ProtocolConfigs.debridge),
    yearn: new YearnAdapter(services, storages, ProtocolConfigs.yearn),
    superseedNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.superseedNativeBridge),
    rango: new RangoAdapter(services, storages, ProtocolConfigs.rango),
    gauntlet: new GauntletAdapter(services, storages, ProtocolConfigs.gauntlet),
    sparkdao: new GauntletAdapter(services, storages, ProtocolConfigs.sparkdao),
    mevcapital: new GauntletAdapter(services, storages, ProtocolConfigs.mevcapital),
    steakhouse: new GauntletAdapter(services, storages, ProtocolConfigs.steakhouse),
    bprotocol: new GauntletAdapter(services, storages, ProtocolConfigs.bprotocol),
    relendnetwork: new GauntletAdapter(services, storages, ProtocolConfigs.relendnetwork),
    hakutora: new GauntletAdapter(services, storages, ProtocolConfigs.hakutora),
    re7capital: new GauntletAdapter(services, storages, ProtocolConfigs.re7capital),
    apostro: new GauntletAdapter(services, storages, ProtocolConfigs.apostro),
    ninesummits: new GauntletAdapter(services, storages, ProtocolConfigs.ninesummits),
    blockanalitica: new GauntletAdapter(services, storages, ProtocolConfigs.blockanalitica),
    llamarisk: new GauntletAdapter(services, storages, ProtocolConfigs.llamarisk),
    tulipacapital: new GauntletAdapter(services, storages, ProtocolConfigs.tulipacapital),
    eulerdao: new GauntletAdapter(services, storages, ProtocolConfigs.eulerdao),
    k3capital: new GauntletAdapter(services, storages, ProtocolConfigs.k3capital),
    opensea: new OpenseaAdapter(services, storages, ProtocolConfigs.opensea),
    magiceden: new MagicedenAdapter(services, storages, ProtocolConfigs.magiceden),
    joepegs: new LooksrareAdapter(services, storages, ProtocolConfigs.joepegs),
    superrare: new SuperrareAdapter(services, storages, ProtocolConfigs.superrare),
    x2y2: new X2y2Adapter(services, storages, ProtocolConfigs.x2y2),
    looksrare: new LooksrareAdapter(services, storages, ProtocolConfigs.looksrare),
    blur: new BlurAdapter(services, storages, ProtocolConfigs.blur),
    pancakenft: new PancakenftAdapter(services, storages, ProtocolConfigs.pancakenft),
    movementNativeBridge: new MovementNativeBridgeAdapter(services, storages, ProtocolConfigs.movementNativeBridge),
    superform: new SuperformAdapter(services, storages, ProtocolConfigs.superform),
    pendle: new PendleAdapter(services, storages, ProtocolConfigs.pendle),
    spectra: new SpectraAdapter(services, storages, ProtocolConfigs.spectra),
    levelusd: new LevelusdAdapter(services, storages, ProtocolConfigs.levelusd),
    celoNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.celoNativeBridge),
    valasfinance: new AaveAdapter(services, storages, ProtocolConfigs.valasfinance),
    blackrockusd: new BlackrockusdAdapter(services, storages, ProtocolConfigs.blackrockusd),
    stablecoin: new StablecoinAdapter(services, storages, ProtocolConfigs.stablecoin),
    kodiak: new UniswapAdapter(services, storages, ProtocolConfigs.kodiak),
    spooky: new UniswapAdapter(services, storages, ProtocolConfigs.spooky),
    hemiNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.hemiNativeBridge),
  };
}
