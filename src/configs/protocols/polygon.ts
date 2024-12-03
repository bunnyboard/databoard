import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface PolygonBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  bridgeERC20: string;
  bridgeEther: string;
  bridgePlasmaDeposit: string;
  bridgePlasmaWithdraw: string;
  supportedTokens: Array<string>;
}

export const PolygonNativeBridgeConfigs: PolygonBridgeProtocolConfig = {
  protocol: ProtocolNames.polygonNativeBridge,
  birthday: 1590969600, // Mon Jun 01 2020 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.polygon,
  bridgeERC20: '0x40ec5b33f54e0e8a33a975908c5ba1c14e5bbbdf',
  bridgeEther: '0x8484ef722627bf18ca5ae6bcf031c23e6e922b30',
  bridgePlasmaDeposit: '0x401F6c983eA34274ec46f84D70b31C151321188b',
  bridgePlasmaWithdraw: '0x2a88696e0ffa76baa1338f2c74497cc013495922',
  supportedTokens: [
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0x3F382DbD960E3a9bbCeaE22651E88158d2791550',
    '0xb6ee9668771a79be7967ee29a63d4184f8097143',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0xb683d83a532e2cb7dfa5275eed3698436371cc9f',
    '0xe0bceef36f3a6efdd5eebfacd591423f8549b9d5',
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    '0xC4C2614E694cF534D407Ee49F8E44D125E4681c4',
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181',
    '0xe939f011a3d8fc0aa874c97e8156053a903d7176',
    '0x94e496474f1725f1c1824cb5bdb92d7691a4f03a',
    '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3',
    '0x2a7cad775fd9c5c43f996a948660ffc21b4e628c',
    '0x340d2bde5eb28c1eed91b2f790723e3b160613b7',
    '0xf17a3fe536f8f7847f1385ec1bc967b2ca9cae8d',
    '0xc477d038d5420c6a9e0b031712f61c5120090de9',
    '0x31429d1856ad1377a8a0079410b297e1a9e214c2',
    '0x38b0e3a59183814957d83df2a97492aed1f003e2',
    '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',
    '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
    '0x888888435fde8e7d4c54cab67f206e4199454c60',
    '0x8290333cef9e6d528dd5618fb97a76f268f3edd4',
    '0x73ee6d7e6b203125add89320e9f343d65ec7c39a',
    '0xee4458e052b533b1aabd493b5f8c4d85d7b263dc',
    '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
    '0xE7f58A92476056627f9FdB92286778aBd83b285F',
    '0x4d224452801aced8b2f0aebe155379bb5d594381',
    '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    '0x111111111117dc0aa78b770fa6a738034120c302',
    '0x431ad2ff6a9c365805ebad47ee021148d6f7dbe0',
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    '0x9469d013805bffb7d3debe5e7839237e535ec483',
    '0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9',
    '0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
    '0xfb7b4564402e5500db5bb6d63ae671302777c75a',
    '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',
    '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
    '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x0b38210ea11411557c13457D4dA7dC6ea731B88a',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
    '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
  ],
};

export interface PolygonZkevmBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  bridge: string;
  layer2Chain: string;
  supportedTokens: Array<string>;
}

export const PolygonZkevmNativeBridgeConfigs: PolygonZkevmBridgeProtocolConfig = {
  protocol: ProtocolNames.polygonzkevmNativeBridge,
  birthday: 1679702400, // Sat Mar 25 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.polygonzkevm,
  bridge: '0x2a3DD3EB832aF982ec71669E178424b10Dca2EDe',
  supportedTokens: [
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0x3F382DbD960E3a9bbCeaE22651E88158d2791550',
    '0xb6ee9668771a79be7967ee29a63d4184f8097143',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0xb683d83a532e2cb7dfa5275eed3698436371cc9f',
    '0xe0bceef36f3a6efdd5eebfacd591423f8549b9d5',
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    '0xC4C2614E694cF534D407Ee49F8E44D125E4681c4',
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0x6b0b3a982b4634ac68dd83a4dbf02311ce324181',
    '0xe939f011a3d8fc0aa874c97e8156053a903d7176',
    '0x94e496474f1725f1c1824cb5bdb92d7691a4f03a',
    '0x761d38e5ddf6ccf6cf7c55759d5210750b5d60f3',
    '0x2a7cad775fd9c5c43f996a948660ffc21b4e628c',
    '0x340d2bde5eb28c1eed91b2f790723e3b160613b7',
    '0xf17a3fe536f8f7847f1385ec1bc967b2ca9cae8d',
    '0xc477d038d5420c6a9e0b031712f61c5120090de9',
    '0x31429d1856ad1377a8a0079410b297e1a9e214c2',
    '0x38b0e3a59183814957d83df2a97492aed1f003e2',
    '0xca1207647Ff814039530D7d35df0e1Dd2e91Fa84',
    '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
    '0x888888435fde8e7d4c54cab67f206e4199454c60',
    '0x8290333cef9e6d528dd5618fb97a76f268f3edd4',
    '0x73ee6d7e6b203125add89320e9f343d65ec7c39a',
    '0xee4458e052b533b1aabd493b5f8c4d85d7b263dc',
    '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
    '0xE7f58A92476056627f9FdB92286778aBd83b285F',
    '0x4d224452801aced8b2f0aebe155379bb5d594381',
    '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    '0x111111111117dc0aa78b770fa6a738034120c302',
    '0x431ad2ff6a9c365805ebad47ee021148d6f7dbe0',
    '0x4e3fbd56cd56c3e72c1403e103b45db9da5b9d2b',
    '0x9469d013805bffb7d3debe5e7839237e535ec483',
    '0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9',
    '0xb6ed7644c69416d67b522e20bc294a9a9b405b31',
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
    '0xfb7b4564402e5500db5bb6d63ae671302777c75a',
    '0xbb0e17ef65f82ab018d8edd776e8dd940327b28b',
    '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
    '0x455e53CBB86018Ac2B8092FdCd39d8444aFFC3F6',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x0b38210ea11411557c13457D4dA7dC6ea731B88a',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
    '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0xB8c77482e45F1F44dE1745F52C74426C631bDD52',
    '0xd2ba23de8a19316a638dc1e7a9adda1d74233368',
    '0x75231f58b43240c9718dd58b4967c5114342a86c',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
  ],
};
