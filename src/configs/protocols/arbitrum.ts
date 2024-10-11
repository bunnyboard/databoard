import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ArbitrumBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  bridge: string;
  erc20Gateways: Array<string>;
  supportedTokens: Array<string>;
}

export const ArbitrumNativeBridgeConfigs: ArbitrumBridgeProtocolConfig = {
  protocol: ProtocolNames.arbitrumNativeBridge,
  category: ProtocolCategories.bridge,
  birthday: 1661472000, // Fri Aug 26 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.arbitrum,
  bridge: '0x8315177ab297ba92a06054ce80a67ed4dbd7ed3a',
  erc20Gateways: ['0xa3a7b6f88361f48403514059f1f16c8e78d60eec', '0xcee284f754e854890e311e3280b767f80797180d'],
  supportedTokens: [
    '0x52a8845df664d76c69d2eea607cd793565af42b8',
    '0x514910771af9ca656af840dff83e8264ecf986ca',
    '0x584bC13c7D411c00c01A62e8019472dE68768430',
    '0xf939E0A03FB07F59A73314E73794Be0E57ac1b4E',
    '0xeec2be5c91ae7f8a338e1e5f3b5de49d07afdc81',
    '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
    '0x865377367054516e17014ccded1e7d814edc9ce4',
    '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
    '0xe72b141df173b999ae7c1adcbf60cc9833ce56a8',
    '0xc770eefad204b5180df6a14ee197d99d808ee52d',
    '0xba100000625a3754423978a60c9317c58a424e3d',
    '0x43Dfc4159D86F3A37A5A4B3D4580b888ad7d4DDd',
    '0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f',
    '0xeeaa40b28a2d1b0b08f6f97bb1dd4b75316c6107',
    '0x6c6ee5e31d828de241282b9606c8e98ea48526e2',
    '0xa487bf43cf3b10dffc97a9a744cbb7036965d3b9',
    '0xf17a3fe536f8f7847f1385ec1bc967b2ca9cae8d',
    '0x9469d013805bffb7d3debe5e7839237e535ec483',
    '0xc0f9bd5fa5698b6505f643900ffa515ea5df54a9',
    '0xde30da39c46104798bb5aa3fe8b9e0e1f348163f',
    '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
    '0x785c34312dfa6b74f6f1829f79ade39042222168',
    '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
    '0xba3335588d9403515223f109edc4eb7269a9ab5d',
    '0xc944e90c64b2c07662a292be6244bdf05cda44a7',
    '0x43044f861ec040db59a7e324c40507addb673142',
    '0x0391D2021f89DC339F60Fff84546EA23E337750f',
    '0x4f9254c83eb525f9fcf346490bbb3ed28a81c667',
    '0x853d955acef822db058eb8505911ed77f175b99e',
    '0xdac17f958d2ee523a2206206994597c13d831ec7',
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    '0x57b946008913b82e4df85f501cbaed910e58d26c',
    '0x4e352cF164E64ADCBad318C3a1e222E9EBa4Ce42',
    '0x0ff5a8451a839f5f0bb3562689d9a44089738d11',
    '0xeabb8996ea1662cad2f7fb715127852cd3262ae9',
    '0x431ad2ff6a9c365805ebad47ee021148d6f7dbe0',
    '0x6b175474e89094c44da98b954eedeac495271d0f',
  ],
};
