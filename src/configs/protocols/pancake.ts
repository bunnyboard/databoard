import { ProtocolCategories } from '../../types/base';
import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const PancakeConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.pancake,
  category: ProtocolCategories.dex,
  birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
  chains: [
    {
      chain: ChainNames.bnbchain,
      dexes: [
        {
          chain: ChainNames.bnbchain,
          version: Pool2Types.univ2,
          factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
          birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
          factoryBirthBlock: 6809737,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.bnbchain.wbnb,
        },
        {
          chain: ChainNames.bnbchain,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
          factoryBirthBlock: 26956207,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.bnbchain.wbnb,
        },
      ],
    },
    {
      chain: ChainNames.ethereum,
      dexes: [
        {
          chain: ChainNames.ethereum,
          version: Pool2Types.univ2,
          factory: '0x1097053fd2ea711dad45caccc45eff7548fcb362',
          birthday: 1664236800, // Tue Sep 27 2022 00:00:00 GMT+0000
          factoryBirthBlock: 15614590,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.ethereum.weth,
        },
        {
          chain: ChainNames.ethereum,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
          factoryBirthBlock: 16950686,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.ethereum.weth,
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      dexes: [
        {
          chain: ChainNames.arbitrum,
          version: Pool2Types.univ2,
          factory: '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e',
          birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
          factoryBirthBlock: 101022992,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.arbitrum.weth,
        },
        {
          chain: ChainNames.arbitrum,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
          factoryBirthBlock: 101028949,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.arbitrum.weth,
        },
      ],
    },
    {
      chain: ChainNames.zksync,
      dexes: [
        {
          chain: ChainNames.zksync,
          version: Pool2Types.univ2,
          factory: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d',
          birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
          factoryBirthBlock: 8637655,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.zksync.weth,
        },
        {
          chain: ChainNames.zksync,
          version: Pool2Types.univ3,
          factory: '0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB',
          birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
          factoryBirthBlock: 8639214,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.zksync.weth,
        },
      ],
    },
    {
      chain: ChainNames.linea,
      dexes: [
        {
          chain: ChainNames.linea,
          version: Pool2Types.univ2,
          factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
          birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
          factoryBirthBlock: 1439,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.linea.weth,
        },
        {
          chain: ChainNames.linea,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
          factoryBirthBlock: 1444,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.linea.weth,
        },
      ],
    },
    {
      chain: ChainNames.base,
      dexes: [
        {
          chain: ChainNames.base,
          version: Pool2Types.univ2,
          factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
          birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
          factoryBirthBlock: 2910387,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.base.weth,
        },
        {
          chain: ChainNames.base,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
          factoryBirthBlock: 2912007,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.base.weth,
        },
      ],
    },
    {
      chain: ChainNames.polygonzkevm,
      dexes: [
        {
          chain: ChainNames.polygonzkevm,
          version: Pool2Types.univ2,
          factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
          birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
          factoryBirthBlock: 749593,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.polygonzkevm.weth,
        },
        {
          chain: ChainNames.polygonzkevm,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
          factoryBirthBlock: 750149,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.polygonzkevm.weth,
        },
      ],
    },
    {
      chain: ChainNames.opbnb,
      dexes: [
        {
          chain: ChainNames.opbnb,
          version: Pool2Types.univ2,
          factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
          birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
          factoryBirthBlock: 1708914,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0008, // 0.08% -> CAKE
          wrappedNative: PublicAddresses.opbnb.wbnb,
        },
        {
          chain: ChainNames.opbnb,
          version: Pool2Types.univ3,
          factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
          birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
          factoryBirthBlock: 1721753,
          feeRateForProtocol: 0.32, // 32% -> CAKE
          wrappedNative: PublicAddresses.opbnb.wbnb,
        },
      ],
    },
  ],
};
