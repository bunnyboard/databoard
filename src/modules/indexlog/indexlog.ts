import { IndexlogConfig } from '../../configs/indexlog';
import ExecuteSession from '../../services/executeSession';
import { ContextServices, ContextStorages, IIndexlogAdapter } from '../../types/namespaces';
import { RunIndexlogOptions } from '../../types/options';

export default class IndexlogAdapter implements IIndexlogAdapter {
  public readonly name: string = 'indexlog';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;
  public readonly indexlogConfig: IndexlogConfig;

  public executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, indexlogConfig: IndexlogConfig) {
    this.services = services;
    this.storages = storages;
    this.indexlogConfig = indexlogConfig;
    this.executeSession = new ExecuteSession();
  }

  public async run(options: RunIndexlogOptions): Promise<void> {
    console.log(options);
    process.exit(0);
  }
}
