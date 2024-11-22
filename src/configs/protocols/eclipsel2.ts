import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EclipseL2BridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  treasury: string;
}

export const EclipseL2NativeConfigs: EclipseL2BridgeProtocolConfig = {
  protocol: ProtocolNames.eclipsel2NativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1722211200, // Mon Jul 29 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.eclipsel2,
  treasury: '0xd7e4b67e735733ac98a88f13d087d8aac670e644',
};
