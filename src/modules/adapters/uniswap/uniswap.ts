import { UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import AdapterDataHelper from '../helpers';
import UniswapCore from './core';

export default class UniswapAdapter extends UniswapCore {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    let protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      breakdownChains: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        swap: 0,
      },
    };

    const uniswapConfig = this.protocolConfig as UniswapProtocolConfig;

    // sync pools first
    for (const chainConfig of uniswapConfig.chains) {
      for (const dexConfig of chainConfig.dexes) {
        await this.indexDexData(dexConfig);
      }
    }

    // query data
    for (const chainConfig of uniswapConfig.chains) {
      if (!(protocolData.breakdownChains as any)[chainConfig.chain]) {
        (protocolData.breakdownChains as any)[chainConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          totalSupplied: 0,
          volumes: {
            deposit: 0,
            withdraw: 0,
            swap: 0,
          },
        };
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.timestamp,
      );
      const beginBlockk = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.endTime,
      );

      const dexData = await this.getDexData({
        chainConfig: chainConfig,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
        beginBlock: beginBlockk,
        endBlock: endBlock,
      });

      if (dexData) {
        protocolData.totalAssetDeposited += dexData.totalLiquidityUsd;
        protocolData.totalValueLocked += dexData.totalLiquidityUsd;
        (protocolData.totalSupplied as number) += dexData.totalLiquidityUsd;
        protocolData.totalFees += dexData.totalSwapFeeUsdForLps + dexData.totalSwapFeeUsdForProtocol;
        protocolData.supplySideRevenue += dexData.totalSwapFeeUsdForLps;
        protocolData.protocolRevenue += dexData.totalSwapFeeUsdForProtocol;
        (protocolData.volumes.swap as number) += dexData.volumeSwapUsd;
        (protocolData.volumes.deposit as number) += dexData.volumeAddLiquidityUsd;
        (protocolData.volumes.withdraw as number) += dexData.volumeRemoveLiquidityUsd;

        (protocolData.breakdownChains as any)[chainConfig.chain].totalAssetDeposited += dexData.totalLiquidityUsd;
        (protocolData.breakdownChains as any)[chainConfig.chain].totalValueLocked += dexData.totalLiquidityUsd;
        (protocolData.breakdownChains as any)[chainConfig.chain].totalSupplied += dexData.totalLiquidityUsd;
        (protocolData.breakdownChains as any)[chainConfig.chain].totalFees +=
          dexData.totalSwapFeeUsdForLps + dexData.totalSwapFeeUsdForProtocol;
        (protocolData.breakdownChains as any)[chainConfig.chain].supplySideRevenue += dexData.totalSwapFeeUsdForLps;
        (protocolData.breakdownChains as any)[chainConfig.chain].protocolRevenue += dexData.totalSwapFeeUsdForProtocol;
        (protocolData.breakdownChains as any)[chainConfig.chain].volumes.swap += dexData.volumeSwapUsd;
        (protocolData.breakdownChains as any)[chainConfig.chain].volumes.deposit += dexData.volumeAddLiquidityUsd;
        (protocolData.breakdownChains as any)[chainConfig.chain].volumes.withdraw += dexData.volumeRemoveLiquidityUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
