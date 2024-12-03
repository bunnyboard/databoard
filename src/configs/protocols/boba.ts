import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const BobaNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.bobaNativeBridge,
  birthday: 1628812800, // Fri Aug 13 2021 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.boba,
  optimismPortal: '0x7b02d13904d8e6e0f0efaf756ab14cb0ff21ee7e',
  optimismGateway: '0xdc1664458d2f0b6090bea60a8793a4e66c2f1c00',
  supportedTokens: [...OptimismSuperchainTokens, '0x42bbfa2e77757c645eeaad1655e0911a7553efbc'],
};
