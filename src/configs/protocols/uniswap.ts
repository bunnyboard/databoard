import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface UniswapDexConfig {
  chain: string;
  version: 2 | 3;
  factory: string;
  birthday: number;
  birthblock: number;
  feeRate?: number; // default 0.003 -> 0.3%
}

export interface UniswapProtocolConfig extends ProtocolConfig {
  dexes: Array<UniswapDexConfig>;
}

export const UniswapConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.uniswap,
  category: ProtocolCategories.dex,
  // v2 deployed
  // Tue May 05 2020 00:00:00 GMT+0000
  birthday: 1588636800,
  dexes: [
    {
      chain: ChainNames.ethereum,
      version: 2,
      factory: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      birthday: 1588636800, // Tue May 05 2020 00:00:00 GMT+0000
      birthblock: 10000836,
    },
    {
      chain: ChainNames.arbitrum,
      version: 2,
      factory: '0xf1D7CC64Fb4452F05c498126312eBE29f30Fbcf9',
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      birthblock: 150442612,
    },
    {
      chain: ChainNames.avalanche,
      version: 2,
      factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      birthblock: 37767796,
    },
    {
      chain: ChainNames.bnbchain,
      version: 2,
      factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      birthblock: 33496019,
    },
    {
      chain: ChainNames.base,
      version: 2,
      factory: '0x8909Dc15e40173Ff4699343b6eB8132c65e18eC6',
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      birthblock: 6601916,
    },
    {
      chain: ChainNames.optimism,
      version: 2,
      factory: '0x0c3c1c532F1e39EdF36BE9Fe0bE1410313E074Bf',
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      birthblock: 112197987,
    },
    {
      chain: ChainNames.polygon,
      version: 2,
      factory: '0x9e5A52f57b3038F1B8EeE45F28b3C1967e22799C',
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      birthblock: 49948179,
    },
    {
      chain: ChainNames.blast,
      version: 2,
      factory: '0x5C346464d33F90bABaf70dB6388507CC889C1070',
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      birthblock: 399406,
    },
    {
      chain: ChainNames.zora,
      version: 2,
      factory: '0x0F797dC7efaEA995bB916f268D919d0a1950eE3C',
      birthday: 1708732800, // Sat Feb 24 2024 00:00:00 GMT+0000
      birthblock: 10973309,
    },

    // v3
    {
      chain: ChainNames.ethereum,
      version: 3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1620172800, // Wed May 05 2021 00:00:00 GMT+0000
      birthblock: 12369622,
    },
    {
      chain: ChainNames.avalanche,
      version: 3,
      factory: '0x740b1c1de25031C31FF4fC9A62f554A55cdC1baD',
      birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
      birthblock: 27832973,
    },
    {
      chain: ChainNames.arbitrum,
      version: 3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1622592000, // Wed Jun 02 2021 00:00:00 GMT+0000
      birthblock: 166,
    },
    {
      chain: ChainNames.bnbchain,
      version: 3,
      factory: '0xdB1d10011AD0Ff90774D0C6Bb92e5C5c8b4461F7',
      birthday: 1678406400, // Fri Mar 10 2023 00:00:00 GMT+0000
      birthblock: 26324015,
    },
    {
      chain: ChainNames.base,
      version: 3,
      factory: '0x33128a8fC17869897dcE68Ed026d694621f6FDfD',
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      birthblock: 1371681,
    },
    {
      chain: ChainNames.blast,
      version: 3,
      factory: '0x792edAdE80af5fC680d96a2eD80A44247D2Cf6Fd',
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      birthblock: 400904,
    },
    {
      chain: ChainNames.celo,
      version: 3,
      factory: '0xAfE208a311B21f13EF87E33A90049fC17A7acDEc',
      birthday: 1657238400, // Fri Jul 08 2022 00:00:00 GMT+0000
      birthblock: 13916356,
    },
    {
      chain: ChainNames.optimism,
      version: 3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1636675200, // Fri Nov 12 2021 00:00:00 GMT+0000
      birthblock: 1,
    },
    {
      chain: ChainNames.polygon,
      version: 3,
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1640044800, // Tue Dec 21 2021 00:00:00 GMT+0000
      birthblock: 22757548,
    },
    {
      chain: ChainNames.zksync,
      version: 3,
      factory: '0x8FdA5a7a8dCA67BBcDd10F02Fa0649A937215422',
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      birthblock: 12637076,
    },
    {
      chain: ChainNames.zora,
      version: 3,
      factory: '0x7145F8aeef1f6510E92164038E1B6F8cB2c42Cbb',
      birthday: 1707436800, // Fri Feb 09 2024 00:00:00 GMT+0000
      birthblock: 10320369,
    },
  ],
};
