import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';
import { CompoundProtocolConfig } from './compound';
import { UniswapProtocolConfig } from './uniswap';

export const LfjlendConfigs: CompoundProtocolConfig = {
  protocol: ProtocolNames.lfjlend,
  birthday: 1633910400, // Mon Oct 11 2021 00:00:00 GMT+0000
  comptrollers: [
    {
      chain: ChainNames.avalanche,
      marketName: 'Core Market',
      birthday: 1633910400, // Mon Oct 11 2021 00:00:00 GMT+0000
      comptroller: '0xdc13687554205E5b89Ac783db14bb5bba4A1eDaC',
      oracleSource: 'oracleUsd',
    },
  ],
};

export const LfjConfigs: UniswapProtocolConfig = {
  protocol: ProtocolNames.lfj,
  birthday: 1624838400, // Mon Jun 28 2021 00:00:00 GMT+0000
  factorySync: true,
  factories: [
    // v1
    // {
    //   chain: ChainNames.avalanche,
    //   version: Pool2Types.univ2,
    //   factory: '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
    //   factoryBirthblock: 2486392,
    //   birthday: 1624838400, // Mon Jun 28 2021 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.0005,
    //   feeRateForLiquidityProviders: 0.0025,
    //   subgraph: {
    //     endpoint: getTheGraphEndpoint({
    //       subgraphId: '235SeJpWvpbzV4jkkvKHuyrjYscdpXFwXdqESp6GB2mA',
    //     }),
    //     queryFields: {
    //       ...UniswapV2SubgraphQueryFieldsDefault,
    //       totalLiquidityUSD: 'liquidityUSD',
    //     },
    //   },
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.univ2,
    //   factory: '0xaE4EC9901c3076D0DdBe76A520F9E90a6227aCB7',
    //   factoryBirthblock: 47838075,
    //   birthday: 1671667200, // Thu Dec 22 2022 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.0005,
    //   feeRateForLiquidityProviders: 0.0025,
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.univ2,
    //   factory: '0x4f8bdc85E3eec5b9dE67097c3f59B6Db025d9986',
    //   factoryBirthblock: 26142762,
    //   birthday: 1677888000, // Sat Mar 04 2023 00:00:00 GMT+0000
    //   feeRateForProtocol: 0.0005,
    //   feeRateForLiquidityProviders: 0.0025,
    // },

    // v2
    // {
    //   chain: ChainNames.avalanche,
    //   version: Pool2Types.lbook,
    //   factory: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
    //   factoryBirthblock: 28371397,
    //   birthday: 1680825600, // Fri Apr 07 2023 00:00:00 GMT+0000
    //   subgraph: {
    //     endpoint: getTheGraphEndpoint({
    //       subgraphId: '9kYckLGqJxmSys6gZeV7DLxPA7D1sKS6j6xDXW29WgzN',
    //     }),
    //     queryFields: {
    //       ...UniswapV2SubgraphQueryFieldsDefault,
    //       factories: 'lbfactories',
    //       pools: 'lbpairs',
    //     },
    //   },
    // },
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.lbook,
      factory: '0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c',
      factoryBirthblock: 46536129,
      birthday: 1718064000, // Tue Jun 11 2024 00:00:00 GMT+0000
    },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.lbook,
    //   factory: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
    //   factoryBirthblock: 77473199,
    //   birthday: 1680825600, // Fri Apr 07 2023 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.arbitrum,
    //   version: Pool2Types.lbook,
    //   factory: '0xb43120c4745967fa9b93E79C149E66B0f2D6Fe0c',
    //   factoryBirthblock: 220345864,
    //   birthday: 1718064000, // Tue Jun 11 2024 00:00:00 GMT+0000
    // },
    // {
    //   chain: ChainNames.bnbchain,
    //   version: Pool2Types.lbook,
    //   factory: '0x8e42f2F4101563bF679975178e880FD87d3eFd4e',
    //   factoryBirthblock: 27099340,
    //   birthday: 1680825600, // Fri Apr 07 2023 00:00:00 GMT+0000
    // },
  ],
};
