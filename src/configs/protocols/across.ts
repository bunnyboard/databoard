import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface AcrossSpokePoolConfig {
  chain: string;
  address: string;
  hubPool?: string;
  birthday: number;
  tokens: Array<string>;
}

export interface AcrossProtocolConfig extends ProtocolConfig {
  spokePools: Array<AcrossSpokePoolConfig>;
}

export const AcrossConfigs: AcrossProtocolConfig = {
  protocol: ProtocolNames.across,
  birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
  spokePools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
      hubPool: '0xc186fA914353c44b2E33eBE05f21846F1048bEda',
      tokens: [
        '0x6033f7f88332b8db6ad452b7c6d5bb643990ae3f',
        '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
        '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
        '0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
        '0x42bbfa2e77757c645eeaad1655e0911a7553efbc',
        '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
      tokens: [
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8',
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        '0x53691596d1bce8cea565b84d4915e69e03d9c99d',
        '0xcf934e2402a5e072928a39a956964eb8f2b5b79c',
        '0xd693ec944a85eeca4247ec1c3b130dca9b0c3b22',
        '0xbfa641051ba0a0ad1b0acf549a89536a0d76472e',
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      address: '0x09aea4b2242abc8bb4bb78d537a67a245a7bec64',
      tokens: [
        '0x4200000000000000000000000000000000000006',
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
        '0xd652c5425aea2afd5fb142e120fecf79e18fafc3',
        '0x4158734d47fc9692176b5085e0f52ee0da5d47f1',
        '0x1c7a460413dd4e964f96d8dfc56e7223ce88cd85',
        '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
      ],
    },
    {
      chain: ChainNames.blast,
      birthday: 1719964800, // Wed Jul 03 2024 00:00:00 GMT+0000
      address: '0x2D509190Ed0172ba588407D4c2df918F955Cc6E1',
      tokens: [
        '0x4300000000000000000000000000000000000004',
        '0xf7bc58b8d8f97adc129cfc4c9f45ce3c0e1d2692',
        '0x4300000000000000000000000000000000000003',
      ],
    },
    {
      chain: ChainNames.linea,
      birthday: 1709769600, // Thu Mar 07 2024 00:00:00 GMT+0000
      address: '0x7e63a5f1a8f0b4d0934b2f2327daed3f6bb2ee75',
      tokens: [
        '0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4',
        '0x176211869ca2b568f2a7d4ee941e073a821ee1ff',
        '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f',
        '0x4af15ec2a0bd43db75dd04e62faa3b8ef36b00d5',
        '0xa219439258ca9da29e9cc4ce5596924745e12b93',
      ],
    },
    {
      chain: ChainNames.mode,
      birthday: 1716336000, // Wed May 22 2024 00:00:00 GMT+0000
      address: '0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96',
      tokens: [
        '0xf0F161fDA2712DB8b566946122a5af183995e2eD',
        '0xcDd475325D6F564d27247D1DddBb0DAc6fA0a5CF',
        '0xd988097fb8612cc24eeC14542bC03424c656005f',
        '0x4200000000000000000000000000000000000006',
      ],
    },
    {
      chain: ChainNames.optimism,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',
      tokens: [
        '0x4200000000000000000000000000000000000006',
        '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        '0x68f180fcce6836688e9084f035309e29bf0a2095',
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '0x8700daec35af8ff88c16bdf0418774cb3d7599b4',
        '0x395ae52bb17aef68c2888d941736a71dc6d4e125',
        '0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921',
        '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        '0xff733b2a3557a7ed6697007ab5d11b79fdd1b76b',
        '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
      ],
    },
    {
      chain: ChainNames.polygon,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096',
      tokens: [
        '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619',
        '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        '0x3066818837c5e6ed6601bd5a91b0762877a6b731',
        '0x25788a1a171ec66da6502f9975a15b609ff54cf6',
      ],
    },
    {
      chain: ChainNames.scroll,
      birthday: 1721174400, // Wed Jul 17 2024 00:00:00 GMT+0000
      address: '0x3bad7ad0728f9917d1bf08af5782dcbd516cdd96',
      tokens: [
        '0x5300000000000000000000000000000000000004',
        '0x3c1bca5a656e69edcd0d4e36bebb3fcdaca60cf1',
        '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4',
        '0xf55bec9cafdbe8730f096aa55dad6d22d44099df',
      ],
    },
    {
      chain: ChainNames.zksync,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      address: '0xE0B015E54d54fc84a6cB9B666099c46adE9335FF',
      tokens: [
        '0x3355df6d4c9c3035724fd0e3914de96a5a83aaf4',
        '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91',
        '0xbbeb516fb02a01611cbbe0453fe3c580d7281011',
        '0x493257fd37edb34451f62edf8d2a0c418852ba4c',
        '0x4b9eb6c0b6ea15176bbf62841c6b2a8a398cb656',
        '0x5a7d6b2f92c77fad6ccabd7ee0624e64907eaf3e',
      ],
    },
    {
      chain: ChainNames.lisk,
      birthday: 1719964800, // Wed Jul 03 2024 00:00:00 GMT+0000
      address: '0x9552a0a6624A23B848060AE5901659CDDa1f83f8',
      tokens: [
        '0x05D032ac25d322df992303dCa074EE7392C117b9',
        '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3',
        '0x4200000000000000000000000000000000000006',
      ],
    },
    {
      chain: ChainNames.redstone,
      birthday: 1723248000, // Sat Aug 10 2024 00:00:00 GMT+0000
      address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97',
      tokens: ['0x4200000000000000000000000000000000000006'],
    },
    {
      chain: ChainNames.zora,
      birthday: 1723507200, // Tue Aug 13 2024 00:00:00 GMT+0000
      address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97',
      tokens: ['0x4200000000000000000000000000000000000006', '0xCccCCccc7021b32EBb4e8C08314bD62F7c653EC4'],
    },
    {
      chain: ChainNames.worldchain,
      birthday: 1728432000, // Wed Oct 09 2024 00:00:00 GMT+0000
      address: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
      tokens: [
        '0x4200000000000000000000000000000000000006',
        '0x79A02482A880bCE3F13e09Da970dC34db4CD24d1',
        '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3',
      ],
    },
    {
      chain: ChainNames.ink,
      birthday: 1734739200, // Sat Dec 21 2024 00:00:00 GMT+0000
      address: '0xeF684C38F94F48775959ECf2012D7E864ffb9dd4',
      tokens: ['0x4200000000000000000000000000000000000006'],
    },
    {
      chain: ChainNames.alephzero,
      birthday: 1731024000, // Fri Nov 08 2024 00:00:00 GMT+0000
      address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97',
      tokens: ['0xD648529D4803d3467bA8850577BEd4e4b8Ae583C'],
    },
    {
      chain: ChainNames.soneium,
      birthday: 1736640000, // Sun Jan 12 2025 00:00:00 GMT+0000
      address: '0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96',
      tokens: ['0x4200000000000000000000000000000000000006', '0xbA9986D2381edf1DA03B0B9c1f8b00dc4AacC369'],
    },
  ],
};
