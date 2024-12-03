import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const ZoraNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.zoraNativeBridge,
  birthday: 1686700800, // Wed Jun 14 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.zora,
  optimismPortal: '0x1a0ad011913A150f69f6A19DF447A0CfD9551054',
  optimismGateway: '0x3e2ea9b92b7e48a52296fd261dc26fd995284631',
  supportedTokens: OptimismSuperchainTokens,
};
