import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import { ZerionProtocolConfig } from '../../../configs/protocols/zerion';
import RouterAbi from '../../../configs/abi/zerion/Router.json';

const ExecutedEvent = '0x5b99554095b82fa9d0725a9ff1f1db8bc3e4d461e7d61911c752c349a47b987f';

export default class ZerionAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.zerion';

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
        // we count token swaps on zerion as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const zerionConfig = this.protocolConfig as ZerionProtocolConfig;
    for (const routerConfig of zerionConfig.routers) {
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

      for (const log of logs.filter((log) => log.topics[0] === ExecutedEvent)) {
        const event: any = decodeEventLog({
          abi: RouterAbi,
          topics: log.topics,
          data: log.data,
        });

        const fromToken = await this.services.blockchain.evm.getTokenInfo({
          chain: routerConfig.chain,
          address: event.args.inputToken,
        });
        const toToken = await this.services.blockchain.evm.getTokenInfo({
          chain: routerConfig.chain,
          address: event.args.outputToken,
        });

        if (fromToken && toToken) {
          const fromAmount = formatBigNumberToNumber(event.args.absoluteInputAmount.toString(), fromToken.decimals);
          const toAmount = formatBigNumberToNumber(event.args.returnedAmount.toString(), toToken.decimals);

          // fee charged on to token
          const feeAmount =
            formatBigNumberToNumber(event.args.protocolFeeAmount.toString(), toToken.decimals) +
            formatBigNumberToNumber(event.args.marketplaceFeeAmount.toString(), toToken.decimals);

          let toTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: toToken.chain,
            address: toToken.address,
            timestamp: options.timestamp,
            disableWarning: true,
          });

          if (toTokenPriceUsd === 0) {
            const fromTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: fromToken.chain,
              address: fromToken.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });

            if (fromTokenPriceUsd > 0) {
              // cal price of to token by from token price
              toTokenPriceUsd = toAmount > 0 ? (fromTokenPriceUsd * fromAmount) / (toAmount + feeAmount) : 0;
            } else {
              logger.warn('failed to get token prices for trade', {
                service: this.name,
                protocol: this.protocolConfig.protocol,
                chain: routerConfig.chain,
                token: `${fromToken.symbol}-${toToken.symbol}`,
                logIndex: log.logIndex,
                txn: log.transactionHash,
              });
            }
          }

          const volumeUsd = (toAmount + feeAmount) * toTokenPriceUsd;

          protocolData.totalFees += feeAmount * toTokenPriceUsd;
          protocolData.protocolRevenue += feeAmount * toTokenPriceUsd;
          (protocolData.volumes.trade as number) += volumeUsd;
          (protocolData.breakdownChains as any)[routerConfig.chain].totalFees += feeAmount * toTokenPriceUsd;
          (protocolData.breakdownChains as any)[routerConfig.chain].protocolRevenue += feeAmount * toTokenPriceUsd;
          ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += volumeUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
