export interface LocaldbWriteSingleOptions {
  database: string;
  key: string;
  value: any;
}

export interface LocaldbWriteBatchOptions {
  database: string;
  values: Array<{
    key: string;
    value: any;
  }>;
}

export interface LocaldbReadOptions {
  database: string;
  key: string;
}

// localdb uses leveldb to store key-value caching data into local files
// it helps to reduce caching queries to mongo database
export interface ILocaldbService {
  // given name helps logging better
  name: string;

  // local dir stores all databases
  // default .localdb
  datadir: string;

  // write a simple key-value to database
  writeSingle: (options: LocaldbWriteSingleOptions) => Promise<void>;

  // batch write a listy of key-value to database
  writeBatch: (options: LocaldbWriteBatchOptions) => Promise<void>;

  // read value by key
  read: (options: LocaldbReadOptions) => Promise<any>;
}
