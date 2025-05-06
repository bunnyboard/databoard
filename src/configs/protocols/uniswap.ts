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

  // the factory address which created this pool2
  // if uniswap v4, this is poolManager
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
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ2,
      factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
      factoryBirthblock: 150442611,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ2,
      factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
      factoryBirthblock: 37767795,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ2,
      factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
      factoryBirthblock: 6601915,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ2,
      factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
      factoryBirthblock: 33496018,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ2,
      factory: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
      factoryBirthblock: 112197986,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ2,
      factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
      factoryBirthblock: 49948178,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ2,
      factory: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
      factoryBirthblock: 399405,
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
    },

    // /////////////////// v3
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      factoryBirthblock: 12369621,
      birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1622592000, // Wed Jun 02 2021 00:00:00 GMT+0000
      factoryBirthblock: 165,
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ3,
      factory: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      factoryBirthblock: 27832972,
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ3,
      factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      factoryBirthblock: 1371680,
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ3,
      factory: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
      birthday: 1678406400, // Fri Mar 10 2023 00:00:00 GMT+0000
      factoryBirthblock: 26324014,
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1636675200, // Fri Nov 12 2021 00:00:00 GMT+0000
      factoryBirthblock: 1,
    },
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1640044800, // Tue Dec 21 2021 00:00:00 GMT+0000
      factoryBirthblock: 22757547,
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ3,
      factory: '0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd',
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      factoryBirthblock: 400903,
    },
    {
      chain: ChainNames.celo,
      version: Pool2Types.univ3,
      factory: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
      birthday: 1657238400, // Fri Jul 08 2022 00:00:00 GMT+0000
      factoryBirthblock: 13916355,
    },
    {
      chain: ChainNames.zksync,
      version: Pool2Types.univ3,
      factory: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422',
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      factoryBirthblock: 12637075,
    },

    /////////////////// v4
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ4,
      factory: '0x000000000004444c5dc75cB358380D2e3dE08A90',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 21688329,
    },
    {
      chain: ChainNames.unichain,
      version: Pool2Types.univ4,
      factory: '0x1f98400000000000000000000000000000000004',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 1,
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ4,
      factory: '0x9a13f98cb987694c9f086b1f5eb990eea8264ec3',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 130947675,
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ4,
      factory: '0x498581ff718922c3f8e6a244956af099b2652b2b',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 25350988,
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ4,
      factory: '0x360e68faccca8ca495c1b759fd9eee466db9fb32',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 297842872,
    },
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ4,
      factory: '0x67366782805870060151383f4bbff9dab53e5cd6',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 66980384,
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ4,
      factory: '0x1631559198a9e474033433b2958dabc135ab6446',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 14377311,
    },
    {
      chain: ChainNames.worldchain,
      version: Pool2Types.univ4,
      factory: '0xb1860d529182ac3bc1f51fa2abd56662b7d13f33',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 9111872,
    },
    {
      chain: ChainNames.ink,
      version: Pool2Types.univ4,
      factory: '0x360e68faccca8ca495c1b759fd9eee466db9fb32',
      birthday: 1738108800, // Wed Jan 29 2025 00:00:00 GMT+0000
      factoryBirthblock: 4580556,
    },
    {
      chain: ChainNames.soneium,
      version: Pool2Types.univ4,
      factory: '0x360e68faccca8ca495c1b759fd9eee466db9fb32',
      birthday: 1738108800, // Wed Jan 29 2025 00:00:00 GMT+0000
      factoryBirthblock: 2473300,
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ4,
      factory: '0x06380c0e0912312b5150364b9dc4542ba0dbbc85',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 56195376,
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ4,
      factory: '0x28e2ea090877bf75740558f6bfb36a5ffee9e9df',
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      factoryBirthblock: 45970610,
    },
  ],
};
