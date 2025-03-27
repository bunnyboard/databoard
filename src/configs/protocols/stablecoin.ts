import { ProtocolConfig, Token } from '../../types/base';
import { TokensBook } from '../data';
import { ChainNames, ProtocolNames } from '../names';

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
}

export const StablecoinConfigs: StablecoinProtocolConfig = {
  protocol: ProtocolNames.stablecoin,

  // USDT was deployed on ethereum
  birthday: 1511913600, // Wed Nov 29 2017 00:00:00 GMT+0000

  coins: {
    USDT: {
      coin: 'USDT',
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
    USDC: {
      coin: 'USDC',
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
    DAI: {
      coin: 'DAI',
      birthday: 1573689600, // Thu Nov 14 2019 00:00:00 GMT+0000
      tokens: [TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f']],
    },
  },
};
