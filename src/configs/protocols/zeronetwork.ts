import { ChainNames, ProtocolNames } from '../names';
import { ZksyncBridgeTokens, ZksyncNativeBridgeProtocolConfig } from './zksync';

export const ZeroNetworkNativeBridgeConfigs: ZksyncNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.zeronetworkNativeBridge,
  birthday: 1729728000, // Thu Oct 24 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.zeronetwork,
  layer2ChainId: 543210,
  shareBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
  tokens: ZksyncBridgeTokens,
};
