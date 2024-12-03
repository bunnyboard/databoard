import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const BaseNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.baseNativeBridge,
  birthday: 1686873600, // Fri Jun 16 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.base,
  optimismPortal: '0x49048044D57e1C92A77f79988d21Fa8fAF74E97e',
  optimismGateway: '0x3154Cf16ccdb4C6d922629664174b904d80F2C35',
  supportedTokens: OptimismSuperchainTokens,
};
