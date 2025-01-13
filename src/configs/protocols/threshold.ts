import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ThresholdBtcProtocolConfig extends ProtocolConfig {
  chain: string;
  tbtc: string;
  vault: string;
}

export const ThresholdBtcConfigs: ThresholdBtcProtocolConfig = {
  protocol: ProtocolNames.thresholdbtc,
  birthday: 1629244800, // Wed Aug 18 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  tbtc: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
  vault: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
};
