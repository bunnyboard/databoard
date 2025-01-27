import { ChainNames, ProtocolNames } from '../names';
import { ZksyncBridgeTokens, ZksyncNativeBridgeProtocolConfig } from './zksync';

export const AbstractNativeBridgeConfigs: ZksyncNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.abstractNativeBridge,
  birthday: 1737936000, // Mon Jan 27 2025 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.abstract,
  layer2ChainId: 2741,
  shareBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
  tokens: ZksyncBridgeTokens,
};
