import { ProtocolConfigs } from '../configs';
import envConfig from '../configs/envConfig';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import { getProtocolAdapters } from '../modules';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';
import * as Sentry from '@sentry/node';

const DefaultServiceSleepSeconds = 30 * 60; // 30 minutes

export class RunCommand extends BasicCommand {
  public readonly name: string = 'run';
  public readonly describe: string = 'Run collector services';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    // check the protocol first
    if (argv.protocol === '') {
      console.log('required --protocol options');
      process.exit(0);
    }

    const protocols = argv.protocol ? argv.protocol.split(',') : [];
    for (const protocol of protocols) {
      if (!(ProtocolConfigs as any)[protocol]) {
        console.log(`protocol ${protocol} config not found`);
        process.exit(0);
      }
    }

    const cmdConfigs: any = {
      type: 'protocol',
      protocol: protocols.toString(),
    };

    cmdConfigs.service = argv.service === 'state' || argv.service === 'snapshot' ? argv.service : 'state and snapshot';
    if (argv.fromTime > 0) {
      cmdConfigs.fromTime = argv.fromTime;
    }
    cmdConfigs.force = argv.force;
    cmdConfigs.interval = `${argv.interval} seconds`;

    logger.info('attemp run command', {
      service: 'command',
      configs: cmdConfigs,
    });

    logger.info('loaded mongo database configs', {
      service: 'configs',
      configs: {
        'database mongo name': envConfig.mongodb.databaseName,
        'database mongo uri': envConfig.mongodb.connectionUri,
      },
    });

    if (envConfig.sentry.dsn) {
      logger.info('loaded sentry configs', {
        service: 'configs',
        configs: {
          dsn: envConfig.sentry.dsn,
        },
      });

      // ensure to call this before importing any other modules!
      Sentry.init({
        dsn: envConfig.sentry.dsn,
      });
    }

    const chainConfigs: any = {};
    for (const blockchainConfig of Object.values(envConfig.blockchains)) {
      chainConfigs[`node rpc ${blockchainConfig.name}`] = blockchainConfig.nodeRpc;
    }
    logger.info(`loaded blockchain rpc configs (${Object.keys(chainConfigs).length})`, {
      service: 'configs',
    });

    logger.seperator();

    await sleep(2);

    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    // get adapters
    const protocolAdapters = getProtocolAdapters(services, storages);

    do {
      for (const protocol of protocols) {
        if ((ProtocolConfigs as any)[protocol] && protocolAdapters[protocol]) {
          try {
            await protocolAdapters[protocol].run({
              service: argv.service === 'state' || argv.service === 'snapshot' ? argv.service : undefined,
              fromTime: argv.fromTime ? argv.fromTime : undefined,
              force: argv.force ? argv.force : false,
            });
          } catch (e: any) {
            // send to Sentry
            Sentry.captureMessage(`failed to run adapter ${protocol}`);
            Sentry.captureException(e);

            // log error and continue
            logger.error('failed to run adapter', {
              service: 'command',
              protocol: protocol,
            });
            console.log(e);
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
        alias: 'p',
        type: 'string',
        default: '',
        describe:
          'Collect data of given protocol. You can pass a list of protocols seperated by comma, ex: --protocol "aave,uniswap".',
      },
      service: {
        type: 'string',
        default: '',
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
