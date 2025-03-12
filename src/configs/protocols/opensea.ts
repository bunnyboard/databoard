import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SeaportConfig {
  chain: string;

  // 1 -> seaport 1.1
  // 4 -> seaport 1.4
  // 5 -> seaport 1.5
  // 6 -> seaport 1.6
  version: 1 | 4 | 5 | 6;

  birthday: number;
  seaport: string;
}

export interface OpenseaProtocolConfig extends ProtocolConfig {
  seaports: Array<SeaportConfig>;
  feeRecipients: Array<string>;
}

export const OpenseaConfigs: OpenseaProtocolConfig = {
  protocol: ProtocolNames.opensea,
  birthday: 1654992000, // Sun Jun 12 2022 00:00:00 GMT+0000
  feeRecipients: [
    '0x5b3256965e7c3cf26e11fcaf296dfc8807c01073',
    '0x8de9c5a032463c561423387a9648c5c7bcc5bc90',
    '0x34ba0f2379bf9b81d09f7259892e26a8b0885095',
    '0x0000a26b00c1f0df003000390027140000faa719',
  ],
  seaports: [
    {
      chain: ChainNames.ethereum,
      version: 1,
      birthday: 1654992000, // Sun Jun 12 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbef3e08e8df289169ede581',
    },
    {
      chain: ChainNames.ethereum,
      version: 4,
      birthday: 1676764800, // Sun Feb 19 2023 00:00:00 GMT+0000
      seaport: '0x00000000000001ad428e4906ae43d8f9852d0dd6',
    },
    {
      chain: ChainNames.ethereum,
      version: 5,
      birthday: 1682553600, // Thu Apr 27 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
    },
    {
      chain: ChainNames.ethereum,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // polygon
    {
      chain: ChainNames.polygon,
      version: 1,
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    },
    {
      chain: ChainNames.polygon,
      version: 5,
      birthday: 1682553600, // Thu Apr 27 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.polygon,
      version: 6,
      birthday: 1710979200, // Thu Mar 21 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // optimism
    {
      chain: ChainNames.optimism,
      version: 1,
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    },
    {
      chain: ChainNames.optimism,
      version: 5,
      birthday: 1682553600, // Thu Apr 27 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.optimism,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // arbitrum
    {
      chain: ChainNames.arbitrum,
      version: 1,
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    },
    {
      chain: ChainNames.arbitrum,
      version: 5,
      birthday: 1682553600, // Thu Apr 27 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.arbitrum,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // base
    {
      chain: ChainNames.base,
      version: 5,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.base,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // avalanche
    {
      chain: ChainNames.avalanche,
      version: 1,
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    },
    {
      chain: ChainNames.avalanche,
      version: 5,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.avalanche,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // gnosis
    {
      chain: ChainNames.gnosis,
      version: 1,
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    },
    {
      chain: ChainNames.gnosis,
      version: 5,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.gnosis,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // bnbchain
    {
      chain: ChainNames.bnbchain,
      version: 1,
      birthday: 1656374400, // Tue Jun 28 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
    },
    {
      chain: ChainNames.bnbchain,
      version: 5,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.bnbchain,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },

    // zora
    {
      chain: ChainNames.zora,
      version: 5,
      birthday: 1689120000, // Wed Jul 12 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000ADc04C56Bf30aC9d3c0aAF14dC',
    },
    {
      chain: ChainNames.zora,
      version: 6,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      seaport: '0x0000000000000068F116a894984e2DB1123eB395',
    },
  ],
};
