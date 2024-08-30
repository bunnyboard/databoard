import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MorphoBlueConfig {
  chain: string;
  morphoBlue: string;
  birthday: number;

  // block number where MorphoBlue contract was deployed
  birthblock: number;

  blacklistPoolIds: {
    [key: string]: boolean;
  };
}

export interface MorphoProtocolConfig extends ProtocolConfig {
  morphoBlues: Array<MorphoBlueConfig>;
}

export const MorphoConfigs: MorphoProtocolConfig = {
  protocol: ProtocolNames.morpho,
  category: ProtocolCategories.lending,
  birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
  morphoBlues: [
    {
      chain: ChainNames.ethereum,
      birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
      birthblock: 18883124,
      morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      blacklistPoolIds: {
        '0xbd33e0ae076c82cfd0fa8d759ea83a296190f9f98d9f79b74a0eb4a294d8bf42': true,
      },
    },
    {
      chain: ChainNames.base,
      birthday: 1714780800, // Sat May 04 2024 00:00:00 GMT+0000
      birthblock: 13977148,
      morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      blacklistPoolIds: {},
    },
  ],
};
