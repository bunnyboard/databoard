import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LooksrareProtocolConfig extends ProtocolConfig {
  chain: string;
  exchangeV1: string;
  exchangeV2: string;
}

export const LooksrareConfigs: LooksrareProtocolConfig = {
  protocol: ProtocolNames.looksrare,
  birthday: 1640649600, // Tue Dec 28 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  exchangeV1: '0x59728544b08ab483533076417fbbb2fd0b17ce3a',
  exchangeV2: '0x0000000000e655fae4d56241588680f86e3b2377',
};
