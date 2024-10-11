import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const ModeNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.modeNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1700179200, // Fri Nov 17 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.mode,
  optimismPortal: '0x8B34b14c7c7123459Cf3076b8Cb929BE097d0C07',
  optimismGateway: '0x735aDBbE72226BD52e818E7181953f42E3b0FF21',
  supportedTokens: OptimismSuperchainTokens,
};
