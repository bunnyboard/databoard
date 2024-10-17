import { ProtocolCategories } from '../../types/base';
import { Pool2, Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';
import { compareAddress } from '../../lib/utils';
import PancakePools from '../data/pool2/pancake.json';

export const PancakeConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.pancake,
  category: ProtocolCategories.dex,
  birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
  dexes: [
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.univ2,
    //   factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    //   birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.bnbchain.wbnb,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.bnbchain)
    //     .filter((pool) => compareAddress(pool.factory, '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73')),
    //   blacklistedPools: [
    //     '0x150908316745e03c58635472a9c591f80b836e74',
    //     '0x4533e0fb27324b2c06e7d6f9504fcd4e5a8e98ac',
    //     '0x2596cdd36a4aedf2b6b014b58fc82238c46fe3f5',
    //   ],
    // },
    // {
    //   chain: ChainNames.ethereum,
    //   version: Pool2Types.univ2,
    //   factory: '0x1097053fd2ea711dad45caccc45eff7548fcb362',
    //   birthday: 1664236800, // Tue Sep 27 2022 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.ethereum.weth,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.ethereum)
    //     .filter((pool) => compareAddress(pool.factory, '0x1097053fd2ea711dad45caccc45eff7548fcb362')),
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e',
    //   birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.arbitrum.weth,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.arbitrum)
    //     .filter((pool) => compareAddress(pool.factory, '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e')),
    // },
    // {
    //   chain: ChainNames.zksync,
    //   version: Pool2Types.univ2,
    //   factory: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d',
    //   birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.zksync.weth,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.zksync)
    //     .filter((pool) => compareAddress(pool.factory, '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d')),
    // },
    // {
    //   chain: ChainNames.linea,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.linea.weth,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.linea)
    //     .filter((pool) => compareAddress(pool.factory, '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E')),
    // },
    // {
    //   chain: ChainNames.base,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.base.weth,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.base)
    //     .filter((pool) => compareAddress(pool.factory, '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E')),
    // },
    // {
    //   chain: ChainNames.polygonzkevm,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.polygonzkevm.weth,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.polygonzkevm)
    //     .filter((pool) => compareAddress(pool.factory, '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E')),
    // },
    // {
    //   chain: ChainNames.opbnb,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.00008, // 0.08% -> CAKE
    //   wrappedNative: PublicAddresses.opbnb.wbnb,
    //   whitelistedPools: (PancakePools as Array<Pool2>)
    //     .filter((pool) => pool.chain === ChainNames.opbnb)
    //     .filter((pool) => compareAddress(pool.factory, '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E')),
    // },

    // v3
    {
      chain: ChainNames.bnbchain,
      version: Pool2Types.univ3,
      factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
      birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.bnbchain.wbnb,
      feeRateForProtocol: 0.32, // 32%
      whitelistedPools: (PancakePools as Array<Pool2>)
        .filter((pool) => pool.chain === ChainNames.bnbchain)
        .filter((pool) => compareAddress(pool.factory, '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865')),
    },
  ],
};
