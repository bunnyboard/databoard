import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { Pool2Type, Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';

export interface UniswapDexConfig {
  chain: string;
  version: Pool2Type;
  birthday: number;

  // the factory address
  // which created this pool2
  factory: string;

  factoryBirthBlock?: number;

  // 0.3% -> 0.003
  // original uniswap takes total of 0.3% fees per swap
  // and goes 100% to liquidity providers
  feeRateForLiquidityProviders?: number;

  // some other dexes like sushi takes 0.3% per swap
  // split 0.25% goes to liquidity providers
  // and 0.05% goes to protocol
  feeRateForProtocol?: number;

  // wrap native token address
  // ex WETH on ethereum
  wrappedNative: string;

  // ignore these ppols
  blacklistPools?: Array<string>;
}

export interface UniswapChainConfig {
  chain: string;
  dexes: Array<UniswapDexConfig>;
}

export interface UniswapProtocolConfig extends ProtocolConfig {
  chains: Array<UniswapChainConfig>;
}

export const UniswapConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.uniswap,
  category: ProtocolCategories.dex,

  // v2 deployed
  // Tue May 05 2020 00:00:00 GMT+0000
  birthday: 1588636800,

  chains: [
    {
      chain: ChainNames.ethereum,
      dexes: [
        {
          chain: ChainNames.ethereum,
          version: Pool2Types.univ2,
          factory: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
          birthday: 1588636800, // Tue May 05 2020 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.ethereum.weth,
        },
        {
          chain: ChainNames.ethereum,
          version: Pool2Types.univ3,
          factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
          factoryBirthBlock: 12369622,
          wrappedNative: PublicAddresses.ethereum.weth,
          blacklistPools: ['0x307c4d0a83931c3eebe501f8f0c0b4c249bcf206', '0xedcfece1060e568e10425e95e35b179d5b5a2b5f'],
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      dexes: [
        {
          chain: ChainNames.arbitrum,
          version: Pool2Types.univ2,
          factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
          birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.arbitrum.weth,
        },
        {
          chain: ChainNames.arbitrum,
          version: Pool2Types.univ3,
          factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          birthday: 1622592000, // Wed Jun 02 2021 00:00:00 GMT+0000
          factoryBirthBlock: 166,
          wrappedNative: PublicAddresses.arbitrum.weth,
        },
      ],
    },
    {
      chain: ChainNames.avalanche,
      dexes: [
        {
          chain: ChainNames.avalanche,
          version: Pool2Types.univ2,
          factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
          birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.avalanche.wavax,
        },
        {
          chain: ChainNames.avalanche,
          version: Pool2Types.univ3,
          factory: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
          birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
          factoryBirthBlock: 27832973,
          wrappedNative: PublicAddresses.avalanche.wavax,
        },
      ],
    },
    {
      chain: ChainNames.base,
      dexes: [
        {
          chain: ChainNames.base,
          version: Pool2Types.univ2,
          factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
          birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.base.weth,
        },
        {
          chain: ChainNames.base,
          version: Pool2Types.univ3,
          factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
          birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
          factoryBirthBlock: 1371681,
          wrappedNative: PublicAddresses.base.weth,
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      dexes: [
        {
          chain: ChainNames.bnbchain,
          version: Pool2Types.univ2,
          factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
          birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.bnbchain.wbnb,
        },
        {
          chain: ChainNames.bnbchain,
          version: Pool2Types.univ3,
          factory: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
          birthday: 1678406400, // Fri Mar 10 2023 00:00:00 GMT+0000
          factoryBirthBlock: 26324015,
          wrappedNative: PublicAddresses.bnbchain.wbnb,
        },
      ],
    },
    {
      chain: ChainNames.optimism,
      dexes: [
        {
          chain: ChainNames.optimism,
          version: Pool2Types.univ2,
          factory: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
          birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.optimism.weth,
        },
        {
          chain: ChainNames.optimism,
          version: Pool2Types.univ3,
          factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          birthday: 1636675200, // Fri Nov 12 2021 00:00:00 GMT+0000
          factoryBirthBlock: 1,
          wrappedNative: PublicAddresses.optimism.weth,
        },
      ],
    },
    {
      chain: ChainNames.polygon,
      dexes: [
        {
          chain: ChainNames.polygon,
          version: Pool2Types.univ2,
          factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
          birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.polygon.wmatic,
        },
        {
          chain: ChainNames.polygon,
          version: Pool2Types.univ3,
          factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
          birthday: 1640044800, // Tue Dec 21 2021 00:00:00 GMT+0000
          factoryBirthBlock: 22757548,
          wrappedNative: PublicAddresses.polygon.wmatic,
        },
      ],
    },
    {
      chain: ChainNames.blast,
      dexes: [
        {
          chain: ChainNames.blast,
          version: Pool2Types.univ2,
          factory: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
          birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.blast.weth,
        },
        {
          chain: ChainNames.blast,
          version: Pool2Types.univ3,
          factory: '0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd',
          birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
          factoryBirthBlock: 400904,
          wrappedNative: PublicAddresses.blast.weth,
        },
      ],
    },
    {
      chain: ChainNames.zora,
      dexes: [
        {
          chain: ChainNames.zora,
          version: Pool2Types.univ2,
          factory: '0x0F797dC7efaEA995bB916f268D919d0a1950eE3C',
          birthday: 1708732800, // Sat Feb 24 2024 00:00:00 GMT+0000
          wrappedNative: PublicAddresses.zora.weth,
        },
        {
          chain: ChainNames.zora,
          version: Pool2Types.univ3,
          factory: '0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb',
          birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
          factoryBirthBlock: 10320369,
          wrappedNative: PublicAddresses.zora.weth,
        },
      ],
    },
    {
      chain: ChainNames.celo,
      dexes: [
        {
          chain: ChainNames.celo,
          version: Pool2Types.univ3,
          factory: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
          birthday: 1657238400, // Fri Jul 08 2022 00:00:00 GMT+0000
          factoryBirthBlock: 13916356,
          wrappedNative: PublicAddresses.celo.celo,
        },
      ],
    },
    {
      chain: ChainNames.zksync,
      dexes: [
        {
          chain: ChainNames.zksync,
          version: Pool2Types.univ3,
          factory: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422',
          birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
          factoryBirthBlock: 12637076,
          wrappedNative: PublicAddresses.zksync.weth,
        },
      ],
    },
  ],
};
