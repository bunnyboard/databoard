import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface RangoExchangeConfig {
  chain: string;
  birthday: number;
  diamond: string;
}

export interface RangoProtocolConfig extends ProtocolConfig {
  exchanges: Array<RangoExchangeConfig>;
}

export const RangoConfigs: RangoProtocolConfig = {
  protocol: ProtocolNames.rango,
  birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
  exchanges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9de5e2edbc3052bf10125f0ca22d',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.moonbeam,
      birthday: 1687046400, // Sun Jun 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.cronos,
      birthday: 1687910400, // Wed Jun 28 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1687910400, // Wed Jun 28 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.linea,
      birthday: 1694563200, // Wed Sep 13 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.base,
      birthday: 1694995200, // Mon Sep 18 2023 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1695168000, // Wed Sep 20 2023 00:00:00 GMT+0000
      diamond: '0x13598FD0986D0E33c402f6907F05Acf720224527',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1706572800, // Tue Jan 30 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.celo,
      birthday: 1714608000, // Thu May 02 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.blast,
      birthday: 1715126400, // Wed May 08 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.metis,
      birthday: 1716681600, // Sun May 26 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.mode,
      birthday: 1720396800, // Mon Jul 08 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.taiko,
      birthday: 1731974400, // Tue Nov 19 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.zora,
      birthday: 1733097600, // Mon Dec 02 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
    {
      chain: ChainNames.xlayer,
      birthday: 1722643200, // Sat Aug 03 2024 00:00:00 GMT+0000
      diamond: '0x69460570c93f9DE5E2edbC3052bf10125f0Ca22d',
    },
  ],
};
