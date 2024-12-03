import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface KyberswapMetaRouterConfig {
  chain: string;
  birthday: number;
  address: string;
}

export interface KyberswapProtocolConfig extends ProtocolConfig {
  routers: Array<KyberswapMetaRouterConfig>;
}

export const KyberswapConfigs: KyberswapProtocolConfig = {
  protocol: ProtocolNames.kyberswap,
  birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
  routers: [
    {
      chain: ChainNames.ethereum,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131b5fae19ea4f9d964eac0408e4408b66337b5',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.base,
      birthday: 1692748800, // Wed Aug 23 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.base,
      birthday: 1685059200, // Fri May 26 2023 00:00:00 GMT+0000
      address: '0x3F95eF3f2eAca871858dbE20A93c01daF6C2e923',
    },
    {
      chain: ChainNames.blast,
      birthday: 1709942400, // Sat Mar 09 2024 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.linea,
      birthday: 1689638400, // Tue Jul 18 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1697241600, // Sat Oct 14 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1691539200, // Wed Aug 09 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
    {
      chain: ChainNames.cronos,
      birthday: 1673308800, // Tue Jan 10 2023 00:00:00 GMT+0000
      address: '0x6131B5fae19EA4f9D964eAc0408E4408b66337b5',
    },
  ],
};
