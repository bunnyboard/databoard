import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const FraxtalNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.fraxtalNativeBridge,
  birthday: 1706832000, // Fri Feb 02 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.fraxtal,
  optimismPortal: '0x36cb65c1967a0fb0eee11569c51c2f2aa1ca6f6d',
  optimismGateway: '0x34C0bD5877A5Ee7099D0f5688D65F4bB9158BDE2',
  supportedTokens: OptimismSuperchainTokens,
};
