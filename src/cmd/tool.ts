import envConfig from '../configs/envConfig';
import { ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

export class ToolCommand extends BasicCommand {
  public readonly name: string = 'tool';
  public readonly describe: string = 'Helper tools';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const todo = argv.todo;
    const protocol = argv.protocol;

    if (todo === 'clearProtocolData') {
      const storages: ContextStorages = await super.getStorages();

      const stateCollection = await storages.database.getCollection(
        envConfig.mongodb.collections.protocolDataStates.name,
      );
      console.log(await stateCollection.deleteMany({ protocol: protocol }));

      const snapshotCollection = await storages.database.getCollection(
        envConfig.mongodb.collections.protocolDataSnapshots.name,
      );
      console.log(await snapshotCollection.deleteMany({ protocol: protocol }));
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      todo: {
        type: 'string',
        default: '',
        describe: 'Given a task to do: clearProtocolData.',
      },
      protocol: {
        type: 'string',
        default: '',
        describe: 'The protocol param for todo task.',
      },
    });
  }
}
