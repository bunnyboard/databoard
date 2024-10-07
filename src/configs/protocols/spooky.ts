import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { UniswapProtocolConfig } from './uniswap';

export const SpookyConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.spooky,
  category: ProtocolCategories.dex,
  birthday: 1618704000, // Sun Apr 18 2021 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.fantom,
      version: 2,
      factory: '0x152ee697f2e276fa89e96742e9bb9ab1f2e61be3',
      birthday: 1618704000, // Sun Apr 18 2021 00:00:00 GMT+0000
      birthblock: 3795377,
    },
    {
      chain: ChainNames.fantom,
      version: 3,
      factory: '0x7928a2c48754501f3a8064765ECaE541daE5c3E6',
      birthday: 1700697600, // Thu Nov 23 2023 00:00:00 GMT+0000
      birthblock: 70992837,
    },
  ],
};
