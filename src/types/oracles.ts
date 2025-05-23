import { Token } from './base';

export type OracleCurrencyBase =
  | 'usd'
  | 'eur'
  | 'eth'
  | 'btc'
  | 'bnb'
  | 'avax'
  | 'matic'
  | 'ftm'
  | 's'
  | 'wstETH'
  | 'core'
  | 'oas'
  | 'bera'
  | 'ip'
  | 'celo'
  | 'mnt'
  | 'klay';

export const OracleTypes = {
  // ChainLink price feed
  // https://docs.chain.link/data-feeds
  chainlink: 'chainlink',

  // https://www.pyth.network/
  pyth: 'pyth',

  // uniswap pool2 version 2
  uniswapv2: 'univ2',

  // uniswap pool2 version 3
  uniswapv3: 'univ3',

  // https://algebra.finance
  algebra: 'algebra',

  // liquidity from https://docs.lfj.gg/V2
  lbook: 'lbook',

  // https://etherscan.io/token/0x83F20F44975D03b1b09e64809B757c47f942BEeA
  savingDai: 'savingDai',

  // https://etherscan.io/address/0x76A9f30B45F4ebFD60Ce8a1c6e963b1605f7cB6d
  // https://docs.makerdao.com/smart-contract-modules/core-module/spot-detailed-documentation
  makerRwaPip: 'makerRwaPip',

  // https://etherscan.io/address/0x5a6a4d54456819380173272a5e8e9b9904bdf41b
  curveMetaPool: 'curveMetaPool',

  // https://etherscan.io/address/0xdc24316b9ae028f1497c275eb9192a3ea0f67022
  curveFactoryPool: 'curveFactoryPool',

  // get the price of a staking wrapper token, let say xSUSHI
  // by get SUSHI balance and divide to xSUSHI supply
  stakingTokenWrapper: 'stakingTokenWrapper',

  // balancer.fi
  balv2: 'balv2',

  // dex liquidity token
  dexLpToken: 'dexLpToken',
};
const AllOracleTypes = Object.values(OracleTypes);
export type OracleType = (typeof AllOracleTypes)[number];

interface OracleSourceBase {
  type: OracleType;
  chain: string;
  address: string;

  // if the currency is not usd
  // we need to get currency base token price too
  currency?: OracleCurrencyBase;
}

export interface OracleSourceChainlink extends OracleSourceBase {
  // aggregator data decimals places
  decimals: number;
}

export interface OracleSourcePyth extends OracleSourceBase {
  assetId: string;
}

export interface OracleSourcePool2 extends OracleSourceBase {
  baseToken: Token;
  quotaToken: Token;
}

// this oracle present a bearing staking pool
// the price will be calculated by amount of underlying (staked) token
export interface OracleSourceSavingDai extends OracleSourceBase {
  token: Token;
}

// this oracle using pip contract from Maker Dao
// this support get price of MakerDao RWA
// https://docs.makerdao.com/smart-contract-modules/core-module/spot-detailed-documentation
export interface OracleSourceMakerRwaPip extends OracleSourceBase {
  // get from ilk from collateral join contract
  ilk: string; //
}

export interface OracleSourceOffchain {
  source: string; // binance
  ticker: string; // ETHUSDT
}

export interface OracleSourceCurvePool extends OracleSourceBase {
  type: 'curveMetaPool' | 'curveFactoryPool';
  baseToken: Token;
  baseTokenIndex: number;
  quotaToken: Token;
  quotaTokenIndex: number;
}

export interface OracleSourceStakingTokenWrapper extends OracleSourceBase {
  type: 'stakingTokenWrapper';
  method: 'balance' | 'erc4626' | 'mETH' | 'cToken' | 'gmxGLP' | 'ousg';
  underlyingToken: Token;
}

export interface OracleSourceBalancerPool extends OracleSourceBase {
  type: 'balv2_Gyro_ECLP' | 'balv2_Weight';
  vault: string;
  poolId: string;
  baseWeight?: number;
  baseToken: Token;
  quotaWeight?: number;
  quotaToken: Token;
}

export interface OracleSourceDexLpToken extends OracleSourceBase {
  method: 'balv2' | 'curve' | 'pendle' | 'univ2';
}

export interface OracleConfig {
  // if the currency is not usd
  // we need to get currency base token price too
  currency: OracleCurrencyBase;

  // a list of on-chain sources where we can get the token price
  sources: Array<
    | OracleSourceChainlink
    | OracleSourcePyth
    | OracleSourcePool2
    | OracleSourceSavingDai
    | OracleSourceMakerRwaPip
    | OracleSourceCurvePool
    | OracleSourceBalancerPool
    | OracleSourceStakingTokenWrapper
    | OracleSourceDexLpToken
  >;

  // if is stablecoin, return 1 when we can not fetch the price from any source
  stablecoin?: boolean;

  // support to get token price when it was not available onchain yet
  offchainSources?: Array<OracleSourceOffchain>;
}

// if all pre-configs oracle failed to get price
// we will try auto find pool
export interface DexOracleConfig {
  type: 'univ2' | 'univ3';
  address: string;

  // uniswap v3 fees enabled
  fees?: Array<number>;
}

export interface OnchainOracleConfig {
  // the native wrap token: WETH
  wrapToken: Token;

  // a list tokens can be used as quota for cal price
  quotaTokens?: Array<Token>;

  // list of dexes contracts
  dexes: Array<DexOracleConfig>;
}
