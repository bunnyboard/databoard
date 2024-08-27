import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://kinza.finance/
// forked from Aave v3
export const KinzaConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.kinza,
  category: ProtocolCategories.lending,
  birthday: 1693526400, // // Fri Sep 01 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.bnbchain,
      marketName: 'Main Market',
      version: 3,
      birthday: 1693526400, // // Fri Sep 01 2023 00:00:00 GMT+0000
      lendingPool: '0xcb0620b181140e57d1c0d8b724cde623ca963c8c',
      dataProvider: '0x09ddc4ae826601b0f9671b9edffdf75e7e6f5d61',
      oracle: {
        currency: 'usd',
        address: '0xec203e7676c45455bf8cb43d28f9556f014ab461',
      },
    },
  ],
};
