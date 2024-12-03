import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface DineroProtocolConfig extends ProtocolConfig {
  chain: string;
  pxETH: string;
  apxETH: string;
  protocolFeeRate: number;
}

export const DineroConfigs: DineroProtocolConfig = {
  protocol: ProtocolNames.dinero,
  birthday: 1702339200, // Tue Dec 12 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  pxETH: '0x04C154b66CB340F3Ae24111CC767e0184Ed00Cc6',
  apxETH: '0x9ba021b0a9b958b5e75ce9f6dff97c7ee52cb3e6',
  protocolFeeRate: 0.1, // 10%
};
