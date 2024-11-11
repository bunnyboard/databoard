import { CowswapProtocolConfig } from '../../../configs/protocols/cowswap';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import GPv2SettlementAbi from '../../../configs/abi/cowswap/GPv2Settlement.json';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import AdapterDataHelper from '../helpers';

const TradeEvent = '0xa07a543ab8a018198e99ca0184c93fe9050a79400a0a723441f84de1d972cc17';

export default class CowswapAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.cowswap 🐮';

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
        // cowswap is dex aggregator
        // we count token swaps on cowswap as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const cowswapConfig = this.protocolConfig as CowswapProtocolConfig;
    for (const settlementConfig of cowswapConfig.settlements) {
      if (settlementConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData as any).breakdownChains[settlementConfig.chain]) {
        (protocolData as any).breakdownChains[settlementConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            trade: 0,
          },
        };
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        settlementConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        settlementConfig.chain,
        options.endTime,
      );
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: settlementConfig.chain,
        address: settlementConfig.settlement,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === TradeEvent) {
          const event: any = decodeEventLog({
            abi: GPv2SettlementAbi,
            topics: log.topics,
            data: log.data,
          });

          let amountUsd = 0;
          let feesUsd = 0;

          const sellToken = await this.services.blockchain.evm.getTokenInfo({
            chain: settlementConfig.chain,
            address: event.args.sellToken,
          });
          const buyToken = await this.services.blockchain.evm.getTokenInfo({
            chain: settlementConfig.chain,
            address: event.args.buyToken,
          });

          if (sellToken && buyToken) {
            const sellAmount = formatBigNumberToNumber(event.args.sellAmount.toString(), sellToken.decimals);
            const buyAmount = formatBigNumberToNumber(event.args.buyAmount.toString(), buyToken.decimals);

            let sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: sellToken.chain,
              address: sellToken.address,
              timestamp: options.timestamp,
              disableWarning: true,
              enableAutoSearching: true,
            });
            let buyTokenPriceUsd = 0;

            if (sellTokenPriceUsd === 0) {
              buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: buyToken.chain,
                address: buyToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
                enableAutoSearching: true,
              });
              sellTokenPriceUsd = sellAmount > 0 ? (buyAmount * buyTokenPriceUsd) / sellAmount : 0;
            }

            if (sellTokenPriceUsd === 0 && buyTokenPriceUsd === 0) {
              logger.warn('failed to get token prices for trade', {
                service: this.name,
                protocol: this.protocolConfig.protocol,
                chain: settlementConfig.chain,
                token: `${sellToken.symbol}-${buyToken.symbol}`,
                logIndex: log.logIndex,
                txn: log.transactionHash,
              });
            } else {
              amountUsd =
                formatBigNumberToNumber(event.args.sellAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
              feesUsd =
                formatBigNumberToNumber(event.args.feeAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;

              protocolData.totalFees += feesUsd;
              protocolData.protocolRevenue += feesUsd;
              (protocolData.volumes.trade as number) += amountUsd;

              (protocolData.breakdownChains as any)[settlementConfig.chain].totalFees += feesUsd;
              ((protocolData.breakdownChains as any)[settlementConfig.chain].volumes.trade as number) += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
