import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const MetisNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.metisNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1637107200, // Wed Nov 17 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.metis,
  optimismPortal: '0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b',
  optimismGateway: '0x3980c9ed79d2c191A89E02Fa3529C60eD6e9c04b',
  supportedTokens: OptimismSuperchainTokens,
};
