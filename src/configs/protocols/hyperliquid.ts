import { ProtocolConfig, Token } from '../../types/base';
import { TokensBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';

export interface HyperLiquidBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  bridge2: string;
  USDC: Token;
}

export const HyperLiquidNativeBridgeConfigs: HyperLiquidBridgeProtocolConfig = {
  protocol: ProtocolNames.hyperliquidNativeBridge,
  birthday: 1701475200, // Sat Dec 02 2023 00:00:00 GMT+0000
  chain: ChainNames.arbitrum,
  layer2Chain: ChainNames.hyperliquid,
  bridge2: '0x2df1c51e09aecf9cacb7bc98cb1742757f163df7',
  USDC: TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
};
