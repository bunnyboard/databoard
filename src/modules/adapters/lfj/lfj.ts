import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapAdapter from '../uniswap/uniswap';
import { Pool2Types } from '../../../types/domains/pool2';
import UniswapV2Core from '../uniswap/univ2';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { IDexCore } from '../uniswap/core';
import LfjLiquidityBookCore from './lbook';

export default class LfjAdapter extends UniswapAdapter {
  public readonly name: string = 'adapter.lfj';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public getDexAdapter(factoryConfig: UniswapFactoryConfig): IDexCore | null {
    if (factoryConfig.version === Pool2Types.univ2) {
      return new UniswapV2Core(this.services, this.storages, factoryConfig);
    } else if (factoryConfig.version === Pool2Types.lbook) {
      return new LfjLiquidityBookCore(this.services, this.storages, factoryConfig);
    }

    return null;
  }
}
