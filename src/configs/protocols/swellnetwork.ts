import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SwethProtocolConfig extends ProtocolConfig {
  chain: string;
  birthday: number;
  address: string;
  protocolFeeRate: number;
}

export const SwethConfigs: SwethProtocolConfig = {
  protocol: ProtocolNames.sweth,
  category: ProtocolCategories.liquidStaking,
  birthday: 1681344000, // Thu Apr 13 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  // https://docs.swellnetwork.io/swell-staking/sweth-liquid-staking/sweth-v1.0-system-design/rewards-and-distribution/liquid-staking-rewards-and-fees
  protocolFeeRate: 0.1, // 10%
  address: '0xf951e335afb289353dc249e82926178eac7ded78',
};
