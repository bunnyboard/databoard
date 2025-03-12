import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface JoepegsProtocolConfig extends ProtocolConfig {
  chain: string;
  exchange: string;
}

export const JoepegsConfigs: JoepegsProtocolConfig = {
  protocol: ProtocolNames.joepegs,
  birthday: 1651276800, // Sat Apr 30 2022 00:00:00 GMT+0000
  chain: ChainNames.avalanche,
  exchange: '0xae079eda901f7727d0715aff8f82ba8295719977',
};
