import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const QuickswapConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.quickswap,
  birthday: 1602201600, // Fri Oct 09 2020 00:00:00 GMT+0000
  factories: [
    // v2
    {
      chain: ChainNames.polygon,
      version: Pool2Types.univ2,
      factory: '0x5757371414417b8C6CAad45bAeF941aBc7d3Ab32',
      factoryBirthblock: 4931780,
      birthday: 1602201600, // Fri Oct 09 2020 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.003, // 0.3% -> LP
      feeRateForProtocol: 0, // no protocol fee
    },

    // v3
    {
      chain: ChainNames.polygon,
      version: Pool2Types.algebra,
      factory: '0x411b0fAcC3489691f28ad58c47006AF5E3Ab3A28',
      factoryBirthblock: 32610688,
      birthday: 1662163200, // Sat Sep 03 2022 00:00:00 GMT+0000
      feeRateForProtocol: 0, // 0% swap fees
    },
  ],
};
