import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface RocketpoolProtocolConfig extends ProtocolConfig {
  chain: string;
  rETH: string;
  rocketStorage: string;
}

export const RocketpoolConfigs: RocketpoolProtocolConfig = {
  protocol: ProtocolNames.rocketpool,
  birthday: 1635897600, // Wed Nov 03 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  rETH: '0xae78736cd615f374d3085123a210448e74fc6393',
  rocketStorage: '0x1d8f8f00cfa6758d7bE78336684788Fb0ee0Fa46',
};
