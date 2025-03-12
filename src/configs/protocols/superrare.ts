import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SuperrareProtocolConfig extends ProtocolConfig {
  chain: string;
  marketplace: string;
}

export const SuperrareConfigs: SuperrareProtocolConfig = {
  protocol: ProtocolNames.superrare,
  birthday: 1644364800, // Wed Feb 09 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  marketplace: '0x6d7c44773c52d396f43c2d511b81aa168e9a7a42',
};
