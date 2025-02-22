import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const SushiConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.sushi,
  birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
  factories: [
    // v2
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ2,
      factory: '0xc0aee478e3658e2610c5f7a4a2e1777ce9e4f2ac',
      factoryBirthblock: 10794229,
      birthday: 1599264000, // Sat Sep 05 2020 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ2,
      factory: '0xc35dadb65012ec5796536bd9864ed8773abc74c4',
      factoryBirthblock: 70,
      birthday: 1622505600, // Tue Jun 01 2021 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1615334400, // Wed Mar 10 2021 00:00:00 GMT+0000
      factoryBirthblock: 506190,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ2,
      factory: '0x71524B4f93c58fcbF659783284E38825f0622859',
      birthday: 1692057600, // Tue Aug 15 2023 00:00:00 GMT+0000
      factoryBirthblock: 2631214,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ2,
      factory: '0x42Fa929fc636e657AC568C0b5Cf38E203b67aC2b',
      birthday: 1709424000,
      factoryBirthblock: 285621,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1614384000,
      factoryBirthblock: 5205069,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.celo,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      factoryBirthblock: 7253488,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.gnosis,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1623888000,
      factoryBirthblock: 14735904,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.linea,
      version: Pool2Types.univ2,
      factory: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C',
      birthday: 1697414400,
      factoryBirthblock: 631714,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ2,
      factory: '0xFbc12984689e5f15626Bad03Ad60160Fe98B303C',
      birthday: 1697414400,
      factoryBirthblock: 110882086,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.scroll,
      version: Pool2Types.univ2,
      factory: '0xB45e53277a7e0F1D35f2a77160e91e25507f1763',
      birthday: 1697587200,
      factoryBirthblock: 81841,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ2,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1614384000,
      factoryBirthblock: 11333218,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },
    {
      chain: ChainNames.sonic,
      version: Pool2Types.univ2,
      factory: '0xb45e53277a7e0f1d35f2a77160e91e25507f1763',
      birthday: 1734048000,
      factoryBirthblock: 347155,
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },

    // v3
    {
      chain: ChainNames.ethereum,
      version: Pool2Types.univ3,
      factory: '0xbACEB8eC6b9355Dfc0269C18bac9d6E2Bdc29C4F',
      birthday: 1680393600,
      factoryBirthblock: 16955547,
      feeRateForProtocol: 0.25, // 25% swap fees
    },
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ3,
      factory: '0x917933899c6a5F8E37F31E19f92CdBFF7e8FF0e2',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 41024971,
    },
    {
      chain: ChainNames.scroll,
      version: Pool2Types.univ3,
      factory: '0x46B3fDF7b5CDe91Ac049936bF0bDb12c5d22202e',
      birthday: 1697587200,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 82522,
    },
    {
      chain: ChainNames.optimism,
      version: Pool2Types.univ3,
      factory: '0x9c6522117e2ed1fE5bdb72bb0eD5E3f2bdE7DBe0',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 85432013,
    },
    {
      chain: ChainNames.linea,
      version: Pool2Types.univ3,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1690329600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 53256,
    },
    {
      chain: ChainNames.gnosis,
      version: Pool2Types.univ3,
      factory: '0xf78031cbca409f2fb6876bdfdbc1b2df24cf9bef',
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 27232871,
    },
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ3,
      factory: '0x126555dd55a39328F69400d6aE4F782Bd4C34ABb',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 26976538,
    },
    {
      chain: ChainNames.blast,
      version: Pool2Types.univ3,
      factory: '0x7680D4B43f3d1d54d6cfEeB2169463bFa7a6cf0d',
      birthday: 1709424000,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 284122,
    },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ3,
      factory: '0x3e603C14aF37EBdaD31709C4f848Fc6aD5BEc715',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 28186391,
    },
    {
      chain: ChainNames.base,
      version: Pool2Types.univ3,
      factory: '0xc35DADB65012eC5796536bD9864eD8773aBc74C4',
      birthday: 1690329600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 1759510,
    },
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ3,
      factory: '0x1af415a1EbA07a4986a52B6f2e7dE7003D82231e',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 75998697,
    },
    {
      chain: ChainNames.sonic,
      version: Pool2Types.univ3,
      factory: '0x46b3fdf7b5cde91ac049936bf0bdb12c5d22202e',
      birthday: 1680393600,
      feeRateForProtocol: 0.25, // 25% swap fees
      factoryBirthblock: 347590,
    },
  ],
};
