import { CowswapProtocolConfig } from '../../../configs/protocols/cowswap';
import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import GPv2SettlementAbi from '../../../configs/abi/cowswap/GPv2Settlement.json';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { TokenDexBase } from '../../../configs';
import logger from '../../../lib/logger';

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
        tokenSwap: 0,
      },
    };

    const cowswapConfig = this.protocolConfig as CowswapProtocolConfig;
    for (const settlementConfig of cowswapConfig.settlements) {
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
          let feesAmountUsd = 0;

          if (
            TokenDexBase[settlementConfig.chain] &&
            TokenDexBase[settlementConfig.chain].includes(normalizeAddress(event.args.sellToken))
          ) {
            const sellToken = await this.services.blockchain.evm.getTokenInfo({
              chain: settlementConfig.chain,
              address: event.args.sellToken,
            });
            if (sellToken) {
              const rawPrice = await this.services.oracle.getTokenPriceUsd({
                chain: sellToken.chain,
                address: sellToken.address,
                timestamp: options.timestamp,
              });
              if (rawPrice) {
                const sellTokenPriceUsd = rawPrice ? Number(rawPrice) : 0;
                amountUsd =
                  formatBigNumberToNumber(event.args.sellAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
                feesAmountUsd =
                  formatBigNumberToNumber(event.args.feeAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
              }
            }
          } else if (
            TokenDexBase[settlementConfig.chain] &&
            TokenDexBase[settlementConfig.chain].includes(normalizeAddress(event.args.buyToken))
          ) {
            const buyToken = await this.services.blockchain.evm.getTokenInfo({
              chain: settlementConfig.chain,
              address: event.args.buyToken,
            });
            if (buyToken) {
              const rawPrice = await this.services.oracle.getTokenPriceUsd({
                chain: buyToken.chain,
                address: buyToken.address,
                timestamp: options.timestamp,
              });
              if (rawPrice) {
                const buyTokenPriceUsd = rawPrice ? Number(rawPrice) : 0;
                amountUsd =
                  formatBigNumberToNumber(event.args.buyAmount.toString(), buyToken.decimals) * buyTokenPriceUsd;
              }
            }
          } else {
            let rawPrice = await this.services.oracle.getTokenPriceUsd({
              chain: settlementConfig.chain,
              address: event.args.sellToken,
              timestamp: options.timestamp,
            });
            if (rawPrice) {
              const sellToken = await this.services.blockchain.evm.getTokenInfo({
                chain: settlementConfig.chain,
                address: event.args.sellToken,
              });
              if (sellToken) {
                const sellTokenPriceUsd = rawPrice ? Number(rawPrice) : 0;
                amountUsd =
                  formatBigNumberToNumber(event.args.sellAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
                feesAmountUsd =
                  formatBigNumberToNumber(event.args.feeAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
              }
            } else {
              rawPrice = await this.services.oracle.getTokenPriceUsd({
                chain: settlementConfig.chain,
                address: event.args.buyToken,
                timestamp: options.timestamp,
              });
              if (rawPrice) {
                const buyToken = await this.services.blockchain.evm.getTokenInfo({
                  chain: settlementConfig.chain,
                  address: event.args.buyToken,
                });
                if (buyToken) {
                  const buyTokenPriceUsd = rawPrice ? Number(rawPrice) : 0;
                  amountUsd =
                    formatBigNumberToNumber(event.args.sellAmount.toString(), buyToken.decimals) * buyTokenPriceUsd;
                }
              }
            }
          }

          if (amountUsd === 0) {
            logger.warn('failed to calculate trade amount', {
              service: this.name,
              protocol: this.protocolConfig.protocol,
              chain: settlementConfig.chain,
              tx: log.transactionHash,
            });
          }

          protocolData.totalFees += feesAmountUsd;
          protocolData.protocolRevenue += feesAmountUsd;
          protocolData.totalVolume += amountUsd;
          (protocolData.volumes.tokenSwap as number) += amountUsd;
        }
      }
    }

    return protocolData;
  }
}
