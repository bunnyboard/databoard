import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const SushiConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.sushi,
  category: ProtocolCategories.dex,
  birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.ethereum,
      version: 2,
      factory: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
      whitelistedPools: [],
    },
    {
      chain: ChainNames.arbitrum,
      version: 2,
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
      whitelistedPools: [],
    },
    {
      chain: ChainNames.avalanche,
      version: 2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1615334400, // Wed Mar 10 2021 00:00:00 GMT+0000
      whitelistedPools: [],
    },
    {
      chain: ChainNames.base,
      version: 2,
      factory: '0x71524B4f93c58fcbF659783284E38825f0622859',
      birthday: 1692057600, // Tue Aug 15 2023 00:00:00 GMT+0000
      whitelistedPools: [],
    },
    {
      chain: ChainNames.blast,
      version: 2,
      factory: '0x42Fa929fc636e657AC568C0b5Cf38E203b67aC2b',
      birthday: 1709424000,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.bnbchain,
      version: 2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1614384000,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.celo,
      version: 2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.fantom,
      version: 2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.gnosis,
      version: 2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.linea,
      version: 2,
      factory: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C',
      birthday: 1697414400,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.optimism,
      version: 2,
      factory: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C',
      birthday: 1697414400,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.scroll,
      version: 2,
      factory: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      birthday: 1697587200,
      whitelistedPools: [],
    },

    // v3
    {
      chain: ChainNames.ethereum,
      version: 3,
      factory: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F',
      birthday: 1680393600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.arbitrum,
      version: 3,
      factory: '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e',
      birthday: 1680393600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.avalanche,
      version: 3,
      factory: '0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715',
      birthday: 1680393600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.base,
      version: 3,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1690329600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.blast,
      version: 3,
      factory: '0x7680D4B43f3d1d54d6cfEeB2169463bFa7a6cf0d',
      birthday: 1709424000,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.bnbchain,
      version: 3,
      factory: '0x126555dd55a39328F69400d6aE4F782Bd4C34ABb',
      birthday: 1680393600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.linea,
      version: 3,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1690329600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.optimism,
      version: 3,
      factory: '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0',
      birthday: 1680393600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.polygon,
      version: 3,
      factory: '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2',
      birthday: 1680393600,
      whitelistedPools: [],
    },
    {
      chain: ChainNames.scroll,
      version: 3,
      factory: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      birthday: 1697587200,
      whitelistedPools: [],
    },
  ],
};
