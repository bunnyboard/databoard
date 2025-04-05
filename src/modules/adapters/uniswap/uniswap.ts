import { UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import logger from '../../../lib/logger';
import { getTimestamp } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { Pool2Types } from '../../../types/domains/pool2';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { IDexCore } from './core';
import UniswapV2Core from './univ2';
import UniswapV3Core from './univ3';

export default class UniswapAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        swap: 0,
      },
      breakdownChains: {},
    };

    // sync pools from factory logs
    const protocolConfig = this.protocolConfig as UniswapProtocolConfig;
    for (const factoryConfig of protocolConfig.factories) {
      if (factoryConfig.version === Pool2Types.univ2) {
        const syncer = new UniswapV2Core(this.services, this.storages, factoryConfig);
        await syncer.indexPools();
      } else if (factoryConfig.version === Pool2Types.univ3) {
        const syncer = new UniswapV3Core(this.services, this.storages, factoryConfig);
        await syncer.indexPools();
      }
    }

    const config = this.protocolConfig as UniswapProtocolConfig;
    for (const factoryConfig of config.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      let coreAdapter: IDexCore | null = null;
      if (factoryConfig.version === Pool2Types.univ2) {
        coreAdapter = new UniswapV2Core(this.services, this.storages, factoryConfig);
      } else if (factoryConfig.version === Pool2Types.univ3) {
        coreAdapter = new UniswapV3Core(this.services, this.storages, factoryConfig);
      }

      if (coreAdapter === null) {
        logger.warn('failed to get dex core adapter for factory', {
          service: this.name,
          chain: factoryConfig.chain,
          version: factoryConfig.version,
          factory: factoryConfig.factory,
        });
        continue;
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.endTime,
      );

      const dexData = await coreAdapter.getDexData({
        timestamp: options.timestamp,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      if (dexData.totalLiquidity > 0) {
        protocolData.totalAssetDeposited += dexData.totalLiquidity;
        protocolData.totalValueLocked += dexData.totalLiquidity;
        (protocolData.totalSupplied as number) += dexData.totalLiquidity;

        if (!(protocolData.breakdownChains as any)[factoryConfig.chain]) {
          (protocolData.breakdownChains as any)[factoryConfig.chain] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              swap: 0,
            },
          };
        }
        (protocolData.breakdownChains as any)[factoryConfig.chain].totalAssetDeposited += dexData.totalLiquidity;
        (protocolData.breakdownChains as any)[factoryConfig.chain].totalValueLocked += dexData.totalLiquidity;
        (protocolData.breakdownChains as any)[factoryConfig.chain].totalSupplied += dexData.totalLiquidity;

        protocolData.totalFees += dexData.protocolRevenueUsd + dexData.supplySideRevenueUsd;
        protocolData.protocolRevenue += dexData.protocolRevenueUsd;
        protocolData.supplySideRevenue += dexData.supplySideRevenueUsd;
        (protocolData.volumes.swap as number) += dexData.swapVolumeUsd;
        (protocolData.volumes.deposit as number) += dexData.depositVolumeUsd;
        (protocolData.volumes.withdraw as number) += dexData.withdrawVolumeUsd;

        (protocolData.breakdownChains as any)[factoryConfig.chain].totalFees +=
          dexData.protocolRevenueUsd + dexData.supplySideRevenueUsd;
        (protocolData.breakdownChains as any)[factoryConfig.chain].protocolRevenue += dexData.protocolRevenueUsd;
        (protocolData.breakdownChains as any)[factoryConfig.chain].supplySideRevenue += dexData.supplySideRevenueUsd;
        (protocolData.breakdownChains as any)[factoryConfig.chain].volumes.swap += dexData.swapVolumeUsd;
        (protocolData.breakdownChains as any)[factoryConfig.chain].volumes.deposit += dexData.depositVolumeUsd;
        (protocolData.breakdownChains as any)[factoryConfig.chain].volumes.withdraw += dexData.withdrawVolumeUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const timeframe = 600;

    const current = getTimestamp();
    const fromTime = options.timestamp ? options.timestamp : current - timeframe;
    const toTime = options.timestamp ? options.timestamp + timeframe : current;

    if (options.output === 'json') {
      console.log(
        JSON.stringify(
          await this.getProtocolData({
            timestamp: fromTime,
            beginTime: fromTime,
            endTime: toTime,
          }),
        ),
      );
    } else {
      logger.inspect(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
  }
}
