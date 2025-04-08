import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { Pool2 } from '../../../types/domains/pool2';
import { EventSignatures } from '../../../configs/constants';
import { normalizeAddress } from '../../../lib/utils';
import UniswapV2Graph from './univ2graph';
import { GetDexDataOptions, GetDexDataResult } from './core';
import { querySubgraph, querySubgraphMetaBlock } from '../../../lib/subgraph';

// suport query data from univ3 subgraph
// https://github.com/Uniswap/v3-subgraph
export default class UniswapV3Graph extends UniswapV2Graph {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    this.poolCreatedEventSignature = EventSignatures.UniswapV3Factory_PoolCreated;
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    if (this.factoryConfig.subgraph) {
      const fieldPoolFeeRate = this.factoryConfig.subgraph.queryFields.poolFeesRate;
      return {
        chain: this.factoryConfig.chain,
        type: this.factoryConfig.version,
        factory: normalizeAddress(this.factoryConfig.factory),
        address: normalizeAddress(log.id),
        feeRate: Number(log[fieldPoolFeeRate] / 1e6),
        token0: {
          chain: this.factoryConfig.chain,
          symbol: log.token0.symbol,
          decimals: Number(log.token0.decimals),
          address: normalizeAddress(log.token0.id),
        },
        token1: {
          chain: this.factoryConfig.chain,
          symbol: log.token1.symbol,
          decimals: Number(log.token1.decimals),
          address: normalizeAddress(log.token1.id),
        },
        birthblock: Number(log.createdAtBlockNumber),
      };
    }

    return null;
  }

  public async getDexData(options: GetDexDataOptions): Promise<GetDexDataResult> {
    if (!this.factoryConfig.subgraph) {
      return super.getDexData(options);
    }

    const result: GetDexDataResult = {
      totalLiquidity: await this.getTotalLiquidityUsd(options.timestamp),
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };

    const metaBlockNumber = await querySubgraphMetaBlock(this.factoryConfig.subgraph.endpoint);
    const queryToBlock = options.toBlock > metaBlockNumber ? metaBlockNumber : options.toBlock;

    const fieldFactories = this.factoryConfig.subgraph.queryFields.factories;
    const fieldTotalVolumeUsd = this.factoryConfig.subgraph.queryFields.totalVolumeUSD;
    const fieldTotalFeesUsd = this.factoryConfig.subgraph.queryFields.totalFeesUSD;
    const responseData = await querySubgraph(
      this.factoryConfig.subgraph.endpoint,
      `
      {
        fromFactories: ${fieldFactories}(first: 1, block: {number: ${options.fromBlock}}) {
          ${fieldTotalVolumeUsd}
          ${fieldTotalFeesUsd}
        }
        toFactories: ${fieldFactories}(first: 1, block: {number: ${queryToBlock}}) {
          ${fieldTotalVolumeUsd}
          ${fieldTotalFeesUsd}
        }
      }  
    `,
    );
    const totalVolumeUsdFrom = Number(responseData.fromFactories[0][fieldTotalVolumeUsd]);
    const totalVolumeUsdTo = Number(responseData.toFactories[0][fieldTotalVolumeUsd]);
    const totalFeesUsdFrom = Number(responseData.fromFactories[0][fieldTotalFeesUsd]);
    const totalFeesUsdTo = Number(responseData.toFactories[0][fieldTotalFeesUsd]);

    const feeRateProtocol = this.factoryConfig.feeRateForProtocol ? this.factoryConfig.feeRateForProtocol : 0;

    const swapFeesUsd = totalFeesUsdTo - totalFeesUsdFrom;
    const protocolFeesUsd = swapFeesUsd * feeRateProtocol;

    result.swapVolumeUsd = totalVolumeUsdTo - totalVolumeUsdFrom;
    result.protocolRevenueUsd = protocolFeesUsd;
    result.supplySideRevenueUsd = swapFeesUsd - protocolFeesUsd;

    return result;
  }
}
