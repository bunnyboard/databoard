import { normalizeAddress } from '../../lib/utils';
import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface FraxlendFactoryConfig {
  chain: string;
  birthday: number;
  factory: string; // factory - pair deployer
  fraxlendPairVersion: 1 | 2;
  blacklists: Array<string>;
}

export interface FraxlendProtocolConfig extends ProtocolConfig {
  factories: Array<FraxlendFactoryConfig>;
}

export const FraxlendConfigs: FraxlendProtocolConfig = {
  protocol: ProtocolNames.fraxlend,
  category: ProtocolCategories.lending,
  birthday: 1662076800, // Fri Sep 02 2022 00:00:00 GMT+0000
  factories: [
    {
      chain: ChainNames.ethereum,
      birthday: 1662076800, // Fri Sep 02 2022 00:00:00 GMT+0000
      fraxlendPairVersion: 1,
      factory: '0x5d6e79bcf90140585ce88c7119b7e43caaa67044',
      blacklists: [],
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1675900800, // Thu Feb 09 2023 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      factory: '0x7ab788d0483551428f2291232477f1818952998c',
      blacklists: [normalizeAddress('0xe1B6A8C4A044b38FCd862ba509844C54393cc737')],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1685404800, // Tue May 30 2023 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      factory: '0xc70cc721d19dc7e627b81feacb6a357fb11200af',
      blacklists: [],
    },
    {
      chain: ChainNames.fraxtal,
      birthday: 1708560000, // Thu Feb 22 2024 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      factory: '0x4c3b0e85cd8c12e049e07d9a4d68c441196e6a12',
      blacklists: [],
    },
  ],
};
