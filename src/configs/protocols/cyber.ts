import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const CyberNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.cyberNativeBridge,
  birthday: 1713484800, // Fri Apr 19 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.cyber,
  optimismPortal: '0x1d59bc9fcE6B8E2B1bf86D4777289FFd83D24C99',
  optimismGateway: '0x12a580c05466eefb2c467C6b115844cDaF55B255',
  supportedTokens: OptimismSuperchainTokens,
};
