import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapAdapter from '../uniswap/uniswap';
import { Pool2Types } from '../../../types/domains/pool2';
import UniswapV2Core from '../uniswap/univ2';
import { UniswapFactoryConfig, UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import { IDexCore } from '../uniswap/core';
import LfjLiquidityBookCore from './lbook';
import UniswapV2Graph from '../uniswap/univ2graph';
import LfjLiquidityBookGraph from './lbookGraph';

export default class LfjAdapter extends UniswapAdapter {
  public readonly name: string = 'adapter.lfj';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public getDexAdapter(factoryConfig: UniswapFactoryConfig): IDexCore | null {
    const config = this.protocolConfig as UniswapProtocolConfig;

    if (factoryConfig.version === Pool2Types.univ2) {
      if (factoryConfig.subgraph && !config.factorySync) {
        return new UniswapV2Graph(this.services, this.storages, factoryConfig);
      } else {
        return new UniswapV2Core(this.services, this.storages, factoryConfig);
      }
    } else if (factoryConfig.version === Pool2Types.lbook) {
      if (factoryConfig.subgraph && !config.factorySync) {
        return new LfjLiquidityBookGraph(this.services, this.storages, factoryConfig);
      } else {
        return new LfjLiquidityBookCore(this.services, this.storages, factoryConfig);
      }
    }

    return null;
  }
}
