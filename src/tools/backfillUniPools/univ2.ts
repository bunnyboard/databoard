import axios from 'axios';
import { Pool2, Pool2Types } from '../../types/domains/pool2';
import { normalizeAddress } from '../../lib/utils';
import { SubgraphConfig } from './configs';
import BlockchainService from '../../services/blockchains/blockchain';
import { ContractCall } from '../../services/blockchains/domains';
import Uniswapv2FactoryAbi from '../../configs/abi/uniswap/UniswapV2Factory.json';
import Uniswapv2PairAbi from '../../configs/abi/uniswap/UniswapV2Pair.json';

export async function queryPoolsV2(endpoint: string, latestId: string): Promise<any> {
  return (
    await axios.post(endpoint, {
      query: `
      {
        factories: uniswapFactories(first: 1) {
          id
        }

        pools: pairs(first: 1000, where: {id_gt: "${latestId}"}, orderBy: id, orderDirection: asc) {
          id
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
        }
      }
    `,
    })
  ).data;
}

export function parseDataPoolsV2(
  subgraphConfig: SubgraphConfig,
  data: any,
): {
  factoryAddress: string;
  pools: Array<Pool2>;
} {
  const factoryAddress = normalizeAddress(data.factories[0].id);
  const pools: Array<Pool2> = [];

  for (const rawPool of data.pools) {
    const pool: Pool2 = {
      chain: subgraphConfig.chain,
      type: Pool2Types.univ2,
      factory: factoryAddress,
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
      feeRate: subgraphConfig.feeRate,
      birthblock: Number(rawPool.createdAtBlockNumber),
    };

    pools.push(pool);
  }

  return {
    factoryAddress,
    pools,
  };
}

export async function queryPoolsV2Messari(endpoint: string, latestId: string): Promise<any> {
  return (
    await axios.post(endpoint, {
      query: `
      {
        factories: uniswapFactories(first: 1) {
          id
        }

        pools: pairs(first: 1000, where: {id_gt: "${latestId}"}, orderBy: id, orderDirection: asc) {
          id
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
        }
      }
    `,
    })
  ).data;
}

export async function queryPoolsV2Factory(
  subgraphConfig: SubgraphConfig,
  fromId: number,
  toId: number,
): Promise<{
  factoryAddress: string;
  pools: Array<Pool2>;
}> {
  const pools: Array<Pool2> = [];
  const blockchain = new BlockchainService();

  const getPairsCalls: Array<ContractCall> = [];
  for (let i = fromId; i <= toId; i++) {
    getPairsCalls.push({
      abi: Uniswapv2FactoryAbi,
      target: subgraphConfig.factoryAddress as string,
      method: 'allPairs',
      params: [i],
    });
  }
  const getPairsResults = await blockchain.multicall({
    chain: subgraphConfig.chain,
    calls: getPairsCalls,
  });

  const getPairTokensCalls: Array<ContractCall> = [];
  for (const pairAddress of getPairsResults) {
    getPairTokensCalls.push({
      abi: Uniswapv2PairAbi,
      target: pairAddress,
      method: 'token0',
      params: [],
    });
    getPairTokensCalls.push({
      abi: Uniswapv2PairAbi,
      target: pairAddress,
      method: 'token1',
      params: [],
    });
  }
  const getPairTokensResults = await blockchain.multicall({
    chain: subgraphConfig.chain,
    calls: getPairTokensCalls,
  });

  for (let i = 0; i < getPairsResults.length; i++) {
    const token0 = await blockchain.getTokenInfo({
      chain: subgraphConfig.chain,
      address: getPairTokensResults[i * 2],
    });
    const token1 = await blockchain.getTokenInfo({
      chain: subgraphConfig.chain,
      address: getPairTokensResults[i * 2 + 1],
    });
    if (token0 && token1) {
      pools.push({
        chain: subgraphConfig.chain,
        type: Pool2Types.univ2,
        factory: normalizeAddress(subgraphConfig.factoryAddress as string),
        address: normalizeAddress(getPairsResults[i]),
        token0: token0,
        token1: token1,
        feeRate: subgraphConfig.feeRate,
        birthblock: 0, // can not get birthblock with this method
      });
    }
  }

  return {
    factoryAddress: normalizeAddress(subgraphConfig.factoryAddress as string),
    pools,
  };
}
