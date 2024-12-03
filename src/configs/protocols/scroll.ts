import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ScrollGatewayConfig {
  gateway: string;
  supportedTokens: Array<string>;
}

export interface ScrollBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  messengerProxy: string;
  ethGateway: string;
  erc20Gateways: Array<ScrollGatewayConfig>;
}

export const ScrollNativeBridgeConfigs: ScrollBridgeProtocolConfig = {
  protocol: ProtocolNames.scrollNativeBridge,
  birthday: 1696809600, // Mon Oct 09 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.scroll,
  messengerProxy: '0x6774bcbd5cecef1336b5300fb5186a12ddd8b367',
  ethGateway: '0x7F2b8C31F88B6006c382775eea88297Ec1e3E905',
  erc20Gateways: [
    {
      gateway: '0xD8A791fE2bE73eb6E6cF1eb0cb3F36adC9B3F8f9',
      supportedTokens: [
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
        '0xae78736cd615f374d3085123a210448e74fc6393',
        '0xd38bb40815d2b0c2d2c866e0c72c5728ffc76dd9',
        '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
        '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
        '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
        '0x7122985656e38bdc0302db86685bb972b145bd3c',
        '0xD533a949740bb3306d119CC777fa900bA034cd52',
        '0xba100000625a3754423978a60c9317c58a424e3d',
        '0xf655c8567e0f213e6c634cd2a68d992152161dc6',
      ],
    },
    {
      gateway: '0xa033ff09f2da45f0e9ae495f525363722df42b2a',
      supportedTokens: ['0xd9a442856c234a39a81a089c06451ebaa4306a72'],
    },
    {
      gateway: '0x6625c6332c9f91f2d27c304e729b86db87a3f504',
      supportedTokens: ['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    },
    {
      gateway: '0x67260a8b73c5b77b55c1805218a42a7a6f98f515',
      supportedTokens: ['0x6b175474e89094c44da98b954eedeac495271d0f'],
    },
    {
      gateway: '0xf1af3b23de0a5ca3cab7261cb0061c0d779a5c7b',
      supportedTokens: ['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
  ],
};
