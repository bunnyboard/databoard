import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const LfjlendConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.lfjlend,
  birthday: 1633910400, // Mon Oct 11 2021 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.avalanche,
      marketName: 'Core Market',
      birthday: 1633910400, // Mon Oct 11 2021 00:00:00 GMT+0000
      comptroller: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC',
      oracleSource: 'oracleUsd',
    },
  ],
};
