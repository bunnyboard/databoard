import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const IonicConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.ionic,
  birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.mode,
      marketName: 'Main Market',
      birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
      comptroller: '0xfb3323e24743caf4add0fdccfb268565c0685556',
      oracleSource: 'oracleEth',
    },
    {
      chain: ChainNames.mode,
      marketName: 'Isolated Market',
      birthday: 1715040000, // Tue May 07 2024 00:00:00 GMT+0000
      comptroller: '0x8Fb3D4a94D0aA5D6EDaAC3Ed82B59a27f56d923a',
      oracleSource: 'oracleEth',
    },
    {
      chain: ChainNames.base,
      marketName: 'Main Market',
      birthday: 1713312000, // Wed Apr 17 2024 00:00:00 GMT+0000
      comptroller: '0x05c9C6417F246600f8f5f49fcA9Ee991bfF73D13',
      oracleSource: 'oracleEth',
    },
    {
      chain: ChainNames.optimism,
      marketName: 'Main Market',
      birthday: 1718928000, // Fri Jun 21 2024 00:00:00 GMT+0000
      comptroller: '0xafb4a254d125b0395610fdc8f1d022936c7b166b',
      oracleSource: 'oracleEth',
    },
    {
      chain: ChainNames.bob,
      marketName: 'Main Market',
      birthday: 1720483200, // Tue Jul 09 2024 00:00:00 GMT+0000
      comptroller: '0x9cFEe81970AA10CC593B83fB96eAA9880a6DF715',
      oracleSource: 'oracleEth',
    },
    {
      chain: ChainNames.fraxtal,
      marketName: 'Main Market',
      birthday: 1722988800, // Wed Aug 07 2024 00:00:00 GMT+0000
      comptroller: '0xB5141403e811fFFE02f4d49Ea8d4a7B0b9590658',
      oracleSource: 'oracleEth',
    },
    {
      chain: ChainNames.lisk,
      marketName: 'Main Market',
      birthday: 1727740800, // Wed Aug 07 2024 00:00:00 GMT+0000
      comptroller: '0xF448A36feFb223B8E46e36FF12091baBa97bdF60',
      oracleSource: 'oracleEth',
    },
  ],
};
