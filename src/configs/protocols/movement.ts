import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LayerzeroOFTConfig {
  chain: string;
  birthday: number;
  address: string;
  token: string;
}

export interface MovementNativeBridgeProtocolConfig extends ProtocolConfig {
  chain: string;
  layer2Chain: string;
  bridges: Array<LayerzeroOFTConfig>;
}

export const MovementNativeBridgeConfigs: MovementNativeBridgeProtocolConfig = {
  protocol: ProtocolNames.movementNativeBridge,
  birthday: 1741132800, // Wed Mar 05 2025 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.movement,
  bridges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1741132800, // Wed Mar 05 2025 00:00:00 GMT+0000
      address: '0xf1df43a3053cd18e477233b59a25fc483c2cbe0f',
      token: '0x3073f7aaa4db83f95e9fff17424f71d4751a3073',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741132800, // Wed Mar 05 2025 00:00:00 GMT+0000
      address: '0xc209a627a7B0a19F16A963D9f7281667A2d9eFf2',
      token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741132800, // Wed Mar 05 2025 00:00:00 GMT+0000
      address: '0x5e87D7e75B272fb7150B4d1a05afb6Bd71474950',
      token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741132800, // Wed Mar 05 2025 00:00:00 GMT+0000
      address: '0x06E01cB086fea9C644a2C105A9F20cfC21A526e8',
      token: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1741132800, // Wed Mar 05 2025 00:00:00 GMT+0000
      address: '0xa55688C280E725704CFe8Ea30eD33fE5B91cE6a4',
      token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
    },
  ],
};
