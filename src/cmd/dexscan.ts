import { DexscanConfigs } from '../configs/dexscan';
import envConfig from '../configs/envConfig';
import logger, { logBreakLine } from '../lib/logger';
import { sleep } from '../lib/utils';
import DexscanModule from '../modules/dexscan/dexscan';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';
import * as Sentry from '@sentry/node';
import { nodeProfilingIntegration } from '@sentry/profiling-node';

const DefaultServiceSleepSeconds = 30 * 60; // 30 minutes

export class DexscanCommand extends BasicCommand {
  public readonly name: string = 'dexscan';
  public readonly describe: string = 'Run dexscan module';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const protocols = DexscanConfigs.protocolConfigs.map((item) => item.protocol);

    // setup sentry in if any
    if (envConfig.sentry.dsn) {
      // Ensure to call this before importing any other modules!
      Sentry.init({
        dsn: envConfig.sentry.dsn,

        integrations: [nodeProfilingIntegration()],

        // Add Tracing by setting tracesSampleRate
        // We recommend adjusting this value in production
        tracesSampleRate: 1.0,

        // Set profilesSampleRate to 1.0 to profile every transaction.
        // Since profilesSampleRate is relative to tracesSampleRate,
        // the final profiling rate can be computed as tracesSampleRate * profilesSampleRate
        // For example, a tracesSampleRate of 0.5 and profilesSampleRate of 0.5 would
        // result in 25% of transactions being profiled (0.5*0.5=0.25)
        profilesSampleRate: 1.0,
      });
    }

    const cmdConfigs: any = {
      type: 'dexscan',
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

    logBreakLine();

    logger.info('loaded mongo database configs', {
      service: 'configs',
      configs: {
        'database mongo uri': envConfig.mongodb.connectionUri,
        'database mongo name': envConfig.mongodb.databaseName,
      },
    });

    const chainConfigs: any = {};
    for (const blockchainConfig of Object.values(envConfig.blockchains)) {
      chainConfigs[`node rpc ${blockchainConfig.name}`] = blockchainConfig.nodeRpc;
    }
    logger.info(`loaded blockchain rpc configs (${Object.keys(chainConfigs).length})`, {
      service: 'configs',
      configs: chainConfigs,
    });

    logBreakLine();

    await sleep(2);

    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    const dexscan = new DexscanModule(services, storages, DexscanConfigs);

    do {
      try {
        await dexscan.run({
          service: argv.service === 'state' || argv.service === 'snapshot' ? argv.service : undefined,
          fromTime: argv.fromTime ? argv.fromTime : undefined,
          force: argv.force ? argv.force : false,
        });
      } catch (e: any) {
        // send to Sentry
        Sentry.captureException(e);

        // exit
        throw e;
      }

      if (!argv.exit) {
        await sleep(argv.interval);
      }
    } while (!argv.exit);

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
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
