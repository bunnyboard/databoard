import { ProtocolCategories } from '../../types/base';
import { Pool2Types } from '../../types/domains/pool2';
import { PublicAddresses } from '../constants/addresses';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const KatanaConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.katana,
  category: ProtocolCategories.dex,
  birthday: 1635206400, // Tue Oct 26 2021 00:00:00 GMT+0000
  chains: [
    {
      chain: ChainNames.ronin,
      dexes: [
        {
          chain: ChainNames.ronin,
          version: Pool2Types.univ2,
          factory: '0xb255d6a720bb7c39fee173ce22113397119cb930',
          birthday: 1635206400, // Tue Oct 26 2021 00:00:00 GMT+0000
          factoryBirthBlock: 7860906,
          wrappedNative: PublicAddresses.ronin.wron,
        },
      ],
    },
  ],
};
