import { ChainNames, ProtocolNames } from '../names';
import { LooksrareProtocolConfig } from './looksrare';

// the same as Looksrare exchange v1
export const JoepegsConfigs: LooksrareProtocolConfig = {
  protocol: ProtocolNames.joepegs,
  birthday: 1651276800, // Sat Apr 30 2022 00:00:00 GMT+0000
  chain: ChainNames.avalanche,
  exchangeV1: '0xae079eda901f7727d0715aff8f82ba8295719977',
};
