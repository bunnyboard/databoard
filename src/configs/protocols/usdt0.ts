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
        chain: ChainNames.arbitrum,
        symbol: 'USDT',
        decimals: 6,
        address: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
      },
    },
    {
      chain: ChainNames.berachain,
      birthday: 1737504000, // Wed Jan 22 2025 00:00:00 GMT+0000
      adapter: '0x3Dc96399109df5ceb2C226664A086140bD0379cB',
      token: {
        chain: ChainNames.berachain,
        symbol: 'USDT',
        decimals: 6,
        address: '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      },
    },
    {
      chain: ChainNames.optimism,
      birthday: 1741996800, // Sat Mar 15 2025 00:00:00 GMT+0000
      adapter: '0xF03b4d9AC1D5d1E7c4cEf54C2A313b9fe051A0aD',
      token: {
        chain: ChainNames.optimism,
        symbol: 'USDT',
        decimals: 6,
        address: '0x01bff41798a0bcf287b996046ca68b395dbc1071',
      },
    },
    {
      chain: ChainNames.unichain,
      birthday: 1741996800, // Sat Mar 15 2025 00:00:00 GMT+0000
      adapter: '0xc07bE8994D035631c36fb4a89C918CeFB2f03EC3',
      token: {
        chain: ChainNames.unichain,
        symbol: 'USDT',
        decimals: 6,
        address: '0x9151434b16b9763660705744891fa906f660ecc5',
      },
    },
  ],
};
