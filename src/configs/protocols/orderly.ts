import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const OrderlyNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.orderlyNativeBridge,
  birthday: 1688947200, // Mon Jul 10 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.orderly,
  optimismPortal: '0x91493a61ab83b62943E6dCAa5475Dd330704Cc84',
  optimismGateway: '0xe07eA0436100918F157DF35D01dCE5c11b16D1F1',
  supportedTokens: OptimismSuperchainTokens,
};
