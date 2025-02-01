import { ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface Usdt0TransferPool {
  chain: string;
  birthday: number;
  adapter: string;
  token: Token;
}

export interface Usdt0ProtocolConfig extends ProtocolConfig {
  pools: Array<Usdt0TransferPool>;
}

export const Usdt0Configs: Usdt0ProtocolConfig = {
  protocol: ProtocolNames.usdt0,
  birthday: 1736380800, // Thu Jan 09 2025 00:00:00 GMT+0000
  pools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1736380800, // Thu Jan 09 2025 00:00:00 GMT+0000
      adapter: '0x6C96dE32CEa08842dcc4058c14d3aaAD7Fa41dee',
      token: {
        chain: ChainNames.ethereum,
        symbol: 'USDT',
        decimals: 6,
        address: '0xdac17f958d2ee523a2206206994597c13d831ec7',
      },
    },
    {
      chain: ChainNames.ink,
      birthday: 1736380800, // Thu Jan 09 2025 00:00:00 GMT+0000
      adapter: '0x1cB6De532588fCA4a21B7209DE7C456AF8434A65',
      token: {
        chain: ChainNames.ink,
        symbol: 'USDT',
        decimals: 6,
        address: '0x0200c29006150606b650577bbe7b6248f58470c1',
      },
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1737072000, // Fri Jan 17 2025 00:00:00 GMT+0000
      adapter: '0x14E4A1B13bf7F943c8ff7C51fb60FA964A298D92',
      token: {
        chain: ChainNames.ink,
        symbol: 'USDT',
        decimals: 6,
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      },
    },
  ],
};
