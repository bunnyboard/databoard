import fs from 'fs';
import { ILocaldbService, LocaldbReadOptions, LocaldbWriteBatchOptions, LocaldbWriteSingleOptions } from './domains';
import { Level } from 'level';

export default class LeveldbService implements ILocaldbService {
  public readonly name: string = 'localdb';
  public readonly datadir: string;

  constructor(datadir: string) {
    this.datadir = datadir;

    if (!fs.existsSync(this.datadir)) {
      fs.mkdirSync(this.datadir);
    }
  }

  private getDatabase(database: string): Level {
    const databasePath = `${this.datadir}/${database}`;
    return new Level(databasePath, { valueEncoding: 'json' });
  }

  public async writeSingle(options: LocaldbWriteSingleOptions): Promise<void> {
    const database = this.getDatabase(options.database);
    await database.put(options.key, options.value);

    // need to close - other process can open and write to
    await database.close();
  }

  public async writeBatch(options: LocaldbWriteBatchOptions): Promise<void> {
    const database = this.getDatabase(options.database);
    await database.batch(
      options.values.map((item) => {
        return {
          type: 'put',
          key: item.key,
          value: item.value,
        };
      }),
    );

    // need to close - other process can open and write to
    await database.close();
  }

  public async read(options: LocaldbReadOptions): Promise<any> {
    const database = this.getDatabase(options.database);
    const value = await database.get(options.key);
    // need to close - other process can open and write to
    await database.close();

    return value;
  }
}
