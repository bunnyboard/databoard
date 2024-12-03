import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const AevoNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.aevoNativeBridge,
  birthday: 1679270400, // Mon Mar 20 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.aevo,
  optimismPortal: '0x787A0ACaB02437c60Aafb1a29167A3609801e320',
  optimismGateway: '0x4082C9647c098a6493fb499EaE63b5ce3259c574',
  supportedTokens: OptimismSuperchainTokens,
};
