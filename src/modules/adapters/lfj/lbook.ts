import { UniswapFactoryConfig } from '../../../configs/protocols/uniswap';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { Pool2, Pool2Types } from '../../../types/domains/pool2';
import { Address, decodeEventLog, fromHex } from 'viem';
import { AddressMulticall3, EventSignatures } from '../../../configs/constants';
import LBFactoryAbi from '../../../configs/abi/lfj/LBFactory.json';
import LBPairAbi from '../../../configs/abi/lfj/LBPair.json';
import envConfig from '../../../configs/envConfig';
import { ContractCall } from '../../../services/blockchains/domains';
import UniswapV2Core from '../uniswap/univ2';
import { GetDexDataOptions, GetDexDataResult } from '../uniswap/core';

const LiquidityBookEvents = {
  Swap: '0xad7d6f97abf51ce18e17a38f4d70e975be9c0708474987bb3e26ad21bd93ca70',
  // DepositedToBins: '0x87f1f9dcf5e8089a3e00811b6a008d8f30293a3da878cb1fe8c90ca376402f8a',
  // WithdrawnFromBins: '0xa32e146844d6144a22e94c586715a1317d58a8aa3581ec33d040113ddcb24350',
};

export default class LfjLiquidityBookCore extends UniswapV2Core {
  public readonly name: string = 'adapter.lfj';

  constructor(services: ContextServices, storages: ContextStorages, factoryConfig: UniswapFactoryConfig) {
    super(services, storages, factoryConfig);

    // override PoolCreated event
    this.poolCreatedEventSignature = EventSignatures.LiquidityBookFactory_PoolCreated;
  }

  public async parsePoolCreatedEvent(log: any): Promise<Pool2 | null> {
    const event: any = decodeEventLog({
      abi: LBFactoryAbi,
      topics: log.topics,
      data: log.data,
    });

    const [token0, token1, getStaticFeeParameters] = await Promise.all([
      this.services.blockchain.evm.getTokenInfo({
        chain: this.factoryConfig.chain,
        address: event.args.tokenX,
      }),
      this.services.blockchain.evm.getTokenInfo({
        chain: this.factoryConfig.chain,
        address: event.args.tokenY,
      }),
      this.services.blockchain.evm.readContract({
        chain: this.factoryConfig.chain,
        abi: LBPairAbi,
        target: event.args.LBPair,
        method: 'getStaticFeeParameters',
        params: [],
      }),
    ]);

    if (token0 && token1) {
      // dynamic fees - will fetch on-chain on swap
      // https://docs.lfj.gg/concepts/fees
      // https://snowscan.xyz/address/0x3e30fdAe04C08Fc20fA2Fe0CF55C95d99a9C2d8f#code#F15#L225
      const feeRate = Number(getStaticFeeParameters[0] / 1e8);

      return {
        chain: this.factoryConfig.chain,
        type: Pool2Types.lbook,
        factory: normalizeAddress(this.factoryConfig.factory),
        address: normalizeAddress(event.args.LBPair),
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
    const logs = await this.getLogsFromEtherscan(
      options.fromBlock,
      options.toBlock,
      Object.values(LiquidityBookEvents),
    );
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
          abi: LBPairAbi,
          topics: log.topics as any,
          data: log.data as any,
        });

        switch (event.eventName) {
          case 'Swap': {
            console.log(event)
            const amount0In = formatBigNumberToNumber(
              fromHex(event.args.amountsIn.slice(0, 32), 'bigint').toString(),
              pool2.token0.decimals,
            );
            const amount1In = formatBigNumberToNumber(
              fromHex(event.args.amountsIn.slice(-32), 'bigint').toString(),
              pool2.token1.decimals,
            );
            const amount0Out = formatBigNumberToNumber(
              fromHex(event.args.amountsOut.slice(0, 32), 'bigint').toString(),
              pool2.token0.decimals,
            );
            const amount1Out = formatBigNumberToNumber(
              fromHex(event.args.amountsOut.slice(-32), 'bigint').toString(),
              pool2.token1.decimals,
            );
            const totalFees0 = formatBigNumberToNumber(
              fromHex(event.args.totalFees.slice(0, 32), 'bigint').toString(),
              pool2.token0.decimals,
            );
            const totalFees1 = formatBigNumberToNumber(
              fromHex(event.args.totalFees.slice(-32), 'bigint').toString(),
              pool2.token1.decimals,
            );
            const protocolFees0 = formatBigNumberToNumber(
              fromHex(event.args.protocolFees.slice(0, 32), 'bigint').toString(),
              pool2.token0.decimals,
            );
            const protocolFees1 = formatBigNumberToNumber(
              fromHex(event.args.protocolFees.slice(-32), 'bigint').toString(),
              pool2.token1.decimals,
            );

            let swapVolumeUsd = 0;
            let swapFeesUsd = 0;
            let protocolFeesUsd = 0;
            if (amount0In > 0) {
              // swap amount0 -> amount1
              const totalAmountIn = amount0In + totalFees0 + protocolFees0;

              let token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token0.chain,
                address: pool2.token0.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token0PriceUsd === 0) {
                const token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.token1.chain,
                  address: pool2.token1.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                token0PriceUsd = (totalAmountIn * token1PriceUsd) / amount1Out;
              }

              swapFeesUsd = totalFees0 * token0PriceUsd;
              protocolFeesUsd = protocolFees0 * token0PriceUsd;
              swapVolumeUsd = totalAmountIn * token0PriceUsd;
            } else {
              // swap amount1 -> amount0
              const totalAmountIn = amount1In + totalFees1 + protocolFees1;

              let token1PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: pool2.token1.chain,
                address: pool2.token1.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (token1PriceUsd === 0) {
                const token0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: pool2.token0.chain,
                  address: pool2.token0.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                token1PriceUsd = (totalAmountIn * token0PriceUsd) / amount0Out;
              }

              swapFeesUsd = totalFees1 * token1PriceUsd;
              protocolFeesUsd = protocolFees1 * token1PriceUsd;
              swapVolumeUsd = totalAmountIn * token1PriceUsd;
            }

            console.log(log.transactionHash, swapVolumeUsd, protocolFeesUsd, swapFeesUsd)

            result.swapVolumeUsd += swapVolumeUsd;
            result.protocolRevenueUsd += protocolFeesUsd;
            result.supplySideRevenueUsd += swapFeesUsd;

            break;
          }
        }
      }
    }

    return result;
  }
}
