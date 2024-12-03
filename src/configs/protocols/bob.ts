import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const BobNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.bobNativeBridge,
  birthday: 1712880000, // Fri Apr 12 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.bob,
  optimismPortal: '0x8AdeE124447435fE03e3CD24dF3f4cAE32E65a3E',
  optimismGateway: '0x3F6cE1b36e5120BBc59D0cFe8A5aC8b6464ac1f7',
  supportedTokens: OptimismSuperchainTokens,
};
