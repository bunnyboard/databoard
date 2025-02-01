import envConfig from '../configs/envConfig';
import { IndexlogConfigs } from '../configs/indexlog';
import logger from '../lib/logger';
import { normalizeAddress, sleep } from '../lib/utils';
import IndexlogAdapter from '../modules/indexlog/indexlog';
import { ContextServices, ContextStorages } from '../types/namespaces';
import { BasicCommand } from './basic';
import * as Sentry from '@sentry/node';

const DefaultServiceSleepSeconds = 60; // 1 minutes

export class IndexlogCommand extends BasicCommand {
  public readonly name: string = 'indexlog';
  public readonly describe: string = 'Run the indexlog module';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const chain = argv.chain;
    if (!envConfig.blockchains[chain] || !IndexlogConfigs.chains[chain]) {
      console.log(`chain ${chain} is not supported`);
      process.exit(0);
    }

    const cmdConfigs: any = {
      type: 'indexlog',
      chain: chain,
    };

    if (argv.fromBlock > 0) {
      cmdConfigs.fromBlock = argv.fromBlock;
    }
    if (argv.contract !== '') {
      cmdConfigs.contract = argv.contract;
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

    const indexlogAdater = new IndexlogAdapter(services, storages, IndexlogConfigs);

    do {
      try {
        await indexlogAdater.run({
          chain: chain,
          fromBlock: argv.fromBlock ? argv.fromBlock : undefined,
          force: argv.force ? argv.force : false,
          contract: argv.contract !== '' ? normalizeAddress(argv.contract) : undefined,
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
        describe: 'Index logs from given blockchain.',
      },
      contract: {
        type: 'string',
        default: '',
        describe: 'Index logs from given contract only.',
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
