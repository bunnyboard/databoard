export interface RunAdapterOptions {
  service?: string;

  // give a timestamp where adapter will start to collect snapshots from
  // if fromTime was given, adapter will use this value instead of config birthday
  fromTime?: number;

  // force to sync snapshots from given fromTime or config birthday
  // do not save state
  force?: boolean;
}

export interface TestAdapterOptions {
  output: 'pretty' | 'json';

  timestamp?: number;
}

export interface GetProtocolDataOptions {
  // this timestamp will be used to query smart contract data
  // at given blockNumber has timestamp
  timestamp: number;

  // query smart contract event logs from beginTime to endTime
  // if beginTime or endTime === 0, ignore to query timeframe data
  beginTime: number;
  endTime: number;
}

export interface RunDecoderOptions {
  chain: string;

  // get and decode logs from given fromBlock
  fromBlock?: number;

  // force to get and decode logs from given fromBlock
  // do not save state
  force?: boolean;

  // get and decode event logs from given contract only
  contract?: string;
}

export interface RunIndexlogOptions {
  chain: string;

  // get and decode logs from given fromBlock
  fromBlock?: number;

  // force to get and decode logs from given fromBlock
  // do not save state
  force?: boolean;

  // index event logs from given contract only
  // if this option is given, index all event logs from this contract
  // and save to database
  contract?: string;
}
