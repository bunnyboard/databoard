import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const SpookyConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.spooky,
  birthday: 1733961600, // Thu Dec 12 2024 00:00:00 GMT+0000
  factories: [
    // {
    //   chain: ChainNames.fantom,
    //   version: Pool2Types.univ2,
    //   factory: '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3',
    //   birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
    //   feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
    //   feeRateForProtocol: 0.0003, // 0.03% -> protocol, xBOO
    // },
    // {
    //   chain: ChainNames.fantom,
    //   version: Pool2Types.univ3,
    //   factory: '0x7928a2c48754501f3a8064765ECaE541daE5c3E6',
    //   birthday: 1700697600, // Thu Nov 23 2023 00:00:00 GMT+0000
    // },

    // v2
    {
      chain: ChainNames.sonic,
      version: Pool2Types.univ2,
      factory: '0xEE4bC42157cf65291Ba2FE839AE127e3Cc76f741',
      factoryBirthblock: 285950,
      birthday: 1733961600, // Thu Dec 12 2024 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
      feeRateForProtocol: 0.0003, // 0.03% -> protocol, xBOO
    },

    // v3
    {
      chain: ChainNames.sonic,
      version: Pool2Types.univ3,
      factory: '0x3D91B700252e0E3eE7805d12e048a988Ab69C8ad',
      factoryBirthblock: 286535,
      birthday: 1733961600, // Thu Dec 12 2024 00:00:00 GMT+0000
    },
  ],
};
