import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface X2y2ProtocolConfig extends ProtocolConfig {
  chain: string;
  exchange: string;
  feeManagement: string;
}

export const X2y2Configs: X2y2ProtocolConfig = {
  protocol: ProtocolNames.x2y2,
  birthday: 1644019200, // Sat Feb 05 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  exchange: '0x74312363e45dcaba76c59ec49a7aa8a65a67eed3',
  feeManagement: '0xD823C605807cC5E6Bd6fC0d7e4eEa50d3e2d66cd',
};
