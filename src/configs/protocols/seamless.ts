import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.seamlessprotocol.com/
// forked from Aave v3
export const SeamlessConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.seamless,
  category: ProtocolCategories.lending,
  birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      version: 3,
      birthday: 1693526400, // Fri Sep 01 2023 00:00:00 GMT+0000
      lendingPool: '0x8f44fd754285aa6a2b8b9b97739b79746e0475a7',
      dataProvider: '0x2a0979257105834789bc6b9e1b00446dfba8dfba',
      oracle: {
        currency: 'usd',
        address: '0xfdd4e83890bccd1fbf9b10d71a5cc0a738753b01',
      },
    },
  ],
};
