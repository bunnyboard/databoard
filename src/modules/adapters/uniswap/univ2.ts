import envConfig from '../../../configs/envConfig';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapV2FactoryAbi from '../../../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import logger from '../../../lib/logger';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { Address, decodeEventLog } from 'viem';
import { AddressMulticall3, EventSignatures } from '../../../configs/constants';
import { ContractCall } from '../../../services/blockchains/domains';
import { EtherscanLogItem } from '../../libs/etherscan';
import DexCore, { GetDexDataOptions, GetDexDataResult } from './core';

const UniswapV2Events = {
  Mint: '0x4c209b5fc8ad50758f13e2e1088ba56a560dff690a1c6fef26394f4c03821c4f',
  Burn: '0xdccd412f0b1252819cb1fd330b93224ca42612892bb3f4f789976e6d81936496',
  Swap: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
};

export default class UniswapV2Core extends DexCore {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    this.poolCreatedEventSignature = EventSignatures.UniswapV2Factory_PairCreated;
  }

  public async indexPools(): Promise<void> {
    let startBlock = this.factoryConfig.factoryBirthblock;

    // get the latest index number from db if any
    const syncStateKey = this.getPoolsIndexingKey();
    const syncState = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: syncStateKey,
      },
    });
    if (syncState) {
      startBlock = Number(syncState.blockNumber) + 1;
    }

    // get current chain latest block
    const latestBlockNumber = await this.services.blockchain.evm.getLastestBlockNumber(this.factoryConfig.chain);

    logger.info('start to sync pools from factory logs', {
      service: this.name,
      chain: this.factoryConfig.chain,
      factory: this.factoryConfig.factory,
      fromBlock: startBlock,
      toBlock: latestBlockNumber,
    });

    const blockRange = 10000;
    while (startBlock <= latestBlockNumber) {
      const toBlock = startBlock + blockRange > latestBlockNumber ? latestBlockNumber : startBlock + blockRange;
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: this.factoryConfig.chain,
        address: this.factoryConfig.factory,
        fromBlock: startBlock,
        toBlock: toBlock,
      });

      for (const log of logs) {
        let pool2: Pool2 | null = null;

        if (log.topics[0] === this.poolCreatedEventSignature) {
          pool2 = await this.parsePoolCreatedEvent(log);
        }

        if (pool2) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.datasyncPool2.name,
            keys: {
              chain: pool2.chain,
              factory: pool2.factory,
              address: pool2.address,
            },
            updates: {
              ...pool2,
            },
            upsert: true,
          });
        }
      }

      startBlock = toBlock + 1;

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: syncStateKey,
        },
        updates: {
          name: syncStateKey,
          blockNumber: startBlock,
        },
        upsert: true,
      });
    }
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: UniswapV2FactoryAbi,
      topics: log.topics,
      data: log.data,
    });

    const [token0, token1] = await Promise.all([
      this.services.blockchain.evm.getTokenInfo({
        chain: this.factoryConfig.chain,
        address: event.args.token0,
      }),
      this.services.blockchain.evm.getTokenInfo({
        chain: this.factoryConfig.chain,
        address: event.args.token1,
      }),
    ]);

    if (token0 && token1) {
      const feeRateForLiquidityProviders = this.factoryConfig.feeRateForLiquidityProviders
        ? this.factoryConfig.feeRateForLiquidityProviders
        : 0;
      const feeRateForProtocol = this.factoryConfig.feeRateForProtocol ? this.factoryConfig.feeRateForProtocol : 0;

      let feeRate = feeRateForLiquidityProviders + feeRateForProtocol;
      if (feeRate === 0) {
        feeRate = 0.003;
      }

      return {
        chain: this.factoryConfig.chain,
        type: Pool2Types.univ2,
        factory: normalizeAddress(this.factoryConfig.factory),
        address: normalizeAddress(event.args.pair),
        feeRate: feeRate,
        token0,
        token1,
        birthblock: Number(log.blockNumber),
      };
    }

    return null;
  }

  protected async getTotalLiquidityUsd(timestamp: number): Promise<number> {
    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      this.factoryConfig.chain,
      timestamp,
    );

    const client = this.services.blockchain.evm.getPublicClient(this.factoryConfig.chain);
    const cachingProcessedPools: { [key: string]: boolean } = {};

    const callSize = 200;
    let totalLiquidityUsd = 0;
    let poolIndex = 0;
    while (true) {
      const poolConfigs: Array<Pool2> = await this.storages.database.query({
        collection: envConfig.mongodb.collections.datasyncPool2.name,
        query: {
          chain: this.factoryConfig.chain,
          factory: normalizeAddress(this.factoryConfig.factory),
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
        if (this.factoryConfig.blacklistPools && this.factoryConfig.blacklistPools.includes(pool2.address)) {
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

        const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: pool2.chain,
          address: pool2.token0.address,
          timestamp: timestamp,
          disableWarning: true,
        });
        if (token0PriceUsd > 0) {
          totalLiquidityUsd += balance0 * token0PriceUsd * 2;
        } else {
          const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: pool2.chain,
            address: pool2.token1.address,
            timestamp: timestamp,
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

  public async getDexData(options: GetDexDataOptions): Promise<GetDexDataResult> {
    const result: GetDexDataResult = {
      totalLiquidity: await this.getTotalLiquidityUsd(options.timestamp),
      swapVolumeUsd: 0,
      protocolRevenueUsd: 0,
      supplySideRevenueUsd: 0,
      depositVolumeUsd: 0,
      withdrawVolumeUsd: 0,
    };

    // caching for reduce calls to db
    const cachingPools: { [key: string]: Pool2 | null } = {};
    const logs = await this.getLogsFromEtherscan(options.fromBlock, options.toBlock, Object.values(UniswapV2Events));
    for (const log of logs) {
      let pool2: Pool2 | undefined | null = cachingPools[normalizeAddress(log.address)];
      if (pool2 === undefined) {
        pool2 = await this.storages.database.find({
          collection: envConfig.mongodb.collections.datasyncPool2.name,
          query: {
            chain: this.factoryConfig.chain,
            factory: normalizeAddress(this.factoryConfig.factory),
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
            if (this.factoryConfig.feeRateForProtocol && this.factoryConfig.feeRateForLiquidityProviders) {
              feeRate = this.factoryConfig.feeRateForProtocol + this.factoryConfig.feeRateForLiquidityProviders;
              feeRateProtocol = this.factoryConfig.feeRateForProtocol;
              feeRateSupplySide = this.factoryConfig.feeRateForLiquidityProviders;
            }

            let swapVolumeUsd = 0;

            const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), pool2.token0.decimals);
            const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), pool2.token1.decimals);
            const amount0Out = formatBigNumberToNumber(event.args.amount0Out.toString(), pool2.token0.decimals);
            const amount1Out = formatBigNumberToNumber(event.args.amount1Out.toString(), pool2.token1.decimals);

            const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
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
              const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
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

            const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: pool2.token0.chain,
              address: pool2.token0.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });
            if (token0PriceUsd > 0) {
              volumeUsd = amount0 * token0PriceUsd * 2;
            } else {
              const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
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

  public async getLogsFromEtherscan(
    fromBlock: number,
    toBlock: number,
    topics: Array<string>,
  ): Promise<Array<EtherscanLogItem>> {
    let logs: Array<EtherscanLogItem> = [];

    for (const topic of topics) {
      const etherscanLogs = await this.services.indexer.etherscan.getLogsByTopic0AutoPaging({
        database: null,
        chain: this.factoryConfig.chain,
        fromBlock: fromBlock,
        toBlock: toBlock,
        topic0: topic,
      });

      logs = logs.concat(etherscanLogs);
    }

    return logs;
  }
}
