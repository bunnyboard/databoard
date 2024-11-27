import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface KintoBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  bridge: string; // hold locked ETH
  gateway: string; // deposit/withdraw ETH and ERC20
}

export const KintoNativeBridgeConfigs: KintoBridgeProtocolConfig = {
  protocol: ProtocolNames.kintoNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1661472000, // Fri Aug 26 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.kinto,
  bridge: '0x859a53Fe2C8DA961387030E7CB498D6D20d0B2DB',
  gateway: '0x0f1b7bd7762662B23486320AA91F30312184f70C',
};
