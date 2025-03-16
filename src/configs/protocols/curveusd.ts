import { ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface CurveusdLlammaConfig {
  chain: string;
  birthday: number;
  collateral: Token;
  controller: string;
  amm: string;
}

export interface CurveusdProtocolConfig extends ProtocolConfig {
  stablecoin: Token;
  llammas: Array<CurveusdLlammaConfig>;
}

export const CurveusdConfigs: CurveusdProtocolConfig = {
  protocol: ProtocolNames.curveusd,
  birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
  stablecoin: {
    chain: ChainNames.ethereum,
    symbol: 'crvUSD',
    decimals: 18,
    address: '0xf939e0a03fb07f59a73314e73794be0e57ac1b4e',
  },
  llammas: [
    {
      chain: ChainNames.ethereum,
      birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'WETH',
        decimals: 18,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      controller: '0xa920de414ea4ab66b97da1bfe9e6eca7d4219635',
      amm: '0x1681195c176239ac5e72d9aebacf5b2492e0c4ee',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1687824000, // Tue Jun 27 2023 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'WBTC',
        decimals: 8,
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      },
      controller: '0x4e59541306910ad6dc1dac0ac9dfb29bd9f15c67',
      amm: '0xe0438eb3703bf871e31ce639bd351109c88666ea',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1686268800, // Fri Jun 09 2023 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'wstETH',
        decimals: 18,
        address: '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
      },
      controller: '0x100daa78fc509db39ef7d04de0c1abd299f4c6ce',
      amm: '0x37417b2238aa52d0dd2d6252d989e728e8f706e4',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1693094400, // Sun Aug 27 2023 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'tBTC',
        decimals: 18,
        address: '0x18084fba666a33d37592fa2633fd49a74dd93a88',
      },
      controller: '0x1c91da0223c763d2e0173243eadaa0a2ea47e704',
      amm: '0xf9bd9da2427a50908c4c6d1599d8e62837c2bcb0',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1693094400, // Sun Aug 27 2023 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'sfrxETH',
        decimals: 18,
        address: '0xac3e018457b222d93114458476f3e3416abbe38f',
      },
      controller: '0xec0820efafc41d8943ee8de495fc9ba8495b15cf',
      amm: '0xfa96ad0a9e64261db86950e2da362f5572c5c6fd',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741651200, // Tue Mar 11 2025 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'cbBTC',
        decimals: 8,
        address: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
      },
      controller: '0xf8C786b1064889fFd3c8A08B48D5e0c159F4cBe3',
      amm: '0xB6E62Aa178a5421d0A51D17E720A05de78D3137A',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741651200, // Tue Mar 11 2025 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'LBTC',
        decimals: 8,
        address: '0x8236a87084f8b84306f72007f36f2618a5634494',
      },
      controller: '0x8aca5A776a878Ea1F8967e70a23b8563008f58Ef',
      amm: '0x9a2e6bb3114B1EEB5492D97188A3ECB09E39fac8',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741651200, // Tue Mar 11 2025 00:00:00 GMT+0000
      collateral: {
        chain: ChainNames.ethereum,
        symbol: 'weETH',
        decimals: 18,
        address: '0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee',
      },
      controller: '0x652aEa6B22310C89DCc506710CaD24d2Dba56B11',
      amm: '0xEd325262f54b2987e74436f4556a27f748146da1',
    },
  ],
};
