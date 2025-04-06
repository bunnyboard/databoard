import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { Pool2 } from '../../../types/domains/pool2';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { EventSignatures } from '../../../configs/constants';
import { normalizeAddress } from '../../../lib/utils';

export interface GetDexDataOptions {
  timestamp: number;
  fromBlock: number;
  toBlock: number;
}

export interface GetDexDataResult {
  totalLiquidity: number;
  swapVolumeUsd: number;
  protocolRevenueUsd: number;
  supplySideRevenueUsd: number;
  depositVolumeUsd: number;
  withdrawVolumeUsd: number;
}

export interface IDexCore {
  name: string;

  services: ContextServices;
  storages: ContextStorages;

  factoryConfig: UniswapFactoryConfig;
  poolCreatedEventSignature: string;

  // get logs from factory contract
  // parse and save pool data into database
  indexPools: () => Promise<void>;

  // every version of factories has diff event format
  // just override this function to parse the pool created events
  parsePoolCreatedEvent(log: any): Promise<Pool2 | null>;

  // get volume and fee data
  getDexData(options: GetDexDataOptions): Promise<GetDexDataResult>;
}

export default class DexCore implements IDexCore {
  public readonly name: string = 'adapter.dexcore';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;
  public readonly factoryConfig: UniswapFactoryConfig;
  public poolCreatedEventSignature: string;

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    this.services = services;
    this.storages = storages;
    this.factoryConfig = factoryConfig;

    // need to override this event log
    this.poolCreatedEventSignature = EventSignatures.UniswapV2Factory_PairCreated;
  }

  public getPoolsIndexingKey(): string {
    return `factory-pools-sync-${this.factoryConfig.chain}-${normalizeAddress(this.factoryConfig.factory)}`;
  }

  public async indexPools(): Promise<void> {}

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    return null;
  }

  protected async getTotalLiquidityUsd(timestamp: number): Promise<number> {
    return 0;
  }

  public async getDexData(options: GetDexDataOptions): Promise<GetDexDataResult> {
    return {
      totalLiquidity: 0,
      swapVolumeUsd: 0,
      supplySideRevenueUsd: 0,
      protocolRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };
  }
}
