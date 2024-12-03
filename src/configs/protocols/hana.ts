import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.hana.finance/
// forked from Aave v3
export const HanaConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.hana,
  birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.taiko,
      marketName: 'Main Market',
      version: 3,
      birthday: 1717200000, // Sat Jun 01 2024 00:00:00 GMT+0000
      lendingPool: '0x4ab85bf9ea548410023b25a13031e91b4c4f3b91',
      dataProvider: '0x9e3d95b518f68349464da1b6dbd0b94db59addc1',
      oracle: {
        currency: 'usd',
        address: '0x47bd9d96b420709b2c6270da99459de9b3550ea1',
      },
    },
  ],
};
