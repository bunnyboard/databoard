import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const SonneConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.sonne,
  birthday: 1664409600, // Thu Sep 29 2022 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.optimism,
      marketName: 'Main Market',
      birthday: 1718150400, // Wed Jun 12 2024 00:00:00 GMT+0000
      comptroller: '0x60CF091cD3f50420d50fD7f707414d0DF4751C58',
      oracleSource: 'oracleUsd',
    },
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      comptroller: '0x1DB2466d9F5e10D7090E7152B68d62703a2245F0',
      oracleSource: 'oracleUsd',
    },
  ],
};
