import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://zerolend.xyz/
// forked from Aave v3
export const ZerolendConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.zerolend,
  birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      version: 3,
      birthday: 1709510400, // Mon Mar 04 2024 00:00:00 GMT+0000
      lendingPool: '0x3bc3d34c32cc98bf098d832364df8a222bbab4c0',
      dataProvider: '0x47223d4ea966a93b2cc96ffb4d42c22651fadfcf',
      oracle: {
        currency: 'usd',
        address: '0x1cc993f2c8b6fbc43a9bafd2a44398e739733385',
      },
    },
    {
      chain: ChainNames.ethereum,
      marketName: 'Bitcoin LRT Market',
      version: 3,
      birthday: 1725580800, // Fri Sep 06 2024 00:00:00 GMT+0000
      lendingPool: '0xCD2b31071119D7eA449a9D211AC8eBF7Ee97F987',
      dataProvider: '0x31063F7CA8ef4089Db0dEdf8D6e35690B468A611',
      oracle: {
        currency: 'usd',
        address: '0xad19a55354614913B373E01da768ab679ac4DA41',
      },
    },
    {
      chain: ChainNames.ethereum,
      marketName: 'Stablecoin RWA Market',
      version: 3,
      birthday: 1727049600, // Mon Sep 23 2024 00:00:00 GMT+0000
      lendingPool: '0xD3a4DA66EC15a001466F324FA08037f3272BDbE8',
      dataProvider: '0x298ECDcb0369Aef75cBbdA3e46a224Cfe622E287',
      oracle: {
        currency: 'usd',
        address: '0x9a4BF8be3a363bd7fC50833c1C24e8076E2F762E',
      },
    },
    {
      chain: ChainNames.blast,
      marketName: 'Main Market',
      version: 3,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      lendingPool: '0xa70b0f3c2470abbe104bdb3f3aaa9c7c54bea7a8',
      dataProvider: '0xc6df4dddbfacb866e78dcc01b813a41c15a08c10',
      oracle: {
        currency: 'usd',
        address: '0xbe0ab675a478a759eca580f0d6c9d399085547d8',
      },
    },
    {
      chain: ChainNames.linea,
      marketName: 'Main Market',
      version: 3,
      birthday: 1710028800, // Sun Mar 10 2024 00:00:00 GMT+0000
      lendingPool: '0x2f9bb73a8e98793e26cb2f6c4ad037bdf1c6b269',
      dataProvider: '0x67f93d36792c49a4493652b91ad4bd59f428ad15',
      oracle: {
        currency: 'usd',
        address: '0xff679e5b4178a2f74a56f0e2c0e1fa1c80579385',
      },
    },
    {
      chain: ChainNames.linea,
      marketName: 'Croak Market',
      version: 3,
      birthday: 1717372800, // Mon Jun 03 2024 00:00:00 GMT+0000
      lendingPool: '0xc6ff96AefD1cC757d56e1E8Dcc4633dD7AA5222D',
      dataProvider: '0x9aFB91a3cfB9aBc8Cbc8429aB57b6593FE36E173',
      oracle: {
        currency: 'usd',
        address: '0xCf3c9Bf6caD62A5eF2037322De6Da8216F31f9ec',
      },
    },
    {
      chain: ChainNames.zksync,
      marketName: 'Main Market',
      version: 3,
      birthday: 1689552000, // Mon Jul 17 2023 00:00:00 GMT+0000
      lendingPool: '0x4d9429246ea989c9cee203b43f6d1c7d83e3b8f8',
      dataProvider: '0xb73550bc1393207960a385fc8b34790e5133175e',
      oracle: {
        currency: 'usd',
        address: '0x785765de3e9ac3d8eeb42b4724a7fea8990142b8',
      },
    },
    {
      chain: ChainNames.manta,
      marketName: 'Main Market',
      version: 3,
      birthday: 1705276800, // Mon Jan 15 2024 00:00:00 GMT+0000
      lendingPool: '0x2f9bb73a8e98793e26cb2f6c4ad037bdf1c6b269',
      dataProvider: '0x67f93d36792c49a4493652b91ad4bd59f428ad15',
      oracle: {
        currency: 'usd',
        address: '0xff679e5b4178a2f74a56f0e2c0e1fa1c80579385',
      },
    },
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      version: 3,
      birthday: 1727136000, // Tue Sep 24 2024 00:00:00 GMT+0000
      lendingPool: '0x766f21277087E18967c1b10bF602d8Fe56d0c671',
      dataProvider: '0xA754b2f1535287957933db6e2AEE2b2FE6f38588',
      oracle: {
        currency: 'usd',
        address: '0xF49Ee3EA9C56D90627881d88004aaBDFc44Fd82c',
      },
    },
    {
      chain: ChainNames.zircuit,
      marketName: 'Main Market',
      version: 3,
      birthday: 1725494400, // Thu Sep 05 2024 00:00:00 GMT+0000
      lendingPool: '0x2774C8B95CaB474D0d21943d83b9322Fb1cE9cF5',
      dataProvider: '0xA754b2f1535287957933db6e2AEE2b2FE6f38588',
      oracle: {
        currency: 'usd',
        address: '0x2e43BC528F422fa9c7FFD25799B7424f8D5b1e67',
      },
    },
    {
      chain: ChainNames.xlayer,
      marketName: 'Main Market',
      version: 3,
      birthday: 1714089600, // Fri Apr 26 2024 00:00:00 GMT+0000
      lendingPool: '0xffd79d05d5dc37e221ed7d3971e75ed5930c6580',
      dataProvider: '0x97e59722318f1324008484aca9c343863792cbf6',
      oracle: {
        currency: 'usd',
        address: '0x78ad3d53045b6582841e2a1a688c52be2ca2a7a7',
      },
    },
  ],
};
