import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const InkNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.inkNativeBridge,
  birthday: 1733529600, // Sat Dec 07 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.ink,
  optimismPortal: '0x5d66c1782664115999c47c9fa5cd031f495d3e4f',
  optimismGateway: '0x88ff1e5b602916615391f55854588efcbb7663f0',
  supportedTokens: OptimismSuperchainTokens,
};
