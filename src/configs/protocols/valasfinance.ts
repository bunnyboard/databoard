import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://valasfinance.com
// forked from Aave v2
export const ValasfinanceConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.valasfinance,
  birthday: 1679184000, // Sun Mar 19 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.bnbchain,
      marketName: 'Core Market',
      version: 2,
      birthday: 1648771200, // Fri Apr 01 2022 00:00:00 GMT+0000
      lendingPool: '0xE29A55A6AEFf5C8B1beedE5bCF2F0Cb3AF8F91f5',
      dataProvider: '0xc9704604E18982007fdEA348e8DDc7CC652E34cA',
      oracle: {
        currency: 'usd',
        address: '0x3436c4B4A27B793539844090e271591cbCb0303c',
        decimals: 18,
      },
    },
  ],
};
