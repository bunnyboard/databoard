import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SolvPoolConfig {
  chain: string;
  birthday: number;
  solvBTC: string;

  vaults: Array<{
    token: string;
    vault: string;
  }>;
}

export interface SolvProtocolConfig extends ProtocolConfig {
  activeAddressListApi: string;
  pools: Array<SolvPoolConfig>;
}

export const SolvConfigs: SolvProtocolConfig = {
  protocol: ProtocolNames.solv,
  birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
  activeAddressListApi:
    'https://raw.githubusercontent.com/solv-finance/solv-protocol-defillama/refs/heads/main/solvbtc.json',
  pools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1719532800, // Fri Jun 28 2024 00:00:00 GMT+0000
      solvBTC: '0x7A56E1C57C7475CCf742a1832B028F0456652F97',
      vaults: [
        {
          vault: '0xb4378d4e3528C12C83821b21c99b43336A543613',
          token: '0x18084fbA666a33d37592fA2633fD49a74DD93a88',
        },
        {
          vault: '0xAd713bd85E8bff9CE85Ca03a8A930e4a38f6893D',
          token: '0xcbB7C0000aB88B473b1f5aFd9ef808440eed33Bf',
        },
        {
          vault: '0x9Bc8EF6bb09e3D0F3F3a6CD02D2B9dC3115C7c5C',
          token: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
        {
          vault: '0xBE6297731720B7E218031Ca8970921f9b41f3D00',
          token: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
      solvBTC: '0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7',
      vaults: [
        {
          vault: '0x9537bc0546506785bd1ebd19fd67d1f06800d185',
          token: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
      solvBTC: '0x3647c54c4c2C65bC7a2D63c0Da2809B399DBBDC0',
      vaults: [
        {
          vault: '0x032470abbb896b1255299d5165c1a5e9ef26bcd2',
          token: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        },
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1724976000, // Fri Aug 30 2024 00:00:00 GMT+0000
      solvBTC: '0x3B86Ad95859b6AB773f55f8d94B4b9d443EE931f',
      vaults: [
        {
          vault: '0xf2416c264aa4068ff4d1949383366458f295f205',
          token: '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b',
        },
      ],
    },
    {
      chain: ChainNames.merlin,
      birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
      solvBTC: '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71',
      vaults: [
        {
          vault: '0x6a57a8d6c4fe64b1fd6e8c3e07b0591d22b7ce7f',
          token: '0xB880fd278198bd590252621d4CD071b1842E9Bcd',
        },
      ],
    },
    {
      chain: ChainNames.mantle,
      birthday: 1721347200, // Fri Jul 19 2024 00:00:00 GMT+0000
      solvBTC: '0xa68d25fC2AF7278db4BcdcAabce31814252642a9',
      vaults: [
        {
          vault: '0x33b7a7a164b77433a61d4b49bd780a2718812e6e',
          token: '0xc96de26018a54d51c097160568752c4e3bd6c364',
        },
      ],
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1722556800, // Fri Aug 02 2024 00:00:00 GMT+0000
      solvBTC: '0xbc78D84Ba0c46dFe32cf2895a19939c86b81a777',
      vaults: [
        {
          vault: '0x33b7a7a164b77433a61d4b49bd780a2718812e6e',
          token: '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
        },
      ],
    },
    {
      chain: ChainNames.bob,
      birthday: 1723680000, // Thu Aug 15 2024 00:00:00 GMT+0000
      solvBTC: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
      vaults: [
        {
          vault: '0x33b7a7a164b77433a61d4b49bd780a2718812e6e',
          token: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3',
        },
      ],
    },
    {
      chain: ChainNames.linea,
      birthday: 1732233600, // Fri Nov 22 2024 00:00:00 GMT+0000
      solvBTC: '0x541fd749419ca806a8bc7da8ac23d346f2df8b77',
      vaults: [
        {
          vault: '0x35ce7fa5623b8a5cf1cf87a8bf8d64ad8da1443e',
          token: '0x3aab2285ddcddad8edf438c1bab47e1a9d05a9b4',
        },
      ],
    },
    {
      chain: ChainNames.core,
      birthday: 1727308800, // Thu Sep 26 2024 00:00:00 GMT+0000
      solvBTC: '0x9410e8052Bc661041e5cB27fDf7d9e9e842af2aa',
      vaults: [],
    },
    {
      chain: ChainNames.taiko,
      birthday: 1728950400, // Tue Oct 15 2024 00:00:00 GMT+0000
      solvBTC: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
      vaults: [],
    },
    {
      chain: ChainNames.bitlayer,
      birthday: 1732924800, // Sat Nov 30 2024 00:00:00 GMT+0000
      solvBTC: '0x541fd749419ca806a8bc7da8ac23d346f2df8b77',
      vaults: [],
    },
    {
      chain: ChainNames.mode,
      birthday: 1730592000, // Sun Nov 03 2024 00:00:00 GMT+0000
      solvBTC: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
      vaults: [],
    },
  ],
};
