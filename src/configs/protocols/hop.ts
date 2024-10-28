import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface HopPoolConfig {
  bridge: string;
  token: string;
}

export interface HopBridgePoolConfig {
  chain: string;
  birthday: number;
  pools: Array<HopPoolConfig>;
}

export interface HopProtocolConfig extends ProtocolConfig {
  bridges: Array<HopBridgePoolConfig>;
}

export const HopConfigs: HopProtocolConfig = {
  protocol: ProtocolNames.hop,
  category: ProtocolCategories.bridge,
  birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
  bridges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0x3e4a3a4796d16c0cd582c382691998f7c06420b6',
          token: '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
        },
        {
          bridge: '0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a',
          token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
        },
        {
          bridge: '0x22B1Cbb8D98a01a3B71D034BB899775A76Eb1cc2',
          token: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0', // MATIC
        },
        {
          bridge: '0x3d4Cc8A61c7528Fd86C55cfe061a78dCBA48EDd1',
          token: '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
        },
        {
          bridge: '0xb8901acB165ed027E32754E0FFe830802919727f',
          token: '0x0000000000000000000000000000000000000000', // ETH
        },
        {
          bridge: '0x914f986a44AcB623A277d6Bd17368171FCbe4273',
          token: '0xc5102fe9359fd9a28f877a67e36b0f050d81a3cc', // HOP
        },
        {
          bridge: '0x893246FACF345c99e4235E5A7bbEE7404c988b96',
          token: '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f', // SNX
        },
        {
          bridge: '0x36443fC70E073fe9D50425f82a3eE19feF697d62',
          token: '0x57ab1ec28d129707052df4df418d58a2d46d5f51', // sUSD
        },
        {
          bridge: '0x87269B23e73305117D0404557bAdc459CEd0dbEc',
          token: '0xae78736cd615f374d3085123a210448e74fc6393', // rETH
        },
        {
          bridge: '0xf074540eb83c86211F305E145eB31743E228E57d',
          token: '0xB0c7a3Ba49C7a6EaBa6cD4a96C55a1391070Ac9A', // MAGIC
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0x0e0E3d2C5c292161999474247956EF542caBF8dd',
          token: '0xFF970A61A04b1cA14834A43f5dE4533eBDDB5CC8', // USDC
        },
        {
          bridge: '0x72209Fe68386b37A40d6bCA04f78356fd342491f',
          token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9', // USDT
        },
        {
          bridge: '0x7aC115536FE3A185100B2c4DE4cb328bf3A58Ba6',
          token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
        },
        {
          bridge: '0x3749C4f034022c39ecafFaBA182555d4508caCCC',
          token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1', // ETH
        },
        {
          bridge: '0x25FB92E505F752F730cAD0Bd4fa17ecE4A384266',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
        {
          bridge: '0xc315239cFb05F1E130E7E28E603CEa4C014c57f0',
          token: '0xEC70Dcb4A1EFa46b8F2D97C310C9c4790ba5ffA8', // rETH
        },
        {
          bridge: '0xEa5abf2C909169823d939de377Ef2Bf897A6CE98',
          token: '0x539bdE0d7Dbd336b79148AA742883198BBF60342', // MAGIC
        },
      ],
    },
    {
      chain: ChainNames.optimism,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0xa81D244A1814468C734E5b4101F7b9c0c577a8fC',
          token: '0x7F5c764cBc14f9669B88837ca1490cCa17c31607', // USDC
        },
        {
          bridge: '0x46ae9BaB8CEA96610807a275EBD36f8e916b5C61',
          token: '0x94b008aA00579c1307B0EF2c499aD98a8ce58e58', // USDT
        },
        {
          bridge: '0x7191061D5d4C60f598214cC6913502184BAddf18',
          token: '0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1', // DAI
        },
        {
          bridge: '0x83f6244Bd87662118d96D9a6D44f09dffF14b30E',
          token: '0x4200000000000000000000000000000000000006', // ETH
        },
        {
          bridge: '0x03D7f750777eC48d39D080b020D83Eb2CB4e3547',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
        {
          bridge: '0x16284c7323c35F4960540583998C98B1CfC581a7',
          token: '0x8700dAec35aF8Ff88c16BdF0418774CB3D7599B4', // SNX
        },
        {
          bridge: '0x33Fe5bB8DA466dA55a8A32D6ADE2BB104E2C5201',
          token: '0x8c6f28f2F1A3C87F0f938b96d27520d9751ec8d9', // sUSD
        },
        {
          bridge: '0xA0075E8cE43dcB9970cB7709b9526c1232cc39c2',
          token: '0x9Bcef72be871e61ED4fBbc7630889beE758eb81D', // rETH
        },
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1691020800, // Thu Aug 03 2023 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0x46ae9BaB8CEA96610807a275EBD36f8e916b5C61',
          token: '0xd9aAEc86B65D86f6A7B5B1b0c42FFA531710b6CA', // USDC
        },
        {
          bridge: '0x3666f603Cc164936C1b87e207F36BEBa4AC5f18a',
          token: '0x4200000000000000000000000000000000000006', // ETH
        },
        {
          bridge: '0xe22D2beDb3Eca35E6397e0C6D62857094aA26F52',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
      ],
    },
    {
      chain: ChainNames.polygon,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8',
          token: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        },
        {
          bridge: '0x6c9a1ACF73bd85463A46B0AFc076FBdf602b690B',
          token: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        },
        {
          bridge: '0x553bC791D746767166fA3888432038193cEED5E2',
          token: '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270', // MATIC
        },
        {
          bridge: '0xEcf268Be00308980B5b3fcd0975D47C4C8e1382a',
          token: '0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063', // DAI
        },
        {
          bridge: '0xb98454270065A31D71Bf635F6F7Ee6A518dFb849',
          token: '0x7ceB23fD6bC0adD59E62ac25578270cFf1b9f619', // ETH
        },
        {
          bridge: '0x58c61AeE5eD3D748a1467085ED2650B697A66234',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
      ],
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1640995200, // Sat Jan 01 2022 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0x25D8039bB044dC227f741a9e381CA4cEAE2E6aE8',
          token: '0xDDAfbb505ad214D7b80b1f830fcCc89B60fb7A83', // USDC
        },
        {
          bridge: '0xFD5a186A7e8453Eb867A360526c5d987A00ACaC2',
          token: '0x4ecaba5870353805a9f068101a40e0f32ed605c6', // USDT
        },
        {
          bridge: '0x7ac71c29fEdF94BAc5A5C9aB76E1Dd12Ea885CCC',
          token: '0x7122d7661c4564b7C6Cd4878B06766489a6028A2', // MATIC
        },
        {
          bridge: '0x0460352b91D7CF42B0E1C1c30f06B602D9ef2238',
          token: '0xe91D153E0b41518A2Ce8Dd3D7944Fa863463a97d', // DAI
        },
        {
          bridge: '0xD8926c12C0B2E5Cd40cFdA49eCaFf40252Af491B',
          token: '0x6A023CCd1ff6F2045C3309768eAd9E68F978f6e1', // ETH
        },
        {
          bridge: '0x6F03052743CD99ce1b29265E377e320CD24Eb632',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
      ],
    },
    {
      chain: ChainNames.linea,
      birthday: 1699315200, // Tue Nov 07 2023 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0xcbb852a6274e03fa00fb4895de0463f66df27a11',
          token: '0xe5D7C2a44FfDDf6b295A15c148167daaAf5Cf34f', // ETH
        },
        {
          bridge: '0x0a6b1904369fE59E002ad0713ae89d4E3dF5A7Cf',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
      ],
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1704499200, // Sat Jan 06 2024 00:00:00 GMT+0000
      pools: [
        {
          bridge: '0x0ce6c85cF43553DE10FC56cecA0aef6Ff0DD444d',
          token: '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9', // ETH
        },
        {
          bridge: '0x9ec9551d4A1a1593b0ee8124D98590CC71b3B09D',
          token: '0xc5102fE9359FD9a28f877a67E36B0F050d81a3CC', // HOP
        },
      ],
    },
  ],
};
