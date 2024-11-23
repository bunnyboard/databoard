import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const ShapeNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.shapeNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1721779200, // Wed Jul 24 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.shape,
  optimismPortal: '0xEB06fFa16011B5628BaB98E29776361c83741dd3',
  optimismGateway: '0x62Edd5f4930Ea92dCa3fB81689bDD9b9d076b57B',
  supportedTokens: OptimismSuperchainTokens,
};
