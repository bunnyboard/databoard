import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const UnichainNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.unichainNativeBridge,
  birthday: 1730764800, // Tue Nov 05 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.unichain,
  optimismPortal: '0x0bd48f6B86a26D3a217d0Fa6FfE2B491B956A7a2',
  optimismGateway: '0x81014F44b0a345033bB2b3B21C7a1A308B35fEeA',
  supportedTokens: OptimismSuperchainTokens,
};
