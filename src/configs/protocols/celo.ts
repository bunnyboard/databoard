import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const CeloNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.celoNativeBridge,
  birthday: 1742947200, // Wed Mar 26 2025 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.celo,
  optimismPortal: '0xc5c5D157928BDBD2ACf6d0777626b6C75a9EAEDC',
  optimismGateway: '0x9C4955b92F34148dbcfDCD82e9c9eCe5CF2badfe',
  supportedTokens: OptimismSuperchainTokens,
};
