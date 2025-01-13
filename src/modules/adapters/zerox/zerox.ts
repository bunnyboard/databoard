import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import ExchangeAbi from '../../../configs/abi/zerox/0xExchange.json';
import { ZeroxProtocolConfig } from '../../../configs/protocols/zerox';
import AdapterDataHelper from '../helpers';

const Events = {
  TransformedERC20: '0x0f6672f78a59ba8e5e5b5d38df3ebc67f3c792e2c9259b8d97d7f00dd78ba1b3',
  RfqOrderFilled: '0x829fa99d94dc4636925b38632e625736a614c154d55006b7ab6bea979c210c32',
  OtcOrderFilled: '0xac75f773e3a92f1a02b12134d65e1f47f8a14eabe4eaf1e24624918e6a8b269f',
};

export default class ZeroxAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.zerox';

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
        // zerox is dex aggregator
        // we count token swaps on zerox as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const zeroxConfig = this.protocolConfig as ZeroxProtocolConfig;
    for (const exchangeConfig of zeroxConfig.exchanges) {
      if (exchangeConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData as any).breakdownChains[exchangeConfig.chain]) {
        (protocolData as any).breakdownChains[exchangeConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            trade: 0,
          },
        };
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        exchangeConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        exchangeConfig.chain,
        options.endTime,
      );
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: exchangeConfig.chain,
        address: exchangeConfig.exchangeProxy,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        const signature = log.topics[0];

        if (Object.values(Events).includes(signature)) {
          const event: any = decodeEventLog({
            abi: ExchangeAbi,
            topics: log.topics,
            data: log.data,
          });

          let tradeAmountUsd = 0;
          let feeAmountUsd = 0;

          switch (signature) {
            case Events.TransformedERC20: {
              const sellToken = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.inputToken,
              });
              const buyToken = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.outputToken,
              });

              if (sellToken && buyToken) {
                const sellAmount = formatBigNumberToNumber(event.args.inputTokenAmount.toString(), sellToken.decimals);
                const buyAmount = formatBigNumberToNumber(event.args.outputTokenAmount.toString(), buyToken.decimals);

                let sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: sellToken.chain,
                  address: sellToken.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });

                if (sellTokenPriceUsd === 0) {
                  const buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: buyToken.chain,
                    address: buyToken.address,
                    timestamp: options.timestamp,
                    disableWarning: true,
                  });
                  tradeAmountUsd = buyAmount * buyTokenPriceUsd;

                  if (buyTokenPriceUsd <= 0) {
                    logger.warn('failed to get token prices for trade', {
                      service: this.name,
                      protocol: this.protocolConfig.protocol,
                      chain: exchangeConfig.chain,
                      token: `${sellToken.symbol}-${buyToken.symbol}`,
                      logIndex: log.logIndex,
                      txn: log.transactionHash,
                    });
                  }
                } else {
                  tradeAmountUsd = sellAmount * sellTokenPriceUsd;
                }
              }

              // charge 0.15% volume per swap
              feeAmountUsd = tradeAmountUsd * 0.0015;

              break;
            }
            case Events.RfqOrderFilled:
            case Events.OtcOrderFilled: {
              const sellToken = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.takerToken,
              });
              const buyToken = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.makerToken,
              });

              if (sellToken && buyToken) {
                const sellAmount = formatBigNumberToNumber(
                  event.args.takerTokenFilledAmount.toString(),
                  sellToken.decimals,
                );
                const buyAmount = formatBigNumberToNumber(
                  event.args.makerTokenFilledAmount.toString(),
                  buyToken.decimals,
                );

                let sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: sellToken.chain,
                  address: sellToken.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });

                if (sellTokenPriceUsd === 0) {
                  const buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: buyToken.chain,
                    address: buyToken.address,
                    timestamp: options.timestamp,
                    disableWarning: true,
                  });
                  tradeAmountUsd = buyAmount * buyTokenPriceUsd;

                  if (buyTokenPriceUsd <= 0) {
                    logger.warn('failed to get token prices for trade', {
                      service: this.name,
                      protocol: this.protocolConfig.protocol,
                      chain: exchangeConfig.chain,
                      token: `${sellToken.symbol}-${buyToken.symbol}`,
                      logIndex: log.logIndex,
                      txn: log.transactionHash,
                    });
                  }
                } else {
                  tradeAmountUsd = sellAmount * sellTokenPriceUsd;
                }
              }

              if (signature === Events.RfqOrderFilled) {
                // charge 0.15% volume per swap
                feeAmountUsd = tradeAmountUsd * 0.0015;
              }

              break;
            }
          }

          protocolData.totalFees += feeAmountUsd;
          protocolData.protocolRevenue += feeAmountUsd;
          (protocolData.volumes.trade as number) += tradeAmountUsd;
          ((protocolData.breakdownChains as any)[exchangeConfig.chain].volumes.trade as number) += tradeAmountUsd;
          (protocolData.breakdownChains as any)[exchangeConfig.chain].totalFees += feeAmountUsd;
          (protocolData.breakdownChains as any)[exchangeConfig.chain].protocolRevenue += feeAmountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
