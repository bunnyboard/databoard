import { OracleConfig } from '../../types/oracles';
import { OracleSourceAlgebraList } from './algebra';
import { OracleSourceBalancerList } from './balancer';
import { OracleSourceChainlinkList } from './chainlink';
import { OracleCurrencyBaseConfigs } from './currency';
import { OracleSourceCurveList } from './curve';
import { OracleSourceCustomList } from './custom';
import { OracleSourceDexLpTokenList } from './dexLp';
import { OracleSourceLBookList } from './lbook';
import { OracleSourcePythList } from './pyth';
import { OracleSourceUniswapv2List } from './uniswapv2';
import { OracleSourceUniswapv3List } from './uniswapv3';
import { OracleSourceUniswapv4List } from './uniswapv4';

// symbol => OracleConfig
export const OracleSourceConfigs: { [key: string]: OracleConfig } = {
  ETH: OracleCurrencyBaseConfigs.eth,
  BNB: OracleCurrencyBaseConfigs.bnb,
  BTC: OracleCurrencyBaseConfigs.btc,
  MATIC: OracleCurrencyBaseConfigs.matic,
  AVAX: OracleCurrencyBaseConfigs.avax,
  FTM: OracleCurrencyBaseConfigs.ftm,
  S: OracleCurrencyBaseConfigs.s,
  GLMR: OracleCurrencyBaseConfigs.glmr,
  CELO: OracleCurrencyBaseConfigs.celo,
  BERA: OracleCurrencyBaseConfigs.bera,
  IP: OracleCurrencyBaseConfigs.ip,
  SUI: {
    currency: 'usd',
    sources: [OracleSourcePythList.SUI_USD],
  },
  DAI: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DAI_USD],
    stablecoin: true,
  },
  USDC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDC_USD],
    stablecoin: true,
  },
  USDT: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
    stablecoin: true,
  },
  EUR: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  sUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDT_USD],
    stablecoin: true,
  },
  TUSD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TUSD_WETH],
  },
  LEND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LEND_WETH],
  },
  BAT: {
    currency: 'eth',
    sources: [OracleSourceChainlinkList.BAT_ETH],
  },
  LINK: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.LINK_USD],
  },
  KNC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KNC_USD],
  },
  REP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REP_WETH],
  },
  MKR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MKR_DAI],
  },
  MANA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MANA_WETH],
  },
  ZRX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZRX_WETH],
  },
  SNX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SNX_WETH],
  },
  WBTC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WBTC_USDT],
  },
  BUSD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BUSD_USD],
    stablecoin: true,
  },
  ENJ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ENJ_WETH],
  },
  REN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REN_WETH],
  },
  YFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.YFI_WETH],
  },
  AAVE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AAVE_WETH],
  },
  UNI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UNI_WETH],
  },
  CRV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CRV_WETH],
  },
  EOS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EOS_USD],
  },
  XTZ: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XTZ_USD],
  },
  BAL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAL_WETH],
  },
  xSUSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.xSUSHI_WETH],
  },
  GUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceChainlinkList.GUSD_USD, OracleSourceCurveList.GUSD_METAPOOL],
  },
  mkUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceCurveList.mkUSD_USDC],
  },
  ULTRA: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceCurveList.ULTRA_USDC],
  },
  FIL: {
    // FIl on bnbchain and renFIL on ethereum
    currency: 'usd',
    sources: [OracleSourceChainlinkList.FIL_USD],
  },
  RAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RAI_WETH],
  },
  USDP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.USDP_USD],
    stablecoin: true,
  },
  AMPL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AMPL_WETH],
  },
  DPI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DPI_WETH],
  },
  FRAX: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.FRAX_USDC],
    stablecoin: true,
  },
  FEI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FEI_WETH],
  },
  stETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.stETH_WETH],
  },
  ENS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ENS_WETH],
  },
  UST: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.UST_BUSD],
  },
  CVX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CVX_WETH],
  },
  '1INCH': {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List['1INCH_WETH']],
  },
  LUSD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LUSD_WETH],
  },
  SUSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SUSHI_WETH],
  },
  wstETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wstETH_WETH, OracleSourceUniswapv3List.wstETH_WETH_2],
  },
  cbETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.cbETH_WETH],
  },
  rETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.rETH_WETH],
  },
  LDO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LDO_WETH],
  },
  GHO: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceChainlinkList.GHO_USD],
  },
  RPL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RPL_WETH, OracleSourceUniswapv3List.RPL_WETH],
  },
  sDAI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.SAVING_DAI],
  },
  sUSDS: {
    currency: 'usd',
    sources: [OracleSourceCustomList.SAVING_USDS],
  },
  STG: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.STG_USDC],
  },
  COMP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.COMP_WETH],
  },
  SAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SAI_WETH],
  },
  EURS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  sEUR: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  MIM: {
    currency: 'eth',
    stablecoin: true,
    sources: [OracleSourceCurveList.MIM_METAPOOL, OracleSourceUniswapv2List.MIM_WETH],
  },
  FXS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.FXS_FRAX],
  },
  ARB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ARB_WETH],
  },
  OP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OP_WETH],
  },
  GHST: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GHST_USDC],
  },
  jEUR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.jEUR_WETH, OracleSourceChainlinkList.EUR_USD],
  },
  agEUR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.agEUR_USDC, OracleSourceChainlinkList.EUR_USD],
  },
  miMATIC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.miMATIC_USDC],
  },
  MAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.miMATIC_USDC],
  },
  stMATIC: {
    currency: 'matic',
    sources: [OracleSourceUniswapv3List.stMATIC_WMATIC],
  },
  MaticX: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.MaticX_WMATIC],
  },
  ALPHA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ALPHA_WETH],
  },
  sAVAX: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.sAVAX_WAVAX],
  },
  ADA: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.ADA_USD],
  },
  BCH: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BCH_USD],
  },
  BETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BETH_ETH],
  },
  CAKE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.CAKE_WBNB],
  },
  DOGE: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DOGE_USD],
  },
  DOT: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.DOT_USD],
  },
  LTC: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.LTC_USD],
  },
  LUNA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.LUNA_WBNB],
  },
  SXP: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.SXP_WBNB],
  },
  wBETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wBETH_ETH],
  },
  lsETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.lsETH_ETH],
  },
  ankrETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ankrETH_WETH],
  },
  REZ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.REZ_WETH],
  },
  uniBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.uniBTC_WBTC],
  },
  SolvBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.SolvBTC_WBTC],
  },
  FBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.FBTC_WBTC],
  },
  ARPA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ARPA_WBNB],
  },
  WIN: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.WIN_WBNB],
  },
  BTT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BTT_WETH],
  },
  SnBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.SbBNB_WBNB],
  },
  stkBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.stkBNB_WBNB],
  },
  ankrBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ankrBNB_WBNB],
  },
  BNBx: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.BNBx_WBNB],
  },
  TRX: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.TRX_USD],
  },
  USDD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDD_USDT],
  },
  XRP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XRP_USD],
  },
  XVS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XVS_USD],
  },
  HAY: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.HAY_BUSD],
  },
  ALPACA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ALPACA_WBNB],
  },
  RACA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.RACA_WBNB],
  },
  BSW: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BSW_WBNB],
  },
  ANKR: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ANKR_WBNB],
  },
  TWT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.TWT_WBNB],
  },
  LYNX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LYNX_WETH],
  },
  FOXY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.FOXY_WETH],
  },
  ZERO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZERO_WETH],
  },
  crvUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceChainlinkList.crvUSD_USD],
  },
  QI: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.QI_WAVAX],
  },
  SD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SD_USDC],
  },
  vBTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.vBTC_WETH],
  },
  CREAM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CREAM_WETH],
  },
  BAC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BAC_DAI],
  },
  NFTX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NFTX_WETH],
  },
  STETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.STETH_WETH],
  },
  pONT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.pONT_WETH],
  },
  DOLA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DOLA_WETH],
  },
  OHMv1: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.OHMv1_DAI],
  },
  OHM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OHM_WETH],
  },
  SONNE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SONNE_USDC],
  },
  STONE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.STONE_WETH],
  },
  IBEX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IBEX_WETH],
  },
  pufETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.pufETH_WETH],
  },
  METIS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.METIS_WETH],
  },
  GNO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GNO_WETH],
  },
  sXDAI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.SAVING_xDAI],
  },
  RDNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RDNT_WETH],
  },
  GBP: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.GBP_USD],
  },
  AUD: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.AUD_USD],
  },
  JPY: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.JPY_USD],
  },
  KRW: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KRW_USD],
  },
  CHF: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.CHF_USD],
  },
  LRC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LRC_WETH],
  },
  MAKER_RWA001: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA001],
  },
  MAKER_RWA002: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA002],
  },
  MAKER_RWA003: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA003],
  },
  MAKER_RWA004: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA004],
  },
  MAKER_RWA005: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA005],
  },
  MAKER_RWA006: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA006],
  },
  MAKER_RWA007: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA007],
  },
  MAKER_RWA009: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA009],
  },
  MAKER_RWA008: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA008],
  },
  MAKER_RWA012: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA012],
  },
  MAKER_RWA013: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA013],
  },
  MAKER_RWA014: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA014],
  },
  MAKER_RWA015: {
    currency: 'usd',
    sources: [OracleSourceCustomList.MAKER_RWA015],
  },
  GMX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GMX_WETH],
  },
  SOL: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.SOL_USD],
  },
  PYUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PYUSD_USDC],
  },
  weETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.weETH_WETH],
  },
  AERO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.AERO_USDC],
  },
  mUSD: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceCurveList.mUSD_METAPOOL],
  },
  BAND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAND_WETH],
  },
  APE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.APE_WETH],
  },
  frxETH: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.frxETH_FRAX],
  },
  swETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.swETH_WETH],
  },
  ETHx: {
    currency: 'eth',
    sources: [OracleSourceCurveList.ETHx_WETH],
  },
  pxETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.pxETH_WETH],
  },
  AJNA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AJNA_WETH],
  },
  RBN: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RBN_USDC],
  },
  PRIME: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PRIME_WETH],
  },
  COW: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.COW_WETH],
  },
  DEGEN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DEGEN_WETH],
  },
  FRIEND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FRIEND_WETH],
  },
  DATA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DATA_WETH],
  },
  PENDLE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PENDLE_WETH],
  },
  RNDR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RNDR_WETH],
  },
  SAND: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SAND_WETH],
  },
  UCO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UCO_WETH],
  },
  IGG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IGG_WETH],
  },
  MNW: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MNW_WETH],
  },
  ACX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ACX_WETH],
  },
  POOL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.POOL_WETH],
  },
  FORT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.FORT_WETH],
  },
  UBT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UBT_WETH],
  },
  PERP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PERP_WETH],
  },
  GRT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GRT_WETH],
  },
  MAGIC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MAGIC_WETH],
  },
  GROW: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GROW_WETH],
  },
  tBTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.tBTC_WETH],
  },
  UMA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UMA_WETH],
  },
  BNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BNT_WETH],
  },
  NMR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NMR_WETH],
  },
  INST: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.INST_WETH],
  },
  XSGD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.XSDG_WETH],
  },
  CVC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CVC_WETH],
  },
  ANT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ANT_WETH],
  },
  MLN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MNL_WETH],
  },
  KEEP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KEEP_WETH],
  },
  AMKT: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.AMKT_WBTC],
  },
  STORJ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.STORJ_WETH],
  },
  AMP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AMP_WETH],
  },
  NU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NU_WETH],
  },
  OATH: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.OATH_WFTM],
  },
  PREMIA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PREMIA_WETH],
  },
  LOOM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.LOOM_USDC],
  },
  MNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MNT_WETH],
  },
  BONK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BONK_WETH],
  },
  DNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DNT_WETH],
  },
  OXT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OXT_WETH],
  },
  cmUMAMI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.cmUMAMI_WETH],
  },
  L2DAO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.L2DAO_WETH],
  },
  MATH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MATH_WETH],
  },
  SPELL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SPELL_WETH],
  },
  DPX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DPX_WETH],
  },
  BIFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BIFI_WETH],
  },
  UNAMI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UNAMI_WETH],
  },
  SIS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SIS_WETH],
  },
  renBTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.renBTC_WETH],
  },
  DODO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DODO_WETH],
  },
  FLOKI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FLOKI_WETH],
  },
  OCEAN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OCEAN_WETH],
  },
  ICHI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.ICHI_USDC],
  },
  THALES: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.THALES_WETH, OracleSourceUniswapv2List.THALES_WETH],
  },
  WOO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.WOO_WETH],
  },
  AKRO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AKRO_WETH],
  },
  CELR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CELR_WETH, OracleSourceUniswapv3List.CELR_WETH],
  },
  KROM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.KROM_WETH],
  },
  TORN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TORN_WETH],
  },
  LYRA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LYRA_WETH],
  },
  USX: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.USX_USDC],
  },
  HOPR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.HOPR_DAI],
  },
  SHU: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SHU_USDC],
  },
  PNK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PNK_WETH],
  },
  OKB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OKB_WETH],
  },
  ETHIX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ETHIX_WETH],
  },
  BZZ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BZZ_WETH],
  },
  BRIGHT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BRIGHT_WETH],
  },
  HAKKA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HAKKA_WETH],
  },
  STAKE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.STAKE_WETH],
  },
  MVX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MVX_WETH],
  },
  CTK: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.CTK_WBNB],
  },
  SWISE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SWISE_WETH],
  },
  SKL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SKL_WETH],
  },
  SEAM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.SEAM_USDC],
  },
  SYN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SYN_WETH],
  },
  VAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.VAI_BUSD],
  },
  BAKE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BAKE_WBNB],
  },
  ATOM: {
    currency: 'bnb',
    sources: [OracleSourceChainlinkList.ATOM_USD],
  },
  INJ: {
    currency: 'bnb',
    sources: [OracleSourceChainlinkList.INJ_USD],
  },
  JOE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.JOE_USDC],
  },
  PNG: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.PNG_USDC],
  },
  XAVA: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.XAVA_WAVAX],
  },
  PTP: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.PTP_WAVAX],
  },
  USDM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDM_USDT],
  },
  USDA: {
    currency: 'eur',
    sources: [OracleSourceUniswapv3List.USDA_EURA],
  },
  USDe: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDe_USDT],
  },
  ezETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ezETH_WETH],
  },
  osETH: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.osETH_USDC],
  },
  tBTCv2: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BTC_USD],
  },
  BADGER: {
    currency: 'btc',
    sources: [OracleSourceUniswapv2List.BADGER_WBTC],
  },
  LIT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LIT_WETH],
  },
  SKY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SKY_WETH],
  },
  SPX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SPX_WETH],
  },
  ARKM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ARKM_WETH],
  },
  AGIX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AGIX_WETH],
  },
  MSTR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MSTR_WETH],
  },
  NOCHILL: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.NOCHILL_WAVAX],
  },
  ARENA: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.ARENA_WAVAX],
  },
  WELL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.WELL_WETH],
  },
  MAVIA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MAVIA_WETH],
  },
  ILV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ILV_WETH],
  },
  Mog: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.Mog_WETH],
  },
  MPL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MPL_WETH],
  },
  eETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.eETH_WETH],
  },
  PROS: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.PROS_WBNB],
  },
  BOO: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.BOO_WFTM],
  },
  POLTER: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.POLTER_WFTM],
  },
  JEFE: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.JEFE_WFTM],
  },
  sFTMx: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.sFTMx_WFTM],
  },
  ICE: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.ICE_WFTM],
  },
  RAM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RAM_WETH],
  },
  KEYCAT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KEYCAT_WETH],
  },
  DIMO: {
    currency: 'matic',
    sources: [OracleSourceUniswapv3List.DIMO_WMPOL],
  },
  GOON: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.GOON_WPOL],
  },
  TEL: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.TEL_USDC],
  },
  RIO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RIO_WETH],
  },
  ZIG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZIG_WETH],
  },
  BABYDOGE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BABYDOGE],
  },
  GTAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GTAI_USDT],
  },
  QUICK: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.QUICK_WPOL],
  },
  QUICK2: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.QUICK2_WPOL],
  },
  CAT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.CAT_WBNB],
  },
  VIRTUAL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VIRTUAL_WETH],
  },
  DRAGONX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DRAGONX_WETH],
  },
  TOKE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TOKE_WETH],
  },
  rswETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.rswETH_WETH],
  },
  RSR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RSR_WETH],
  },
  USD0: {
    currency: 'usd',
    stablecoin: true,
    sources: [],
  },
  USC: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceUniswapv2List.USC_USDC],
  },
  CDCETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CDCETH_WETH, OracleSourceUniswapv3List.CDCETH_WETH],
  },
  GRAI: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceUniswapv3List.GRAI_USDC],
  },
  sFRAX: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sFRAX],
  },
  sDOLA: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sDOLA],
  },
  FPI: {
    currency: 'usd',
    stablecoin: true,
    sources: [],
  },
  rsETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.rsETH_WETH],
  },
  CRO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WCRO_USDC],
  },
  RON: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WRON_USDC],
  },
  RLB: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RLB_USDT],
  },
  pzETH: {
    currency: 'wstETH',
    sources: [OracleSourceUniswapv3List.pzETH_wstETH],
  },
  weETHs: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.weETHs_WETH],
  },
  eUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.eUSD_USDC],
  },
  AUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.AUSD_USDT],
  },
  ENA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ENA_WETH],
  },
  ETHFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ETHFI_WETH],
  },
  mstETH: {
    currency: 'wstETH',
    sources: [OracleSourceUniswapv3List.mstETH_wstETH],
  },
  PSTAKE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PSTAKE_USDC],
  },
  PRO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PRO_WETH],
  },
  KWENTA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KWENTA_WETH],
  },
  ZRO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ZRO_WETH],
  },
  BURGER: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BURGER_USDT],
  },
  DRIP: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.DRIP_BUSD],
  },
  ZK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZK_WETH],
  },
  TRADE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.TRADE_USDT],
  },
  FET: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FET_WETH],
  },
  OPTIMUS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OPTIMUS_WETH],
  },
  GPT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GPT_WETH],
  },
  LAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.LAI_USDC],
  },
  RARI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RARI_WETH],
  },
  mETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.mETH_WETH, OracleSourceCustomList.mETH],
  },
  WLD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WLD_WETH],
  },
  ID: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ID_WBNB],
  },
  BRLA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.BRLA_USDC],
  },
  BRETT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BRETT_WETH],
  },
  ALT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ALT_WETH],
  },
  KAS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.KAS_WETH],
  },
  OLAS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OLAS_WETH],
  },
  PEPE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PEPE_WETH],
  },
  BEAM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BEAM_WETH],
  },
  LOGX: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.LOGX_USDT],
  },
  CORE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.WCORE_USDT],
  },
  stCORE: {
    currency: 'core',
    sources: [OracleSourceUniswapv2List.stCORE_WCORE],
  },
  LSK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LSK_WETH],
  },
  LBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.LBTC_WBTC],
  },
  EIGEN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.EIGEN_WETH],
  },
  KAVA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WKAVA_USDT],
  },
  KLAY: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KLAY_USD],
  },
  TAP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.TAP_WETH],
  },
  L3: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.L3_WETH],
  },
  LOUDER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LOUDER_WETH],
  },
  OETH: {
    currency: 'eth',
    sources: [OracleSourceCurveList.OETH_WETH],
  },
  DMT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DMT_WETH],
  },
  XAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.XAI_WETH],
  },
  TIA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TIA_WETH],
  },
  ATH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ATH_WETH],
  },
  NYA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.NYA_WETH],
  },
  BOBA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BOBA_WETH],
  },
  G: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.G_USDC],
  },
  NEWO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.NEWO_USDC],
  },
  gOHM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.gOHM_WETH],
  },
  HIGH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HIGH_WETH],
  },
  DOG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DOG_WETH],
  },
  SOFI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SOFI_USDC],
  },
  APEX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.APEX_WETH],
  },
  H2O: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.H2O_USDC],
  },
  SFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SFI_WETH],
  },
  NFD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NFD_WETH],
  },
  SDT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SDT_WETH],
  },
  VSTA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VSTA_WETH],
  },
  PLS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PLS_WETH],
  },
  UNIDX: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.UNIDX_DAI],
  },
  wsOHM: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.wsOHM_WAVAX],
  },
  JUMP: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.JUMP_WFTM],
  },
  SPEC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SPEC_WETH],
  },
  ynETH: {
    currency: 'wstETH',
    sources: [OracleSourceCurveList.ynETH_WETH],
  },
  wM: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.wM_USDC],
  },
  TRYb: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.TRYb_USDC],
  },
  HOP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.HOP_WETH],
  },
  RGT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RGT_WETH],
  },
  BOND: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BOND_USDC],
  },
  POND: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.POND_USDC],
  },
  rDPX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.rDPX_WETH],
  },
  DF: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DF_WETH],
  },
  MM: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.MM_WBNB],
  },
  WOW: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.WOW_WBNB],
  },
  FUEL: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.FUEL_WBNB],
  },
  NULS: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.NULS_WBNB],
  },
  NVT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.NVT_WBNB],
  },
  FRONT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.FRONT_WBNB],
  },
  UNFI: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.UNFI_WBNB],
  },
  ONT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.ONT_WBNB],
  },
  O3: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.O3_BUSD],
  },
  TOSHI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.TOSHI_WETH],
  },
  WXT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WXT_WETH],
  },
  uniETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.uniETH_WETH],
  },
  TCGC: {
    currency: 'oas',
    sources: [OracleSourceUniswapv2List.TCGC_WOAS],
  },
  OAS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WOAS_USDT],
  },
  GHX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GHX_WETH],
  },
  DOMI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DOMI_WETH],
  },
  veSOLAR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.veSOLAR_USDT],
  },
  BICO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BICO_WETH, OracleSourceUniswapv3List.BICO_WETH],
  },
  MOVR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MOVR_FRAX],
  },
  MANTA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MANTA_USDC],
  },
  MASK: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MASK_USDC],
  },
  HEGIC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HEGIC_WETH],
  },
  ALBT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ALBT_WETH],
  },
  TRAC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TRAC_WETH],
  },
  SAFE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SAFE_WETH],
  },
  GIV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GIV_WETH],
  },
  FOX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FOX_WETH],
  },
  UNCX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UNCX_WETH],
  },
  CLNY: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.CLNY_USDC],
  },
  GOVI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GOVI_WETH],
  },
  HOT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HOT_WETH],
  },
  DERI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.DERI_USDT],
  },
  RING: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RING_WETH],
  },
  DONUT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DONUT_WETH],
  },
  BUMP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BUMP_WETH],
  },
  GEAR: {
    currency: 'eth',
    sources: [OracleSourceCurveList.GEAR_WETH],
  },
  KOI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KOI_WETH],
  },
  IDO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IDO_WETH],
  },
  MUTE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MUTE_WETH],
  },
  MAV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MAV_WETH],
  },
  TON: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.TON_WETH],
  },
  GTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GTC_WETH],
  },
  CXO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CXO_WETH],
  },
  BTU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BTU_WETH],
  },
  FACTR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.FACTR_WETH],
  },
  CHAIN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CHAIN_WETH],
  },
  ALI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ALI_USDC],
  },
  DOLZ: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.DOLZ_USDT],
  },
  BANANA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BANANA_WETH],
  },
  ELON: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ELON_WETH],
  },
  DOP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DOP_WETH],
  },
  VEE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VEE_WETH],
  },
  BAG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAG_WETH],
  },
  BOSON: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BOSON_WETH],
  },
  ANGLE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ANGLE_WETH],
  },
  ANML: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ANML_WETH],
  },
  DHT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.DHT_USDC],
  },
  DFX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DFX_WETH],
  },
  AXI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AXI_WETH],
  },
  PASS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.PASS_USDT],
  },
  DWEB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DWEB_WETH],
  },
  API3: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.API3_WETH],
  },
  DEXT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DEXT_WETH],
  },
  AXS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AXS_WETH],
  },
  lisUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.lisUSD_USDT],
  },
  snBNB: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.snBNB_WBNB],
  },
  BLAST: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BLAST_WETH],
  },
  TITANX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.TITANX_WETH],
  },
  DUSK: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.DUSK_USDT],
  },
  BOOE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BOOE_WETH],
  },
  SHIB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SHIB_WETH],
  },
  SCR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SCR_WETH],
  },
  WIGO: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.WIGO_WFTM],
  },
  SNS: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.SNS_WFTM],
  },
  XFIT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.XFIT_USDT],
  },
  XMT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.XMT_USDC],
  },
  PIRATE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PIRATE_WETH],
  },
  AIUS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AIUS_WETH],
  },
  AZUR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AZUR_WETH],
  },
  FXN: {
    currency: 'eth',
    sources: [OracleSourceCurveList.FXN_ETH],
  },
  IXS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IXS_WETH],
  },
  UwU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.UwU_WETH],
  },
  MK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MK_WETH],
  },
  MAGA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MAGA_WETH],
  },
  SUPER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SUPER_WETH],
  },
  MCADE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.MCADE_USDC],
  },
  WIFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.WIFI_WETH],
  },
  TURBO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.TURBO_WETH],
  },
  BITCOIN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BITCOIN_WETH],
  },
  GSWIFT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GSWIFT_WETH],
  },
  RSC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RSC_WETH],
  },
  GRAIL: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GRAIL_USDC],
  },
  OX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OX_WETH],
  },
  AI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AI_WETH],
  },
  XBG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.XBG_WETH],
  },
  FFM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.FFM_WETH],
  },
  CATCH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.CATCH_WETH],
  },
  BAMBOO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAMBOO_WETH],
  },
  BSWAP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BSWAP_WETH],
  },
  BTCB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BTCB_WETH],
  },
  THE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.THE_WBNB],
  },
  ETHB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ETHB_WETH],
  },
  W: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.W_WETH],
  },
  MODE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MODE_WETH],
  },
  EXTRA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.EXTRA_USDC],
  },
  VELO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.VELO_WETH],
  },
  NEAR: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.NEAR_USD],
  },
  MOE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MOE_USDT],
  },
  ION: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ION_WETH],
  },
  bsdETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.bsdETH_WETH],
  },
  AVAIL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AVAIL_WETH],
  },
  BNBTC: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BNBTC_WBNB],
  },
  BTCBR: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.BTCBR_WBNB],
  },
  LINA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.LINA_BUSD],
  },
  BETS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BETS_WETH],
  },
  IZI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IZI_WETH],
  },
  CANTO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.CANTO_WETH],
  },
  FTT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FTT_WETH],
  },
  PNP: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.PNP_USDC],
  },
  RBC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RBC_WETH],
  },
  LUNA_VIRTUALS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LUNA_WETH],
  },
  ONCHAIN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ONCHAIN_WETH],
  },
  FUSE: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.FUSE_WBNB],
  },
  AIOZ: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.AIOZ_WBNB],
  },
  MENDI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MENDI_USDC],
  },
  OM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OM_WETH],
  },
  SWELL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SWELL_WETH],
  },
  COTI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.COTI_WETH],
  },
  THOR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.THOR_WETH],
  },
  ONDO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ONDO_WETH],
  },
  wTAO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wTAO_WETH],
  },
  stTAO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.stTAO_WETH],
  },
  DEAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DEAI_WETH],
  },
  BANANA_GUN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BANANA_WETH],
  },
  MGP: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.MGP_WBNB],
  },
  CKP: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.CKP_WBNB],
  },
  MASQ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MASQ_WETH],
  },
  LOOKS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LOOKS_WETH],
  },
  LQTY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LQTY_WETH],
  },
  DYDX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DYDX_WETH],
  },
  wQUIL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.wQUIL_WETH],
  },
  DINERO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DINERO_WETH],
  },
  USDs: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDs_USDC],
  },
  SPA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.SPA_USDC],
  },
  COQ: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.COQ_WAVAX],
  },
  CHR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CHR_WETH],
  },
  LOTUS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LOTUS_WETH],
  },
  VOLT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.VOLT_WETH],
  },
  LUA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.LUA_USDT],
  },
  LUAUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.LUAUSD_USDT],
  },
  BLUR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BLUR_WETH],
  },
  OPN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OPN_WETH],
  },
  unshETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.unshETH_ETH],
  },
  BRUSH: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.BRUSH_WFTM],
  },
  SPIRIT: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.SPIRIT_WFTM],
  },
  LYXe: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LYXe_WETH],
  },
  VANRY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VANRY_WETH],
  },
  WINR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WINR_WETH],
  },
  LQDR: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.LQDR_WFTM],
  },
  TAROT: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.TAROT_WFTM],
  },
  EQUAL: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.EQUAL_WFTM],
  },
  STEAK: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.STEAK_WAVAX],
  },
  HOLD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HOLD_WETH],
  },
  JASMY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.JASMY_WETH],
  },
  ZETA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ZETA_WETH],
  },
  STRK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.STRK_WETH],
  },
  TAIKO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.TAIKO_WETH],
  },
  deUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.deUSD_USDC],
  },
  ZK_Polyhedra_Network: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ZK_Polyhedra_Network_WETH],
  },
  Silo: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.Silo_WETH],
  },
  XLM: {
    currency: 'eth',
    sources: [OracleSourceChainlinkList.XLM_USD],
  },
  MEME: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MEME_WETH],
  },
  OSAK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OSAK_WETH],
  },
  FARM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FARM_WETH],
  },
  NPC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NPC_WETH],
  },
  ANYONE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ANYONE_WETH],
  },
  ICE_NETWORK: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ICE_USDT],
  },
  GYD: {
    currency: 'usd',
    sources: [OracleSourceBalancerList.GYD_USDC],
  },
  AURA: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.AURA_WETH],
  },
  QI_DAO: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.QI_DAO_WETH],
  },
  ALCX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ALCX_WETH],
  },
  PSP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PSP_WETH],
  },
  sBTC: {
    currency: 'btc',
    sources: [OracleSourceCurveList.sBTC_WBTC_renBTC],
  },
  T: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.T_WBTC],
  },
  AGETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AGETH_WETH],
  },
  TEMPLE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.TEMPLE_FRAX],
  },
  PAR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.PAR_USDC],
  },
  FOLD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FOLD_WETH],
  },
  mevETH: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.mevETH_WETH],
  },
  SYNO: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.SYNO_WETH],
  },
  PICKLE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PICKLE_WETH],
  },
  '0xMR': {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List['0xMR_WETH']],
  },
  '0xBTC': {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List['0xBTC_WETH']],
  },
  'ETH+': {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List['ETH+_WETH']],
  },
  TECH: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.TECH_WAVAX],
  },
  GEC: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.GEC_WAVAX],
  },
  ZBU: {
    currency: 'usd',
    sources: [OracleSourceBalancerList.ZBU_USDC],
  },
  IMO: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.IMO_WETH],
  },
  BANK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BANK_WETH],
  },
  BEETS: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.BEETS_WFTM],
  },
  HND: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.HND_WFTM],
  },
  GOGLZ: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.GOGLZ_WFTM],
  },
  DEUS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DEUS_WETH],
  },
  BAY: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.BAY_WFTM],
  },
  IB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IB_WETH],
  },
  BOB: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.BOB_USDC],
  },
  BFR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BFR_WETH],
  },
  APU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.APU_WETH],
  },
  tETH: {
    currency: 'wstETH',
    sources: [OracleSourceCurveList.tETH_wstETH],
  },
  TANGO: {
    currency: 'wstETH',
    sources: [OracleSourceBalancerList.TANGO_wstETH],
  },
  MORE: {
    currency: 'usd',
    sources: [OracleSourceBalancerList.MORE_GYD],
  },
  yyAVAX: {
    currency: 'avax',
    sources: [OracleSourceUniswapv3List.yyAVAX_WAVAX],
  },
  ggAVAX: {
    currency: 'avax',
    sources: [OracleSourceUniswapv3List.ggAVAX_WAVAX],
  },
  GOLD: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.GOLD_WETH],
  },
  AGVE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.AGVE_WXDAI],
  },
  PAXG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PAXG_WETH],
  },
  GNS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.GNS_DAI],
  },
  ADS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ADS_WETH],
  },
  Y2K: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.Y2K_WETH],
  },
  NESG: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.NESG_USDT],
  },
  OPAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OPAI_WETH],
  },
  MORPHO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MORPHO_WETH],
  },
  KLIMA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.KLIMA_USDC],
  },
  XCAD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.XCAD_USDT],
  },
  RICE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RICE_USDT],
  },
  IMX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IMX_WETH],
  },
  OVR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OVR_WETH],
  },
  BIT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BIT_WETH],
  },
  ZRC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ZRC_WETH],
  },
  INV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.INV_WETH],
  },
  msETH: {
    currency: 'eth',
    sources: [OracleSourceCurveList.msETH_WETH],
  },
  WIF: {
    currency: 'usd',
    sources: [OracleSourcePythList.WIF_USD],
  },
  ORDER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ORDER_WETH],
  },
  PEAR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PEAR_WETH],
  },
  YAK: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.YAK_WAVAX],
  },
  alETH: {
    currency: 'eth',
    sources: [OracleSourceCurveList.alETH_WETH],
  },
  PEPU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PEPU_WETH],
  },
  GALA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GALA_WETH, OracleSourceUniswapv3List.GALA_WETH],
  },
  SLAP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SLAP_WETH],
  },
  DSYNC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DSYNC_WETH],
  },
  USR: {
    currency: 'usd',
    sources: [OracleSourceCurveList.USR_USDC],
  },
  eBTC: {
    currency: 'btc',
    sources: [OracleSourceCurveList.eBTC_WBTC],
  },
  sUSDe: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.sUSDe_USDT],
  },
  LNDX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LNDX_WETH],
  },
  stS: {
    currency: 'ftm',
    sources: [OracleSourceBalancerList.stS_WS],
  },
  MVI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MVI_WETH],
  },
  LDY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LDY_WETH],
  },
  WMTX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WMTX_WETH],
  },
  DLCBTC: {
    currency: 'btc',
    sources: [OracleSourceCurveList.DLCBTC_WBTC],
  },
  mBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.mBTC_WBTC],
  },
  ALU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ALU_WBNB],
  },
  ZUN: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ZUN_USDC],
  },
  EARNM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.EARNM_WETH],
  },
  LAND: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.LAND_WBNB],
  },
  BMX: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BMX_USDC],
  },
  RLP: {
    currency: 'usd',
    sources: [OracleSourceCurveList.RLP_USDC],
  },
  USUAL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.USUAL_WETH],
  },
  USUALx: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USUALx_USDC],
  },
  ODOS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ODOS_WETH],
  },
  DACKIE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DACKIE_WETH],
  },
  VC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VC_WETH],
  },
  ZF: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZF_WETH],
  },
  SDEX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SDEX_WETH],
  },
  VS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VS_WETH],
  },
  ALB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ALB_WETH],
  },
  LVL: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.LVL_WBNB],
  },
  amphrETH: {
    currency: 'wstETH',
    sources: [OracleSourceUniswapv3List.amphrETH_wstETH],
  },
  ROOT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ROOT_WETH],
  },
  SUDO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SUDO_WETH],
  },
  BASE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BASE_USDC],
  },
  Re7LRT: {
    currency: 'wstETH',
    sources: [OracleSourceUniswapv3List.Re7LRT_wstETH],
  },
  fBOMB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.fBOMB_WETH],
  },
  CPOOL: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.CPOOL_USDC],
  },
  MUBI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MUBI_WETH],
  },
  RBX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RBX_WETH],
  },
  ZENT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZENT_WETH],
  },
  stZENT: {
    currency: 'eth',
    sources: [OracleSourceCustomList.stZENT],
  },
  BRIUN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BRIUN_WETH],
  },
  CJ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CJ_WETH],
  },
  BENJI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BENJI_WETH],
  },
  BOOP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BOOP_WETH],
  },
  SMOL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SMOL_WETH],
  },
  FrenBet: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FrenBet_WETH],
  },
  HIGHER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.HIGHER_WETH],
  },
  POLS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.POLS_WETH],
  },
  ORBS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ORBS_WETH],
  },
  VELA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VELA_WETH],
  },
  ARX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ARX_WETH],
  },
  OneRING: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.OneRING_WFTM],
  },
  ERN: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.ERN_USDC],
  },
  OVN: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.OVN_USDT],
  },
  METAL: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.METAL_USDT],
  },
  MEE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.MEE_USDT],
  },
  KTC: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.KTC_USDT],
  },
  LAVA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LAVA_WETH],
  },
  PHA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PHA_WETH],
  },
  PRQ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PRQ_WETH],
  },
  SMT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SMT_WETH],
  },
  EAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.EAI_WETH],
  },
  ARC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ARC_WETH],
  },
  KEKIUS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KEKIUS_WETH],
  },
  MASA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MASA_WETH],
  },
  ShibDoge: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ShibDoge_WETH],
  },
  KUJI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KUJI_WETH],
  },
  AXL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AXL_WETH],
  },
  USDz: {
    currency: 'usd',
    stablecoin: true,
    sources: [OracleSourceUniswapv3List.USDz_USDC],
  },
  PUFF: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PUFF_mETH],
  },
  MIGGLES: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MIGGLES_WETH],
  },
  USD0PlusPLus: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USD0PlusPLus_USDT],
  },
  IQ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IQ_WETH],
  },
  FPIS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.FPIS_FRAX],
  },
  HAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.HAI_WETH],
  },
  USDL: {
    currency: 'usd',
    sources: [OracleSourceCurveList.USDL_USDC],
  },
  hyUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.hyUSD_USDC],
  },
  MTLX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MTLX_WETH],
  },
  ROKO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ROKO_WETH],
  },
  basedAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.basedAI_WETH],
  },
  reployRAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.reployRAI_WETH],
  },
  PAAL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PAAL_WETH],
  },
  MQT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.MQT_USDT],
  },
  SEKOIA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SEKOIA_WETH],
  },
  COOKIE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.COOKIE_USDT],
  },
  CGPT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.CGPT_USDT],
  },
  GATSBY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GATSBY_WETH],
  },
  ABT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ABT_WETH],
  },
  bXEN: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.bXEN_WBNB],
  },
  KTCCoin: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.KTCCoin_USDT],
  },
  CPLE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.CPLE_USDT],
  },
  AIXBT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AIXBT_WETH],
  },
  XEN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.XEN_WETH],
  },
  IOTX: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.IOTX_WBNB],
  },
  midasTBILL: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.midasTBILL_USD],
  },
  midasBASIS: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.midasBASIS_USD],
  },
  midasBTC: {
    currency: 'btc',
    sources: [OracleSourceChainlinkList.midasBTC_BTC],
  },
  SOLV: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.SOLV_WBNB],
  },
  BOLD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.BOLD_USDC],
  },
  ANIME: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ANIME_WETH],
  },
  wstUSR: {
    currency: 'usd',
    sources: [OracleSourceCustomList.wstUSR],
  },
  sUSDz: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sUSDz],
  },
  XYRO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.XYRO_WETH],
  },
  XSWAP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.XSWAP_WETH],
  },
  PHIL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PHIL_WETH],
  },
  DIP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DIP_WETH],
  },
  hyETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.hyETH_WETH],
  },
  XAU: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.XAU_USD],
  },
  USDQ: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDQ_USDT],
  },
  yETHx: {
    currency: 'eth',
    sources: [OracleSourceCustomList.yETHx],
  },
  USDX: {
    currency: 'usd',
    sources: [OracleSourceCurveList.USDX_USDT],
  },
  sUSDX: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sUSDX],
  },
  TOBY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TOBY_WETH],
  },
  SYMM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SYMM_WETH],
  },
  ANON: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ANON_USDC],
  },
  SiloXAI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.SiloXAI_USDC],
  },
  QNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.QNT_WETH],
  },
  PEAS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PEAS_DAI],
  },
  mooBIFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.mooBIFI_WETH],
  },
  Rootkit: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.Rootkit_WETH],
  },
  TOWER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TOWER_WETH],
  },
  EGGS: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EGGS_USDC],
  },
  HONEY: {
    currency: 'bera',
    sources: [OracleSourceBalancerList.HONEY_WBERA],
  },
  stBGT: {
    currency: 'bera',
    sources: [OracleSourceBalancerList.stBGT_WBERA],
  },
  iBGT: {
    currency: 'bera',
    sources: [OracleSourceBalancerList.iBGT_WBERA],
  },
  LBGT: {
    currency: 'bera',
    sources: [OracleSourceBalancerList.LBGT_WBERA],
  },
  CROWD: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.CROWD_WPOL],
  },
  EXA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.EXA_WETH],
  },
  GRAIN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GRAIN_WETH],
  },
  WBLT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WBLT_USDC],
  },
  PINTO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PINTO_USDC],
  },
  CHI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.CHI_DAI],
  },
  CHZ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.CHZ_WETH],
  },
  VGX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.VGX_WETH],
  },
  MYRIA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MYRIA_WETH],
  },
  LCX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LCX_WETH],
  },
  GLM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GLM_WETH],
  },
  XCN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.XCN_WETH],
  },
  SHELL: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.SHELL_WBNB],
  },
  YFII: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.YFII_WETH],
  },
  VET: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.VET_WBNB],
  },
  B3: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.B3_WETH],
  },
  KAITO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.KAITO_WETH],
  },
  JMPT: {
    currency: 'celo',
    sources: [OracleSourceUniswapv3List.JMPT_CELO],
  },
  VR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.VR_USDT],
  },
  SDAO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SDAO_WETH],
  },
  renDOGE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.renDOGE_WETH],
  },
  floatBANK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.floatBANK_WETH],
  },
  FLX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FLX_WETH],
  },
  IDLE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.IDLE_WETH],
  },
  RAD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.RAD_USDC],
  },
  eXRD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.eXRD_USDC],
  },
  SOS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SOS_WETH],
  },
  FLOAT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FLOAT_WETH],
  },
  UBI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UBI_WETH],
  },
  oSQTH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.oSQTH_WETH],
  },
  GAMMA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GAMMA_WETH],
  },
  wNXM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.wNXM_WETH],
  },
  FNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FNT_WETH],
  },
  MTA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MTA_WETH],
  },
  REQ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REQ_WETH],
  },
  TRDL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TRDL_WETH],
  },
  BED: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BED_WETH],
  },
  ETH2xFLI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ETH2xFLI_WETH],
  },
  BABL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BABL_WETH],
  },
  CARD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.CARD_WETH],
  },
  INDEX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.INDEX_WETH],
  },
  OGN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OGN_WETH],
  },
  EUL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.EUL_WETH],
  },
  CTX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CTX_WETH],
  },
  VEGA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VEGA_WETH],
  },
  impermaxIMX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.impermaxIMX_WETH],
  },
  GFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GFI_WETH],
  },
  sETH2: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.sETH2_WETH],
  },
  SSV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SSV_WETH],
  },
  XMON: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.XMON_WETH],
  },
  MILADY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MILADY_WETH],
  },
  SOCKS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SOCKS_WETH],
  },
  SDL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SDL_WETH],
  },
  compoundETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.compoundETH_WETH],
  },
  cvxCRV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.cvxCRV_WETH],
  },
  NEXO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NEXO_WETH],
  },
  DFI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DFI_WETH],
  },
  C98: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.C98_WBNB],
  },
  VVV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VVV_WETH],
  },
  OBT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OBT_WETH],
  },
  USDtb: {
    currency: 'usd',
    sources: [OracleSourceCurveList.USDtb_USDC],
  },
  WALLET: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WALLET_USDT],
  },
  ABR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ABR_USDT],
  },
  WHITE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WHITE_USDC],
  },
  LPT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LPT_WETH],
  },
  OMI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OMI_WETH],
  },
  ELA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ELA_WETH],
  },
  STRDY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.STRDY_WETH],
  },
  AURORA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AURORA_WETH],
  },
  RARE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RARE_WETH],
  },
  MULTI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MULTI_WETH],
  },
  LITH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LITH_WETH],
  },
  ProtonXRP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ProtonXRP_WETH],
  },
  PLUME: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PLUME_USDC],
  },
  GURU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.GURU_WETH],
  },
  compoundUSDC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.compoundUSDC_WETH],
  },
  PRE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.PRE_USDT],
  },
  WXM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WXM_WETH],
  },
  LILAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.LILAI_WETH],
  },
  UXLINK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.UXLINK_WETH],
  },
  DeFAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DeFAI_WETH],
  },
  ARBY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ARBY_WETH],
  },
  RUSSELL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RUSSELL_WETH],
  },
  NATIVE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.NATIVE_WETH],
  },
  FAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.FAI_WETH],
  },
  MOXIE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MOXIE_WETH],
  },
  MYST: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MYST_WETH],
  },
  UNO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.UNO_WETH],
  },
  DepartmentDOGE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DepartmentDOGE_WETH],
  },
  Pin: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.Pin_WETH],
  },
  QF: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.QF_WETH],
  },
  BIO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BIO_WETH],
  },
  ElectronicEUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.ElectronicEUSD_USDC],
  },
  lvlUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.lvlUSD_USDC],
  },
  frxUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.frxUSD_USDe],
  },
  gUSDC: {
    currency: 'usd',
    sources: [OracleSourceCustomList.gUSDC],
  },
  sfrxUSD: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sfrxUSD],
  },
  slvlUSD: {
    currency: 'usd',
    sources: [OracleSourceCustomList.slvlUSD],
  },
  HENLO: {
    currency: 'bera',
    sources: [OracleSourceUniswapv2List.HENLO_WBERA],
  },
  YEET: {
    currency: 'bera',
    sources: [OracleSourceUniswapv3List.YEET_WBERA],
  },
  NILE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NILE_WETH],
  },
  doginme: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.doginme_WETH],
  },
  KNIGHT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KNIGHT_WETH],
  },
  FIRE: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.FIRE_USDT],
  },
  ZED: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ZED_WETH],
  },
  ASH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ASH_WETH],
  },
  KP3R: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KP3R_WETH],
  },
  TSUKA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.TSUKA_USDC],
  },
  OS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.OS_WETH],
  },
  REVV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.REVV_WETH],
  },
  VOLTAGE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.VOLTAGE_WETH],
  },
  MHUNT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.MHUNT_WBNB],
  },
  CUBE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CUBE_WETH],
  },
  VCNT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.VCNT_USDC],
  },
  CONE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.CONE_WETH],
  },
  MOVE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MOVE_WETH],
  },
  REKT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.REKT_WETH],
  },
  CRTS: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.CRTS_WBNB],
  },
  GMT: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.GMT_WBNB],
  },
  BLU: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BLU_USDC],
  },
  BOBR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BOBR_WETH],
  },
  HNY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HNY_WETH],
  },
  HEX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HEX_WETH],
  },
  ZEDRUN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ZEDRUN_WETH],
  },
  DEVVE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DEVVE_WETH],
  },
  XI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.XI_WETH],
  },
  ASTO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ASTO_USDC],
  },
  BRIL: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.BRIL_WPOL],
  },
  SFL: {
    currency: 'matic',
    sources: [OracleSourceUniswapv2List.SFL_WPOL],
  },
  BFT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BFT_WETH],
  },
  PLR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PLR_WETH],
  },
  SVM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SVM_WETH],
  },
  RED: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.RED_WETH],
  },
  stBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.stBTC_BTCB],
  },
  FARTCOIN: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.FARTCOIN_WETH],
  },
  BNKR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BNKR_WETH],
  },
  StandardUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.StandardUSD_USDC],
  },
  LON: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.LON_USDT],
  },
  PUFFER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PUFFER_WETH],
  },
  USN: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USN_USDT],
  },
  sUSN: {
    currency: 'usd',
    sources: [OracleSourceCustomList.sUSN],
  },
  fxUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.fxUSD_USDC],
  },
  yAjnaDAI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.yAjnaDAI],
  },
  OUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.OUSD_USDT],
  },
  NEIRO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NEIRO_WETH],
  },
  PANDORA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PANDORA_WETH],
  },
  BASED: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BASED_WETH],
  },
  BALD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.BALD_WETH],
  },
  moonwellUSDC: {
    currency: 'usd',
    sources: [OracleSourceCustomList.moonwellUSDC],
  },
  BlueSparrow: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BlueSparrow_WETH],
  },
  Balv2_LP_AURA_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_AURA_WETH],
  },
  Balv2_LP_rETH_STABLE: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_rETH_STABLE],
  },
  Balv2_LP_rETH_weETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_rETH_weETH],
  },
  Balv2_LP_ezETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ezETH_WETH],
  },
  Balv2_LP_VCX_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_VCX_WETH],
  },
  Curve_LP_cvxCRV_CRV: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_cvxCRV_CRV],
  },
  Curve_LP_stETH_ETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_stETH_ETH],
  },
  Balv2_LP_svETH_wstETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_svETH_wstETH],
  },
  Curve_LP_MIM_3Crv: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_MIM_3Crv],
  },
  Pendle_market_stETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Pendle_market_stETH],
  },
  Pendle_market_weETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Pendle_market_weETH],
  },
  Balv2_LP_auraBAL_STABLE: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_auraBAL_STABLE],
  },
  Balv2_LP_MIMO_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_MIMO_WETH],
  },
  Balv2_LP_wstETH_ACX: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_wstETH_ACX],
  },
  Balv2_LP_STG_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_STG_USDC],
  },
  Balv2_LP_ezETH_weETH_rswETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ezETH_weETH_rswETH],
  },
  VCX: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.VCX_WETH],
  },
  vETH: {
    currency: 'eth',
    sources: [OracleSourceCurveList.vETH_WETH],
  },
  Balv2_LP_BAL_WETH: {
    currency: 'eth',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_BAL_WETH],
  },
  MIMO: {
    currency: 'eth',
    sources: [OracleSourceBalancerList.MIMO_WETH],
  },
  Univ2_LP_BSX_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_BSX_WETH],
  },
  Balv2_LP_GOLD_WETH_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_GOLD_WETH_USDC],
  },
  Balv2_LP_ankrETh_wstETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ankrETh_wstETH],
  },
  Balv2_LP_wstETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_wstETH_WETH],
  },
  Balv2_LP_wstETH_WETH_BPT: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_wstETH_WETH_BPT],
  },
  Univ2_LP_WELL_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_WELL_WETH],
  },
  Balv2_LP_ECLP_AURA_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ECLP_AURA_USDC],
  },
  Univ2_LP_KLIMA_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_KLIMA_WETH],
  },
  Univ2_LP_VIRTUAL_cbBTC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_VIRTUAL_cbBTC],
  },
  Balv2_LP_bpt_ethtri: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_bpt_ethtri],
  },
  PIGGY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PIGGY_WETH],
  },
  LODE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.LODE_WETH],
  },
  gDAI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.gDAI],
  },
  Univ2_LP_VELO_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_VELO_USDC],
  },
  Univ2_LP_wstETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_wstETH_WETH],
  },
  Univ2_LP_HBR_WBNB: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_HBR_WBNB],
  },
  venusBNB: {
    currency: 'usd',
    sources: [OracleSourceCustomList.venusBNB],
  },
  Curve_LP_FRAX_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_FRAX_USDC],
  },
  Balv2_LP_stETH_STABLE: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_stETH_STABLE],
  },
  Balv2_LP_ankrETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ankrETH_WETH],
  },
  Balv2_LP_stafiETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_stafiETH_WETH],
  },
  Balv2_LP_swETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_swETH_WETH],
  },
  Balv2_LP_swETH_aWETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_swETH_aWETH],
  },
  Balv2_LP_ankrETH_wstETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ankrETH_wstETH],
  },
  Balv2_LP_ETHx_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_ETHx_WETH],
  },
  Balv2_LP_vETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_vETH_WETH],
  },
  Balv2_LP_a_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_a_WETH],
  },
  Balv2_LP_a_WETH2: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_a_WETH2],
  },
  lybraUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.lybraUSD_METAPOOL],
  },
  stafiETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.stafiETH_WETH],
  },
  stakehouseLRT: {
    currency: 'wstETH',
    sources: [OracleSourceCustomList.stakehouseLRT],
  },
  amphrLRT: {
    currency: 'wstETH',
    sources: [OracleSourceCustomList.amphrLRT],
  },
  weETHk: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.weETHk_WETH],
  },
  liquidBeraBTC: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.liquidBeraBTC_WBTC],
  },
  USDa: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USDa_USDT],
  },
  Univ2_LP_PENDLE_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_PENDLE_WETH],
  },
  Univ2_LP_ARB_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_ARB_WETH],
  },
  Univ2_LP_GRAIL_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_GRAIL_WETH],
  },
  Univ2_LP_frxETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_frxETH_WETH],
  },
  Curve_LP_GHO_USR: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_GHO_USR],
  },
  ysyDAIyvDAi: {
    currency: 'usd',
    sources: [OracleSourceCustomList.ysyDAIyvDAi],
  },
  Univ2_LP_iFARM_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_iFARM_WETH],
  },
  Univ2_LP_GNOME_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_GNOME_WETH],
  },
  Univ2_LP_GENE_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_GENE_WETH],
  },
  Univ2_LP_DeltaSwap_USDC_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_DeltaSwap_USDC_WETH],
  },
  nUSDC: {
    currency: 'usd',
    sources: [OracleSourceCustomList.nUSDC],
  },
  BSX: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BSX_WETH],
  },
  gmxGLP_Arbitrum: {
    currency: 'usd',
    sources: [OracleSourceCustomList.gmxGLP_Arbitrum],
  },
  gmxGLP_Avalanche: {
    currency: 'usd',
    sources: [OracleSourceCustomList.gmxGLP_Avalanche],
  },
  hmlHLP_Arbitrum: {
    currency: 'usd',
    sources: [OracleSourceCustomList.hmlHLP_Arbitrum],
  },
  GNOME: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GNOME_WETH],
  },
  GENE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GENE_WETH],
  },
  Balv2_LP_wstETH_sfrxETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_wstETH_sfrxETH],
  },
  Univ2_LP_DOLA_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_DOLA_USDC],
  },
  Univ2_LP_wstETH_OP: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_wstETH_OP],
  },
  Univ2_LP_USDC_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_USDC_WETH],
  },
  Univ2_LP_DOLA_USDC2: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_DOLA_USDC2],
  },
  Univ2_LP_USDC_LUSD: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_USDC_LUSD],
  },
  Univ2_LP_mooBIFI_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_mooBIFI_WETH],
  },
  Univ2_LP_POOL_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_POOL_WETH],
  },
  Curve_LP_2BTC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_2BTC],
  },
  Univ2_LP_USDC_WETH2: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_USDC_WETH2],
  },
  TYBG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TYBG_WETH],
  },
  WARPIE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.WARPIE_WETH],
  },
  Univ2_LP_tBTC_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_tBTC_WETH],
  },
  Univ2_LP_VELO_USDC2: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_VELO_USDC2],
  },
  Univ2_LP_SNX_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_SNX_USDC],
  },
  Balv2_LP_OATH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_OATH_WETH],
  },
  Balv2_LP_instETH_wstETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_instETH_wstETH],
  },
  Balv2_LP_rETH_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_rETH_WETH],
  },
  Univ2_LP_USDR_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_USDR_USDC],
  },
  Univ2_LP_RNT_USDT: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_RNT_USDT],
  },
  Balv2_LP_MaticX_WMATIC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_MaticX_WMATIC],
  },
  Univ2_LP_WBTC_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_WBTC_WETH],
  },
  Balv2_LP_sAVAX_WAVAX: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_sAVAX_WAVAX],
  },
  bWOOL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.bWOOL_WETH],
  },
  bPEPE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.bPEPE_WETH],
  },
  YOLO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.YOLO_WETH],
  },
  ANDY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ANDY_WETH],
  },
  JUICE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.JUICE_WETH],
  },
  PAC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PAC_WETH],
  },
  YES: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.YES_WETH],
  },
  KAP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KAP_WETH],
  },
  DJENNCoin: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DJENNCoin_WETH],
  },
  PTC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.PTC_WETH],
  },
  ORBIT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ORBIT_WETH],
  },
  YIELD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.YIELD_WETH],
  },
  MFER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MFER_WETH],
  },
  HBR: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.HBR_WBNB],
  },
  RNT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.RNT_USDT],
  },
  polygonYearnUSDC: {
    currency: 'usd',
    sources: [OracleSourceCustomList.polygonYearnUSDC],
  },
  STAR: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.STAR_USDC],
  },
  rTBL: {
    currency: 'usd',
    sources: [OracleSourceCurveList.rTBL_USDC],
  },
  WILD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.WILD_WETH],
  },
  Univ2_LP_axlwstETH_wstETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_axlwstETH_wstETH],
  },
  Univ2_LP_axlUSDC_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_axlUSDC_USDC],
  },
  Balv2_LP_APW_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_APW_WETH],
  },
  Curve_LP_IBTC_WBTC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_IBTC_WBTC],
  },
  Pendle_market_agETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Pendle_market_agETH],
  },
  Balv2_LP_paUSD_GYD: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Balv2_LP_paUSD_GYD],
  },
  Univ2_LP_GENOME_WETH: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_GENOME_WETH],
  },
  Univ2_LP_STAR_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_STAR_USDC],
  },
  Univ2_LP_OVN_USD: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_OVN_USD],
  },
  Univ2_LP_DOLA_USDbC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_DOLA_USDbC],
  },
  Univ2_LP_SPOT_USDC: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Univ2_LP_SPOT_USDC],
  },
  USDN: {
    currency: 'usd',
    sources: [OracleSourceCurveList.USDN_USDT],
  },
  MONEY: {
    currency: 'usd',
    sources: [OracleSourceCurveList.MONEY_DAI],
  },
  SPECTRA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.SPECTRA_USDC],
  },
  GENOME: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.GENOME_WETH],
  },
  SKI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SKI_WETH],
  },
  OUSG: {
    currency: 'usd',
    sources: [OracleSourceCustomList.OUSG],
  },
  lvlwaUSDC: {
    currency: 'usd',
    sources: [OracleSourceCustomList.lvlwaUSDC],
  },
  lvlwaUSDT: {
    currency: 'usd',
    sources: [OracleSourceCustomList.lvlwaUSDT],
  },
  Curve_LP_steCRV: {
    currency: 'usd',
    sources: [OracleSourceDexLpTokenList.Curve_LP_steCRV],
  },
  TLOS: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.TLOS_WBNB],
  },
  WIZZ: {
    currency: 'bera',
    sources: [OracleSourceBalancerList.WIZZ_WBERA],
  },
  bm: {
    currency: 'bera',
    sources: [OracleSourceUniswapv2List.bm_WBERA],
  },
  BAO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BAO_WETH],
  },
  Zeus: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.Zeus_WETH],
  },
  ML: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ML_WETH],
  },
  POLY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.POLY_WETH],
  },
  NUZO: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.NUZO_USDT],
  },
  fxVERSE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.fxVERSE_WETH],
  },
  VOXEL: {
    currency: 'matic',
    sources: [OracleSourceUniswapv3List.VOXEL_WPOL],
  },
  RSUP: {
    currency: 'eth',
    sources: [OracleSourceCurveList.RSUP_WETH],
  },
  AVA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.AVA_WETH],
  },
  WMC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WMC_WETH],
  },
  Reach: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.Reach_WETH],
  },
  PRISMA: {
    currency: 'eth',
    sources: [OracleSourceCurveList.PRISMA_WETH],
  },
  SERV: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SERV_WETH],
  },
  SYNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SYNT_WETH],
  },
  scrvUSD: {
    currency: 'usd',
    sources: [OracleSourceCustomList.scrvUSD],
  },
  wmooSiloV2SonicUSDC: {
    currency: 'usd',
    sources: [OracleSourceCustomList.wmooSiloV2SonicUSDC],
  },
  OMIKAMI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.OMIKAMI_USDC],
  },
  RYU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RYU_WETH],
  },
  ZCHF: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.ZCHF_USDT],
  },
  DRB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.DRB_WETH],
  },
  BERAMO: {
    currency: 'bera',
    sources: [OracleSourceUniswapv2List.BERAMO_WBERA],
  },
  PLUG: {
    currency: 'bera',
    sources: [OracleSourceUniswapv2List.PLUG_WBERA],
  },
  ARTIO: {
    currency: 'bera',
    sources: [OracleSourceUniswapv3List.ARTIO_WBERA],
  },
  AIBERA: {
    currency: 'bera',
    sources: [OracleSourceUniswapv3List.AIBERA_WBERA],
  },
  cUNI: {
    currency: 'usd',
    sources: [OracleSourceCustomList.cUNI],
  },
  RLY: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.RLY_WETH],
  },
  AST: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AST_WETH],
  },
  SRM: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SRM_WETH],
  },
  TRU: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TRU_WETH],
  },
  DEXTF: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.DEXTF_WETH],
  },
  OVER: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.OVER_WETH],
  },
  SAS: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SAS_WETH],
  },
  SOIL: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.SOIL_USDT],
  },
  USDFI: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.USDFI_WBNB],
  },
  VRTX: {
    currency: 'usd',
    sources: [OracleSourceAlgebraList.VRTX_USDC],
  },
  COOK: {
    currency: 'mnt',
    sources: [OracleSourceLBookList.COOK_WMNT],
  },
  USDO: {
    currency: 'usd',
    sources: [OracleSourceCurveList.USDO_USDC],
  },
  SWAP: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SWAP_WETH],
  },
  VEIL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.VEIL_WETH],
  },
  TRUE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.TRUE_WETH],
  },
  cmETH: {
    currency: 'eth',
    sources: [OracleSourceLBookList.cmETH_WETH],
  },
  NODL: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NODL_WETH],
  },
  PHAR: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.PHAR_WAVAX],
  },
  WINK: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.WINK_WAVAX],
  },
  KET: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.KET_WAVAX],
  },
  BLUB: {
    currency: 'avax',
    sources: [OracleSourceUniswapv2List.BLUB_WAVAX],
  },
  X33: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv3List.X33_WS],
  },
  COAL: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv3List.COAL_WS],
  },
  NAVI: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv3List.NAVI_WS],
  },
  METRO: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv2List.METRO_WS],
  },
  SHADOW: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv3List.SHADOW_WS],
  },
  DERP: {
    currency: 'ftm',
    sources: [OracleSourceUniswapv3List.DERP_WS],
  },
  EDU: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.EDU_USDT],
  },
  TKO: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.TKO_WBNB],
  },
  QANX: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.QANX_WBNB],
  },
  IOTA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.IOTA_WBNB],
  },
  AION: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.AION_WETH],
  },
  NURI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.NURI_WETH],
  },
  HashAI: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.HashAI_WETH],
  },
  BONE: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.BONE_WETH],
  },
  MOODENG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.MOODENG_WETH],
  },
  avUSD: {
    currency: 'usd',
    sources: [OracleSourceLBookList.avUSD_USDC],
  },
  savUSD: {
    currency: 'usd',
    sources: [OracleSourceCustomList.savUSD],
  },
  SNT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.SNT_WETH],
  },
  XYO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.XYO_WETH],
  },
  GYFI: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.GYFI_USDC],
  },
  yUSD: {
    currency: 'usd',
    sources: [OracleSourceCurveList.yUSD_USDC],
  },
  ANZ: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.ANZ_WETH],
  },
  LISTA: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.LISTA_WBNB],
  },
  WCT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WCT_WETH],
  },
  ACH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ACH_WETH],
  },
  YUSD: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv3List.YUSD_WBNB],
  },
  YGG: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.YGG_WTH],
  },
  SUPR: {
    currency: 'eth',
    sources: [OracleSourceUniswapv4List.SUPR_ETH],
  },
  WMINIMA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.WMINIMA_USDT],
  },
  SPC: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SPC_WETH],
  },
  PORK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.PORK_WETH],
  },
  ELMT: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.ELMT_WETH],
  },
  HOOF: {
    currency: 'eth',
    sources: [OracleSourceUniswapv4List.HOOF_ETH],
  },
  SATO: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.SATO_WETH],
  },
  ZORA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.ZORA_USDC],
  },
  KTA: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.KTA_WETH],
  },
  PROMT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.PROMT_USDC],
  },
  VON: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.VON_WBNB],
  },
  RLUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RLUSD_USDC],
  },
  NECT: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.NECT_HONEY],
  },
  USD1: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.USD1_USDT],
  },
};
