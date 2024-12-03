import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const SpookyConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.spooky,
  birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
  chains: [
    {
      chain: ChainNames.fantom,
      dexes: [
        {
          chain: ChainNames.fantom,
          version: Pool2Types.univ2,
          factory: '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3',
          birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
          factoryBirthBlock: 3795376,
          feeRateForLiquidityProviders: 0.0017, // 0.17% -> LP
          feeRateForProtocol: 0.0003, // 0.03% -> protocol, xBOO
          wrappedNative: PublicAddresses.fantom.wftm,
        },
        {
          chain: ChainNames.fantom,
          version: Pool2Types.univ3,
          factory: '0x7928a2c48754501f3a8064765ECaE541daE5c3E6',
          birthday: 1700697600, // Thu Nov 23 2023 00:00:00 GMT+0000
          factoryBirthBlock: 70992836,
          wrappedNative: PublicAddresses.fantom.wftm,
        },
      ],
    },
  ],
};
