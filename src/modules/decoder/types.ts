import { DecoderModuleConfig } from '../../configs/decoder';
import { ContextServices, ContextStorages } from '../../types/namespaces';

export interface HandleLogOptions {
  context: {
    services: ContextServices;
    storages: ContextStorages;
  };
  config: DecoderModuleConfig;
  chain: string;
  log: any;
}
