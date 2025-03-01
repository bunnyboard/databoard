import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface GnosisBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  daiToken: string;
  sdaiToken: string;
  layer2Chain: string;
  xDaiBridge: string;
  omniBridge: string;
  supportedTokens: Array<string>;
}

export const GnosisNativeBridgeConfigs: GnosisBridgeProtocolConfig = {
  protocol: ProtocolNames.gnosisNativeBridge,
  birthday: 1539043200, // Tue Oct 09 2018 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.gnosis,
  daiToken: '0x6b175474e89094c44da98b954eedeac495271d0f',
  sdaiToken: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
  xDaiBridge: '0x4aa42145Aa6Ebf72e164C9bBC74fbD3788045016',
  omniBridge: '0x88ad09518695c6c3712ac10a214be5109a655671',
  supportedTokens: [
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
    '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
    '0xdAC17F958D2ee523a2206206994597C13D831ec7',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    '0xf5581dfefd8fb0e4aec526be659cfab1f8c781da',
    '0xae78736cd615f374d3085123a210448e74fc6393',
    '0xc770eefad204b5180df6a14ee197d99d808ee52d',
    '0x93ed3fbe21207ec2e8f2d3c3de6e058cb73bc04d',
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0x19062190b1925b5b6689d7073fdfc8c2976ef8cb',
    '0x5dd57da40e6866c9fcc34f4b6ddc89f1ba740dfe',
    '0x0E29e5AbbB5FD88e28b2d355774e73BD47dE3bcd',
    '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    '0xe485e2f1bab389c08721b291f6b59780fec83fd7',
    '0xc0f9bd5fa5698b6505f643900ffa515ea5df54a9',
    '0xfd09911130e6930bf87f2b0554c44f400bd80d3e',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
    '0x75231f58b43240c9718dd58b4967c5114342a86c',
    '0xbC396689893D065F41bc2C6EcbeE5e0085233447',
    '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
    '0xe2f2a5c287993345a840db3b0845fbc70f5935a5',
    '0x1494ca1f11d487c2bbe4543e90080aeba4ba3c2b',
    '0x08d967bb0134f2d07f7cfb6e246680c53927dd30',
    '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
    '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
    '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
    '0xdefa4e8a7bcba345f687a2f1456f5edd9ce97202',
    '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
    '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
    '0x0b38210ea11411557c13457D4dA7dC6ea731B88a',
    '0x111111111117dc0aa78b770fa6a738034120c302',
    '0x40D16FC0246aD3160Ccc09B8D0D3A2cD28aE6C2f',
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    '0x3231cb76718cdef2155fc47b5286d82e6eda273f',
    '0x0001A500A6B18995B03f44bb040A5fFc28E45CB0',
    '0x0000000000085d4780B73119b644AE5ecd22b376',
    '0x00a8b738E453fFd858a7edf03bcCfe20412f0Eb0',
    '0x00c83aeCC790e8a4453e5dD3B0B4b3680501a7A7',
    '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
    '0x0bc529c00C6401aEF6D220BE8C6Ea1667F6Ad93e',
    '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
    '0x6810e776880c02933d47db1b9fc05908e5386b96',
    '0xaa7a9ca87d3694b5755f213b5d04094b8d0f0a6f',
    '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
    '0x5afe3855358e112b5647b952709e6165e1c1eeee',
    '0x900db999074d9277c5da2a43f252d74366230da0',
    '0x3e828ac5c480069d4765654fb4b8733b910b13b2',
    '0xadb2437e6f65682b85f814fbc12fec0508a7b1d0',
    '0x0ae055097c6d159879521c384f1d2123d1f195e6',
    '0xd533a949740bb3306d119cc777fa900ba034cd52',
    '0x48c3399719b582dd63eb5aadf12a40b4c3f52fa2',
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    '0xd31a59c85ae9d8edefec411d448f90841571b89c',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
  ],
};
