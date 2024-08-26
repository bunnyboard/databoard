import { DefaultMemcacheTime, ProtocolConfigs } from '../configs';
import BlockchainService from '../services/blockchains/blockchain';
import { MemcacheService } from '../services/caching/memcache';
import DatabaseService from '../services/database/database';
import OracleService from '../services/oracle/oracle';
import { BasicCommand } from './basic';
import { getProtocolAdapters } from '../modules/adapters';

export class TestCommand extends BasicCommand {
  public readonly name: string = 'test';
  public readonly describe: string = 'Run adapter testing';

  constructor() {
    super();
  }

  public async execute(argv: any) {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);
    const memcache = new MemcacheService(DefaultMemcacheTime);
    const database = new DatabaseService();

    const protocol = argv.protocol;
    const adapters = getProtocolAdapters(
      {
        blockchain: {
          evm: blockchain,
        },
        oracle: oracle,
      },
      {
        database: database,
        memcache: memcache,
      },
    );

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
