import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SymbioticFactoryConfig {
  chain: string;
  version: 'default' | 'vault';
  birthday: number;
  factory: string;
}

export interface SymbioticProtocolConfig extends ProtocolConfig {
  factories: Array<SymbioticFactoryConfig>;
}

export const SymbioticConfigs: SymbioticProtocolConfig = {
  protocol: ProtocolNames.symbiotic,
  birthday: 1717459200, // Tue Jun 04 2024 00:00:00 GMT+0000
  factories: [
    {
      chain: ChainNames.ethereum,
      version: 'default',
      birthday: 1717459200, // Tue Jun 04 2024 00:00:00 GMT+0000
      factory: '0x1BC8FCFbE6Aa17e4A7610F51B888f34583D202Ec',
    },
    {
      chain: ChainNames.ethereum,
      version: 'vault',
      birthday: 1736380800, // Thu Jan 09 2025 00:00:00 GMT+0000
      factory: '0xAEb6bdd95c502390db8f52c8909F703E9Af6a346',
    },
  ],
};
