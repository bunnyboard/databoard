import { UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import logger from '../../../lib/logger';
import { getTimestamp } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import UniswapCore from './core';
import UniswapDatasync from './datasync';

export default class UniswapAdapter extends UniswapDatasync {
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
    await this.indexPool2();

    const config = this.protocolConfig as UniswapProtocolConfig;
    for (const factoryConfig of config.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      const totalLiquidityUsd = await UniswapCore.getLiquidityUsd({
        storages: this.storages,
        services: this.services,
        factoryConfig: factoryConfig,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += totalLiquidityUsd;
      protocolData.totalValueLocked += totalLiquidityUsd;
      (protocolData.totalSupplied as number) += totalLiquidityUsd;

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
      (protocolData.breakdownChains as any)[factoryConfig.chain].totalAssetDeposited += totalLiquidityUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].totalValueLocked += totalLiquidityUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].totalSupplied += totalLiquidityUsd;

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        factoryConfig.chain,
        options.endTime,
      );

      const logsData = await UniswapCore.getLogsDataUsd({
        storages: this.storages,
        services: this.services,
        factoryConfig: factoryConfig,
        timestamp: options.timestamp,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      protocolData.totalFees += logsData.protocolRevenueUsd + logsData.supplySideRevenueUsd;
      protocolData.protocolRevenue += logsData.protocolRevenueUsd;
      protocolData.supplySideRevenue += logsData.supplySideRevenueUsd;
      (protocolData.volumes.swap as number) += logsData.swapVolumeUsd;
      (protocolData.volumes.deposit as number) += logsData.depositVolumeUsd;
      (protocolData.volumes.withdraw as number) += logsData.withdrawVolumeUsd;

      (protocolData.breakdownChains as any)[factoryConfig.chain].totalFees +=
        logsData.protocolRevenueUsd + logsData.supplySideRevenueUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].protocolRevenue += logsData.protocolRevenueUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].supplySideRevenue += logsData.supplySideRevenueUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].volumes.swap += logsData.swapVolumeUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].volumes.deposit += logsData.depositVolumeUsd;
      (protocolData.breakdownChains as any)[factoryConfig.chain].volumes.withdraw += logsData.withdrawVolumeUsd;
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
