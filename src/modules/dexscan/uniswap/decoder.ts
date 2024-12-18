import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { DexscanModuleConfig } from '../../../configs/dexscan';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { Pool2 } from '../../../types/domains/pool2';
import envConfig from '../../../configs/envConfig';
import UniswapV2PairAbi from '../../../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3PoolAbi from '../../../configs/abi/uniswap/UniswapV3Pool.json';
import PancakeV3PoolAbi from '../../../configs/abi/pancake/PancakeV3Pool.json';
import { decodeEventLog } from 'viem';

interface DecodeEventOptions {
  chain: string;
  log: any;

  // timestamp where we get token price
  timestamp: number;
}

interface DecodeEventResult {
  protocol: string;
  factoryAddress: string;
  swapVolume: number;
  swapFeesForLp: number;
  swapFeesForProtocol: number;
  addLiquidityVolume: number;
  removeLiquidityVolume: number;
}

// help to decode uniswap v2, v3 event logs
export default class UniswapEventDecoder {
  public readonly name: string = 'dexscan.uniswap 🦄';

  public readonly services: ContextServices;
  public readonly storages: ContextStorages;
  public readonly dexscanConfig: DexscanModuleConfig;

  constructor(services: ContextServices, storages: ContextStorages, dexscanConfig: DexscanModuleConfig) {
    this.services = services;
    this.storages = storages;
    this.dexscanConfig = dexscanConfig;
  }

  public async decodeAndCountFromLog(options: DecodeEventOptions): Promise<DecodeEventResult | null> {
    const poolAddress = normalizeAddress(options.log.address);
    const signature = options.log.topics[0];

    if (
      Object.values(this.dexscanConfig.events.univ2)
        .concat(Object.values(this.dexscanConfig.events.univ3))
        .concat(Object.values(this.dexscanConfig.events.pancakev3))
        .includes(signature)
    ) {
      // get pool2 data from database
      const pool2: Pool2 | null | undefined = await this.storages.database.find({
        collection: envConfig.mongodb.collections.datasyncPool2.name,
        query: {
          chain: options.chain,
          address: poolAddress,
        },
      });
      if (!pool2) {
        return null;
      }

      // we find the correct protocol and factory config
      const factoryConfig = this.dexscanConfig.factories.filter((factory) =>
        compareAddress(factory.factory, pool2.factory),
      )[0];
      if (!factoryConfig) {
        return null;
      }

      const result: DecodeEventResult = {
        protocol: factoryConfig.protocol,
        factoryAddress: normalizeAddress(pool2.factory),
        swapVolume: 0,
        swapFeesForLp: 0,
        swapFeesForProtocol: 0,
        addLiquidityVolume: 0,
        removeLiquidityVolume: 0,
      };

      if (Object.values(this.dexscanConfig.events.univ2).includes(signature)) {
        const event: any = decodeEventLog({
          abi: UniswapV2PairAbi,
          topics: options.log.topics,
          data: options.log.data,
        });

        switch (signature) {
          case this.dexscanConfig.events.univ2.Swap: {
            // token0
            const amount0In = formatBigNumberToNumber(event.args.amount0In.toString(), pool2.token0.decimals);
            const amount0Out = formatBigNumberToNumber(event.args.amount0Out.toString(), pool2.token0.decimals);
            // token1
            const amount1In = formatBigNumberToNumber(event.args.amount1In.toString(), pool2.token1.decimals);
            const amount1Out = formatBigNumberToNumber(event.args.amount1Out.toString(), pool2.token1.decimals);

            let volumeUsd = 0;

            // get base token address if any
            const baseTokenAddress = this.dexscanConfig.baseTokens[factoryConfig.chain].filter(
              (item) => compareAddress(item, pool2.token0.address) || compareAddress(item, pool2.token1.address),
            )[0];

            if (baseTokenAddress) {
              if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token0.address,
                  timestamp: options.timestamp,
                });

                if (amount0In > 0) {
                  volumeUsd = amount0In * token0PriceUsd;
                } else if (amount0Out > 0) {
                  // amountOut have already deducted fees
                  volumeUsd = (amount0Out * token0PriceUsd) / (1 - pool2.feeRate);
                }
              } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token1.address,
                  timestamp: options.timestamp,
                });

                if (amount1In > 0) {
                  volumeUsd = amount1In * token1PriceUsd;
                } else if (amount1Out > 0) {
                  // amountOut have already deducted fees
                  volumeUsd = (amount1Out * token1PriceUsd) / (1 - pool2.feeRate);
                }
              }

              // cal fees
              const feeRateLp = factoryConfig.feeRateForLiquidityProviders
                ? factoryConfig.feeRateForLiquidityProviders
                : pool2.feeRate
                  ? pool2.feeRate
                  : 0.003; // default 0.3%
              const feeRateProtocol = factoryConfig.feeRateForProtocol ? factoryConfig.feeRateForProtocol : 0;

              result.swapVolume = volumeUsd;
              result.swapFeesForLp = volumeUsd * feeRateLp;
              result.swapFeesForProtocol = volumeUsd * feeRateProtocol;
            }

            break;
          }
          case this.dexscanConfig.events.univ2.Mint:
          case this.dexscanConfig.events.univ2.Burn: {
            const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
            const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

            let volumeUsd = 0;

            // get base token address if any
            const baseTokenAddress = this.dexscanConfig.baseTokens[factoryConfig.chain].filter(
              (item) => compareAddress(item, pool2.token0.address) || compareAddress(item, pool2.token1.address),
            )[0];

            if (baseTokenAddress) {
              if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token0.address,
                  timestamp: options.timestamp,
                });
                volumeUsd = amount0 * token0PriceUsd * 2;
              } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token1.address,
                  timestamp: options.timestamp,
                });
                volumeUsd = amount1 * token1PriceUsd * 2;
              }

              if (signature === this.dexscanConfig.events.univ2.Mint) {
                result.addLiquidityVolume = volumeUsd;
              } else {
                result.removeLiquidityVolume = volumeUsd;
              }
            }

            break;
          }
        }
      } else if (
        Object.values(this.dexscanConfig.events.univ3)
          .concat(Object.values(this.dexscanConfig.events.pancakev3))
          .includes(signature)
      ) {
        const event: any = decodeEventLog({
          abi: signature === this.dexscanConfig.events.pancakev3.Swap ? PancakeV3PoolAbi : UniswapV3PoolAbi,
          topics: options.log.topics,
          data: options.log.data,
        });

        // get base token address if any
        const baseTokenAddress = this.dexscanConfig.baseTokens[factoryConfig.chain].filter(
          (item) => compareAddress(item, pool2.token0.address) || compareAddress(item, pool2.token1.address),
        )[0];

        if (baseTokenAddress) {
          switch (signature) {
            case this.dexscanConfig.events.univ3.Swap: {
              const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
              const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

              let volumeUsd = 0;

              if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token0.address,
                  timestamp: options.timestamp,
                });

                if (amount0 > 0) {
                  // swap token0 for token1
                  volumeUsd = amount0 * token0PriceUsd;
                } else if (amount0 < 0) {
                  // swap token1 for token0
                  volumeUsd = (Math.abs(amount0) * token0PriceUsd) / (1 - pool2.feeRate);
                }
              } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token1.address,
                  timestamp: options.timestamp,
                });

                if (amount1 > 0) {
                  // swap token1 for token0
                  volumeUsd = amount1 * token1PriceUsd;
                } else if (amount1 < 0) {
                  // swap token0 for token1
                  volumeUsd = (Math.abs(amount1) * token1PriceUsd) / (1 - pool2.feeRate);
                }
              }

              const totalSwapFees = volumeUsd * pool2.feeRate;
              const feeRateProtocol = factoryConfig.feeRateForProtocol ? factoryConfig.feeRateForProtocol : 0;
              const feeRateForLps = 1 - feeRateProtocol;

              result.swapVolume += volumeUsd;
              result.swapFeesForLp += totalSwapFees * feeRateForLps;
              result.swapFeesForProtocol += totalSwapFees * feeRateProtocol;

              break;
            }
            case this.dexscanConfig.events.univ3.Mint:
            case this.dexscanConfig.events.univ3.Burn: {
              const amount0 = formatBigNumberToNumber(event.args.amount0.toString(), pool2.token0.decimals);
              const amount1 = formatBigNumberToNumber(event.args.amount1.toString(), pool2.token1.decimals);

              let volumeUsd = 0;
              if (compareAddress(baseTokenAddress, pool2.token0.address)) {
                const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token0.address,
                  timestamp: options.timestamp,
                });
                volumeUsd = amount0 * token0PriceUsd;
              } else if (compareAddress(baseTokenAddress, pool2.token1.address)) {
                const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.chain,
                  address: pool2.token1.address,
                  timestamp: options.timestamp,
                });
                volumeUsd = amount1 * token1PriceUsd;
              }

              if (signature === this.dexscanConfig.events.univ3.Mint) {
                result.addLiquidityVolume += volumeUsd;
              } else {
                result.removeLiquidityVolume += volumeUsd;
              }

              break;
            }
          }
        }
      }
    }

    return null;
  }
}
