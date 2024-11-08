import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const MantleNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.mantleNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1687996800, // Thu Jun 29 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.mantle,
  optimismPortal: '0xc54cb22944f2be476e02decfcd7e3e7d3e15a8fb',
  optimismGateway: '0x95fC37A27a2f68e3A647CDc081F0A89bb47c3012',
  supportedTokens: OptimismSuperchainTokens,
};
