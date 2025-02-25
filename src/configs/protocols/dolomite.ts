import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface DolomiteMarket {
  chain: string;
  birthday: number;
  margin: string;
}

export interface DolomiteProtocolConfig extends ProtocolConfig {
  markets: Array<DolomiteMarket>;
}

export const DolomiteConfigs: DolomiteProtocolConfig = {
  protocol: ProtocolNames.dolomite,
  birthday: 1664841600, // Tue Oct 04 2022 00:00:00 GMT+0000
  markets: [
    {
      chain: ChainNames.arbitrum,
      birthday: 1664841600, // Tue Oct 04 2022 00:00:00 GMT+0000
      margin: '0x6bd780e7fdf01d77e4d475c821f1e7ae05409072',
    },
    // {
    //   chain: ChainNames.ink,
    //   birthday: 1734566400, // Thu Dec 19 2024 00:00:00 GMT+0000
    //   margin: '0x003ca23fd5f0ca87d01f6ec6cd14a8ae60c2b97d',
    // },
    // {
    //   chain: ChainNames.mantle,
    //   birthday: 1714348800, // Mon Apr 29 2024 00:00:00 GMT+0000
    //   margin: '0xE6Ef4f0B2455bAB92ce7cC78E35324ab58917De8',
    // },
    // {
    //   chain: ChainNames.polygonzkevm,
    //   birthday: 1706832000, // Fri Feb 02 2024 00:00:00 GMT+0000
    //   margin: '0x836b557Cf9eF29fcF49C776841191782df34e4e5',
    // },
    // {
    //   chain: ChainNames.berachain,
    //   birthday: 1737763200, // Sat Jan 25 2025 00:00:00 GMT+0000
    //   margin: '0x003ca23fd5f0ca87d01f6ec6cd14a8ae60c2b97d',
    // },
  ],
};
