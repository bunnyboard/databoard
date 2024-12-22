import { ProtocolConfigs } from '../configs';
import { BasicCommand } from './basic';
import { getProtocolAdapters } from '../modules/adapters';
import { ContextServices, ContextStorages } from '../types/namespaces';

export class TestCommand extends BasicCommand {
  public readonly name: string = 'test';
  public readonly describe: string = 'Run adapter testing';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    const protocol = argv.protocol;
    const adapters = getProtocolAdapters(services, storages);

    if ((ProtocolConfigs as any)[protocol] && adapters[protocol]) {
      await adapters[protocol].runTest({
        output: argv.output,
        timestamp: argv.timestamp,
      });
    } else {
      console.log(`adapter not found for protocol ${protocol}`);
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      protocol: {
        alias: 'p',
        type: 'string',
        default: '',
        describe: 'Query and output JSON given protocol data.',
      },
      output: {
        type: 'string',
        default: 'pretty',
        describe: 'Print results in styles: pretty, json.',
      },
      timestamp: {
        type: 'number',
        default: 0,
        describe: 'Collect protocol at given timestamp.',
      },
    });
  }
}
