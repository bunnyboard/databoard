import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LayerBankConfig {
  chain: string;
  birthday: number;
  core: string;
}

export interface LayerBankProtocolConfig extends ProtocolConfig {
  banks: Array<LayerBankConfig>;
}

export const LayerbankConfigs: LayerBankProtocolConfig = {
  protocol: ProtocolNames.layerbank,
  category: ProtocolCategories.lending,
  birthday: 1697846400, // Sat Oct 21 2023 00:00:00 GMT+0000
  banks: [
    {
      chain: ChainNames.scroll,
      birthday: 1697846400, // Sat Oct 21 2023 00:00:00 GMT+0000
      core: '0xec53c830f4444a8a56455c6836b5d2aa794289aa',
    },
    {
      chain: ChainNames.linea,
      birthday: 1710288000, // Wed Mar 13 2024 00:00:00 GMT+0000
      core: '0x43eac5bfea14531b8de0b334e123ea98325de866',
    },
    {
      chain: ChainNames.mode,
      birthday: 1708473600, // Wed Feb 21 2024 00:00:00 GMT+0000
      core: '0x80980869d90a737aff47aba6fbaa923012c1ff50',
    },
    {
      chain: ChainNames.zklinknova,
      birthday: 1711756800, // Sat Mar 30 2024 00:00:00 GMT+0000
      core: '0x4ac518dbf0cc730a1c880739cfa98fe0bb284959',
    },
    {
      chain: ChainNames.bsquared,
      birthday: 1713225600, // Tue Apr 16 2024 00:00:00 GMT+0000
      core: '0x72f7a8eb9f83de366ae166dc50f16074076c3ea6',
    },
    {
      chain: ChainNames.bob,
      birthday: 1714521600, // Wed May 01 2024 00:00:00 GMT+0000
      core: '0x77cabfd057bd7c81c011059f1bf74ec1fbeda971',
    },
    {
      chain: ChainNames.bitlayer,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      core: '0xf1e25704e75da0496b46bf4e3856c5480a3c247f',
    },
    {
      chain: ChainNames.manta,
      birthday: 1698624000, // Mon Oct 30 2023 00:00:00 GMT+0000
      core: '0xb7a23fc0b066051de58b922dc1a08f33df748bbf',
    },
  ],
};
