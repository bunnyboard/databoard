import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const DeriveNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.deriveNativeBridge,
  birthday: 1700092800, // Thu Nov 16 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.derive,
  optimismPortal: '0x85eA9c11cf3D4786027F7FD08F4406b15777e5f8',
  optimismGateway: '0x61E44dC0dae6888B5a301887732217d5725B0bFf',
  supportedTokens: OptimismSuperchainTokens,
};
