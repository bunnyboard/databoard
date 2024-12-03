import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MorphL2BridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  crossDomainMessage: string;
  ethGateway: string;
  erc20Gateways: Array<string>;
  supportedTokens: Array<string>;
}

export const MorphL2NativeBridgeConfigs: MorphL2BridgeProtocolConfig = {
  protocol: ProtocolNames.morphl2NativeBridge,
  birthday: 1729382400, // Sun Oct 20 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.morphl2,
  crossDomainMessage: '0xdc71366effa760804dcfc3edf87fa2a6f1623304',
  ethGateway: '0x1c1ffb5828c3a48b54e8910f1c75256a498ade68',
  erc20Gateways: [
    '0x788890ba6f105cca373c4ff01055cd34de01877f',
    '0x44c28f61a5c2dd24fc71d7df8e85e18af4ab2bd8',
    '0xa534badd09b4c62b7b1c32c41df310aa17b52ef1',
    '0xc9045350712a1dcc3a74eca18bc985424bbe7535',
  ],
  supportedTokens: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  ],
};
