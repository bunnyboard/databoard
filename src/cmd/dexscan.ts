import { DexscanConfigs } from '../configs/dexscan';
import envConfig from '../configs/envConfig';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import DexscanModule from '../modules/dexscan/dexscan';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';
import * as Sentry from '@sentry/node';

const DefaultServiceSleepSeconds = 30 * 60; // 30 minutes

export class DexscanCommand extends BasicCommand {
  public readonly name: string = 'dexscan';
  public readonly describe: string = 'Run dexscan module';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const cmdConfigs: any = {
      type: 'dexscan',
    };

    cmdConfigs.service = argv.service === 'state' || argv.service === 'snapshot' ? argv.service : 'state and snapshot';
    if (argv.fromTime > 0) {
      cmdConfigs.fromTime = argv.fromTime;
    }
    cmdConfigs.force = argv.force;
    cmdConfigs.interval = `${argv.interval} seconds`;

    logger.info('attemp dexscan command', {
      service: 'command',
      configs: cmdConfigs,
    });

    logger.seperator();

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
    });

    for (const factoryConfig of DexscanConfigs.factories) {
      // have base tokens config for chain
      if (!DexscanConfigs.baseTokens[factoryConfig.chain]) {
        logger.error(`no dex base tokens configs for chain ${factoryConfig.chain}`, {
          service: 'configs',
        });
        process.exit(1);
      }

      // must have univ3Birthblocks config
      if (!DexscanConfigs.univ3Birthblocks[factoryConfig.chain]) {
        logger.error(`no univ3Birthblocks configs for chain ${factoryConfig.chain}`, {
          service: 'configs',
        });
        process.exit(1);
      }
    }

    logger.info(`loaded factories configs (${DexscanConfigs.factories.length})`, {
      service: 'configs',
      configs: {},
    });

    logger.seperator();

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
