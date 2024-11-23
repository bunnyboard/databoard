import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const DbkchainNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.dbkchainNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1717545600, // Wed Jun 05 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.dbkchain,
  optimismPortal: '0x63CA00232F471bE2A3Bf3C4e95Bc1d2B3EA5DB92',
  optimismGateway: '0x28f1b9F457CB51E0af56dff1d11CD6CEdFfD1977',
  supportedTokens: OptimismSuperchainTokens,
};
