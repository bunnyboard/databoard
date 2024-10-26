import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ZksyncNativeBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  shareBridge: string;
  tokens: Array<string>;
}

export const ZksyncNativeBridgeConfigs: ZksyncNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.zksyncNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1717545600, // Wed Jun 05 2024 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.zksync,
  shareBridge: '0xD7f9f54194C633F36CCD5F3da84ad4a1c38cB2cB',
  tokens: [
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x9D14BcE1dADdf408d77295BB1be9b343814f44DE',
    '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xa0b73e1ff0b80914ab6fe0444e65848c4c34450b',
    '0xf9c53268e9de692ae1b2ea5216e24e1c3ad7cb1e',
    '0xa49d7499271ae71cd8ab9ac515e6694c755d400c',
    '0xae78736cd615f374d3085123a210448e74fc6393',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
    '0xeeaa40b28a2d1b0b08f6f97bb1dd4b75316c6107',
    '0x6982508145454ce325ddbe47a25d4ec3d2311933',
    '0xd38bb40815d2b0c2d2c866e0c72c5728ffc76dd9',
    '0xb64ef51c888972c908cfacf59b47c1afbc0ab8ac',
    '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    '0xd31a59c85ae9d8edefec411d448f90841571b89c',
    '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    '0x582d872a1b094fc48f5de31d3b73f2d9be47def1',
    '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
    '0x111111111117dc0aa78b770fa6a738034120c302',
    '0x163f8c2467924be0ae7b5347228cabf260318753',
    '0x18084fba666a33d37592fa2633fd49a74dd93a88',
    '0x7448c7456a97769f6cd04f1e83a4a23ccdc46abd',
    '0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
    '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
    '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
    '0x62D0A8458eD7719FDAF978fe5929C6D342B0bFcE',
    '0x4691937a7508860f876c9c0a2a617e7d9e945d4b',
    '0x4e15361fd6b4bb609fa63c81a2be19d873717870',
    '0xbC396689893D065F41bc2C6EcbeE5e0085233447',
    '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
    '0x967da4048cD07aB37855c090aAF366e4ce1b9F48',
    '0x6de037ef9ad2725eb40118bb1702ebb27e4aeb24',
    '0xd33526068d116ce69f19a9ee46f0bd304f21a51f',
    '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
    '0xf951E335afb289353dc249e82926178EaC7DEd78',
  ],
};
