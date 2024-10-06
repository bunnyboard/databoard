import envConfig from '../configs/envConfig';
import { ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

export class ClearProtocolDataCommand extends BasicCommand {
  public readonly name: string = 'clearProtocolData';
  public readonly describe: string =
    'Help to clear all data of a given protocol from database. You should know what are you doing.';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const protocol = argv.protocol;

    const storages: ContextStorages = await super.getStorages();

    const stateCollection = await storages.database.getCollection(
      envConfig.mongodb.collections.protocolDataStates.name,
    );
    console.log(await stateCollection.deleteMany({ protocol: protocol }));

    const snapshotCollection = await storages.database.getCollection(
      envConfig.mongodb.collections.protocolDataSnapshots.name,
    );
    console.log(await snapshotCollection.deleteMany({ protocol: protocol }));

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      protocol: {
        type: 'string',
        default: '',
        describe: 'The protocol param for todo task.',
      },
    });
  }
}
