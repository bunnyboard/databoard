import { getTheGraphEndpoint } from '../../lib/subgraph';
import { ProtocolConfig } from '../../types/base';
import { Pool2Type, Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';

export interface UniswapSubgraphQueryFields {
  factories: string;
  totalLiquidityUSD: string;
  totalVolumeUSD: string;
  totalFeesUSD: string;

  pools: string;
  poolFeesRate: string;
}

export interface UniswapSubgraphConfig {
  endpoint: string;
  queryFields: UniswapSubgraphQueryFields;
}

export const UniswapV2SubgraphQueryFieldsDefault: UniswapSubgraphQueryFields = {
  factories: 'uniswapFactories',
  totalLiquidityUSD: 'totalLiquidityUSD',
  totalVolumeUSD: 'totalVolumeUSD',
  pools: 'pairs',

  // dont' use for v2
  totalFeesUSD: '', // don't use
  poolFeesRate: '', // don't use
};

export const UniswapV3SubgraphQueryFieldsDefault: UniswapSubgraphQueryFields = {
  factories: 'factories',
  totalLiquidityUSD: 'totalValueLockedUSD',
  totalVolumeUSD: 'totalVolumeUSD',
  totalFeesUSD: 'totalFeesUSD',
  pools: 'pools',
  poolFeesRate: 'feeTier',
};

export interface UniswapFactoryConfig {
  chain: string;
  version: Pool2Type;
  birthday: number;

  // the factory address
  // which created this pool2
  factory: string;

  // block number when factory were deployed
  factoryBirthblock: number;

  // 0.3% -> 0.003
  // original uniswap takes total of 0.3% fees per swap
  // and goes 100% to liquidity providers
  feeRateForLiquidityProviders?: number;

  // some other dexes like sushi takes 0.3% per swap
  // split 0.25% goes to liquidity providers
  // and 0.05% goes to protocol
  feeRateForProtocol?: number;

  // ignore these ppols
  blacklistPools?: Array<string>;

  // support subgraph query if any
  subgraph?: UniswapSubgraphConfig;
}

export interface UniswapProtocolConfig extends ProtocolConfig {
  // force to sync data use onchain factory method
  factorySync?: boolean;
  factories: Array<UniswapFactoryConfig>;
}

export const UniswapConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.uniswap,

  // v2 deployed
  // Tue May 05 2020 00:00:00 GMT+0000
  birthday: 1588636800,

  // force to sync data use onchain factory method
  factorySync: true,

  factories: [
    /////////////////// v2
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ2,
      factory: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      factoryBirthblock: 10000835,
      birthday: 1588636800, // Tue May 05 2020 00:00:00 GMT+0000
      subgraph: {
        endpoint: getTheGraphEndpoint({
          subgraphId: 'A3Np3RQbaBA6oKJgiwDJeo5T3zrYfGHPWFYayMwtNDum',
        }),
        queryFields: UniswapV2SubgraphQueryFieldsDefault,
      },
    },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.univ2,
    //   factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
    //   birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.avalanche,
    //   version: Pool2Types.univ2,
    //   factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
    //   birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.base,
    //   version: Pool2Types.univ2,
    //   factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    //   birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.univ2,
    //   factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
    //   birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.optimism,
    //   version: Pool2Types.univ2,
    //   factory: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
    //   birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.polygon,
    //   version: Pool2Types.univ2,
    //   factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
    //   birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.blast,
    //   version: Pool2Types.univ2,
    //   factory: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
    //   birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.zora,
    //   version: Pool2Types.univ2,
    //   factory: '0x0F797dC7efaEA995bB916f268D919d0a1950eE3C',
    //   birthday: 1708732800, // Sat Feb 24 2024 00:00:00 GMT+0000
    // },
    // /////////////////// v3
    // {
    //   chain: ChainNames.ethereum,
    //   version: Pool2Types.univ3,
    //   factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    //   birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: '5zvR82QoaXYFyDEKLZ9t6v9adgnptxYpKpSbxtgVENFV',
    //     customParams: {
    //       countTvlByPools: true,
    //     },
    //   },
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.univ3,
    //   factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    //   birthday: 1622592000, // Wed Jun 02 2021 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: 'FbCGRftH4a3yZugY7TnbYgPJVEv2LvMT6oF1fxPe9aJM',
    //   },
    // },
    // {
    //   chain: ChainNames.avalanche,
    //   version: Pool2Types.univ3,
    //   factory: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
    //   birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: '9EAxYE17Cc478uzFXRbM7PVnMUSsgb99XZiGxodbtpbk',
    //   },
    // },
    // {
    //   chain: ChainNames.base,
    //   version: Pool2Types.univ3,
    //   factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
    //   birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: '43Hwfi3dJSoGpyas9VwNoDAv55yjgGrPpNSmbQZArzMG',
    //   },
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.univ3,
    //   factory: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
    //   birthday: 1678406400, // Fri Mar 10 2023 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: 'F85MNzUGYqgSHSHRGgeVMNsdnW1KtZSVgFULumXRZTw2',
    //   },
    // },
    // {
    //   chain: ChainNames.optimism,
    //   version: Pool2Types.univ3,
    //   factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    //   birthday: 1636675200, // Fri Nov 12 2021 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: 'Cghf4LfVqPiFw6fp6Y5X5Ubc8UpmUhSfJL82zwiBFLaj',
    //   },
    // },
    // {
    //   chain: ChainNames.polygon,
    //   version: Pool2Types.univ3,
    //   factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
    //   birthday: 1640044800, // Tue Dec 21 2021 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: 'EsLGwxyeMMeJuhqWvuLmJEiDKXJ4Z6YsoJreUnyeozco',
    //   },
    // },
    // {
    //   chain: ChainNames.blast,
    //   version: Pool2Types.univ3,
    //   factory: '0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd',
    //   birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.zora,
    //   version: Pool2Types.univ3,
    //   factory: '0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb',
    //   birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.celo,
    //   version: Pool2Types.univ3,
    //   factory: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
    //   birthday: 1657238400, // Fri Jul 08 2022 00:00:00 GMT+0000
    //   subgraph: {
    //     provider: 'thegraph',
    //     subgraphIdOrEndpoint: '8cLf29KxAedWLVaEqjV8qKomdwwXQxjptBZFrqWNH5u2',
    //   },
    // },
    // {
    //   chain: ChainNames.zksync,
    //   version: Pool2Types.univ3,
    //   factory: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422',
    //   birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
    // },
  ],
};
