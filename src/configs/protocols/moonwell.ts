import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const MoonwellConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.moonwell,
  category: ProtocolCategories.lending,
  birthday: 1624320000, // Tue Jun 22 2021 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.moonbeam,
      marketName: 'Main Market',
      birthday: 1624320000, // Tue Jun 22 2021 00:00:00 GMT+0000
      comptroller: '0x8e00d5e02e65a19337cdba98bba9f84d4186a180',
      oracleSource: 'oracleUsd',
      blacklists: [
        '0x02e9081dfadd37a852f9a73c4d7d69e615e61334',
        '0xc3090f41eb54a7f18587fd6651d4d3ab477b07a4',
        '0x24a9d8f1f350d59cb0368d3d52a77db29c833d1d',
        '0x298f2e346b82d69a473bf25f329bdf869e17dec8',
      ],
      cTokenMappings: {
        '0x091608f4e4a15335145be0a279483c0f8e4c7955': {
          chain: 'moonbeam',
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'GLMR',
          decimals: 18,
        },
      },
    },
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      comptroller: '0xfbb21d0380bee3312b33c4353c8936a0f13ef26c',
      oracleSource: 'oracleUsd',
    },
  ],
};
