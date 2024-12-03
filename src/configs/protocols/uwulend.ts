import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.uwulend.finance
// forked from Aave v2
export const UwulendConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.uwulend,
  birthday: 1663632000, // Tue Sep 20 2022 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      version: 2,
      birthday: 1663632000, // Tue Sep 20 2022 00:00:00 GMT+0000
      lendingPool: '0x2409af0251dcb89ee3dee572629291f9b087c668',
      dataProvider: '0x17938ede656ca1901807abf43a6b1d138d8cd521',
      oracle: {
        currency: 'usd',
        address: '0xac4a2ac76d639e10f2c05a41274c1af85b772598',
      },
    },
  ],
};
