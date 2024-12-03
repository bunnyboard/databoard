import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LineaNativeBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  messageServiceL1: string;
  messageServiceL2: string;
  tokenBridge: string;
  supportedTokens: Array<string>;
}

export const LineaNativeBridgeConfigs: LineaNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.lineaNativeBridge,
  birthday: 1689206400, // Thu Jul 13 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.linea,
  messageServiceL1: '0xd19d4b5d358258f05d7b411e21a1460d11b0876f',
  messageServiceL2: '0x508Ca82Df566dCD1B0DE8296e70a96332cD644ec',
  tokenBridge: '0x051F1D88f0aF5763fB888eC4378b4D8B29ea3319',
  supportedTokens: [
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x4aa41bc1649c9c3177ed16caaa11482295fc7441',
    '0x5f98805a4e8be255a32880fdec7f6728c6568ba0',
    '0xd38bb40815d2b0c2d2c866e0c72c5728ffc76dd9',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0xf655c8567e0f213e6c634cd2a68d992152161dc6',
    '0x3e5d9d8a63cc8a88748f229999cf59487e90721e',
    '0x95ad61b0a150d79219dcf64e1e6cc01f0b64c4ce',
    '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202',
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
  ],
};
