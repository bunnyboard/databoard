import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface AcrossSpokePoolConfig {
  chain: string;
  address: string;
  birthday: number;
  tokens?: Array<string>;
}

export interface AcrossProtocolConfig extends ProtocolConfig {
  spokePools: Array<AcrossSpokePoolConfig>;
}

export const AcrossConfigs: AcrossProtocolConfig = {
  protocol: ProtocolNames.across,
  birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
  spokePools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0x5c7BCd6E7De5423a257D81B442095A1a6ced35C5',
      tokens: [
        '0x6033f7f88332b8db6ad452b7c6d5bb643990ae3f',
        '0x0cec1a9154ff802e7934fc916ed7ca50bde6844e',
        '0xc011a73ee8576fb46f5e1c5751ca3b9fe0af2a6f',
        '0x44108f0223A3C3028F5Fe7AEC7f9bb2E66beF82F',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x3472A5A71965499acd81997a54BBA8D852C6E53d',
        '0x42bbfa2e77757c645eeaad1655e0911a7553efbc',
        '0x04Fa0d235C4abf4BcF4787aF4CF447DE572eF828',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0xe35e9842fceaca96570b734083f4a58e8f7c5f2a',
    },
    {
      chain: ChainNames.base,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      address: '0x09aea4b2242abc8bb4bb78d537a67a245a7bec64',
    },
    {
      chain: ChainNames.blast,
      birthday: 1719964800, // Wed Jul 03 2024 00:00:00 GMT+0000
      address: '0x2D509190Ed0172ba588407D4c2df918F955Cc6E1',
    },
    {
      chain: ChainNames.linea,
      birthday: 1709769600, // Thu Mar 07 2024 00:00:00 GMT+0000
      address: '0x7e63a5f1a8f0b4d0934b2f2327daed3f6bb2ee75',
    },
    {
      chain: ChainNames.mode,
      birthday: 1716336000, // Wed May 22 2024 00:00:00 GMT+0000
      address: '0x3baD7AD0728f9917d1Bf08af5782dCbD516cDd96',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0x6f26Bf09B1C792e3228e5467807a900A503c0281',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1682380800, // Tue Apr 25 2023 00:00:00 GMT+0000
      address: '0x9295ee1d8C5b022Be115A2AD3c30C72E34e7F096',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1721174400, // Wed Jul 17 2024 00:00:00 GMT+0000
      address: '0x3bad7ad0728f9917d1bf08af5782dcbd516cdd96',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1691193600, // Sat Aug 05 2023 00:00:00 GMT+0000
      address: '0xE0B015E54d54fc84a6cB9B666099c46adE9335FF',
    },
    {
      chain: ChainNames.lisk,
      birthday: 1719964800, // Wed Jul 03 2024 00:00:00 GMT+0000
      address: '0x9552a0a6624A23B848060AE5901659CDDa1f83f8',
    },
    {
      chain: ChainNames.redstone,
      birthday: 1723248000, // Sat Aug 10 2024 00:00:00 GMT+0000
      address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97',
    },
    {
      chain: ChainNames.zora,
      birthday: 1723507200, // Tue Aug 13 2024 00:00:00 GMT+0000
      address: '0x13fDac9F9b4777705db45291bbFF3c972c6d1d97',
    },
    {
      chain: ChainNames.worldchain,
      birthday: 1728432000, // Wed Oct 09 2024 00:00:00 GMT+0000
      address: '0x09aea4b2242abC8bb4BB78D537A67a245A7bEC64',
    },
  ],
};
