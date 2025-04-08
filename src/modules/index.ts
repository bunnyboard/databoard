import { ProtocolConfigs } from '../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../types/namespaces';
import AaveAdapter from './adapters/aave/aave';
import AcrossAdapter from './adapters/across/across';
import AnkrAdapter from './adapters/ankr/ankr';
import AnzenAdapter from './adapters/anzen/anzen';
import ArbitrumNativeBridgeAdapter from './adapters/arbitrum/nativeBridge';
import AvalonAdapter from './adapters/avalon/avalon';
import AxelarAdapter from './adapters/axelar/axelar';
import BalancerAdapter from './adapters/balancer/balancer';
import BedrockAdapter from './adapters/bedrock/bedrock';
import BenqiAdapter from './adapters/benqi/benqi';
import BenqiStakingAvaxAdapter from './adapters/benqi/savax';
import BlackrockusdAdapter from './adapters/blackrock/build';
import BlastNativeBridgeAdapter from './adapters/blast/nativeBridge';
import BlurAdapter from './adapters/blur/blur';
import BungeeAdapter from './adapters/bungee/bungee';
import CbridgeAdapter from './adapters/celer/cbridge';
import ChainlinkCcipAdapter from './adapters/chainlink/ccip';
import CircleCctpAdapter from './adapters/circle/circlecctp';
import CbethAdapter from './adapters/coinbase/cbeth';
import CompoundAdapter from './adapters/compound/compound';
import CowswapAdapter from './adapters/cowswap/cowswap';
import CurvelendAdapter from './adapters/curve/curvelend';
import CurveusdAdapter from './adapters/curve/curveusd';
import DebridgeAdapter from './adapters/debridge/debridge';
import DineroAdapter from './adapters/dinero/dinero';
import DodoexAdapter from './adapters/dodoex/dodoex';
import DolomiteAdapter from './adapters/dolomite/dolomite';
import Eclipsel2NativeBridgeAdapter from './adapters/eclipsel2/nativeBridge';
import EigenLayerAdapter from './adapters/eigenlayer/eigenlayer';
import EigenpieAdapter from './adapters/eigenpie/eigenpie';
import EthenaAdapter from './adapters/ethena/ethena';
import EthereumAdapter from './adapters/ethereum/ethereum';
import EtherfiAdapter from './adapters/etherfi/etherfi';
import EulerAdapter from './adapters/euler/euler';
import FluidAdapter from './adapters/fluid/fluid';
import FraxEtherAdapter from './adapters/frax/fraxether';
import FraxlendAdapter from './adapters/frax/fraxlend';
import FuelNativeBridgeAdapter from './adapters/fuel/nativeBridge';
import GearboxAdapter from './adapters/gearbox/gearbox';
import GmxAdapter from './adapters/gmx/gmx';
import GnosisNativeBridgeAdapter from './adapters/gnosis/nativeBridge';
import GauntletAdapter from './adapters/guntlet/gauntlet';
import HopAdapter from './adapters/hop/hop';
import HyperLiquidNativeBridgeAdapter from './adapters/hyperliquid/nativeBridge';
import HyphenAdapter from './adapters/hyphen/hyphen';
import KarakAdapter from './adapters/karak/karak';
import KelpdaoAdapter from './adapters/kelpdao/kelpdao';
import KyberswapAdapter from './adapters/kyberswap/kyberswap';
import LayerbankAdapter from './adapters/layerbank/layerbank';
import LevelusdAdapter from './adapters/levelusd/levelusd';
import LfjlendAdapter from './adapters/lfj/lfjlend';
import LidoAdapter from './adapters/lido/lido';
import LifiAdapter from './adapters/lifi/lifi';
import LineaNativeBridgeAdapter from './adapters/linea/nativeBridge';
import LiquidCollectiveAdapter from './adapters/liquidcollective/lseth';
import LiquityAdapter from './adapters/liquity/liquity';
import SlisbnbAdapter from './adapters/listadao/slisbnb';
import LombardAdapter from './adapters/lombard/lombard';
import LooksrareAdapter from './adapters/looksrare/looksrare';
import LoopringNativeBridgeAdapter from './adapters/loopring/nativeBridge';
import MagicedenAdapter from './adapters/magiceden/magiceden';
import MakerAdapter from './adapters/maker/maker';
import MethAdapter from './adapters/mantle/meth';
import MantleNativeBridgeAdapter from './adapters/mantle/nativeBridge';
import MellowAdapter from './adapters/mellow/mellow';
import MetisNativeBridgeAdapter from './adapters/metis/nativeBridge';
import MoonwellAdapter from './adapters/moonwell/moonwell';
import MorphL2NativeBridgeAdapter from './adapters/morphl2/nativeBridge';
import MorphoAdapter from './adapters/morpho/morpho';
import MovementNativeBridgeAdapter from './adapters/movement/nativeBridge';
import OdosAdapter from './adapters/odos/odos';
import Okxweb3Adapter from './adapters/okx/okxweb3';
import OpenseaAdapter from './adapters/opensea/opensea';
import OptimismNativeBridgeAdapter from './adapters/optimism/nativeBridge';
import OptimismNativeBridgeLegacyAdapter from './adapters/optimism/nativeBridgeLegacy';
import PancakenftAdapter from './adapters/pancake/marketplace';
import ParaswapAdapter from './adapters/paraswap/paraswap';
import PellNetworkAdapter from './adapters/pellnetwork/pellnetwork';
import PendleAdapter from './adapters/pendle/pendle';
import PolygonNativeBridgeAdapter from './adapters/polygon/nativeBridge';
import PolygonZzkevmNativeBridgeAdapter from './adapters/polygon/zkevmNativeBridge';
import PufferAdapter from './adapters/puffer/puffer';
import RangoAdapter from './adapters/rango/rango';
import RenzoAdapter from './adapters/renzo/renzo';
import ResolvAdapter from './adapters/resolv/resolv';
import RocketpoolAdapter from './adapters/rocketpool/rocketpool';
import RubicAdapter from './adapters/rubic/rubic';
import ScrollNativeBridgeAdapter from './adapters/scroll/nativeBridge';
import SilofinanceAdapter from './adapters/silofinance/silofinance';
import SolvAdapter from './adapters/solv/solv';
import SonicNativeBridgeAdapter from './adapters/sonic/nativeBridge';
import SpectraAdapter from './adapters/spectra/spectra';
import StablecoinAdapter from './adapters/stablecoin/stablecoin';
import StaderAdapter from './adapters/stader/stader';
import StakewiseAdapter from './adapters/stakewise/stakewise';
import StargateAdapter from './adapters/stargate/stargate';
import StarknetNativeBridgeAdapter from './adapters/starknet/starknetBridge';
import SuperformAdapter from './adapters/superform/superform';
import SuperrareAdapter from './adapters/superrare/superrare';
import SwellAdapter from './adapters/swell/swell';
import SymbiosisAdapter from './adapters/symbiosis/symbiosis';
import SymbioticAdapter from './adapters/symbiotic/symbiotic';
import SynapseAdapter from './adapters/synapse/synapse';
import TaikoNativeBridgeAdapter from './adapters/taiko/nativeBridge';
import ThresholdbtcAdapter from './adapters/threshold/thresholdbtc';
import UniswapAdapter from './adapters/uniswap/uniswap';
import Usdt0Adapter from './adapters/usdt0/usdt0';
import UsualAdapter from './adapters/usual/usual';
import VenusAdapter from './adapters/venus/venus';
import WbethAdapter from './adapters/wbeth/wbeth';
import WoofiAdapter from './adapters/woofi/woofi';
import X2y2Adapter from './adapters/x2y2/x2y2';
import YearnAdapter from './adapters/yearn/yearn';
import ZerionAdapter from './adapters/zerion/zerion';
import ZeroxAdapter from './adapters/zerox/zerox';
import ZksyncNativeBridgeAdapter from './adapters/zksync/nativeBridge';

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
    symbiosis: new SymbiosisAdapter(services, storages, ProtocolConfigs.symbiosis),
    hyperithm: new GauntletAdapter(services, storages, ProtocolConfigs.hyperithm),
    camelot: new UniswapAdapter(services, storages, ProtocolConfigs.camelot),
    quickswap: new UniswapAdapter(services, storages, ProtocolConfigs.quickswap),
  };
}
