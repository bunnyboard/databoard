import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface OpenoceanExchangeConfig {
  chain: string;
  birthday: number;
  exchange: string;
}

export interface OpenoceanProtocolConfig extends ProtocolConfig {
  exchanges: Array<OpenoceanExchangeConfig>;
}

export const OpenoceanConfigs: OpenoceanProtocolConfig = {
  protocol: ProtocolNames.openocean,
  birthday: 1630713600, // Sat Sep 04 2021 00:00:00 GMT+0000
  exchanges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1633996800, // Tue Oct 12 2021 00:00:00 GMT+0000
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1631750400, // Thu Sep 16 2021 00:00:00 GMT+0000
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1632441600, // Fri Sep 24 2021 00:00:00 GMT+0000
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1630713600, // Sat Sep 04 2021 00:00:00 GMT+0000
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1637712000, // Wed Nov 24 2021 00:00:00 GMT+0000
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1642636800,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1679961600,
      exchange: '0x36A1aCbbCAfca2468b85011DDD16E7Cb4d673230',
    },
    {
      chain: ChainNames.base,
      birthday: 1691625600,
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.opbnb,
      birthday: 1694563200,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1689724800,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.manta,
      birthday: 1696982400,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.telos,
      birthday: 1690502400,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1697932800,
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1638230400,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.cronos,
      birthday: 1650412800,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.blast,
      birthday: 1709337600,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.mode,
      birthday: 1708992000,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.kava,
      birthday: 1678406400,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.celo,
      birthday: 1678320000,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.metis,
      birthday: 1675296000,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
    {
      chain: ChainNames.sonic,
      birthday: 1733875200,
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.berachain,
      birthday: 1739232000,
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.unichain,
      birthday: 1740096000,
      exchange: '0x6352a56caadc4f1e25cd6c75970fa768a3304e64',
    },
    {
      chain: ChainNames.swellchain,
      birthday: 1743120000,
      exchange: '0x6352a56caadC4F1E25CD6c75970Fa768A3304e64',
    },
  ],
};
