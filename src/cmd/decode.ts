import { DecoderConfigs } from '../configs/decoder';
import envConfig from '../configs/envConfig';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import DecoderModule from '../modules/decoder/decoder';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';
import * as Sentry from '@sentry/node';

const DefaultServiceSleepSeconds = 30 * 60; // 30 minutes

export class DecodeCommand extends BasicCommand {
  public readonly name: string = 'decode';
  public readonly describe: string = 'Run decoder module';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const cmdConfigs: any = {
      type: 'decode',
    };

    if (argv.fromBlock > 0) {
      cmdConfigs.fromBlock = argv.fromBlock;
    }
    cmdConfigs.force = argv.force;
    cmdConfigs.interval = `${argv.interval} seconds`;

    logger.info('attemp decode command', {
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

    const chain = argv.chain;

    const chainConfigs: any = {
      chain: envConfig.blockchains[chain].nodeRpc,
    };
    logger.info(`loaded blockchain rpc config for chain ${chain}`, {
      service: 'configs',
      configs: chainConfigs,
    });

    logger.seperator();

    await sleep(2);

    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();

    const decoder = new DecoderModule(services, storages, DecoderConfigs);

    do {
      try {
        await decoder.run({
          chain: chain,
          fromBlock: argv.fromBlock ? argv.fromBlock : undefined,
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
      chain: {
        type: 'string',
        default: '',
        describe: 'Blockchain to be decoded.',
      },
      fromBlock: {
        type: 'number',
        default: 0,
        describe: 'Start to decode from given block number.',
      },
      force: {
        type: 'boolean',
        default: false,
        describe: 'Force to decode from given fromBlock.',
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
