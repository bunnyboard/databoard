import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ZerionRouterConfig {
  chain: string;
  birthday: number;
  router: string;
}

export interface ZerionProtocolConfig extends ProtocolConfig {
  routers: Array<ZerionRouterConfig>;
}

export const ZerionConfigs: ZerionProtocolConfig = {
  protocol: ProtocolNames.zerion,
  birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
  routers: [
    {
      chain: ChainNames.arbitrum,
      birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
      router: '0xd7f1dd5d49206349cae8b585fcb0ce3d96f1696f',
    },
    {
      chain: ChainNames.base,
      birthday: 1691798400, // Sat Aug 12 2023 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.blast,
      birthday: 1711929600, // Mon Apr 01 2024 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.celo,
      birthday: 1697068800, // Thu Oct 12 2023 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1647388800, // Wed Mar 16 2022 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.linea,
      birthday: 1712275200, // Fri Apr 05 2024 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1726185600, // Fri Sep 13 2024 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1646870400, // Thu Mar 10 2022 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1712361600, // Sat Apr 06 2024 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1712361600, // Sat Apr 06 2024 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
    {
      chain: ChainNames.taiko,
      birthday: 1726099200, // Thu Sep 12 2024 00:00:00 GMT+0000
      router: '0xd7F1Dd5D49206349CaE8b585fcB0Ce3D96f1696F',
    },
  ],
};
