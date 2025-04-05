import axios from 'axios';
import { Pool2 } from '../../types/domains/pool2';
import { normalizeAddress } from '../../lib/utils';
import { SubgraphConfig } from './configs';

export async function queryPoolsV3(endpointConfig: SubgraphConfig, latestId: string): Promise<any> {
  return (
    await axios.post(endpointConfig.endpoint, {
      query: `
        {
          factories(first: 1) {
            id
          }

          pools(first: 1000, where: {id_gt: "${latestId}"}, orderBy: id) {
            id
            ${endpointConfig.feeRateField ? endpointConfig.feeRateField : 'feeTier'}
            token0 {
              id
              symbol
              decimals
            }
            token1 {
              id
              symbol
              decimals
            }
            createdAtBlockNumber
            createdAtTimestamp
          }
        }
      `,
    })
  ).data;
}

export function parseDataPoolsV3(
  subgraphConfig: SubgraphConfig,
  data: any,
): {
  factoryAddress: string;
  pools: Array<Pool2>;
} {
  const factoryAddress = normalizeAddress(data.factories[0].id);
  const pools: Array<Pool2> = [];

  const feeRateField = subgraphConfig.feeRateField ? subgraphConfig.feeRateField : 'feeTier';

  for (const rawPool of data.pools) {
    const pool: Pool2 = {
      chain: subgraphConfig.chain,
      factory: normalizeAddress(factoryAddress),
      type: subgraphConfig.version,
      feeRate: Number(rawPool[feeRateField]) / 1e6,
      address: normalizeAddress(rawPool.id),
      token0: {
        chain: subgraphConfig.chain,
        address: normalizeAddress(rawPool.token0.id),
        symbol: rawPool.token0.symbol,
        decimals: Number(rawPool.token0.decimals),
      },
      token1: {
        chain: subgraphConfig.chain,
        address: normalizeAddress(rawPool.token1.id),
        symbol: rawPool.token1.symbol,
        decimals: Number(rawPool.token1.decimals),
      },
      birthblock: Number(rawPool.createdAtBlockNumber),
    };

    pools.push(pool);
  }

  return {
    factoryAddress,
    pools,
  };
}
