import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const MendiConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.mendi,
  category: ProtocolCategories.lending,
  birthday: 1692316800, // Fri Aug 18 2023 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.linea,
      marketName: 'Main Market',
      birthday: 1692316800, // Fri Aug 18 2023 00:00:00 GMT+0000
      comptroller: '0x1b4d3b0421dDc1eB216D230Bc01527422Fb93103',
      oracleSource: 'oracleUsd',
    },
  ],
};
