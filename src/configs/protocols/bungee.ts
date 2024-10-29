import { ProtocolCategories, ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import BungeeSupportedTokens from '../data/constants/BungeeTokens.json';

export interface BungeeGatewayConfig {
  chain: string;
  birthday: number;
  gateway: string;

  // list of supported tokens
  tokens: Array<Token>;
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
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.ethereum),
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.arbitrum),
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.avalanche),
    },
    {
      chain: ChainNames.base,
      birthday: 1690675200, // Sun Jul 30 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.base),
    },
    {
      chain: ChainNames.blast,
      birthday: 1709683200, // Wed Mar 06 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.blast),
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.bnbchain),
    },
    {
      chain: ChainNames.fantom,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.fantom),
    },
    {
      chain: ChainNames.linea,
      birthday: 1701302400, // Thu Nov 30 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.linea),
    },
    {
      chain: ChainNames.mantle,
      birthday: 1707523200, // Sat Feb 10 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.mantle),
    },
    {
      chain: ChainNames.optimism,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.optimism),
    },
    {
      chain: ChainNames.polygon,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.polygon),
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.polygonzkevm),
    },
    {
      chain: ChainNames.scroll,
      birthday: 1709251200, // Fri Mar 01 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.scroll),
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.gnosis),
    },
    {
      chain: ChainNames.zksync,
      birthday: 1681776000, // Tue Apr 18 2023 00:00:00 GMT+0000
      gateway: '0xadde7028e7ec226777e5dea5d53f6457c21ec7d6',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.zksync),
    },
    {
      chain: ChainNames.mode,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
      tokens: BungeeSupportedTokens.filter((token) => token.chain === ChainNames.mode),
    },
    // {
    //   chain: ChainNames.aurora,
    //   birthday: 1679097600, // Sat Mar 18 2023 00:00:00 GMT+0000
    //   gateway: '0x3a23f943181408eac424116af7b7790c94cb97a5',
    //   tokens: BungeeSupportedTokens.filter(token => token.chain === ChainNames.aurora),
    // },
  ],
};
