import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LoopringBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  depositContract: string; // hold bridge ETH and token
  exchangeContract: string; // deposit/withdraw
  supportedTokens: Array<string>;
}

export const LoopringNativeBridgeConfigs: LoopringBridgeProtocolConfig = {
  protocol: ProtocolNames.loopringNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1606348800, // Thu Nov 26 2020 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.loopring,
  depositContract: '0x674bdf20A0F284D710BC40872100128e2d66Bd3f',
  exchangeContract: '0x0BABA1Ad5bE3a5C0a66E7ac838a129Bf948f1eA4',
  supportedTokens: [
    '0xbbbbca6a901c926f240b89eacb641d8aec7aeafd',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0xf57e7e7c23978c3caec3c3548e3d615c346e79ff',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    '0x10dea67478c5f8c5e2d90e5e9b26dbe60c54d800',
    '0x69af81e73a73b40adf4f3d4223cd9b1ece623074',
    '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0xc18360217d8f7ab5e7c516566761ea12ce7f9d72',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0x0f5d2fb29fb7d3cfee444a200298f468908cc942',
    '0x3845badade8e6dff049820680d1f14bd3903a5d0',
    '0xbd9908b0cdd50386f92efcc8e1d71766c2782df0',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    '0xff20817765cb7f73d4bde2e66e067e58d11095c2',
    '0x03ab458634910aad20ef5f1c8ee96f1d6ac54919',
    '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
    '0x6dea81c8171d0ba574754ef6f8b412f2ed88c54d',
    '0xb4efd85c19999d84251304bda99e90b92300bd93',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    '0xf629cbd94d3791c9250152bd8dfbdf380e2a3b9c',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x1a4b46696b2bb4794eb3d4c26f1c55f9170fa4c5',
    '0xe41d2489571d322189246dafa5ebde1f4699f498',
    '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
    '0x0bc529c00c6401aef6d220be8c6ea1667f6ad93e',
    '0x6810e776880c02933d47db1b9fc05908e5386b96',
    '0x6b3595068778dd592e39a122f4f5a5cf09c90fe2',
    '0x4691937a7508860f876c9c0a2a617e7d9e945d4b',
    '0x21bfbda47a0b4b5b1248c767ee49f7caa9b23697',
    '0x1494CA1F11D487c2bBe4543E90080AeBa4BA3C2b',
    '0xEB4C2781e4ebA804CE9a9803C67d0893436bB27D',
    '0x111111111117dC0aa78b770fA6A738034120C302',
    '0xD533a949740bb3306d119CC777fa900bA034cd52',
    '0x467Bccd9d29f223BcE8043b84E8C8B282827790F',
    '0x0D8775F648430679A709E98d2b0Cb6250d2887EF',
  ],
};
