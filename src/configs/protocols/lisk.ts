import { ProtocolCategories } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const LiskNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.liskNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1714780800, // Sat May 04 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.lisk,
  optimismPortal: '0x26dB93F8b8b4f7016240af62F7730979d353f9A7',
  optimismGateway: '0x2658723Bf70c7667De6B25F99fcce13A16D25d08',
  supportedTokens: OptimismSuperchainTokens,
};
