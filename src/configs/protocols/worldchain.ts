import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const WorldchainativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.worldchainNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1719446400, // Thu Jun 27 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.worldchain,
  optimismPortal: '0xd5ec14a83B7d95BE1E2Ac12523e2dEE12Cbeea6C',
  optimismGateway: '0x470458C91978D2d929704489Ad730DC3E3001113',
  supportedTokens: OptimismSuperchainTokens,
};
