import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { BalancerDexConfig, BalancerProtocolConfig } from '../../../configs/protocols/balancer';
import { decodeEventLog } from 'viem';
import BalancerVaultAbi from '../../../configs/abi/balancer/Vault.json';
import WeightPoolAbi from '../../../configs/abi/balancer/WeightedPool.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import logger from '../../../lib/logger';

const Events = {
  FlashLoan: '0x0d7d75e01ab95780d3cd1c8ec0dd6c2ce19e3a20427eec8bf53283b6fb8e95f0',
  PoolBalanceChanged: '0xe5ce249087ce04f05a957192435400fd97868dba0e6a4b4c049abf8af80dae78',
  Swap: '0x2170c741c41531aec20e7c107c24eecfdd15e69c9bb0a8dd37b1840b9e0b207b',
};

export default class BalancerAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.balancer';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getPoolSwapFeePercentage(dexConfig: BalancerDexConfig, poolId: string): Promise<number> {
    const datakey = `balancer-pool-swapFee-${dexConfig.chain}-${normalizeAddress(dexConfig.vault)}-${poolId}`;
    const cachingData = await this.storages.localdb.read({
      database: 'adapter.balancer',
      key: datakey,
    });
    if (cachingData) {
      return cachingData;
    }

    let feePercentage = 0;

    const getPoolResult = await this.services.blockchain.evm.readContract({
      chain: dexConfig.chain,
      abi: BalancerVaultAbi,
      target: dexConfig.vault,
      method: 'getPool',
      params: [poolId],
    });
    if (getPoolResult && getPoolResult[0]) {
      const getSwapFeePercentage = await this.services.blockchain.evm.readContract({
        chain: dexConfig.chain,
        abi: WeightPoolAbi,
        target: getPoolResult[0],
        method: 'getSwapFeePercentage',
        params: [],
      });

      feePercentage = formatBigNumberToNumber(getSwapFeePercentage ? getSwapFeePercentage.toString() : '0', 18);
    }

    await this.storages.localdb.writeSingle({
      database: 'adapter.balancer',
      key: datakey,
      value: feePercentage,
    });

    return feePercentage;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        swap: 0,
        flashloan: 0,
      },
      breakdownChains: {},
    };

    const balancerConfig = this.protocolConfig as BalancerProtocolConfig;
    for (const dexConfig of balancerConfig.dexes) {
      if (dexConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData.breakdownChains as any)[dexConfig.chain]) {
        (protocolData.breakdownChains as any)[dexConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          totalSupplied: 0,
          volumes: {
            deposit: 0,
            withdraw: 0,
            swap: 0,
            flashloan: 0,
          },
        };
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        dexConfig.chain,
        options.endTime,
      );

      const tokens: Array<Token> = [];
      for (const address of dexConfig.tokens) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: dexConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: dexConfig.chain,
        ownerAddress: dexConfig.vault,
        tokens: tokens,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;
      (protocolData.totalValueLocked as number) += getBalanceResult.totalBalanceUsd;

      for (const tokenBalance of Object.values(getBalanceResult.tokenBalanceUsds)) {
        (protocolData.breakdownChains as any)[dexConfig.chain].totalAssetDeposited += tokenBalance.balanceUsd;
        (protocolData.breakdownChains as any)[dexConfig.chain].totalValueLocked += tokenBalance.balanceUsd;
        (protocolData.breakdownChains as any)[dexConfig.chain].totalSupplied += tokenBalance.balanceUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: dexConfig.chain,
        address: dexConfig.vault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (Object.values(Events).includes(log.topics[0])) {
          const event: any = decodeEventLog({
            abi: BalancerVaultAbi,
            topics: log.topics,
            data: log.data,
          });

          switch (log.topics[0]) {
            case Events.FlashLoan: {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: dexConfig.chain,
                address: event.args.token,
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                const volumeUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;
                const feeUsd = formatBigNumberToNumber(event.args.feeAmount.toString(), token.decimals) * tokenPriceUsd;

                protocolData.totalFees += feeUsd;
                protocolData.protocolRevenue += feeUsd;
                (protocolData.volumes.flashloan as number) += volumeUsd;

                (protocolData.breakdownChains as any)[dexConfig.chain].totalFees += feeUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].protocolRevenue += feeUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].volumes.flashloan += volumeUsd;
              }
              break;
            }
            case Events.Swap: {
              let volumeUsd = 0;
              let swapFeeUsd = 0;

              const tokenIn = tokens.filter((token) => compareAddress(token.address, event.args.tokenIn))[0];
              const tokenOut = tokens.filter((token) => compareAddress(token.address, event.args.tokenOut))[0];
              if (tokenIn) {
                const feePercentage = await this.getPoolSwapFeePercentage(dexConfig, event.args.poolId);
                const tokenInPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: tokenIn.chain,
                  address: tokenIn.address,
                  timestamp: options.timestamp,
                });
                volumeUsd = formatBigNumberToNumber(event.args.amountIn.toString(), tokenIn.decimals) * tokenInPriceUsd;
                swapFeeUsd = volumeUsd * feePercentage;
              } else if (tokenOut) {
                const feePercentage = await this.getPoolSwapFeePercentage(dexConfig, event.args.poolId);
                const tokenOutPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: tokenOut.chain,
                  address: tokenOut.address,
                  timestamp: options.timestamp,
                });
                // amountOut is deducted by fees
                const amountOut =
                  formatBigNumberToNumber(event.args.amountOut.toString(), tokenOut.decimals) * tokenOutPriceUsd;
                volumeUsd = amountOut / (1 - feePercentage);
                swapFeeUsd = volumeUsd * feePercentage;
              }

              if (tokenIn || tokenOut) {
                // 50%
                // https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
                const protocolRevenue = swapFeeUsd * 0.5;

                protocolData.totalFees += swapFeeUsd;
                protocolData.supplySideRevenue += swapFeeUsd - protocolRevenue;
                protocolData.protocolRevenue += protocolRevenue;
                (protocolData.volumes.swap as number) += volumeUsd;

                (protocolData.breakdownChains as any)[dexConfig.chain].totalFees += swapFeeUsd;
                (protocolData.breakdownChains as any)[dexConfig.chain].supplySideRevenue +=
                  swapFeeUsd - protocolRevenue;
                (protocolData.breakdownChains as any)[dexConfig.chain].protocolRevenue += protocolRevenue;
                (protocolData.breakdownChains as any)[dexConfig.chain].volumes.swap += volumeUsd;
              } else {
                logger.warn('failed to get token price for swap', {
                  service: this.name,
                  protocol: this.protocolConfig.protocol,
                  chain: dexConfig.chain,
                  txn: log.transactionHash,
                  logIndex: log.logIndex,
                });
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
