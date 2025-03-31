import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const HemiNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.hemiNativeBridge,
  birthday: 1725926400, // Tue Sep 10 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.hemi,
  optimismPortal: '0x39a0005415256B9863aFE2d55Edcf75ECc3A4D7e',
  optimismGateway: '0x5eaa10F99e7e6D177eF9F74E519E319aa49f191e',
  supportedTokens: OptimismSuperchainTokens,
};
