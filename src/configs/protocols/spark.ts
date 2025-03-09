import { ChainNames, ProtocolNames } from '../names';
import { AaveProtocolConfig } from './aave';
import { GauntletProtocolConfig } from './gauntlet';

// https://www.spark.fi/
// forked from Aave v3
export const SparkConfigs: AaveProtocolConfig = {
  protocol: ProtocolNames.spark,
  birthday: 1678233600, // Wed Mar 08 2023 00:00:00 GMT+0000
  lendingMarkets: [
    {
      chain: ChainNames.ethereum,
      marketName: 'Main Market',
      version: 3,
      birthday: 1678233600, // Wed Mar 08 2023 00:00:00 GMT+0000
      lendingPool: '0xc13e21b648a5ee794902342038ff3adab66be987',
      dataProvider: '0xfc21d6d146e6086b8359705c8b28512a983db0cb',
      oracle: {
        currency: 'usd',
        address: '0x8105f69d9c41644c6a0803fda7d03aa70996cfd9',
      },
    },
    {
      chain: ChainNames.gnosis,
      marketName: 'Main Market',
      version: 3,
      birthday: 1693958400, // Wed Sep 06 2023 00:00:00 GMT+0000
      lendingPool: '0x2dae5307c5e3fd1cf5a72cb6f698f915860607e0',
      dataProvider: '0x2a002054a06546bb5a264d57a81347e23af91d18',
      oracle: {
        currency: 'usd',
        address: '0x8105f69d9c41644c6a0803fda7d03aa70996cfd9',
      },
    },
  ],
};

export const SparkdaoConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.sparkdao,
  birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1710547200, // Sat Mar 16 2024 00:00:00 GMT+0000
      morphoVaults: ['0x73e65DBD630f90604062f6E02fAb9138e713edD9'],
      eulerVaults: [],
    },
    {
      chain: ChainNames.base,
      birthday: 1735603200, // Tue Dec 31 2024 00:00:00 GMT+0000
      morphoVaults: ['0x7BfA7C4f149E7415b73bdeDfe609237e29CBF34A'],
      eulerVaults: [],
    },
  ],
};
