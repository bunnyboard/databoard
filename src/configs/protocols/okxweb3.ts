import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface Okxweb3ChainConfig {
  chain: string;
  birthday: number;
  dexRouters: Array<string>;
  xBridgeRouter: string;
}

export interface Okxweb3ProtocolConfig extends ProtocolConfig {
  chains: Array<Okxweb3ChainConfig>;
}

export const Okxweb3Configs: Okxweb3ProtocolConfig = {
  protocol: ProtocolNames.okxweb3,
  birthday: 1648771200, // Fri Apr 01 2022 00:00:00 GMT+0000
  chains: [
    {
      chain: ChainNames.ethereum,
      birthday: 1648771200, // Fri Apr 01 2022 00:00:00 GMT+0000
      dexRouters: ['0x3b3ae790Df4F312e745D270119c6052904FB6790', '0x7D0CcAa3Fac1e5A943c5168b6CEd828691b46B36'],
      xBridgeRouter: '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1648771200, // Fri Apr 01 2022 00:00:00 GMT+0000
      dexRouters: ['0x9333C74BDd1E118634fE5664ACA7a9710b108Bab'],
      xBridgeRouter: '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1680307200, // Sat Apr 01 2023 00:00:00 GMT+0000
      dexRouters: ['0xb9061E38FeE7d30134F56aEf7117E2F6d1580666'],
      xBridgeRouter: '0x4040bEC373F6e8be2F913324de94A7b9242E5E92',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1655856000, // Wed Jun 22 2022 00:00:00 GMT+0000
      dexRouters: ['0xf332761c673b59B21fF6dfa8adA44d78c12dEF09'],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1648771200, // Fri Apr 01 2022 00:00:00 GMT+0000
      dexRouters: ['0xA748D6573acA135aF68F2635BE60CB80278bd855'],
      xBridgeRouter: '0x89f423567c2648BB828c3997f60c47b54f57Fa6e',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1655856000, // Wed Jun 22 2022 00:00:00 GMT+0000
      dexRouters: ['0xf332761c673b59B21fF6dfa8adA44d78c12dEF09'],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1655856000, // Wed Jun 22 2022 00:00:00 GMT+0000
      dexRouters: ['0xf332761c673b59B21fF6dfa8adA44d78c12dEF09'],
      xBridgeRouter: '0xFc99f58A8974A4bc36e60E2d490Bb8D72899ee9f',
    },
    {
      chain: ChainNames.cronos,
      birthday: 1655856000, // Wed Jun 22 2022 00:00:00 GMT+0000
      dexRouters: [],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
    {
      chain: ChainNames.linea,
      birthday: 1690243200, // Tue Jul 25 2023 00:00:00 GMT+0000
      dexRouters: ['0x6b2C0c7be2048Daa9b5527982C29f48062B34D58'],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1690243200, // Tue Jul 25 2023 00:00:00 GMT+0000
      dexRouters: ['0x6b2C0c7be2048Daa9b5527982C29f48062B34D58'],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
    {
      chain: ChainNames.base,
      birthday: 1691712000, // Fri Aug 11 2023 00:00:00 GMT+0000
      dexRouters: ['0x6b2C0c7be2048Daa9b5527982C29f48062B34D58'],
      xBridgeRouter: '0x5965851f21DAE82eA7C62f87fb7C57172E9F2adD',
    },
    {
      chain: ChainNames.metis,
      birthday: 1706054400, // Wed Jan 24 2024 00:00:00 GMT+0000
      dexRouters: ['0x6b2C0c7be2048Daa9b5527982C29f48062B34D58'],
      xBridgeRouter: '0xa50FD06d2b099a4B06d54177C7d3AB08D3D3F004',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1689897600, // Fri Jul 21 2023 00:00:00 GMT+0000
      dexRouters: ['0x6b2C0c7be2048Daa9b5527982C29f48062B34D58'],
      xBridgeRouter: '0x5965851f21DAE82eA7C62f87fb7C57172E9F2adD',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1698883200, // Thu Nov 02 2023 00:00:00 GMT+0000
      dexRouters: ['0x6b2C0c7be2048Daa9b5527982C29f48062B34D58'],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
    {
      chain: ChainNames.blast,
      birthday: 1710201600, // Tue Mar 12 2024 00:00:00 GMT+0000
      dexRouters: ['0x2E86f54943faFD2cB62958c3deed36C879e3E944'],
      xBridgeRouter: '0xf956d9fa19656d8e5219fd6fa8ba6cb198094138',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1655856000, // Wed Jun 22 2022 00:00:00 GMT+0000
      dexRouters: ['0x1daC23e41Fc8ce857E86fD8C1AE5b6121C67D96d'],
      xBridgeRouter: '0xf956D9FA19656D8e5219fd6fa8bA6cb198094138',
    },
  ],
};
