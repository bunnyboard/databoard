import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const RedstoneNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.redstoneNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1712188800, // Thu Apr 04 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.redstone,
  optimismPortal: '0xC7bCb0e8839a28A1cFadd1CF716de9016CdA51ae',
  optimismGateway: '0xc473ca7E02af24c129c2eEf51F2aDf0411c1Df69',
  supportedTokens: OptimismSuperchainTokens,
};
