import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import OdosRouterAbiV2 from '../../../configs/abi/odos/OdosRouterV2.json';
import OdosLimitOrderRouterAbi from '../../../configs/abi/odos/OdosLimitOrderRouter.json';
import { decodeEventLog } from 'viem';
import { OdosProtocolConfig } from '../../../configs/protocols/odos';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import AdapterDataHelper from '../helpers';

const EventSwap = '0x823eaf01002d7353fbcadb2ea3305cc46fa35d799cb0914846d185ac06f8ad05';
const EventSwapMulti = '0x7d7fb03518253ae01913536628b78d6d82e63e19b943aab5f4948356021259be';
const EventLimitOrderFilled = '0x81af66102905420f059278ff929ed6b30795eb7e25505c3418616dd28e1b4da6';

export default class OdosAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.odos';

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
        // odos is dex aggregator
        // we count token swaps on odos as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const odosConfig = this.protocolConfig as OdosProtocolConfig;
    for (const routerConfig of odosConfig.routers) {
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
        if (log.topics[0] === EventSwap || log.topics[0] === EventSwapMulti) {
          const event: any = decodeEventLog({
            abi: OdosRouterAbiV2,
            topics: log.topics,
            data: log.data,
          });

          if (log.topics[0] === EventSwap) {
            const sellToken = await this.services.blockchain.evm.getTokenInfo({
              chain: routerConfig.chain,
              address: event.args.inputToken,
            });
            const buyToken = await this.services.blockchain.evm.getTokenInfo({
              chain: routerConfig.chain,
              address: event.args.outputToken,
            });

            if (sellToken && buyToken) {
              const sellAmount = formatBigNumberToNumber(event.args.inputAmount.toString(), sellToken.decimals);
              const buyAmount = formatBigNumberToNumber(event.args.amountOut.toString(), buyToken.decimals);
              const slippage = formatBigNumberToNumber(event.args.slippage.toString(), buyToken.decimals);

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
                const amountUsd = sellAmount * sellTokenPriceUsd;
                const feesUsd = slippage > 0 ? slippage * buyTokenPriceUsd : 0;

                protocolData.totalFees += feesUsd;
                protocolData.protocolRevenue += feesUsd;
                (protocolData.volumes.trade as number) += amountUsd;

                (protocolData.breakdownChains as any)[routerConfig.chain].totalFees += feesUsd;
                ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += amountUsd;
              }
            }
          } else {
            let afterFeeAmounttUsd = 0;
            for (let i = 0; i < event.args.tokensOut.length; i++) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: routerConfig.chain,
                address: event.args.tokensOut[i],
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });

                afterFeeAmounttUsd +=
                  formatBigNumberToNumber(
                    event.args.amountsOut[i] ? event.args.amountsOut[i].toString() : '0',
                    token.decimals,
                  ) * tokenPriceUsd;
              }
            }
            const volumeUsd = afterFeeAmounttUsd / 0.9999; // 0.01% swap amount
            const feeUsd = volumeUsd - afterFeeAmounttUsd;

            protocolData.totalFees += feeUsd;
            protocolData.protocolRevenue += feeUsd;
            (protocolData.volumes.trade as number) += volumeUsd;

            (protocolData.breakdownChains as any)[routerConfig.chain].totalFees += feeUsd;
            (protocolData.breakdownChains as any)[routerConfig.chain].protocolRevenue += feeUsd;
            ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += volumeUsd;
          }
        }
      }

      if (routerConfig.limitOrderRouter) {
        const limitOrderLogs = await this.services.blockchain.evm.getContractLogs({
          chain: routerConfig.chain,
          address: routerConfig.limitOrderRouter,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of limitOrderLogs) {
          if (log.topics[0] === EventLimitOrderFilled) {
            const event: any = decodeEventLog({
              abi: OdosLimitOrderRouterAbi,
              topics: log.topics,
              data: log.data,
            });

            const sellToken = await this.services.blockchain.evm.getTokenInfo({
              chain: routerConfig.chain,
              address: event.args.inputToken,
            });
            const buyToken = await this.services.blockchain.evm.getTokenInfo({
              chain: routerConfig.chain,
              address: event.args.outputToken,
            });
            if (sellToken && buyToken) {
              const sellAmount = formatBigNumberToNumber(event.args.filledInputAmount.toString(), sellToken.decimals);
              const buyAmount = formatBigNumberToNumber(event.args.filledOutputAmount.toString(), buyToken.decimals);

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
                const amountUsd = sellAmount * sellTokenPriceUsd;

                (protocolData.volumes.trade as number) += amountUsd;
                ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += amountUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
