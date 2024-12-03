import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const ZircuitNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.zircuitNativeBridge,
  birthday: 1719964800, // Wed Jul 03 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.zircuit,
  optimismPortal: '0x17bfAfA932d2e23Bd9B909Fd5B4D2e2a27043fb1',
  optimismGateway: '0x386B76D9cA5F5Fb150B6BFB35CF5379B22B26dd8',
  supportedTokens: [...OptimismSuperchainTokens, '0xfd418e42783382E86Ae91e445406600Ba144D162'],
};
