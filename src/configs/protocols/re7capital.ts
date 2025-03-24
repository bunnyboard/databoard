import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const Re7capitalConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.re7capital,
  birthday: 1706659200, // Wed Jan 31 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1706659200, // Wed Jan 31 2024 00:00:00 GMT+0000
      morphoVaults: [
        '0x78Fc2c2eD1A4cDb5402365934aE5648aDAd094d0',
        '0xE0C98605f279e4D7946d25B75869c69802823763',
        '0x95EeF579155cd2C5510F312c8fA39208c3Be01a8',
        '0xA02F5E93f783baF150Aa1F8b341Ae90fe0a772f7',
        '0x4F460bb11cf958606C69A963B4A17f9DaEEea8b6',
        '0xBE40491F3261Fd42724F1AEb465796eb11c06ddF',
        '0x89D80f5e9BC88d8021b352064ae73F0eAf79EBd8',
        '0x60d715515d4411f7F43e4206dc5d4a3677f0eC78',
        '0xE87ed29896B91421ff43f69257ABF78300e40c7a',
        '0x43fD147d5319B8Cf39a6e57143684Efca9CF3613',
      ],
      eulerVaults: [
        '0xcf47fBe97aaE77B8ABEa5e1F59c9bcb808A8d47d',
        '0x8dDE384022D4dE1D6C67891a8865f551c444dc4C',
        '0xce45EF0414dE3516cAF1BCf937bF7F2Cf67873De',
        '0xAb254591B63138247eCcDF82170Eb64890d36b1B',
        '0xcAd0be6e135C3d2859EA0c872cCD510C962765b7',
        '0xa992d3777282c44ee980E9B0ca9Bd0c0E4f737aF',
        '0x631D8E808f2c4177a8147Eaa39a4F57C47634dE8',
        '0x82c710B9B225B43C0c90f097DB31f5f10a7F86FA',
        '0xea0C048c728578b1510EBDF9b692E8936D6Fbc90',
        '0x67e4e4e73947257Ca62D118E0FBC56D06f11d96F',
        '0xc41252D4F61D25658cD83Cc39942c49776E1B0C5',
        '0xfaCaD9D934F17930d28b93F3C84a13BFAc73347C',
        '0xb2A8bAba27B5D45Db0a4E58275cAf62DEBca7AA2',
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1718064000, // Tue Jun 11 2024 00:00:00 GMT+0000
      morphoVaults: [
        '0xbb819D845b573B5D7C538F5b85057160cfb5f313',
        '0xA2Cac0023a4797b4729Db94783405189a4203AFc',
        '0x12AFDeFb2237a5963e7BAb3e2D46ad0eee70406e',
        '0x80D9964fEb4A507dD697b4437Fc5b25b618CE446',
        '0xB7890CEE6CF4792cdCC13489D36D9d42726ab863',
        '0x6e37C95b43566E538D8C278eb69B00FC717a001b',
        '0x0FaBfEAcedf47e890c50C8120177fff69C6a1d9B',
        '0x74B6EA9BFee07C3756969b0139CFacBBa5845969',
        '0x30B8A2c8E7Fa41e77b54b8FaF45c610e7aD909E3',
        '0x8c3A6B12332a6354805Eb4b72ef619aEdd22BcdD',
        '0xdB90A4e973B7663ce0Ccc32B6FbD37ffb19BfA83',
        '0x00dfDb8C7295a03DCf1ADfF4D21eB5D9D19FB330',
      ],
      eulerVaults: [],
    },
    {
      chain: ChainNames.sonic,
      birthday: 1738540800, // Mon Feb 03 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0xeEb1DC1Ca7ffC5b54aD1cc4c1088Db4E5657Cb6c',
        '0x3D9e5462A940684073EED7e4a13d19AE0Dcd13bc',
        '0x4c0AF5d6Bcb10B3C05FB5F3a846999a3d87534C7',
        '0xF3c631B979EB59d8333374baA7c58B5Aff5e24D2',
        '0x2De851E60e428106fC98fE94017466F8D71793d1',
        '0xEeb63D2d370C5318ef174D366A41507F9380f093',
      ],
    },
    {
      chain: ChainNames.bob,
      birthday: 1739923200, // Wed Feb 19 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0x11DA346d3Fdb62641BDbfebfd54b81CAA871aEf6',
        '0x33Cc3800574c4bEe6D7428e707Db82d1543d639D',
        '0xB615D3123410EE89542b027DC71e87b4Fc05EA80',
      ],
    },
    {
      chain: ChainNames.berachain,
      birthday: 1739318400, // Wed Feb 12 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0x89FD57175EcEEC45992e07c206e5A864Fa6aF433',
        '0x66f233ac844C3948A516857CA769872E5941f91c',
        '0xe318d262290ABab80FC6e217c514801e2c0EF999',
      ],
    },
  ],
};
