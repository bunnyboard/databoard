import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import AdapterDataHelper from '../helpers';
import { WoofiProtocolConfig } from '../../../configs/protocols/woofi';
import WooRouterV2Abi from '../../../configs/abi/woofi/WooRouterV2.json';

const WooRouterSwapEvent = '0x27c98e911efdd224f4002f6cd831c3ad0d2759ee176f9ee8466d95826af22a1c';

export default class WoofiAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.woofi';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        // woofi is dex aggregator
        // we count token swaps on woofi as trade volume
        // woofi dex aggregator charges 0 fees
        trade: 0,
      },
      breakdownChains: {},
    };

    const woofiConfig = this.protocolConfig as WoofiProtocolConfig;
    for (const routerConfig of woofiConfig.routers) {
      if (routerConfig.birthday > options.timestamp) {
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
        address: routerConfig.router,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === WooRouterSwapEvent) {
          const event: any = decodeEventLog({
            abi: WooRouterV2Abi,
            topics: log.topics,
            data: log.data,
          });

          const sellToken = await this.services.blockchain.evm.getTokenInfo({
            chain: routerConfig.chain,
            address: event.args.fromToken,
          });
          const buyToken = await this.services.blockchain.evm.getTokenInfo({
            chain: routerConfig.chain,
            address: event.args.toToken,
          });

          if (sellToken && buyToken) {
            let volumeUsd = 0;

            const sellAmount = formatBigNumberToNumber(event.args.fromAmount.toString(), sellToken.decimals);
            const buyAmount = formatBigNumberToNumber(event.args.toAmount.toString(), buyToken.decimals);

            let sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: sellToken.chain,
              address: sellToken.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });

            volumeUsd = sellAmount * sellTokenPriceUsd;

            if (volumeUsd === 0) {
              const buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: buyToken.chain,
                address: buyToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              volumeUsd = buyAmount * buyTokenPriceUsd;
            }

            if (volumeUsd === 0) {
              logger.warn('failed to get token prices for trade', {
                service: this.name,
                protocol: this.protocolConfig.protocol,
                chain: routerConfig.chain,
                token: `${sellToken.symbol}-${buyToken.symbol}`,
                logIndex: log.logIndex,
                txn: log.transactionHash,
              });
            }

            (protocolData.volumes.trade as number) += volumeUsd;
            ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += volumeUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
