import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';

export const BenqiConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.benqi,
  category: ProtocolCategories.lending,
  birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.avalanche,
      marketName: 'Core Market',
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      comptroller: '0x486Af39519B4Dc9a7fCcd318217352830E8AD9b4',
      oracleSource: 'oracleUsd',
      cTokenMappings: {
        '0x5c0401e81bc07ca70fad469b451682c0d747ef1c': {
          chain: 'avalanche',
          address: '0x0000000000000000000000000000000000000000',
          symbol: 'AVAX',
          decimals: 18,
        },
      },
    },
    {
      chain: ChainNames.avalanche,
      marketName: 'Avalanche Ecosystem Market',
      birthday: 1721088000, // Tue Jul 16 2024 00:00:00 GMT+0000
      comptroller: '0xD7c4006d33DA2A0A8525791ed212bbCD7Aca763F',
      oracleSource: 'oracleUsd',
    },
  ],
};
