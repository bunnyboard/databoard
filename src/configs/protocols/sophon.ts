import { ChainNames, ProtocolNames } from '../names';
import { ZksyncBridgeTokens, ZksyncNativeBridgeProtocolConfig } from './zksync';

export const SophonNativeBridgeConfigs: ZksyncNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.sophonNativeBridge,
  birthday: 1734480000, // Wed Dec 18 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.sophon,
  layer2ChainId: 50104,
  shareBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
  tokens: ZksyncBridgeTokens,
};
