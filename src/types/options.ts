import { Token } from './base';

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

export interface GetAddressBalanceUsdOptions {
  chain: string;
  ownerAddress: string;
  tokens: Array<Token>;
  timestamp: number;
  blockNumber?: number;
}

export interface GetAddressBalanceUsdResult {
  totalBalanceUsd: number;
  tokenBalanceUsds: {
    [key: string]: {
      token: Token;
      priceUsd: number;
      balanceUsd: number;
    };
  };
}

export interface IndexContracLogsOptions {
  chain: string;
  address: string;
  fromBlock: number;
  toBlock: number;
}

export interface GetChainLogsOptions {
  chain: string;
  fromBlock: number;
  toBlock: number;
  signatures?: Array<string>;
}
