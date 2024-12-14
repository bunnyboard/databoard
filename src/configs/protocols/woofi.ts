import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface WoofiRouterConfig {
  chain: string;
  birthday: number;
  router: string;
}

export interface WoofiProtocolConfig extends ProtocolConfig {
  routers: Array<WoofiRouterConfig>;
}

export const WoofiConfigs: WoofiProtocolConfig = {
  protocol: ProtocolNames.woofi,
  birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
  routers: [
    {
      chain: ChainNames.ethereum,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.base,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.linea,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x4c4AF8DBc524681930a27b2F1Af5bcC8062E6fB7',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1708905600, // Mon Feb 26 2024 00:00:00 GMT+0000
      router: '0x09873bfECA34F1Acd0a7e55cDA591f05d8a75369',
    },
  ],
};
