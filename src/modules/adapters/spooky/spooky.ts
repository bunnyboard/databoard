import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapAdapter from '../uniswap/uniswap';

export default class SpookyAdapter extends UniswapAdapter {
  public readonly name: string = 'adapter.spooky 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }
}
