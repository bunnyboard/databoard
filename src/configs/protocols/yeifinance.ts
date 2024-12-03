import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://www.yei.finance/
// forked from Aave v3
export const YeifinanceConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.yeifinance,
  birthday: 1717372800, // Mon Jun 03 2024 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.seievm,
      marketName: 'Main Market',
      version: 3,
      birthday: 1709510400, // Mon Mar 04 2024 00:00:00 GMT+0000
      lendingPool: '0x4a4d9abd36f923cba0af62a39c01dec2944fb638',
      dataProvider: '0x60c82a40c57736a9c692c42e87a8849fb407f0d6',
      oracle: {
        currency: 'usd',
        address: '0xa1ce28cebab91d8df346d19970e4ee69a6989734',
      },
    },
  ],
};
