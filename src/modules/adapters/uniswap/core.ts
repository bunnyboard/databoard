import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';
import { GetDexDataDataOptions, GetDexDataResult, Uniswapv2Events, Uniswapv3Events } from './types';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { TokenDexBase } from '../../../configs';
import { ContractCall } from '../../../services/blockchains/domains';
import { decodeEventLog } from 'viem';
import logger from '../../../lib/logger';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import BigNumber from 'bignumber.js';

interface Pool2WithPrices extends Pool2 {
  token0PriceUsd: number;
  token1PriceUsd: number;
}

// query data of 100 pools per time
const callSize = 100;

export default class UniswapCore extends ProtocolAdapter {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getDexData(options: GetDexDataDataOptions): Promise<GetDexDataResult | null> {
    if (options.dexConfig.version === Pool2Types.univ2) {
      return await this.getDexDataV2(options);
    } else if (options.dexConfig.version === Pool2Types.univ3) {
      return await this.getDexDataV3(options);
    }

    return null;
  }

  // helper
  private helperGetBaseTokenAddress(pool2: Pool2): string | null {
    for (const whitelistBaseToken of TokenDexBase[pool2.chain]) {
      if (compareAddress(whitelistBaseToken, pool2.token0.address)) {
        return pool2.token0.address;
      } else if (compareAddress(whitelistBaseToken, pool2.token1.address)) {
        return pool2.token1.address;
      }
    }

    return null;
  }

  protected async getDexDataV2(options: GetDexDataDataOptions): Promise<GetDexDataResult | null> {
    const result: GetDexDataResult = {
      total: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsdForLps: 0,
        totalSwapFeeUsdForProtocol: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
        volumeSwapUsd: 0,
      },
    };

    // caching pool with token prices
    const processedPools: { [key: string]: Pool2WithPrices } = {};

    // query pools liquidity
    for (let startIndex = 0; startIndex < options.pools.length; startIndex += callSize) {
      const queryPools = options.pools.slice(startIndex, startIndex + callSize);

      const balanceCalls: Array<ContractCall> = [];
      for (const pool2 of queryPools) {
        balanceCalls.push({
          abi: Erc20Abi,
          target: pool2.token0.address,
          method: 'balanceOf',
          params: [pool2.address],
        });
        balanceCalls.push({
          abi: Erc20Abi,
          target: pool2.token1.address,
          method: 'balanceOf',
          params: [pool2.address],
        });
      }

      // query balances
      const balanceResults: Array<any> = await this.services.blockchain.evm.multicall({
        chain: options.dexConfig.chain,
        blockNumber: options.blockNumber,
        calls: balanceCalls,
      });

      for (let i = 0; i < queryPools.length; i++) {
        const pool2 = queryPools[i];

        const balance0 = formatBigNumberToNumber(
          balanceResults[i * 2] ? balanceResults[i * 2].toString() : '0',
          pool2.token0.decimals,
        );
        const balance1 = formatBigNumberToNumber(
          balanceResults[i * 2 + 1] ? balanceResults[i * 2 + 1].toString() : '0',
          pool2.token1.decimals,
        );

        const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
        if (baseTokenAddress) {
          const baseTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: pool2.chain,
            address: baseTokenAddress,
            timestamp: options.timestamp,
          });

          let token0PriceUsd = 0;
          let token1PriceUsd = 0;
          if (compareAddress(pool2.token0.address, baseTokenAddress)) {
            token0PriceUsd = baseTokenPriceUsd;
            token1PriceUsd = balance1 > 0 ? (balance0 / balance1) * baseTokenPriceUsd : 0;
          } else {
            token1PriceUsd = baseTokenPriceUsd;
            token0PriceUsd = balance0 > 0 ? (balance1 / balance0) * baseTokenPriceUsd : 0;
          }

          if (!processedPools[pool2.address]) {
            result.total.totalLiquidityUsd += balance0 * token0PriceUsd + balance1 * token1PriceUsd;
          }

          processedPools[pool2.address] = {
            ...pool2,
            token0PriceUsd,
            token1PriceUsd,
          };
        }
      }

      logger.debug('processed pools liquidity data', {
        service: this.name,
        chain: options.dexConfig.chain,
        protocol: this.protocolConfig.protocol,
        version: options.dexConfig.version,
        factory: options.dexConfig.factory,
        pools: `${startIndex + callSize > options.pools.length ? options.pools.length : startIndex + callSize}/${options.pools.length}`,
      });
    }

    const logs = await this.services.blockchain.evm.getAndFilterLogs({
      chain: options.dexConfig.chain,
      contracts: options.pools.map((item) => item.address),
      signatures: [Uniswapv2Events.Swap, Uniswapv2Events.Mint, Uniswapv2Events.Burn],
      fromBlock: options.beginBlock,
      toBlock: options.endBlock,
    });

    for (const log of logs) {
      const eventPool2 = processedPools[normalizeAddress(log.address)];
      if (eventPool2) {
        const signature = log.topics[0];

        const event: any = decodeEventLog({
          abi: UniswapV2PairAbi,
          topics: log.topics,
          data: log.data,
        });

        if (signature === Uniswapv2Events.Swap) {
          const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), eventPool2.token0.decimals);
          const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), eventPool2.token1.decimals);

          let volumeUsd = 0;
          if (amount0In > 0) {
            volumeUsd = amount0In * eventPool2.token0PriceUsd;
          } else if (amount1In > 0) {
            volumeUsd = amount1In * eventPool2.token1PriceUsd;
          }

          const feeRateLp = options.dexConfig.feeRateForLiquidityProviders
            ? options.dexConfig.feeRateForLiquidityProviders
            : eventPool2.feeRate;
          const feeRateProtocol = options.dexConfig.feeRateForProtocol ? options.dexConfig.feeRateForProtocol : 0;
          const feeUsdForLp = volumeUsd * feeRateLp;
          const feeUsdForProtocol = volumeUsd * feeRateProtocol;

          result.total.volumeSwapUsd += volumeUsd;
          result.total.totalSwapFeeUsdForLps += feeUsdForLp;
          result.total.totalSwapFeeUsdForProtocol += feeUsdForProtocol;
        } else {
          const amount0Usd =
            formatBigNumberToNumber(event.args.amount0.toString(), eventPool2.token0.decimals) *
            eventPool2.token0PriceUsd;
          const amount1Usd =
            formatBigNumberToNumber(event.args.amount1.toString(), eventPool2.token1.decimals) *
            eventPool2.token1PriceUsd;

          if (signature === Uniswapv2Events.Mint) {
            result.total.volumeAddLiquidityUsd += amount0Usd + amount1Usd;
          } else {
            result.total.volumeRemoveLiquidityUsd += amount0Usd + amount1Usd;
          }
        }
      }
    }

    return result;
  }

  protected async getDexDataV3(options: GetDexDataDataOptions): Promise<GetDexDataResult | null> {
    const result: GetDexDataResult = {
      total: {
        totalLiquidityUsd: 0,
        totalSwapFeeUsdForLps: 0,
        totalSwapFeeUsdForProtocol: 0,
        volumeAddLiquidityUsd: 0,
        volumeRemoveLiquidityUsd: 0,
        volumeSwapUsd: 0,
      },
    };

    // caching pool and token prices for fast calculate volumes from logs later below
    const processedPools: { [key: string]: Pool2WithPrices } = {};

    // query pools liquidity
    for (let startIndex = 0; startIndex < options.pools.length; startIndex += callSize) {
      // in very loop, make sure queryPools.length == 1/3 of balanceCalls.length == 1/3 of balanceResults

      // query pools if this loop
      const queryPools = options.pools.slice(startIndex, startIndex + callSize);

      const balanceCalls: Array<ContractCall> = [];
      for (const pool2 of queryPools) {
        balanceCalls.push({
          abi: UniswapV3PoolAbi,
          target: pool2.address,
          method: 'slot0',
          params: [],
        });
        balanceCalls.push({
          abi: Erc20Abi,
          target: pool2.token0.address,
          method: 'balanceOf',
          params: [pool2.address],
        });
        balanceCalls.push({
          abi: Erc20Abi,
          target: pool2.token1.address,
          method: 'balanceOf',
          params: [pool2.address],
        });
      }

      // query balances
      const balanceResults: Array<any> = await this.services.blockchain.evm.multicall({
        chain: options.dexConfig.chain,
        blockNumber: options.blockNumber,
        calls: balanceCalls,
      });

      if (balanceResults) {
        for (let i = 0; i < queryPools.length; i++) {
          const pool2 = queryPools[i];

          const baseTokenAddress = this.helperGetBaseTokenAddress(pool2);
          if (!baseTokenAddress) {
            // this pool does not contain baseToken
            continue;
          }

          const slot0 = balanceResults[i * 3];
          const balance0 = formatBigNumberToNumber(
            balanceResults[i * 3 + 1] ? balanceResults[i * 3 + 1].toString() : '0',
            pool2.token0.decimals,
          );
          const balance1 = formatBigNumberToNumber(
            balanceResults[i * 3 + 2] ? balanceResults[i * 3 + 2].toString() : '0',
            pool2.token1.decimals,
          );

          if (slot0 && slot0[0] && balance0 > 0 && balance1 > 0) {
            let token0PriceUsd = 0;
            let token1PriceUsd = 0;

            // https://blog.uniswap.org/uniswap-v3-math-primer
            // slot0.sqrtPriceX96 -> sqrtPrice
            const diffDecimals = pool2.token1.decimals - pool2.token0.decimals;
            const sqrtPrice = new BigNumber(slot0[0].toString())
              .dividedBy(2 ** 96)
              .pow(2)
              .dividedBy(10 ** diffDecimals)
              .toNumber();

            // sqrtPrice -> price
            const token0PriceVsToken1 = sqrtPrice;
            const token1PriceVsToken0 = sqrtPrice > 0 ? 1 / token0PriceVsToken1 : 0;

            if (compareAddress(baseTokenAddress, pool2.token0.address)) {
              // price token1 vs token0
              token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.chain,
                address: pool2.token0.address,
                timestamp: options.timestamp,
              });

              token1PriceUsd = token1PriceVsToken0 * token0PriceUsd;
            } else {
              // price token0 vs token1
              token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
              });

              token0PriceUsd = token0PriceVsToken1 * token1PriceUsd;
            }

            const balance0usd = balance0 * token0PriceUsd;
            const balance1Usd = balance1 * token1PriceUsd;

            if (!processedPools[pool2.address]) {
              result.total.totalLiquidityUsd += balance0usd + balance1Usd;
            }

            // save cache
            processedPools[pool2.address] = {
              ...pool2,
              token0PriceUsd,
              token1PriceUsd,
            };
          }
        }
      }

      logger.debug('processed pools liquidity data', {
        service: this.name,
        chain: options.dexConfig.chain,
        protocol: this.protocolConfig.protocol,
        version: options.dexConfig.version,
        factory: options.dexConfig.factory,
        pools: `${startIndex + callSize}/${options.pools.length}`,
      });
    }

    const logs = await this.services.blockchain.evm.getAndFilterLogs({
      chain: options.dexConfig.chain,
      contracts: options.pools.map((item) => item.address),
      signatures: [Uniswapv3Events.Swap, Uniswapv3Events.Mint, Uniswapv3Events.Burn],
      fromBlock: options.beginBlock,
      toBlock: options.endBlock,
    });

    for (const log of logs) {
      const signature = log.topics[0];
      if (
        signature === Uniswapv3Events.Swap ||
        signature === Uniswapv3Events.Mint ||
        signature === Uniswapv3Events.Burn
      ) {
        const eventPool2 = processedPools[normalizeAddress(log.address)];
        if (eventPool2) {
          const event: any = decodeEventLog({
            abi: UniswapV3PoolAbi,
            topics: log.topics,
            data: log.data,
          });

          if (signature === Uniswapv3Events.Swap) {
            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), eventPool2.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), eventPool2.token1.decimals);

            let volumeUsd = 0;
            if (amount0 > 0) {
              // swap from token0 -> token1
              volumeUsd = amount0 * eventPool2.token0PriceUsd;
            } else if (amount1 > 0) {
              volumeUsd = amount1 * eventPool2.token1PriceUsd;
            }

            const swapFeeUsd = volumeUsd * eventPool2.feeRate;

            const feeRateProtocol = options.dexConfig.feeRateForProtocol ? options.dexConfig.feeRateForProtocol : 0;
            const feeUsdForProtocol = swapFeeUsd * feeRateProtocol;

            result.total.volumeSwapUsd += volumeUsd;
            result.total.totalSwapFeeUsdForLps += swapFeeUsd - feeUsdForProtocol;
            result.total.totalSwapFeeUsdForProtocol += feeUsdForProtocol;
          } else {
            const amount0Usd =
              formatBigNumberToNumber(event.args.amount0.toString(), eventPool2.token0.decimals) *
              eventPool2.token0PriceUsd;
            const amount1Usd =
              formatBigNumberToNumber(event.args.amount1.toString(), eventPool2.token1.decimals) *
              eventPool2.token1PriceUsd;

            if (signature === Uniswapv3Events.Mint) {
              result.total.volumeAddLiquidityUsd += Math.abs(amount0Usd) + Math.abs(amount1Usd);
            } else {
              result.total.volumeRemoveLiquidityUsd += Math.abs(amount0Usd) + Math.abs(amount1Usd);
            }
          }
        }
      }
    }

    return result;
  }
}
