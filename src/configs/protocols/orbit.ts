import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const OrbitConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.orbit,
  category: ProtocolCategories.lending,
  birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.blast,
      marketName: 'Main Market',
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      comptroller: '0x1E18C3cb491D908241D0db14b081B51be7B6e652',
      oracleSource: 'oracleUsd',
      blacklists: ['0xf92996ddc677a8dcb032ac5fe62bbf00f92ae2ec', '0xd847b486fe612c51900f1da1a045741820dd5fa0'],
    },
    {
      chain: ChainNames.blast,
      marketName: 'LRT Market',
      birthday: 1712275200, // Fri Apr 05 2024 00:00:00 GMT+0000
      comptroller: '0x273683CA19D9CF827628EE216E4a9604EfB077A3',
      oracleSource: 'oracleUsd',
    },
  ],
};
