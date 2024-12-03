import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://polter.finance/
// forked from Aave v2
export const PolterConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.polter,
  birthday: 1706745600, // Thu Feb 01 2024 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.fantom,
      marketName: 'Main Market',
      version: 2,
      birthday: 1706745600, // Thu Feb 01 2024 00:00:00 GMT+0000
      lendingPool: '0x867faa51b3a437b4e2e699945590ef4f2be2a6d5',
      dataProvider: '0x5f1a219954d231Ae23737325e1C7C1b773ceA5e6',
      oracle: {
        currency: 'usd',
        decimals: 18,
        address: '0x6808b5ce79d44e89883c5393b487c4296abb69fe',
      },
    },
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      version: 2,
      birthday: 1726358400, // Sun Sep 15 2024 00:00:00 GMT+0000
      lendingPool: '0x33CA62504cebAB919f0FCa94562413ee121A9798',
      dataProvider: '0x11b518f695a2a1236803b2976a1ec3fbae783a78',
      oracle: {
        currency: 'usd',
        decimals: 18,
        address: '0xc588bF881A1a743d70D9dD3faF9EF4885eDAeDA7',
      },
    },
  ],
};
