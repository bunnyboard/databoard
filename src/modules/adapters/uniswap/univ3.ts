import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import UniswapV3FactoryAbi from '../../../configs/abi/uniswap/UniswapV3Factory.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { Address, decodeEventLog } from 'viem';
import { AddressMulticall3, EventSignatures } from '../../../configs/constants';
import UniswapV2Core from './univ2';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import envConfig from '../../../configs/envConfig';
import { ContractCall } from '../../../services/blockchains/domains';
import { GetDexDataOptions, GetDexDataResult } from './core';

const UniswapV3Events = {
  Mint: '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
  Burn: '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c',
  Swap: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
};

export default class UniswapV3Core extends UniswapV2Core {
  public readonly name: string = 'adapter.uniswap 🦄';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    // override PoolCreated event
    this.poolCreatedEventSignature = EventSignatures.UniswapV3Factory_PoolCreated;
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: UniswapV3FactoryAbi,
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
      const feeRate = formatBigNumberToNumber(event.args.fee.toString(), 6);
      return {
        chain: this.factoryConfig.chain,
        type: Pool2Types.univ3,
        factory: normalizeAddress(this.factoryConfig.factory),
        address: normalizeAddress(event.args.pool),
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
        const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: pool2.chain,
          address: pool2.token1.address,
          timestamp: timestamp,
          disableWarning: true,
        });

        totalLiquidityUsd += balance0 * token0PriceUsd + balance1 * token1PriceUsd;
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

    const cachingPools: { [key: string]: Pool2 | null } = {};
    const logs = await this.getLogsFromEtherscan(options.fromBlock, options.toBlock, Object.values(UniswapV3Events));
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
          abi: UniswapV3PoolAbi,
          topics: log.topics as any,
          data: log.data as any,
        });

        switch (event.eventName) {
          case 'Swap': {
            let feeRateProtocol = this.factoryConfig.feeRateForProtocol ? this.factoryConfig.feeRateForProtocol : 0;

            let swapVolumeUsd = 0;

            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

            if (amount0 > 0) {
              // swap amount0 -> amount1
              const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token0.chain,
                address: pool2.token0.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token0PriceUsd > 0) {
                swapVolumeUsd = Math.abs(amount0) * token0PriceUsd;
              } else {
                const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
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
              const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token1.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token1PriceUsd) {
                swapVolumeUsd = Math.abs(amount1) * token1PriceUsd;
              } else {
                const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
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
}
