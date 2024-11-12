import { ProtocolCategories } from '../../types/base';
import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const CamelotConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.camelot,
  category: ProtocolCategories.dex,
  birthday: 1667520000, // Fri Nov 04 2022 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.arbitrum,
      version: Pool2Types.univ2,
      factory: '0x6EcCab422D763aC031210895C81787E87B43A652',
      birthday: 1667520000, // Fri Nov 04 2022 00:00:00 GMT+0000
      wrappedNative: PublicAddresses.arbitrum.weth,
    },
  ],
};
