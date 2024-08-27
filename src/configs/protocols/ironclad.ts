import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://ironclad.finance/
// forked from Aave v2
export const IroncladConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.ironclad,
  category: ProtocolCategories.lending,
  birthday: 1708128000, // Sat Feb 17 2024 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.mode,
      marketName: 'Main Market',
      version: 2,
      birthday: 1708128000, // Sat Feb 17 2024 00:00:00 GMT+0000
      lendingPool: '0xb702ce183b4e1faa574834715e5d4a6378d0eed3',
      dataProvider: '0x29563f73de731ae555093deb795ba4d1e584e42e',
      oracle: {
        currency: 'usd',
        address: '0xe4f4f36fcbb2d53c0bab95f5d117489579553caa',
      },
    },
  ],
};
