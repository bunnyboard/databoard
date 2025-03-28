import { ProtocolConfig, Token } from '../../../types/base';
import { TokensBook } from '../../data';
import { ChainNames, ProtocolNames } from '../../names';
import { StablecoinCoins } from './coins';
import { CurvePoolConfig, CurvePoolConfigs } from './curve3pool';

export interface StablecoinConfig {
  // unique ticker: USDC, DAI, ...
  coin: string;

  birthday: number;

  // list of contracts will be counted supply
  tokens: Array<Token>;

  // saving
  saving?: {
    chain: string;
    type: 'erc4626';
    address: string;
  };
}

export interface StablecoinProtocolConfig extends ProtocolConfig {
  coins: {
    [key: string]: StablecoinConfig;
  };

  curvePools: {
    [key: string]: CurvePoolConfig;
  };
}

export const StablecoinConfigs: StablecoinProtocolConfig = {
  protocol: ProtocolNames.stablecoin,

  // USDT was deployed on ethereum
  birthday: 1511913600, // Wed Nov 29 2017 00:00:00 GMT+0000

  // monitor important curve stablecoin core pools
  curvePools: CurvePoolConfigs,

  coins: {
    [StablecoinCoins.USDT]: {
      coin: StablecoinCoins.USDT,
      birthday: 1511913600, // Wed Nov 29 2017 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
        TokensBook.avalanche['0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7'],
        {
          chain: ChainNames.kava,
          symbol: 'USDT',
          decimals: 6,
          address: '0x919c1c267bc06a7039e03fcc2ef738525769109c',
        },
        {
          chain: ChainNames.celo,
          symbol: 'USDT',
          decimals: 6,
          address: '0x48065fbbe25f71c9282ddf5e1cd6d6a887483d5e',
        },
      ],
    },
    [StablecoinCoins.USDC]: {
      coin: StablecoinCoins.USDC,
      birthday: 1533340800, // Sat Aug 04 2018 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
        TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
        TokensBook.avalanche['0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'],
        TokensBook.base['0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'],
        {
          chain: ChainNames.celo,
          symbol: 'USDC',
          decimals: 6,
          address: '0xceba9300f2b948710d2653dd7b07f33a8b32118c',
        },
        TokensBook.linea['0x176211869ca2b568f2a7d4ee941e073a821ee1ff'],
        TokensBook.optimism['0x0b2c639c533813f4aa9d7837caf62653d097ff85'],
        TokensBook.polygon['0x3c499c542cef5e3811e1192ce70d8cc03d5c3359'],
        {
          chain: ChainNames.unichain,
          symbol: 'USDC',
          decimals: 6,
          address: '0x078d782b760474a361dda0af3839290b0ef57ad6',
        },
        TokensBook.zksync['0x1d17cbcf0d6d143135ae902365d2e5e2a16538d4'],
      ],
    },
    [StablecoinCoins.DAI]: {
      coin: StablecoinCoins.DAI,
      birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f']],
    },
    [StablecoinCoins.USDe]: {
      coin: StablecoinCoins.USDe,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0x4c9edd5852cd905f086c759e8383e09bff1e68b3']],
    },
    [StablecoinCoins.FRAX]: {
      coin: StablecoinCoins.FRAX,
      birthday: 1608163200, // Thu Dec 17 2020 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0x853d955acef822db058eb8505911ed77f175b99e']],
    },
    [StablecoinCoins.USR]: {
      coin: StablecoinCoins.USR,
      birthday: 1717372800, // Mon Jun 03 2024 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110']],
    },
    [StablecoinCoins.crvUSD]: {
      coin: StablecoinCoins.crvUSD,
      birthday: 1684108800, // Mon May 15 2023 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0xf939e0a03fb07f59a73314e73794be0e57ac1b4e']],
    },
    [StablecoinCoins.USDS]: {
      coin: StablecoinCoins.USDS,
      birthday: 1725321600, // Tue Sep 03 2024 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0xdc035d45d973e3ec169d2276ddab16f1e407384f']],
    },
    [StablecoinCoins.LUSD]: {
      coin: StablecoinCoins.LUSD,
      birthday: 1617667200, // Tue Apr 06 2021 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0x5f98805a4e8be255a32880fdec7f6728c6568ba0']],
    },
    [StablecoinCoins.FDUSD]: {
      coin: StablecoinCoins.FDUSD,
      birthday: 1682726400, // Sat Apr 29 2023 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0xc5f0f7b66764f6ec8c8dff7ba683102295e16409'],
        TokensBook.bnbchain['0xc5f0f7b66764f6ec8c8dff7ba683102295e16409'],
      ],
    },
    [StablecoinCoins.BUILD]: {
      coin: StablecoinCoins.BUILD,
      birthday: 1709337600, // Sat Mar 02 2024 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x7712c34205737192402172409a8f7ccef8aa2aec'],
        TokensBook.ethereum['0x6a9da2d710bb9b700acde7cb81f10f1ff8c89041'],
        {
          chain: ChainNames.polygon,
          symbol: 'BUIDL',
          decimals: 6,
          address: '0x2893ef551b6dd69f661ac00f11d93e5dc5dc0e99',
        },
        {
          chain: ChainNames.avalanche,
          symbol: 'BUIDL',
          decimals: 6,
          address: '0x53fc82f14f009009b440a706e31c9021e1196a2f',
        },
        {
          chain: ChainNames.optimism,
          symbol: 'BUIDL',
          decimals: 6,
          address: '0xa1cdab15bba75a80df4089cafba013e376957cf5',
        },
        {
          chain: ChainNames.arbitrum,
          symbol: 'BUIDL',
          decimals: 6,
          address: '0xa6525ae43edcd03dc08e775774dcabd3bb925872',
        },
      ],
    },
    [StablecoinCoins.USDTB]: {
      coin: StablecoinCoins.USDTB,
      birthday: 1732838400, // Fri Nov 29 2024 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0xc139190f447e929f090edeb554d95abb8b18ac1c']],
    },
    [StablecoinCoins.USD0]: {
      coin: StablecoinCoins.USD0,
      birthday: 1716508800, // Fri May 24 2024 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x73a15fed60bf67631dc6cd7bc5b6e8da8190acf5'],
        TokensBook.arbitrum['0x35f1c5cb7fb977e669fd244c567da99d8a3a6850'],
      ],
    },
    [StablecoinCoins.PYUSD]: {
      coin: StablecoinCoins.PYUSD,
      birthday: 1667952000, // Wed Nov 09 2022 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x6c3ea9036406852006290770bedfcaba0e23a0e8'],
        {
          chain: ChainNames.berachain,
          symbol: 'PYUSD',
          decimals: 18,
          address: '0x688e72142674041f8f6af4c808a4045ca1d6ac82',
        },
      ],
    },
    [StablecoinCoins.HONEY]: {
      coin: StablecoinCoins.HONEY,
      birthday: 1737417600, // Tue Jan 21 2025 00:00:00 GMT+0000
      tokens: [
        {
          chain: ChainNames.berachain,
          symbol: 'HONEY',
          decimals: 18,
          address: '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce',
        },
      ],
    },
    [StablecoinCoins.USDX]: {
      coin: StablecoinCoins.USDX,
      birthday: 1710806400, // Tue Mar 19 2024 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0xf3527ef8de265eaa3716fb312c12847bfba66cef'],
        TokensBook.bnbchain['0xf3527ef8de265eaa3716fb312c12847bfba66cef'],
        TokensBook.arbitrum['0xf3527ef8de265eaa3716fb312c12847bfba66cef'],
      ],
    },
    [StablecoinCoins.USDY]: {
      coin: StablecoinCoins.USDY,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x96f6ef951840721adbf46ac996b59e0235cb985c'],
        TokensBook.mantle['0x5be26527e817998a7206475496fde1e68957c5a6'],
        TokensBook.arbitrum['0x35e050d3c0ec2d29d269a8ecea763a183bdf9a9d'],
      ],
    },
    [StablecoinCoins.TUSD]: {
      coin: StablecoinCoins.TUSD,
      birthday: 1546300800, // Tue Jan 01 2019 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x0000000000085d4780b73119b644ae5ecd22b376'],
        TokensBook.avalanche['0x1c20e891bab6b1727d14da358fae2984ed9b59eb'],
        TokensBook.cronos['0x87efb3ec1576dec8ed47e58b832bedcd86ee186e'],
      ],
    },
    [StablecoinCoins.BUSD]: {
      coin: StablecoinCoins.BUSD,
      birthday: 1567728000, // Fri Sep 06 2019 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x4fabb145d64652a948d72533023f6e7a623c7c53'],
        TokensBook.avalanche['0x9c9e5fd8bbc25984b178fdce6117defa39d2db39'],
        TokensBook.polygon['0x9c9e5fd8bbc25984b178fdce6117defa39d2db39'],
      ],
    },
    [StablecoinCoins.AvalonUSDa]: {
      coin: StablecoinCoins.AvalonUSDa,
      birthday: 1730678400, // Mon Nov 04 2024 00:00:00 GMT+0000
      tokens: [
        TokensBook.ethereum['0x8a60e489004ca22d775c5f2c657598278d17d9c2'],
        TokensBook.bnbchain['0x9356086146be5158e98ad827e21b5cf944699894'],
        TokensBook.mantle['0x075df695b8e7f4361fa7f8c1426c63f11b06e326'],
        TokensBook.base['0x2840f9d9f96321435ab0f977e7fdbf32ea8b304f'],
        TokensBook.zksync['0xb8d7d88d042880ae87bb61de2dfff8441768766d'],
        {
          chain: ChainNames.taiko,
          symbol: 'USDa',
          decimals: 18,
          address: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
        },
        {
          chain: ChainNames.berachain,
          symbol: 'USDa',
          decimals: 18,
          address: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
        },
        {
          chain: ChainNames.zircuit,
          symbol: 'USDa',
          decimals: 18,
          address: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
        },
        {
          chain: ChainNames.sonic,
          symbol: 'USDa',
          decimals: 18,
          address: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
        },
        {
          chain: ChainNames.morphl2,
          symbol: 'USDa',
          decimals: 18,
          address: '0xff12470a969dd362eb6595ffb44c82c959fe9acc',
        },
        {
          chain: ChainNames.bitlayer,
          symbol: 'USDa',
          decimals: 18,
          address: '0x91bd7f5e328aecd1024e4118ade0ccb786f55db1',
        },
        {
          chain: ChainNames.bob,
          symbol: 'USDa',
          decimals: 18,
          address: '0x250fc55c82bce84c991ba25698a142b21cdc778a',
        },
      ],
    },
  },
  [StablecoinCoins.DOLA]: {
    coin: StablecoinCoins.DOLA,
    birthday: 1614124800, // Wed Feb 24 2021 00:00:00 GMT+0000
    tokens: [TokensBook.ethereum['0x865377367054516e17014ccded1e7d814edc9ce4']],
  },
  [StablecoinCoins.GHO]: {
    coin: StablecoinCoins.GHO,
    birthday: 1689465600, // Sun Jul 16 2023 00:00:00 GMT+0000
    tokens: [TokensBook.ethereum['0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f']],
  },
  [StablecoinCoins.deUSD]: {
    coin: StablecoinCoins.deUSD,
    birthday: 1721088000, // Tue Jul 16 2024 00:00:00 GMT+0000
    tokens: [TokensBook.ethereum['0x15700b564ca08d9439c58ca5053166e8317aa138']],
  },
  [StablecoinCoins.M0]: {
    coin: StablecoinCoins.M0,
    birthday: 1715126400, // Wed May 08 2024 00:00:00 GMT+0000
    tokens: [TokensBook.ethereum['0x866a2bf4e572cbcf37d5071a7a58503bfb36be1b']],
  },
  [StablecoinCoins.frxUSD]: {
    coin: StablecoinCoins.frxUSD,
    birthday: 1735948800, // Sat Jan 04 2025 00:00:00 GMT+0000
    tokens: [
      TokensBook.ethereum['0xcacd6fd266af91b8aed52accc382b4e165586e29'],
      {
        chain: ChainNames.fraxtal,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0xfc00000000000000000000000000000000000001',
      },
      {
        chain: ChainNames.blast,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.arbitrum,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.optimism,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.bnbchain,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.ink,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.sonic,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.mode,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.xlayer,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.avalanche,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.polygon,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
      {
        chain: ChainNames.polygonzkevm,
        symbol: 'frxUSD',
        decimals: 18,
        address: '0x80eede496655fb9047dd39d9f418d5483ed600df',
      },
    ],
  },
  [StablecoinCoins.USDA]: {
    coin: StablecoinCoins.USDA,
    birthday: 1704844800, // Wed Jan 10 2024 00:00:00 GMT+0000
    tokens: [TokensBook.ethereum['0x0000206329b97db379d5e1bf586bbdb969c63274']],
  },
  [StablecoinCoins.USDz]: {
    coin: StablecoinCoins.USDz,
    birthday: 1715904000, // Fri May 17 2024 00:00:00 GMT+0000
    tokens: [
      TokensBook.ethereum['0xa469b7ee9ee773642b3e93e842e5d9b5baa10067'],
      TokensBook.base['0x04d5ddf5f3a8939889f11e97f8c4bb48317f1938'],
      TokensBook.blast['0x52056ed29fe015f4ba2e3b079d10c0b87f46e8c6'],
      TokensBook.manta['0x73d23f3778a90be8846e172354a115543df2a7e4'],
    ],
  },
  [StablecoinCoins.lvlUSD]: {
    coin: StablecoinCoins.lvlUSD,
    birthday: 1727913600, // Thu Oct 03 2024 00:00:00 GMT+0000
    tokens: [TokensBook.ethereum['0x7c1156e515aa1a2e851674120074968c905aaf37']],
  },
};
