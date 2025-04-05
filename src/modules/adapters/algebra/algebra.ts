import { EventSignatures } from '../../../configs/constants';
import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import AlgebraPoolAbi from '../../../configs/abi/algebra/AlgebraPool.json';
import { decodeEventLog } from 'viem';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import UniswapV3Core from '../uniswap/univ3';
import envConfig from '../../../configs/envConfig';
import { GetDexDataOptions, GetDexDataResult } from '../uniswap/core';

const AlgebraPoolEvents = {
  Mint: '0x7a53080ba414158be7ec69b987b5fb7d07dee101fe85488f0853ae16239d0bde',
  Burn: '0x0c396cd989a39f4459b5fa1aed6a9a8dcdbc45908acfd67e028cd568da98982c',
  Swap: '0xc42079f94a6350d7e6235f29174924f928cc2ac818eb64fed8004e115fbcca67',
};

export default class AlgebraCore extends UniswapV3Core {
  public readonly name: string = 'adapter.algebra';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    this.poolCreatedEventSignature = EventSignatures.AlgebraFactory_PoolCreated;
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: AlgebraPoolAbi,
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
      const feeRate = await this.services.blockchain.evm.readContract({
        chain: this.factoryConfig.chain,
        abi: AlgebraPoolAbi,
        target: event.args.pool,
        method: 'feeZto',
        params: [],
      });

      return {
        chain: this.factoryConfig.chain,
        type: Pool2Types.algebra,
        factory: normalizeAddress(this.factoryConfig.factory),
        address: normalizeAddress(event.args.pool),
        feeRate: Number(feeRate) / 1000000,
        token0,
        token1,
        birthblock: Number(log.blockNumber),
      };
    }

    return null;
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
    const logs = await this.getLogsFromEtherscan(options.fromBlock, options.toBlock, Object.values(AlgebraPoolEvents));
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
          abi: AlgebraPoolAbi,
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
