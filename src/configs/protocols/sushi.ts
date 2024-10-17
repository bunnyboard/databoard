import { ProtocolCategories } from '../../types/base';
import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';
import SushiPools from '../data/pool2/sushi.json';
import { compareAddress } from '../../lib/utils';

export const SushiConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.sushi,
  category: ProtocolCategories.dex,
  birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ2,
      factory: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
      wrappedNative: PublicAddresses.ethereum.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.ethereum).filter((pool) =>
        compareAddress(pool.factory, '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac'),
      ),
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ2,
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.arbitrum.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.arbitrum).filter((pool) =>
        compareAddress(pool.factory, '0xc35dadb65012ec5796536bd9864ed8773abc74c4'),
      ),
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1615334400, // Wed Mar 10 2021 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.avalanche.wavax,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.avalanche).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ2,
      factory: '0x71524B4f93c58fcbF659783284E38825f0622859',
      birthday: 1692057600, // Tue Aug 15 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.base.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.base).filter((pool) =>
        compareAddress(pool.factory, '0x71524B4f93c58fcbF659783284E38825f0622859'),
      ),
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ2,
      factory: '0x42Fa929fc636e657AC568C0b5Cf38E203b67aC2b',
      birthday: 1709424000,
      wrappedNative: PublicAddresses.blast.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.blast).filter((pool) =>
        compareAddress(pool.factory, '0x42Fa929fc636e657AC568C0b5Cf38E203b67aC2b'),
      ),
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1614384000,
      wrappedNative: PublicAddresses.bnbchain.wbnb,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.bnbchain).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.celo,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      wrappedNative: PublicAddresses.celo.celo,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.celo).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.fantom,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      wrappedNative: PublicAddresses.fantom.wftm,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.fantom).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.gnosis,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      wrappedNative: PublicAddresses.gnosis.wxdai,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.gnosis).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.linea,
      version: Pool2Types.univ2,
      factory: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C',
      birthday: 1697414400,
      wrappedNative: PublicAddresses.linea.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.linea).filter((pool) =>
        compareAddress(pool.factory, '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C'),
      ),
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ2,
      factory: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C',
      birthday: 1697414400,
      wrappedNative: PublicAddresses.optimism.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.optimism).filter((pool) =>
        compareAddress(pool.factory, '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C'),
      ),
    },
    {
      chain: ChainNames.scroll,
      version: Pool2Types.univ2,
      factory: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      birthday: 1697587200,
      wrappedNative: PublicAddresses.scroll.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.scroll).filter((pool) =>
        compareAddress(pool.factory, '0xB45e53277a7e0F1D35f2a77160e91e25507f1763'),
      ),
    },

    // v3
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ3,
      factory: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      wrappedNative: PublicAddresses.ethereum.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.ethereum).filter((pool) =>
        compareAddress(pool.factory, '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F'),
      ),
      blacklistedPools: ['0xa090a1657dbf752fca8638624f26e9284e33da3a'],
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ3,
      factory: '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e',
      birthday: 1680393600,
      wrappedNative: PublicAddresses.arbitrum.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.arbitrum).filter((pool) =>
        compareAddress(pool.factory, '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e'),
      ),
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ3,
      factory: '0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715',
      birthday: 1680393600,
      wrappedNative: PublicAddresses.avalanche.wavax,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.avalanche).filter((pool) =>
        compareAddress(pool.factory, '0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715'),
      ),
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ3,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1690329600,
      wrappedNative: PublicAddresses.base.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.base).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ3,
      factory: '0x7680D4B43f3d1d54d6cfEeB2169463bFa7a6cf0d',
      birthday: 1709424000,
      wrappedNative: PublicAddresses.blast.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.blast).filter((pool) =>
        compareAddress(pool.factory, '0x7680D4B43f3d1d54d6cfEeB2169463bFa7a6cf0d'),
      ),
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ3,
      factory: '0x126555dd55a39328F69400d6aE4F782Bd4C34ABb',
      birthday: 1680393600,
      wrappedNative: PublicAddresses.bnbchain.wbnb,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.bnbchain).filter((pool) =>
        compareAddress(pool.factory, '0x126555dd55a39328F69400d6aE4F782Bd4C34ABb'),
      ),
    },
    {
      chain: ChainNames.linea,
      version: Pool2Types.univ3,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1690329600,
      wrappedNative: PublicAddresses.linea.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.linea).filter((pool) =>
        compareAddress(pool.factory, '0xc35DADB65012eC5796536bD9864eD8773aBc74C4'),
      ),
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ3,
      factory: '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0',
      birthday: 1680393600,
      wrappedNative: PublicAddresses.optimism.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.optimism).filter((pool) =>
        compareAddress(pool.factory, '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0'),
      ),
    },
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ3,
      factory: '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2',
      birthday: 1680393600,
      wrappedNative: PublicAddresses.polygon.wmatic,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.polygon).filter((pool) =>
        compareAddress(pool.factory, '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2'),
      ),
    },
    {
      chain: ChainNames.scroll,
      version: Pool2Types.univ3,
      factory: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      birthday: 1697587200,
      wrappedNative: PublicAddresses.scroll.weth,
      whitelistedPools: SushiPools.filter((pool) => pool.chain === ChainNames.scroll).filter((pool) =>
        compareAddress(pool.factory, '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e'),
      ),
    },
  ],
};
