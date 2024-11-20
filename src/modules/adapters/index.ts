import { ProtocolConfigs } from '../../configs';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import AaveAdapter from './aave/aave';
import AcrossAdapter from './across/across';
import ArbitrumNativeBridgeAdapter from './arbitrum/nativeBridge';
import AvalonAdapter from './avalon/avalon';
import BalancerAdapter from './balancer/balancer';
import BenqiAdapter from './benqi/benqi';
import BenqiStakingAvaxAdapter from './benqi/savax';
import BlastNativeBridgeAdapter from './blast/nativeBridge';
import BungeeAdapter from './bungee/bungee';
import CbridgeAdapter from './celer/cbridge';
import CircleCctpAdapter from './circle/circlecctp';
import CbethAdapter from './coinbase/cbeth';
import CompoundAdapter from './compound/compound';
import CowswapAdapter from './cowswap/cowswap';
import CurvelendAdapter from './curve/curvelend';
import CurveusdAdapter from './curve/curveusd';
import DineroAdapter from './dinero/dinero';
import DodoexAdapter from './dodoex/dodoex';
import EigenLayerAdapter from './eigenlayer/eigenlayer';
import EigenpieAdapter from './eigenpie/eigenpie';
import EthereumEcosystemAdapter from './ethereum/ecosystem';
import EtherfiAdapter from './etherfi/etherfi';
import EulerAdapter from './euler/euler';
import FluidAdapter from './fluid/fluid';
import FraxEtherAdapter from './frax/fraxether';
import FraxlendAdapter from './frax/fraxlend';
import FuelNativeBridgeAdapter from './fuel/nativeBridge';
import GnosisNativeBridgeAdapter from './gnosis/nativeBridge';
import HopAdapter from './hop/hop';
import HyphenAdapter from './hyphen/hyphen';
import KarakAdapter from './karak/karak';
import KelpdaoAdapter from './kelpdao/kelpdao';
import KyberswapAdapter from './kyberswap/kyberswap';
import LayerbankAdapter from './layerbank/layerbank';
import LfjlendAdapter from './lfj/lfjlend';
import LidoAdapter from './lido/lido';
import LifiAdapter from './lifi/lifi';
import LineaNativeBridgeAdapter from './linea/nativeBridge';
import LiquidCollectiveAdapter from './liquidcollective/lseth';
import LiquityAdapter from './liquity/liquity';
import SlisbnbAdapter from './listadao/slisbnb';
import MakerAdapter from './maker/maker';
import MethAdapter from './mantle/meth';
import MetisNativeBridgeAdapter from './metis/nativeBridge';
import MoonwellAdapter from './moonwell/moonwell';
import MorphL2NativeBridgeAdapter from './morphl2/nativeBridge';
import MorphoAdapter from './morpho/morpho';
import OdosAdapter from './odos/odos';
import OptimismNativeBridgeAdapter from './optimism/nativeBridge';
import OptimismNativeBridgeLegacyAdapter from './optimism/nativeBridgeLegacy';
import PancakeAdapter from './pancake/pancake';
import ParaswapAdapter from './paraswap/paraswap';
import PellNetworkAdapter from './pellnetwork/pellnetwork';
import PolygonNativeBridgeAdapter from './polygon/nativeBridge';
import PolygonZzkevmNativeBridgeAdapter from './polygon/zkevmNativeBridge';
import PufferAdapter from './puffer/puffer';
import RenzoAdapter from './renzo/renzo';
import RocketpoolAdapter from './rocketpool/rocketpool';
import RubicAdapter from './rubic/rubic';
import ScrollNativeBridgeAdapter from './scroll/nativeBridge';
import SpookyAdapter from './spooky/spooky';
import EthxAdapter from './stader/ethx';
import StakewiseAdapter from './stakewise/stakewise';
import StargateAdapter from './stargate/stargate';
import StarknetNativeBridgeAdapter from './starknet/starknetBridge';
import SushiAdapter from './sushi/sushi';
import SwellAdapter from './swell/swell';
import SymbioticAdapter from './symbiotic/symbiotic';
import SynapseAdapter from './synapse/synapse';
import TaikoNativeBridgeAdapter from './taiko/nativeBridge';
import UniswapAdapter from './uniswap/uniswap';
import VenusAdapter from './venus/venus';
import WbethAdapter from './wbeth/wbeth';
import ZeroxAdapter from './zerox/zerox';
import ZksyncNativeBridgeAdapter from './zksync/nativeBridge';

export function getProtocolAdapters(
  services: ContextServices,
  storages: ContextStorages,
): { [key: string]: IProtocolAdapter } {
  return {
    ethereum: new EthereumEcosystemAdapter(services, storages, ProtocolConfigs.ethereum),
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
    sushi: new SushiAdapter(services, storages, ProtocolConfigs.sushi),
    tectonic: new CompoundAdapter(services, storages, ProtocolConfigs.tectonic),
    uniswap: new UniswapAdapter(services, storages, ProtocolConfigs.uniswap),
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
    spooky: new SpookyAdapter(services, storages, ProtocolConfigs.spooky),
    bungee: new BungeeAdapter(services, storages, ProtocolConfigs.bungee),
    lifi: new LifiAdapter(services, storages, ProtocolConfigs.lifi),
    rocketpool: new RocketpoolAdapter(services, storages, ProtocolConfigs.rocketpool),
    wbeth: new WbethAdapter(services, storages, ProtocolConfigs.wbeth),
    meth: new MethAdapter(services, storages, ProtocolConfigs.meth),
    swell: new SwellAdapter(services, storages, ProtocolConfigs.swell),
    ethx: new EthxAdapter(services, storages, ProtocolConfigs.ethx),
    stakewise: new StakewiseAdapter(services, storages, ProtocolConfigs.stakewise),
    liquidcollective: new LiquidCollectiveAdapter(services, storages, ProtocolConfigs.liquidcollective),
    dinero: new DineroAdapter(services, storages, ProtocolConfigs.dinero),
    // stakestone: new StakeStoneAdapter(services, storages, ProtocolConfigs.stakestone),
    across: new AcrossAdapter(services, storages, ProtocolConfigs.across),
    layerbank: new LayerbankAdapter(services, storages, ProtocolConfigs.layerbank),
    pancake: new PancakeAdapter(services, storages, ProtocolConfigs.pancake),
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
    katana: new UniswapAdapter(services, storages, ProtocolConfigs.katana),
    camelot: new UniswapAdapter(services, storages, ProtocolConfigs.camelot),
    hyphen: new HyphenAdapter(services, storages, ProtocolConfigs.hyphen),
    cbridge: new CbridgeAdapter(services, storages, ProtocolConfigs.cbridge),
    hop: new HopAdapter(services, storages, ProtocolConfigs.hop),
    gnosisNativeBridge: new GnosisNativeBridgeAdapter(services, storages, ProtocolConfigs.gnosisNativeBridge),
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
    mantleNativeBridge: new OptimismNativeBridgeAdapter(services, storages, ProtocolConfigs.mantleNativeBridge),
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
  };
}
