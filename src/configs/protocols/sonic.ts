import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SonicNativeBridgeProtocolConfig extends ProtocolConfig {
  sourceChain: string;
  destChain: string;
  bridge: string;
  tokens: Array<string>;
}

// bridge from ethereum -> sonic
export const SonicNativeBridgeConfigs: SonicNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.sonicNativeBridge,
  birthday: 1734739200, // Sat Dec 21 2024 00:00:00 GMT+0000
  sourceChain: ChainNames.ethereum,
  destChain: ChainNames.sonic,
  bridge: '0xa1E2481a9CD0Cb0447EeB1cbc26F1b3fff3bec20',
  tokens: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
    '0x1aBaEA1f7C830bD89Acc67eC4af516284b1bC33c',
  ],
};
