import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const KromaNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.kromaNativeBridge,
  birthday: 1693958400, // Wed Sep 06 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.kroma,
  optimismPortal: '0x31F648572b67e60Ec6eb8E197E1848CC5F5558de',
  optimismGateway: '0x827962404D7104202C5aaa6b929115C8211d9596',
  supportedTokens: OptimismSuperchainTokens,
};
