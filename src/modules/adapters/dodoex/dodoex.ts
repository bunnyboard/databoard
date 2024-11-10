import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import RouterAbi from '../../../configs/abi/dodoex/DODORouteProxy.json';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import { DodoexProtocolConfig } from '../../../configs/protocols/dodoex';

const OrderHistoryEvent = '0x92ceb067a9883c85aba061e46b9edf505a0d6e81927c4b966ebed543a5221787';

export default class DodoexAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.dodoex 🦆';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        // dodoex is dex aggregator
        // we count token swaps on dodoex as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const dodoexConfig = this.protocolConfig as DodoexProtocolConfig;
    for (const routerConfig of dodoexConfig.routers) {
      if (routerConfig.birthday > options.timestamp) {
        continue;
      }

      // stop to getting data from endday config
      if (routerConfig.endday && routerConfig.endday < options.timestamp) {
        continue;
      }

      if (!(protocolData as any).breakdownChains[routerConfig.chain]) {
        (protocolData as any).breakdownChains[routerConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            trade: 0,
          },
        };
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        routerConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        routerConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: routerConfig.chain,
        address: routerConfig.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === OrderHistoryEvent) {
          const event: any = decodeEventLog({
            abi: RouterAbi,
            topics: log.topics,
            data: log.data,
          });

          let swapAmountUsd = 0;

          const sellToken = await this.services.blockchain.evm.getTokenInfo({
            chain: routerConfig.chain,
            address: event.args.fromToken,
          });
          const buyToken = await this.services.blockchain.evm.getTokenInfo({
            chain: routerConfig.chain,
            address: event.args.toToken,
          });

          if (sellToken && buyToken) {
            const sellAmount = formatBigNumberToNumber(event.args.fromAmount.toString(), sellToken.decimals);
            const buyAmount = formatBigNumberToNumber(event.args.returnAmount.toString(), buyToken.decimals);

            let sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: sellToken.chain,
              address: sellToken.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });
            let buyTokenPriceUsd = 0;

            if (sellTokenPriceUsd === 0) {
              buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: buyToken.chain,
                address: buyToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              sellTokenPriceUsd = sellAmount > 0 ? (buyAmount * buyTokenPriceUsd) / sellAmount : 0;
            }

            if (sellTokenPriceUsd === 0 && buyTokenPriceUsd === 0) {
              logger.warn('failed to get token prices for trade', {
                service: this.name,
                protocol: this.protocolConfig.protocol,
                chain: routerConfig.chain,
                token: `${sellToken.symbol}-${buyToken.symbol}`,
                logIndex: log.logIndex,
                txn: log.transactionHash,
              });
            } else {
              swapAmountUsd = sellAmount * sellTokenPriceUsd;

              // https://docs.dodoex.io/en/product/fees#route-fee
              const feeAmountUsd = swapAmountUsd * 0.001;

              protocolData.totalFees += feeAmountUsd;
              protocolData.protocolRevenue += feeAmountUsd;
              (protocolData.volumes.trade as number) += swapAmountUsd;

              (protocolData.breakdownChains as any)[routerConfig.chain].totalFees += feeAmountUsd;
              (protocolData.breakdownChains as any)[routerConfig.chain].protocolRevenue += feeAmountUsd;
              ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += swapAmountUsd;
            }
          }
        }
      }
    }

    return protocolData;
  }
}
