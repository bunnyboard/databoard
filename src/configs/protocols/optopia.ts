import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const OptopiaNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.optopiaNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1715385600, // Sat May 11 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.optopia,
  optimismPortal: '0x39A90926306E11497EC5FE1C459910258B620edD',
  optimismGateway: '0x1adE86B9cc8a50Db747b7aaC32E8527d42c71fC1',
  supportedTokens: OptimismSuperchainTokens,
};
