import envConfig from '../../../configs/envConfig';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { ContractCall } from '../../../services/blockchains/domains';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import { Address, decodeEventLog } from 'viem';
import { AddressMulticall3 } from '../../../configs/constants';
import { EtherscanLogItem } from '../../libs/etherscan';

interface GetLiquidityDataOptions {
  storages: ContextStorages;
  services: ContextServices;
  factoryConfig: UniswapFactoryConfig;
  timestamp: number;
}

interface GetLogsDataOptions extends GetLiquidityDataOptions {
  fromBlock: number;
  toBlock: number;
}

interface GetLogsDataResult {
  swapVolumeUsd: number;
  protocolRevenueUsd: number;
  supplySideRevenueUsd: number;
  depositVolumeUsd: number;
  withdrawVolumeUsd: number;
}

const callSize = 200;

const UniswapV2Events = {
  Mint: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
  Burn: '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
  Swap: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
};

const UniswapV3Events = {
  Mint: '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
  Burn: '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c',
  Swap: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
};

export default class UniswapCore {
  public static async getLiquidityUsd(options: GetLiquidityDataOptions): Promise<number> {
    if (options.factoryConfig.version === Pool2Types.univ2) {
      return await UniswapCore.getLiquidityV2(options);
    } else if (options.factoryConfig.version === Pool2Types.univ3) {
      return await UniswapCore.getLiquidityV3(options);
    }

    return 0;
  }

  public static async getLogsDataUsd(options: GetLogsDataOptions): Promise<GetLogsDataResult> {
    if (options.factoryConfig.version === Pool2Types.univ2) {
      return await UniswapCore.getLogsDataV2(options);
    } else if (options.factoryConfig.version === Pool2Types.univ3) {
      return await UniswapCore.getLogsDataV3(options);
    }

    return {
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };
  }

  public static async getLiquidityV2(options: GetLiquidityDataOptions): Promise<number> {
    const blockNumber = await options.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.factoryConfig.chain,
      options.timestamp,
    );

    const client = options.services.blockchain.evm.getPublicClient(options.factoryConfig.chain);
    const cachingProcessedPools: { [key: string]: boolean } = {};

    let totalLiquidityUsd = 0;
    let poolIndex = 0;
    while (true) {
      const poolConfigs: Array<Pool2> = await options.storages.database.query({
        collection: envConfig.mongodb.collections.datasyncPool2.name,
        query: {
          chain: options.factoryConfig.chain,
          factory: normalizeAddress(options.factoryConfig.factory),
        },
        options: {
          limit: callSize,
          skip: poolIndex * callSize,
          order: { address: 1 },
        },
      });

      if (poolConfigs.length === 0) {
        break;
      }

      const balanceCalls: Array<ContractCall> = [];
      for (const pool2 of poolConfigs) {
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
      const contracts = balanceCalls.map((call) => {
        return {
          address: call.target as Address,
          abi: call.abi,
          functionName: call.method,
          args: call.params,
        } as const;
      });
      const callResults: Array<any> = await client.multicall({
        multicallAddress: AddressMulticall3,
        contracts: contracts,
        blockNumber: BigInt(blockNumber),
        allowFailure: true,
      });

      // we allow failure on multicall
      // so if a call failed, we count the balance is zero
      const balanceResults: Array<any> = callResults.map((item) => (item.result ? item.result : 0n));

      for (let i = 0; i < poolConfigs.length; i++) {
        const pool2 = poolConfigs[i];

        if (cachingProcessedPools[pool2.address]) {
          continue;
        } else {
          cachingProcessedPools[pool2.address] = true;
        }

        // ignore blacklist pools too
        if (options.factoryConfig.blacklistPools && options.factoryConfig.blacklistPools.includes(pool2.address)) {
          continue;
        }

        const balance0 = formatBigNumberToNumber(
          balanceResults[i * 2] ? balanceResults[i * 2].toString() : '0',
          pool2.token0.decimals,
        );
        const balance1 = formatBigNumberToNumber(
          balanceResults[i * 2 + 1] ? balanceResults[i * 2 + 1].toString() : '0',
          pool2.token1.decimals,
        );

        const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
          chain: pool2.chain,
          address: pool2.token0.address,
          timestamp: options.timestamp,
          disableWarning: true,
        });
        if (token0PriceUsd > 0) {
          totalLiquidityUsd += balance0 * token0PriceUsd * 2;
        } else {
          const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
            chain: pool2.chain,
            address: pool2.token1.address,
            timestamp: options.timestamp,
            disableWarning: true,
          });
          if (token1PriceUsd > 0) {
            totalLiquidityUsd += balance1 * token1PriceUsd * 2;
          }
        }
      }

      poolIndex += 1;
    }

    return totalLiquidityUsd;
  }

  public static async getLiquidityV3(options: GetLiquidityDataOptions): Promise<number> {
    const blockNumber = await options.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      options.factoryConfig.chain,
      options.timestamp,
    );

    const client = options.services.blockchain.evm.getPublicClient(options.factoryConfig.chain);
    const cachingProcessedPools: { [key: string]: boolean } = {};

    let totalLiquidityUsd = 0;
    let poolIndex = 0;
    while (true) {
      const poolConfigs: Array<Pool2> = await options.storages.database.query({
        collection: envConfig.mongodb.collections.datasyncPool2.name,
        query: {
          chain: options.factoryConfig.chain,
          factory: normalizeAddress(options.factoryConfig.factory),
        },
        options: {
          limit: callSize,
          skip: poolIndex * callSize,
          order: { address: 1 },
        },
      });

      if (poolConfigs.length === 0) {
        break;
      }

      const balanceCalls: Array<ContractCall> = [];
      for (const pool2 of poolConfigs) {
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
      const contracts = balanceCalls.map((call) => {
        return {
          address: call.target as Address,
          abi: call.abi,
          functionName: call.method,
          args: call.params,
        } as const;
      });
      const callResults: Array<any> = await client.multicall({
        multicallAddress: AddressMulticall3,
        contracts: contracts,
        blockNumber: BigInt(blockNumber),
        allowFailure: true,
      });

      // we allow failure on multicall
      // so if a call failed, we count the balance is zero
      const balanceResults: Array<any> = callResults.map((item) => (item.result ? item.result : 0n));

      for (let i = 0; i < poolConfigs.length; i++) {
        const pool2 = poolConfigs[i];

        if (cachingProcessedPools[pool2.address]) {
          continue;
        } else {
          cachingProcessedPools[pool2.address] = true;
        }

        // ignore blacklist pools too
        if (options.factoryConfig.blacklistPools && options.factoryConfig.blacklistPools.includes(pool2.address)) {
          continue;
        }

        const balance0 = formatBigNumberToNumber(
          balanceResults[i * 2] ? balanceResults[i * 2].toString() : '0',
          pool2.token0.decimals,
        );
        const balance1 = formatBigNumberToNumber(
          balanceResults[i * 2 + 1] ? balanceResults[i * 2 + 1].toString() : '0',
          pool2.token1.decimals,
        );

        const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
          chain: pool2.chain,
          address: pool2.token0.address,
          timestamp: options.timestamp,
          disableWarning: true,
        });
        const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
          chain: pool2.chain,
          address: pool2.token1.address,
          timestamp: options.timestamp,
          disableWarning: true,
        });

        totalLiquidityUsd += balance0 * token0PriceUsd + balance1 * token1PriceUsd;
      }

      poolIndex += 1;
    }

    return totalLiquidityUsd;
  }

  public static async getLogsDataV2(options: GetLogsDataOptions): Promise<GetLogsDataResult> {
    const result: GetLogsDataResult = {
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };

    // caching for reduce calls to db
    const cachingPools: { [key: string]: Pool2 | null } = {};
    const logs = await UniswapCore.getLogsFromEtherscan(options);
    for (const log of logs) {
      let pool2: Pool2 | undefined | null = cachingPools[normalizeAddress(log.address)];
      if (pool2 === undefined) {
        pool2 = await options.storages.database.find({
          collection: envConfig.mongodb.collections.datasyncPool2.name,
          query: {
            chain: options.factoryConfig.chain,
            factory: normalizeAddress(options.factoryConfig.factory),
            address: normalizeAddress(log.address),
          },
        });
        if (pool2) {
          cachingPools[normalizeAddress(log.address)] = pool2;
        } else {
          cachingPools[normalizeAddress(log.address)] = null;
        }
      }

      if (pool2) {
        const event: any = decodeEventLog({
          abi: UniswapV2PairAbi,
          topics: log.topics as any,
          data: log.data as any,
        });

        switch (event.eventName) {
          case 'Swap': {
            let feeRate = 0.003; // default univ2
            let feeRateProtocol = 0;
            let feeRateSupplySide = 0;
            if (options.factoryConfig.feeRateForProtocol && options.factoryConfig.feeRateForLiquidityProviders) {
              feeRate = options.factoryConfig.feeRateForProtocol + options.factoryConfig.feeRateForLiquidityProviders;
              feeRateProtocol = options.factoryConfig.feeRateForProtocol;
              feeRateSupplySide = options.factoryConfig.feeRateForLiquidityProviders;
            }

            let swapVolumeUsd = 0;

            const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), pool2.token0.decimals);
            const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), pool2.token1.decimals);
            const amount0Out = formatBigNumberToNumber(event.args.amount0Out.toString(), pool2.token0.decimals);
            const amount1Out = formatBigNumberToNumber(event.args.amount1Out.toString(), pool2.token1.decimals);

            const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.token0.chain,
              address: pool2.token0.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });
            if (token0PriceUsd > 0) {
              if (amount0In > 0) {
                swapVolumeUsd = amount0In * token0PriceUsd;
              } else {
                swapVolumeUsd = (amount0Out * token0PriceUsd) / (1 - feeRate);
              }
            } else {
              const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token1.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token1PriceUsd) {
                if (amount1In > 0) {
                  swapVolumeUsd = amount1In * token1PriceUsd;
                } else {
                  swapVolumeUsd = (amount1Out * token1PriceUsd) / (1 - feeRate);
                }
              }
            }

            result.swapVolumeUsd += swapVolumeUsd;
            result.protocolRevenueUsd += swapVolumeUsd * feeRateProtocol;
            result.supplySideRevenueUsd += swapVolumeUsd * feeRateSupplySide;

            break;
          }

          case 'Mint':
          case 'Burn': {
            let volumeUsd = 0;

            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

            const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.token0.chain,
              address: pool2.token0.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });
            if (token0PriceUsd > 0) {
              volumeUsd = amount0 * token0PriceUsd * 2;
            } else {
              const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token1.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              volumeUsd = amount1 * token1PriceUsd * 2;
            }

            if (event.eventName === 'Mint') {
              result.depositVolumeUsd += volumeUsd;
            } else {
              result.withdrawVolumeUsd += volumeUsd;
            }

            break;
          }
        }
      }
    }

    return result;
  }

  public static async getLogsDataV3(options: GetLogsDataOptions): Promise<GetLogsDataResult> {
    const result: GetLogsDataResult = {
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };

    const cachingPools: { [key: string]: Pool2 | null } = {};
    const logs = await UniswapCore.getLogsFromEtherscan(options);
    for (const log of logs) {
      let pool2: Pool2 | undefined | null = cachingPools[normalizeAddress(log.address)];
      if (pool2 === undefined) {
        pool2 = await options.storages.database.find({
          collection: envConfig.mongodb.collections.datasyncPool2.name,
          query: {
            chain: options.factoryConfig.chain,
            factory: normalizeAddress(options.factoryConfig.factory),
            address: normalizeAddress(log.address),
          },
        });
        if (pool2) {
          cachingPools[normalizeAddress(log.address)] = pool2;
        } else {
          cachingPools[normalizeAddress(log.address)] = null;
        }
      }
      if (pool2) {
        const event: any = decodeEventLog({
          abi: UniswapV3PoolAbi,
          topics: log.topics as any,
          data: log.data as any,
        });

        switch (event.eventName) {
          case 'Swap': {
            let feeRateProtocol = options.factoryConfig.feeRateForProtocol
              ? options.factoryConfig.feeRateForProtocol
              : 0;

            let swapVolumeUsd = 0;

            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

            if (amount0 > 0) {
              // swap amount0 -> amount1
              const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token0.chain,
                address: pool2.token0.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token0PriceUsd > 0) {
                swapVolumeUsd = Math.abs(amount0) * token0PriceUsd;
              } else {
                const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.token1.chain,
                  address: pool2.token1.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                if (token1PriceUsd > 0) {
                  swapVolumeUsd = (Math.abs(amount1) * token1PriceUsd) / (1 - pool2.feeRate);
                }
              }
            } else {
              // swap amount1 -> amount0
              const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token1.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token1PriceUsd) {
                swapVolumeUsd = Math.abs(amount1) * token1PriceUsd;
              } else {
                const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.token0.chain,
                  address: pool2.token0.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                if (token0PriceUsd > 0) {
                  swapVolumeUsd = (Math.abs(amount0) * token0PriceUsd) / (1 - pool2.feeRate);
                }
              }
            }

            const swapFeeUsd = swapVolumeUsd * pool2.feeRate;
            const protocolFeeUsd = swapFeeUsd * feeRateProtocol;

            result.swapVolumeUsd += swapVolumeUsd;
            result.protocolRevenueUsd += protocolFeeUsd;
            result.supplySideRevenueUsd += swapFeeUsd - protocolFeeUsd;

            break;
          }

          case 'Mint':
          case 'Burn': {
            let volumeUsd = 0;

            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

            const token0PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.token0.chain,
              address: pool2.token0.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });
            if (token0PriceUsd > 0) {
              volumeUsd = amount0 * token0PriceUsd * 2;
            } else {
              const token1PriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token1.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              volumeUsd = amount1 * token1PriceUsd * 2;
            }

            if (event.eventName === 'Mint') {
              result.depositVolumeUsd += volumeUsd;
            } else {
              result.withdrawVolumeUsd += volumeUsd;
            }

            break;
          }
        }
      }
    }

    return result;
  }

  public static async getLogsFromEtherscan(options: GetLogsDataOptions): Promise<Array<EtherscanLogItem>> {
    let logs: Array<EtherscanLogItem> = [];

    const topics =
      options.factoryConfig.version === Pool2Types.univ2
        ? Object.values(UniswapV2Events)
        : Object.values(UniswapV3Events);

    for (const topic of topics) {
      const etherscanLogs = await options.services.indexer.etherscan.getLogsByTopic0AutoPaging({
        database: null,
        chain: options.factoryConfig.chain,
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
        topic0: topic,
      });

      logs = logs.concat(etherscanLogs);
    }

    return logs;
  }
}
