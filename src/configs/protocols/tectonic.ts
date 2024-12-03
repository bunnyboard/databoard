import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const TectonicConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.tectonic,
  birthday: 1639612800, // Thu Dec 16 2021 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.cronos,
      marketName: 'Main Market',
      birthday: 1639612800, // Thu Dec 16 2021 00:00:00 GMT+0000
      comptroller: '0xb3831584acb95ed9ccb0c11f677b5ad01deaeec0',
      oracleSource: 'oracleUsd',
    },
    {
      chain: ChainNames.cronos,
      marketName: 'Veno Market',
      birthday: 1680048000, // Wed Mar 29 2023 00:00:00 GMT+0000
      comptroller: '0x7E0067CEf1e7558daFbaB3B1F8F6Fa75Ff64725f',
      oracleSource: 'oracleUsd',
    },
    {
      chain: ChainNames.cronos,
      marketName: 'DeFi Market',
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      comptroller: '0x8312A8d5d1deC499D00eb28e1a2723b13aA53C1e',
      oracleSource: 'oracleUsd',
    },
  ],
};
