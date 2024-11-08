import { OracleConfig } from '../../types/oracles';
import { OracleSourceChainlinkList } from './chainlink';
import { OracleCurrencyBaseConfigs } from './currency';
import { OracleSourceCurveList } from './curve';
import { OracleSourceCustomList } from './custom';
import { OracleSourceUniswapv2List } from './uniswapv2';
import { OracleSourceUniswapv3List } from './uniswapv3';

// symbol => OracleConfig
export const OracleSourceConfigs: { [key: string]: OracleConfig } = {
  ETH: OracleCurrencyBaseConfigs.eth,
  BNB: OracleCurrencyBaseConfigs.bnb,
  BTC: OracleCurrencyBaseConfigs.btc,
  MATIC: OracleCurrencyBaseConfigs.matic,
  AVAX: OracleCurrencyBaseConfigs.avax,
  FTM: OracleCurrencyBaseConfigs.ftm,
  GLMR: OracleCurrencyBaseConfigs.glmr,
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
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.RAI_DAI],
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
    sources: [OracleSourceUniswapv3List.RPL_WETH],
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
    currency: 'usd',
    sources: [OracleSourceChainlinkList.SXP_USD],
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
    sources: [OracleSourceUniswapv2List.ankrETH_WETH],
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
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.BTT_BUSD],
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
    sources: [OracleSourceUniswapv3List.ankrBNB_WBNB],
  },
  BNBx: {
    currency: 'bnb',
    sources: [OracleSourceUniswapv2List.BNBx_WBNB],
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
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.ALPACA_BUSD],
  },
  RACA: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.RACA_BUSD],
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
  FDUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.FDUSD_USDT],
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
  mevETH: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.mevETH_WETH],
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
    sources: [OracleSourceUniswapv3List.NMR_WETH],
  },
  MCB: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.MCB_WETH],
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
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.osETH_WETH],
  },
  tBTCv2: {
    currency: 'btc',
    sources: [OracleSourceUniswapv3List.tBTC_WBTC],
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
    sources: [OracleSourceUniswapv2List.CDCETH_WETH],
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
  STRK: {
    currency: 'eth',
    sources: [OracleSourceUniswapv2List.STRK_WETH],
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
    sources: [OracleSourceUniswapv3List.mETH_WETH],
  },
  WLD: {
    currency: 'eth',
    sources: [OracleSourceUniswapv3List.WLD_WETH],
  },
  ID: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.ID_USDC],
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
  cUSD: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.cUSD_USDT],
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
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.GEAR_USDT],
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
    sources: [OracleSourceUniswapv2List.SCR_WETH],
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
    sources: [OracleSourceUniswapv2List.BTCBR_WBNB],
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
};
