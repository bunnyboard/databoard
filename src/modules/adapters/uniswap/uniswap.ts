import { UniswapDexConfig, UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import AdapterDataHelper from '../helpers';
import UniswapCore from './core';
import { compareAddress } from '../../../lib/utils';
import { Pool2 } from '../../../types/domains/pool2';

function getWhitelistedPools(dexConfig: UniswapDexConfig): Array<Pool2> {
  return dexConfig.whitelistedPools.filter((pool2) => {
    return (
      !dexConfig.blacklistedPools ||
      dexConfig.blacklistedPools.filter((item) => compareAddress(item, pool2.address))[0] === undefined
    );
  });
}

export default class UniswapAdapter extends UniswapCore {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    let protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        trade: 0,
      },
    };

    const uniswapConfig = this.protocolConfig as UniswapProtocolConfig;
    for (const dexConfig of uniswapConfig.dexes) {
      if (dexConfig.birthday > options.timestamp) {
        // dex was not deployed yet
        continue;
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.timestamp,
      );
      const beginBlockk = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.endTime,
      );

      const dexData = await this.getDexData({
        dexConfig: dexConfig,
        pools: getWhitelistedPools(dexConfig),
        timestamp: options.timestamp,
        blockNumber: blockNumber,
        beginBlock: beginBlockk,
        endBlock: endBlock,
      });

      if (dexData) {
        protocolData.totalAssetDeposited += dexData.total.totalLiquidityUsd;
        protocolData.totalValueLocked += dexData.total.totalLiquidityUsd;
        (protocolData.totalSupplied as number) += dexData.total.totalLiquidityUsd;
        protocolData.totalFees += dexData.total.totalSwapFeeUsdForLps + dexData.total.totalSwapFeeUsdForProtocol;
        protocolData.supplySideRevenue += dexData.total.totalSwapFeeUsdForLps;
        protocolData.protocolRevenue += dexData.total.totalSwapFeeUsdForProtocol;
        (protocolData.volumes.trade as number) += dexData.total.volumeSwapUsd;
        (protocolData.volumes.deposit as number) += dexData.total.volumeAddLiquidityUsd;
        (protocolData.volumes.withdraw as number) += dexData.total.volumeRemoveLiquidityUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
