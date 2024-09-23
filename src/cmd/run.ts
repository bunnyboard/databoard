import { ProtocolConfigs } from '../configs';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import { getProtocolAdapters } from '../modules/adapters';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

const DefaultServiceSleepSeconds = 300; // 5 minutes

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run collector services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();
    const adapters = getProtocolAdapters(services, storages);

    logger.info('attemp run command', {
      service: 'command',
      argvProtocol: argv.protocol,
      argvService: argv.service,
      argvFromTime: argv.fromTime,
      argvForce: argv.force,
    });

    do {
      for (const protocol of Object.keys(ProtocolConfigs as any)) {
        if (argv.protocol === undefined || argv.protocol === '' || argv.protocol === protocol) {
          if (adapters[protocol]) {
            await adapters[protocol].run({
              service: argv.service === 'state' || argv.service === 'snapshot' ? argv.service : undefined,
              fromTime: argv.fromTime ? argv.fromTime : undefined,
              force: argv.force ? argv.force : false,
            });
          }
        }
      }

      if (!argv.exit) {
        await sleep(argv.interval);
      }
    } while (!argv.exit);

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      protocol: {
        type: 'string',
        default: '',
        describe:
          'Collect data of given protocol. You can pass a list of protocol seperated by comma, ex: --protocol "aave,uniswap".',
      },
      service: {
        type: 'string',
        default: 'undefined',
        describe: 'Collect current data or historical snapshots or both.',
      },
      fromTime: {
        type: 'number',
        default: 0,
        describe: 'Collect snapshots data from given timestamp.',
      },
      force: {
        type: 'boolean',
        default: false,
        describe: 'Force collect data from given from block number.',
      },

      exit: {
        type: 'boolean',
        default: false,
        describe: 'Do not run services as workers.',
      },
      interval: {
        type: 'number',
        default: DefaultServiceSleepSeconds,
        describe: 'Given amount of seconds to sleep after every sync round.',
      },
    });
  }
}
