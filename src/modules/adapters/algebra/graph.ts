import { EventSignatures } from '../../../configs/constants';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapV3Graph from '../uniswap/univ3graph';

export default class AlgebraGraph extends UniswapV3Graph {
  public readonly name: string = 'adapter.algebra';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    this.poolCreatedEventSignature = EventSignatures.AlgebraFactory_PoolCreated;
  }
}
