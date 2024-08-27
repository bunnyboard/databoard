import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';

// https://zerolend.xyz/
// forked from Aave v3
export const ZerolendConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.zerolend,
  category: ProtocolCategories.lending,
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
  ],
};
