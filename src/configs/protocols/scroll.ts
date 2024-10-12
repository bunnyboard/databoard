import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ScrollBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  messengerProxy: string;
  ethGateway: string;
  erc20Gateway: string;
  supportedTokens: Array<string>;
}

export const ScrollNativeBridgeConfigs: ScrollBridgeProtocolConfig = {
  protocol: ProtocolNames.scrollNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1696809600, // Mon Oct 09 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.scroll,
  messengerProxy: '0x6774bcbd5cecef1336b5300fb5186a12ddd8b367',
  ethGateway: '0x7F2b8C31F88B6006c382775eea88297Ec1e3E905',
  erc20Gateway: '0xD8A791fE2bE73eb6E6cF1eb0cb3F36adC9B3F8f9',
  supportedTokens: [
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
    '0xae78736cd615f374d3085123a210448e74fc6393',
    '0xd38bb40815d2b0c2d2c866e0c72c5728ffc76dd9',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x88df592f8eb5d7bd38bfef7deb0fbc02cf3778a0',
    '0xdeFA4e8a7bcBA345F687a2f1456F5Edd9CE97202',
    '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
    '0x7122985656e38bdc0302db86685bb972b145bd3c',
    '0xD533a949740bb3306d119CC777fa900bA034cd52',
    '0xba100000625a3754423978a60c9317c58a424e3d',
  ],
};
