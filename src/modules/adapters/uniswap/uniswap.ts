import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import ProtocolExtendedAdapter from '../extended';
import { UniswapProtocolConfig } from '../../../configs/protocols/uniswap';
import { querySubgraphUniv2, querySubgraphUniv3, SubgraphQueryParams, SubgraphQueryResult } from './subgraph';
import { Pool2Types } from '../../../types/domains/pool2';
import logger from '../../../lib/logger';

export default class UniswapAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  public readonly subgraphV2QueryParams: SubgraphQueryParams;
  public readonly subgraphV3QueryParams: SubgraphQueryParams;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);

    this.subgraphV2QueryParams = {
      factories: 'uniswapFactories',
      totalVolumeUSD: 'totalVolumeUSD',
      totalLiquidityUSD: 'totalLiquidityUSD',
    };

    this.subgraphV3QueryParams = {
      factories: 'factories',
      totalVolumeUSD: 'totalVolumeUSD',
      totalFeesUSD: 'totalFeesUSD',
      totalLiquidityUSD: 'totalValueLockedUSD',
    };
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

    const uniswapConfig = this.protocolConfig as UniswapProtocolConfig;
    for (const factoryConfig of uniswapConfig.factories) {
      if (factoryConfig.birthday > options.timestamp) {
        continue;
      }

      if (factoryConfig.subgraph) {
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

        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          factoryConfig.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          factoryConfig.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          factoryConfig.chain,
          options.endTime,
        );

        logger.debug('getting data from subgraph', {
          service: this.name,
          chain: factoryConfig.chain,
          factory: factoryConfig.factory,
          version: factoryConfig.version,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        let response: SubgraphQueryResult | null = null;
        if (factoryConfig.version === Pool2Types.univ2) {
          response = await querySubgraphUniv2({
            contextServices: this.services,
            factoryConfig: factoryConfig,
            params: this.subgraphV2QueryParams,

            blockNumber: blockNumber,
            fromBlock: beginBlock,
            toBlock: endBlock,

            timestamp: options.timestamp,
            fromTime: options.beginTime,
            toTime: options.endTime,
          });
        } else if (factoryConfig.version === Pool2Types.univ3) {
          response = await querySubgraphUniv3({
            contextServices: this.services,
            factoryConfig: factoryConfig,
            params: this.subgraphV3QueryParams,

            blockNumber: blockNumber,
            fromBlock: beginBlock,
            toBlock: endBlock,

            timestamp: options.timestamp,
            fromTime: options.beginTime,
            toTime: options.endTime,

            countPools:
              factoryConfig.subgraph &&
              factoryConfig.subgraph.customParams &&
              factoryConfig.subgraph.customParams.countTvlByPools,
          });
        }

        if (response) {
          protocolData.totalFees += response.totalFeesUsd;
          protocolData.supplySideRevenue += response.totalLpFeesUsd;
          protocolData.protocolRevenue += response.totalProtocolFeesUsd;
          protocolData.totalAssetDeposited += response.liquidityUsd;
          protocolData.totalValueLocked += response.liquidityUsd;
          (protocolData.totalSupplied as number) += response.liquidityUsd;
          (protocolData.volumes.swap as number) += response.volumeSwapUsd;
          (protocolData.volumes.deposit as number) += response.volumeAddLiquidityUsd;
          (protocolData.volumes.withdraw as number) += response.volumeRemoveLiquidityUsd;

          // add to chain breakdown
          (protocolData.breakdownChains as any)[factoryConfig.chain].totalFees += response.totalFeesUsd;
          (protocolData.breakdownChains as any)[factoryConfig.chain].supplySideRevenue += response.totalLpFeesUsd;
          (protocolData.breakdownChains as any)[factoryConfig.chain].protocolRevenue += response.totalProtocolFeesUsd;
          (protocolData.breakdownChains as any)[factoryConfig.chain].totalAssetDeposited += response.liquidityUsd;
          (protocolData.breakdownChains as any)[factoryConfig.chain].totalValueLocked += response.liquidityUsd;
          ((protocolData.breakdownChains as any)[factoryConfig.chain].totalSupplied as number) += response.liquidityUsd;
          ((protocolData.breakdownChains as any)[factoryConfig.chain].volumes.swap as number) += response.volumeSwapUsd;
          ((protocolData.breakdownChains as any)[factoryConfig.chain].volumes.deposit as number) +=
            response.volumeAddLiquidityUsd;
          ((protocolData.breakdownChains as any)[factoryConfig.chain].volumes.withdraw as number) +=
            response.volumeRemoveLiquidityUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
