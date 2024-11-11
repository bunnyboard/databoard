import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface OdosRouterConfig {
  chain: string;
  router: string;
  limitOrderRouter?: string;
  birthday: number;
}

export interface OdosProtocolConfig extends ProtocolConfig {
  routers: Array<OdosRouterConfig>;
}

export const OdosConfigs: OdosProtocolConfig = {
  protocol: ProtocolNames.odos,
  category: ProtocolCategories.aggregator,
  birthday: 1662508800, // Wed Sep 07 2022 00:00:00 GMT+0000
  routers: [
    {
      chain: ChainNames.ethereum,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0xcf5540fffcdc3d510b18bfca6d2b9987b0772559',
      limitOrderRouter: '0x0F26B03961eb5D625BD6001278F0DB13f3e583d8',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0xa669e7a0d4b3e4fa48af2de86bd4cd7126be4e13',
      limitOrderRouter: '0x83564b903c0311877accEE8f99e6BEb712AD8E43',
    },
    {
      chain: ChainNames.base,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0x19ceead7105607cd444f5ad10dd51356436095a1',
      limitOrderRouter: '0x8c8c3E8465B911186aDeC83a53C7De8c587eDDaB',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0xca423977156bb05b13a2ba3b76bc5419e2fe9680',
      limitOrderRouter: '0xafF142fBc8FA5B1885FE54E4C889985F8a579b24',
    },
    {
      chain: ChainNames.linea,
      birthday: 1710374400, // Thu Mar 14 2024 00:00:00 GMT+0000
      router: '0x2d8879046f1559E53eb052E949e9544bCB72f414',
      limitOrderRouter: '0x5Ab73021e0648f46Da303cE7f5a0F2F15a3944c6',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1717372800, // Mon Jun 03 2024 00:00:00 GMT+0000
      router: '0xbFe03C9E20a9Fc0b37de01A172F207004935E0b1',
      limitOrderRouter: '0x014F335e0161B4EdDf3fF5b297BA6A31004Ca528',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1710115200, // Mon Mar 11 2024 00:00:00 GMT+0000
      router: '0xD9F4e85489aDCD0bAF0Cd63b4231c6af58c26745',
      limitOrderRouter: '0x014F335e0161B4EdDf3fF5b297BA6A31004Ca528',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0x4bBa932E9792A2b917D47830C93a9BC79320E4f7',
      limitOrderRouter: '0xa688F1d16b44b9A3110C3b4413b6081F271A643B',
    },
    {
      chain: ChainNames.mode,
      birthday: 1710633600, // Sun Mar 17 2024 00:00:00 GMT+0000
      router: '0x7E15EB462cdc67Cf92Af1f7102465a8F8c784874',
      limitOrderRouter: '0x65005f4Bea4005D48eE9Bdaae960832c6CECC557',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0x4e3288c9ca110bcc82bf38f09a7b425c095d92bf',
      limitOrderRouter: '0xBefe4BC7f39771CF7C2CcCE6E4e7Ef393deb6704',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0x88de50B233052e4Fb783d4F6db78Cc34fEa3e9FC',
      limitOrderRouter: '0xD10634297961fEa132ac7b6e7451BC4E5B17359b',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0x89b8aa89fdd0507a99d334cbe3c808fafc7d850e',
      limitOrderRouter: '0xFA198dF5167dc5fb7DDA2Ad413310Be67394bF3d',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      router: '0xd0c22a5435f4e8e5770c1fafb5374015fc12f7cd',
      limitOrderRouter: '0x8c8c3E8465B911186aDeC83a53C7De8c587eDDaB',
    },
  ],
};
