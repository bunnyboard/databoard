import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const SoneiumNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.soneiumNativeBridge,
  birthday: 1700092800, // Thu Nov 16 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.soneium,
  optimismPortal: '0x88e529a6ccd302c948689cd5156c83d4614fae92',
  optimismGateway: '0xeb9bf100225c214efc3e7c651ebbadcf85177607',
  supportedTokens: OptimismSuperchainTokens,
};
