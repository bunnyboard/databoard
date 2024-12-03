import { OracleConfig } from '../../types/oracles';
import { OffchainOracleSourcesFromBinance } from './binance';
import { OracleSourceChainlinkList } from './chainlink';
import { OracleSourceUniswapv2List } from './uniswapv2';
import { OracleSourceUniswapv3List } from './uniswapv3';

export const OracleCurrencyBaseConfigs: { [key: string]: OracleConfig } = {
  eth: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.ETH_USD],
    offchainSources: [OffchainOracleSourcesFromBinance.ETH],
  },
  btc: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BTC_USD],
  },
  bnb: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.BNB_USD],
  },
  matic: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.MATIC_USD],
  },
  avax: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.AVAX_USD],
  },
  ftm: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.FTM_USD],
  },
  eur: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.EUR_USD],
  },
  wstETH: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.wstETH_USD],
  },
  core: {
    currency: 'usd',
    sources: [OracleSourceUniswapv3List.WCORE_USDT],
  },
  klay: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.KLAY_USD],
  },
  oas: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.WOAS_USDT],
  },
  glmr: {
    currency: 'usd',
    sources: [OracleSourceChainlinkList.GLMR_USD],
  },
  celo: {
    currency: 'usd',
    sources: [OracleSourceUniswapv2List.CELO_mCUSD],
  },
};
