import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig } from './optimism';

export const SuperseedNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.superseedNativeBridge,
  birthday: 1726185600, // Fri Sep 13 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.superseed,
  optimismPortal: '0x2c2150aa5c75A24fB93d4fD2F2a895D618054f07',
  optimismGateway: '0x8b0576E39F1233679109F9b40cFcC2a7E0901Ede',
  supportedTokens: [],
};
