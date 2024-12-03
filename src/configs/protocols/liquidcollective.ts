import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LiquidCollectiveProtocolConfig extends ProtocolConfig {
  chain: string;
  lsETH: string;
  protocolFeeRate: number;
}
export const LiquidCollectiveConfigs: LiquidCollectiveProtocolConfig = {
  protocol: ProtocolNames.liquidcollective,
  birthday: 1664928000, // Wed Oct 05 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  lsETH: '0x8c1BEd5b9a0928467c9B1341Da1D7BD5e10b6549',
  protocolFeeRate: 0.1, // 10%
};
