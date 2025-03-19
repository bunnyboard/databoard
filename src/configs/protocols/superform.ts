import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SuperformFactoryConfig {
  chain: string;
  birthday: number;
  factory: string;
}

export interface SuperformSuperVaultConfig {
  chain: string;
  birthday: number;
  vault: string;
}

export interface SuperformProtocolConfig extends ProtocolConfig {
  factories: Array<SuperformFactoryConfig>;
  superVaults: Array<SuperformSuperVaultConfig>;
}

export const SuperformConfigs: SuperformProtocolConfig = {
  protocol: ProtocolNames.superform,
  birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
  factories: [
    {
      chain: ChainNames.ethereum,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.base,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1706140800, // Thu Jan 25 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1715817600, // Thu May 16 2024 00:00:00 GMT+0000
      factory: '0xbc85043544CC2b3Fd095d54b6431822979BBB62A',
    },
    {
      chain: ChainNames.linea,
      birthday: 1726617600, // Wed Sep 18 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
    {
      chain: ChainNames.blast,
      birthday: 1726617600, // Wed Sep 18 2024 00:00:00 GMT+0000
      factory: '0xD85ec15A9F814D6173bF1a89273bFB3964aAdaEC',
    },
  ],
  superVaults: [
    {
      chain: ChainNames.ethereum,
      birthday: 1733788800, // Tue Dec 10 2024 00:00:00 GMT+0000
      vault: '0xF7DE3c70F2db39a188A81052d2f3C8e3e217822a',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1739232000, // Tue Feb 11 2025 00:00:00 GMT+0000
      vault: '0xeF101508bf4DC6CF0f0a0C135f39a41faB4E4389',
    },
    {
      chain: ChainNames.base,
      birthday: 1736294400, // Wed Jan 08 2025 00:00:00 GMT+0000
      vault: '0xe9F2a5F9f3c846f29066d7fB3564F8E6B6b2D65b',
    },
  ],
};
