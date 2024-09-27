import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface FraxEtherProtocolConfig extends ProtocolConfig {
  chain: string;
  frxETH: string;
  sfrxETH: string;
  protocolFeeRate: number;
}

export const FraxEtherConfigs: FraxEtherProtocolConfig = {
  protocol: ProtocolNames.fraxether,
  birthday: 1665100800, // Fri Oct 07 2022 00:00:00 GMT+0000
  category: ProtocolCategories.liquidStaking,
  chain: ChainNames.ethereum,
  frxETH: '0x5e8422345238f34275888049021821e8e08caa1f',
  sfrxETH: '0xac3e018457b222d93114458476f3e3416abbe38f',
  protocolFeeRate: 0.1, // 10%
};
