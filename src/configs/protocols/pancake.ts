import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const PancakeConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.pancake,
  birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
  factories: [
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.univ2,
    //   factory: '0xcA143Ce32Fe78f1f7019d7d551a6402fC5350c73',
    //   birthday: 1619222400, // Sat Apr 24 2021 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.ethereum,
    //   version: Pool2Types.univ2,
    //   factory: '0x1097053fd2ea711dad45caccc45eff7548fcb362',
    //   birthday: 1664236800, // Tue Sep 27 2022 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.ethereum,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1680393600, // Sun Apr 02 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3bbd7401a5f7fa98a384ebc70bb5749e',
    //   birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1686787200, // Thu Jun 15 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.zksync,
    //   version: Pool2Types.univ2,
    //   factory: '0xd03D8D566183F0086d8D09A84E1e30b58Dd5619d',
    //   birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.zksync,
    //   version: Pool2Types.univ3,
    //   factory: '0x1BB72E0CbbEA93c08f535fc7856E0338D7F7a8aB',
    //   birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.linea,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.linea,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.base,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.base,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1692662400, // Tue Aug 22 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.polygonzkevm,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.polygonzkevm,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
    // {
    //   chain: ChainNames.opbnb,
    //   version: Pool2Types.univ2,
    //   factory: '0x02a84c1b3BBD7401a5f7fa98a384EBC70bB5749E',
    //   birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0008, // 0.08% -> CAKE
    // },
    // {
    //   chain: ChainNames.opbnb,
    //   version: Pool2Types.univ3,
    //   factory: '0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865',
    //   birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.32, // 32% -> CAKE
    // },
  ],
};

export interface PancakenftProtocolConfig extends ProtocolConfig {
  chain: string;
  marketplace: string;
}

export const PancakenftConfigs: PancakenftProtocolConfig = {
  protocol: ProtocolNames.pancakenft,
  birthday: 1633046400, // Fri Oct 01 2021 00:00:00 GMT+0000
  chain: ChainNames.bnbchain,
  marketplace: '0x17539cca21c7933df5c980172d22659b8c345c5a',
};
