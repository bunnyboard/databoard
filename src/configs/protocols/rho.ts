import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const RhoConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.rho,
  category: ProtocolCategories.lending,
  birthday: 1718150400, // Wed Jun 12 2024 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.scroll,
      marketName: 'Main Market',
      birthday: 1718150400, // Wed Jun 12 2024 00:00:00 GMT+0000
      comptroller: '0x8a67ab98a291d1aea2e1eb0a79ae4ab7f2d76041',
      oracleSource: 'oracleUsd',
    },
  ],
};
