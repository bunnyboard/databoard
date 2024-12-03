import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface WbethTokenConfig {
  chain: string;
  birthday: number;
  address: string;
}

export interface WbethProtocolConfig extends ProtocolConfig {
  tokens: Array<WbethTokenConfig>;
}

export const WbethConfigs: WbethProtocolConfig = {
  protocol: ProtocolNames.wbeth,
  birthday: 1681948800, // Thu Apr 20 2023 00:00:00 GMT+0000
  tokens: [
    {
      chain: ChainNames.ethereum,
      birthday: 1681948800, // Thu Apr 20 2023 00:00:00 GMT+0000
      address: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1681948800, // Thu Apr 20 2023 00:00:00 GMT+0000
      address: '0xa2e3356610840701bdf5611a53974510ae27e2e1',
    },
  ],
};
