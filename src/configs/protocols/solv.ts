import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SolvPoolConfig {
  chain: string;
  birthday: number;
  solvBTC: string;

  // deposit/withdraw BTC -> SolvBTC
  router?: string;

  vaults: Array<{
    token: string;
    vault: string;
  }>;
}

export interface SolvProtocolConfig extends ProtocolConfig {
  pools: Array<SolvPoolConfig>;
}

export const SolvConfigs: SolvProtocolConfig = {
  protocol: ProtocolNames.solv,
  birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
  pools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1719532800, // Fri Jun 28 2024 00:00:00 GMT+0000
      solvBTC: '0x7A56E1C57C7475CCf742a1832B028F0456652F97',
      router: '0x1ff7d7c0a7d8e94046708c611dec5056a9d2b823',
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
          vault: '0x6c0FE76DA5B8C3b24125830f127037BF16bCA46C',
          token: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
        {
          vault: '0x9Bc8EF6bb09e3D0F3F3a6CD02D2B9dC3115C7c5C',
          token: '0x2260FAC5E5542a773Aa44fBCfeDf7C193bc2C599',
        },
        {
          vault: '0xD2E8955267c27dFA2B5b9433a1063ec52EB61b9A',
          token: '0x7A56E1C57C7475CCf742a1832B028F0456652F97',
        },
        {
          vault: '0x32611194b98b7eF451edf2a8bb0A11475Ca8c287',
          token: '0x7A56E1C57C7475CCf742a1832B028F0456652F97',
        },
        {
          vault: '0xBE6297731720B7E218031Ca8970921f9b41f3D00',
          token: '0xC96dE26018A54D51c097160568752c4E3BD6C364',
        },
      ],
    },
    // {
    //   chain: ChainNames.bnbchain,
    //   birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
    //   solvBTC: '0x4aae823a6a0b376De6A78e74eCC5b079d38cBCf7',
    //   router: '0x5c1215712f174df2cbc653edce8b53fa4caf2201',
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
    //   solvBTC: '0x3647c54c4c2C65bC7a2D63c0Da2809B399DBBDC0',
    //   router: '0xe9ed7530427cb41a56c9e004e00e074ccc168c44',
    // },
    // {
    //   chain: ChainNames.base,
    //   birthday: 1724976000, // Fri Aug 30 2024 00:00:00 GMT+0000
    //   solvBTC: '0x3B86Ad95859b6AB773f55f8d94B4b9d443EE931f',
    //   router: '0x65effda5e69df470d4dbd31a805e15855cae65c7',
    // },
    // {
    //   chain: ChainNames.merlin,
    //   birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
    //   solvBTC: '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71',
    //   router: '0x8c29858319614380024093DBEE553F9337665756',
    // },
    // {
    //   chain: ChainNames.mantle,
    //   birthday: 1721347200, // Fri Jul 19 2024 00:00:00 GMT+0000
    //   solvBTC: '0xa68d25fC2AF7278db4BcdcAabce31814252642a9',
    //   router: '0x900637b3258e6b86fe2e713fbca4510ad934ee7e',
    // },
    // {
    //   chain: ChainNames.avalanche,
    //   birthday: 1722556800, // Fri Aug 02 2024 00:00:00 GMT+0000
    //   solvBTC: '0xbc78D84Ba0c46dFe32cf2895a19939c86b81a777',
    // },
    // {
    //   chain: ChainNames.bob,
    //   birthday: 1723680000, // Thu Aug 15 2024 00:00:00 GMT+0000
    //   solvBTC: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
    // },
  ],
};
