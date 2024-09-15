import { ProtocolCategories, ProtocolConfig, Token } from '../../types/base';
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
  category: ProtocolCategories.lending,
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
  ],
};
