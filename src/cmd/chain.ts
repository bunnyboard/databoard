import { ChainConfigs } from '../configs';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import { getChainAdapters } from '../modules/chains';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';

const DefaultServiceSleepSeconds = 300; // 5 minutes

export class ChainCommand extends BasicCommand {
  public readonly name: string = 'chain';
  public readonly describe: string = 'Run blockchain data collector services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();
    const adapters = getChainAdapters(services.oracle, storages);

    logger.info('attemp chain command', {
      service: 'command',
      argvChain: argv.chain,
    });

    do {
      for (const chain of Object.keys(ChainConfigs as any)) {
        if (argv.chain === undefined || argv.chain === '' || argv.chain === chain) {
          if (adapters[chain]) {
            await adapters[chain].run({
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
      chain: {
        type: 'string',
        default: '',
        describe:
          'Collect blockchain data of given chain. You can pass a list of protocol seperated by comma, ex: --chain "ethereum,arbitrum".',
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
