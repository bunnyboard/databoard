import { ChainNames, ProtocolNames } from '../names';
import { ZksyncBridgeTokens, ZksyncNativeBridgeProtocolConfig } from './zksync';

export const TreasureNativeBridgeConfigs: ZksyncNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.treasureNativeBridge,
  birthday: 1732665600, // Wed Nov 27 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.treasure,
  layer2ChainId: 61166,
  shareBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
  tokens: ZksyncBridgeTokens,
};
