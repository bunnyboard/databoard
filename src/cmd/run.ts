import { ChainConfigs, ProtocolConfigs } from '../configs';
import envConfig from '../configs/envConfig';
import logger from '../lib/logger';
import { sleep } from '../lib/utils';
import { getProtocolAdapters } from '../modules/adapters';
import { getChainAdapters } from '../modules/chains';
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
    if (argv.chain === '' && argv.protocol === '') {
      console.log('required at least --chain or --protocol options');
      process.exit(0);
    }

    const cmdConfigs: any = {};
    if (argv.chain && argv.chain !== '') {
      cmdConfigs.type = 'chain';
      cmdConfigs.chain = argv.chain;
    } else if (argv.protocol && argv.protocol !== '') {
      cmdConfigs.type = 'protocol';
      cmdConfigs.protocol = argv.protocol;
    }

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
        'database mongo uri': envConfig.mongodb.connectionUri,
        'database mongo name': envConfig.mongodb.databaseName,
      },
    });

    const chainConfigs: any = {};
    for (const blockchainConfig of Object.values(envConfig.blockchains)) {
      chainConfigs[`node rpc ${blockchainConfig.name}`] = blockchainConfig.nodeRpc;
    }
    logger.info('loaded blockchain rpc configs', {
      service: 'configs',
      configs: chainConfigs,
    });

    await sleep(2);

    const services: ContextServices = await super.getServices();
    const storages: ContextStorages = await super.getStorages();
    const protocolAdapters = getProtocolAdapters(services, storages);
    const chainAdapters = getChainAdapters(services.oracle, storages);

    if (argv.chain !== '') {
      do {
        for (const chain of Object.keys(ChainConfigs as any)) {
          if (argv.chain === undefined || argv.chain === '' || argv.chain === chain) {
            if (chainAdapters[chain]) {
              await chainAdapters[chain].run({
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
    } else if (argv.protocol !== '') {
      do {
        for (const protocol of Object.keys(ProtocolConfigs as any)) {
          if (argv.protocol === undefined || argv.protocol === '' || argv.protocol === protocol) {
            if (protocolAdapters[protocol]) {
              await protocolAdapters[protocol].run({
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
    }

    process.exit(0);
  }

  public setOptions(yargs: any) {
    return yargs.option({
      chain: {
        type: 'string',
        default: '',
        describe:
          'Collect data of given blockchain. You can pass a list of chains seperated by comma, ex: --chain "ethereum,polygon".',
      },
      protocol: {
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
