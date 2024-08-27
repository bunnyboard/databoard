import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://pac.finance/
// forked from Aave v3
export const PacConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.pac,
  category: ProtocolCategories.lending,
  birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.blast,
      marketName: 'Main Market',
      version: 3,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      lendingPool: '0xd2499b3c8611e36ca89a70fda2a72c49ee19eaa8',
      dataProvider: '0x742316f430002d067dc273469236d0f3670be446',
      oracle: {
        currency: 'usd',
        address: '0xaf77325317f109ee21459afeede51b16c231e6b1',
      },
    },
  ],
};
