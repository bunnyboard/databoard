import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface PufferProtocolConfig extends ProtocolConfig {
  chain: string;
  pufETH: string;
}

export const PufferConfigs: PufferProtocolConfig = {
  protocol: ProtocolNames.puffer,
  category: ProtocolCategories.liquidStaking,
  birthday: 1706745600, // Thu Feb 01 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  pufETH: '0xD9A442856C234a39a81a089C06451EBAa4306a72',
};
