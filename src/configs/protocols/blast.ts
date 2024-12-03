import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export interface BlastBridgeProtocolConfig extends OptimismBridgeProtocolConfig {
  ethYieldManager: string;
  usdYieldManager: string;

  // legacy bridger version
  blastBridge: string;
}

export const BlastNativeBridgeConfigs: BlastBridgeProtocolConfig = {
  protocol: ProtocolNames.blastNativeBridge,
  birthday: 1708819200, // Sun Feb 25 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.blast,
  optimismPortal: '0x0Ec68c5B10F21EFFb74f2A5C61DFe6b08C0Db6Cb',
  optimismGateway: '0x697402166Fbf2F22E970df8a6486Ef171dbfc524',
  blastBridge: '0x3a05E5d33d7Ab3864D53aaEc93c8301C1Fa49115',
  ethYieldManager: '0x98078db053902644191f93988341E31289E1C8FE',
  usdYieldManager: '0xa230285d5683C74935aD14c446e137c8c8828438',
  supportedTokens: OptimismSuperchainTokens,
};
