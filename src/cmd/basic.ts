import { DefaultLocaldbDir, DefaultMemcacheTime } from '../configs';
import envConfig from '../configs/envConfig';
import BitcoreService from '../services/blockchains/bitcore';
import BlockchainService from '../services/blockchains/blockchain';
import { MemcacheService } from '../services/caching/memcache';
import DatabaseService from '../services/database/database';
import LeveldbService from '../services/localdb/level';
import OracleService from '../services/oracle/oracle';
import { ContextServices, ContextStorages } from '../types/namespaces';

export class BasicCommand {
  public readonly name: string = 'command';
  public readonly describe: string = 'Basic command';

  constructor() {}

  public async getServices(): Promise<ContextServices> {
    const blockchain = new BlockchainService();
    const bitcore = new BitcoreService();
    const oracle = new OracleService(blockchain);

    return {
      blockchain: {
        evm: blockchain,
        bitcore: bitcore,
      },
      oracle: oracle,
    };
  }

  public async getStorages(): Promise<ContextStorages> {
    const memcache = new MemcacheService(DefaultMemcacheTime);
    const localdb = new LeveldbService(DefaultLocaldbDir);
    const database = new DatabaseService();
    await database.connect(envConfig.mongodb.connectionUri, envConfig.mongodb.databaseName);

    return {
      database: database,
      memcache: memcache,
      localdb: localdb,
    };
  }

  public async execute(argv: any) {}
  public setOptions(yargs: any) {}
}
