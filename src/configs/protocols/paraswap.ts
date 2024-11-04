import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ParaswapSwapperConfig {
  chain: string;
  birthday: number;
  address: string;
}

export interface ParaswapProtocolConfig extends ProtocolConfig {
  swappers: Array<ParaswapSwapperConfig>;
}

export const ParaswapConfigs: ParaswapProtocolConfig = {
  protocol: ProtocolNames.paraswap,
  category: ProtocolCategories.dexAggregator,
  birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
  swappers: [
    {
      chain: ChainNames.ethereum,
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: '0xdef171fe48cf0115b1d80b88dc8eab59176fee57',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1657238400, // Fri Jul 08 2022 00:00:00 GMT+0000
      address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1631059200, // Wed Sep 08 2021 00:00:00 GMT+0000
      address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
    },
    {
      chain: ChainNames.base,
      birthday: 1694217600, // Sat Sep 09 2023 00:00:00 GMT+0000
      address: '0x59C7C832e96D2568bea6db468C1aAdcbbDa08A52',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1642636800, // Thu Jan 20 2022 00:00:00 GMT+0000
      address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1657929600, // Sat Jul 16 2022 00:00:00 GMT+0000
      address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1629331200, // Thu Aug 19 2021 00:00:00 GMT+0000
      address: '0xDEF171Fe48CF0115B1d80b88dc8eAB59176FEe57',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1689724800, // Wed Jul 19 2023 00:00:00 GMT+0000
      address: '0xb83b554730d29ce4cb55bb42206c3e2c03e4a40a',
    },
  ],
};
