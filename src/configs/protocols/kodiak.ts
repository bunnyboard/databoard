import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

// https://documentation.kodiak.finance/protocol/dex/trading-fees
export const KodiakConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.kodiak,
  birthday: 1737417600, // Tue Jan 21 2025 00:00:00 GMT+0000
  factories: [
    // v2
    {
      chain: ChainNames.berachain,
      version: Pool2Types.univ2,
      factory: '0x5e705e184d233ff2a7cb1553793464a9d0c3028f',
      factoryBirthblock: 12242,
      birthday: 1737417600, // Tue Jan 21 2025 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
    },

    // v3
    {
      chain: ChainNames.berachain,
      version: Pool2Types.univ3,
      factory: '0xd84cbf0b02636e7f53db9e5e45a616e05d710990',
      birthday: 1737417600, // Tue Jan 21 2025 00:00:00 GMT+0000
      factoryBirthblock: 12314,
      feeRateForProtocol: 0.35, // 35% swap fees
    },
  ],
};
