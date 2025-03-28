import { Token } from '../../../types/base';
import { TokensBook } from '../../data';
import { ChainNames } from '../../names';
import { StablecoinCoins } from './coins';

export interface CurvePoolConfig {
  chain: string;
  name: string;
  birthday: number;
  poolAddress: string;
  lpAddress: string;
  coins: {
    [key: string]: Token;
  };
}

export const CurvePoolConfigs: { [key: string]: CurvePoolConfig } = {
  pool3Crv: {
    name: 'pool3Crv',
    chain: ChainNames.ethereum,
    birthday: 1599436800, // Mon Sep 07 2020 00:00:00 GMT+0000
    poolAddress: '0xbebc44782c7db0a1a60cb6fe97d0b483032ff1c7',
    lpAddress: '0x6c3f90f043a72fa612cbac8115ee7e52bde6e490',
    coins: {
      [StablecoinCoins.DAI]: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
      [StablecoinCoins.USDC]: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
      [StablecoinCoins.USDT]: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
    },
  },
  pool_USDe_USDC: {
    name: 'pool_USDe_USDC',
    chain: ChainNames.ethereum,
    birthday: 1700092800, // Thu Nov 16 2023 00:00:00 GMT+0000
    poolAddress: '0x02950460e2b9529d0e00284a5fa2d7bdf3fa4d72',
    lpAddress: '0x02950460e2b9529d0e00284a5fa2d7bdf3fa4d72',
    coins: {
      [StablecoinCoins.USDe]: TokensBook.ethereum['0x4c9edd5852cd905f086c759e8383e09bff1e68b3'],
      [StablecoinCoins.USDC]: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
  },
  pool_FRAX_USDC: {
    name: 'pool_FRAX_USDC',
    chain: ChainNames.ethereum,
    birthday: 1654905600, // Sat Jun 11 2022 00:00:00 GMT+0000
    poolAddress: '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
    lpAddress: '0x3175df0976dfa876431c2e9ee6bc45b65d3473cc',
    coins: {
      [StablecoinCoins.FRAX]: TokensBook.ethereum['0x853d955acef822db058eb8505911ed77f175b99e'],
      [StablecoinCoins.USDC]: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
  },
  pool_USR_USDC: {
    name: 'pool_USR_USDC',
    chain: ChainNames.ethereum,
    birthday: 1654905600, // Sat Jun 11 2022 00:00:00 GMT+0000
    poolAddress: '0x3ee841f47947fefbe510366e4bbb49e145484195',
    lpAddress: '0x3ee841f47947fefbe510366e4bbb49e145484195',
    coins: {
      [StablecoinCoins.USR]: TokensBook.ethereum['0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110'],
      [StablecoinCoins.USDC]: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
  },
  pool_crvUSD_USDC: {
    name: 'pool_crvUSD_USDC',
    chain: ChainNames.ethereum,
    birthday: 1684108800, // Mon May 15 2023 00:00:00 GMT+0000
    poolAddress: '0x4dece678ceceb27446b35c672dc7d61f30bad69e',
    lpAddress: '0x4dece678ceceb27446b35c672dc7d61f30bad69e',
    coins: {
      [StablecoinCoins.USDC]: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
      [StablecoinCoins.crvUSD]: TokensBook.ethereum['0xf939e0a03fb07f59a73314e73794be0e57ac1b4e'],
    },
  },
};
