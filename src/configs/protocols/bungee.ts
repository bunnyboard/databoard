import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface BungeeGatewayConfig {
  chain: string;
  birthday: number;
  gateway: string;
}

export interface BungeeProtocolConfig extends ProtocolConfig {
  socketGateways: Array<BungeeGatewayConfig>;
}

export const BungeeConfigs: BungeeProtocolConfig = {
  protocol: ProtocolNames.bungee,
  category: ProtocolCategories.bridge,
  birthday: 1679097600, // gateway deployed on ethereum
  socketGateways: [
    {
      chain: ChainNames.ethereum,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23F943181408EAC424116Af7b7790c94Cb97a5',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.base,
      birthday: 1690675200, // Sun Jul 30 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.blast,
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.linea,
      birthday: 1701302400, // Thu Nov 30 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1707523200, // Sat Feb 10 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      gateway: '0xadde7028e7ec226777e5dea5d53f6457c21ec7d6',
    },
    {
      chain: ChainNames.mode,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    },
    // {
    //   chain: ChainNames.aurora,
    //   birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
    //   gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    // },
  ],
};
