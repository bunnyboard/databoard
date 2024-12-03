import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const MintNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.mintNativeBridge,
  birthday: 1715644800, // Tue May 14 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.mint,
  optimismPortal: '0x59625d1FE0Eeb8114a4d13c863978F39b3471781',
  optimismGateway: '0x2b3F201543adF73160bA42E1a5b7750024F30420',
  supportedTokens: OptimismSuperchainTokens,
};
