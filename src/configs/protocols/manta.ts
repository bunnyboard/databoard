import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export const MantaNativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.mantaNativeBridge,
  birthday: 1694304000, // Sun Sep 10 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.manta,
  optimismPortal: '0x9168765EE952de7C6f8fC6FaD5Ec209B960b7622',
  optimismGateway: '0x3B95bC951EE0f553ba487327278cAc44f29715E5',
  supportedTokens: OptimismSuperchainTokens,
};
