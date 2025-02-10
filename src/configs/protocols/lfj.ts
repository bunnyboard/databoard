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
  factories: [
    {
      chain: ChainNames.avalanche,
      version: Pool2Types.univ2,
      factory: '0x9ad6c38be94206ca50bb0d90783181662f0cfa10',
      birthday: 1624838400, // Mon Jun 28 2021 00:00:00 GMT+0000
      feeRateForLiquidityProviders: 0.0025,
      feeRateForProtocol: 0.0005,
      subgraph: {
        provider: 'thegraph',
        subgraphIdOrEndpoint: '235SeJpWvpbzV4jkkvKHuyrjYscdpXFwXdqESp6GB2mA',
      },
    },
  ],
};
