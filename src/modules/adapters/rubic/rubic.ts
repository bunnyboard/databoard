import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { RubicProtocolConfig } from '../../../configs/protocols/rubic';
import RubicExchangeAbi from '../../../configs/abi/rubic/RubicExchange.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import { getChainNameById } from '../../../lib/helpers';

export const RubicEvents = {
  TokenFee: '0x25471ec9f39b4ceb20d58f63c37f9c738011f0babcc4b6af69bdd82984ca5f8e',
  RubicSwappedGeneric: '0xb6422835e7046b0692f1b80a12361c9fc693dbaf86a063f876a82ef68755670b',
  RubicTransferStarted: '0xf834e948c18ff30cc76e65c4bb09ce6f070fcea13e3cb45413d9a66686584b94',
};

export default class RubicAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.rubic';

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
        bridge: 0,
        trade: 0,
      },
      volumeBridgePaths: {},
    };

    const rubicConfig = this.protocolConfig as RubicProtocolConfig;
    for (const exchangeConfig of rubicConfig.exchanges) {
      if (exchangeConfig.birthday > options.timestamp) {
        // diamond was not deployed yet
        continue;
      }

      if (!protocolData.breakdown[exchangeConfig.chain]) {
        protocolData.breakdown[exchangeConfig.chain] = {};
      }
      if (!(protocolData.volumeBridgePaths as any)[exchangeConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[exchangeConfig.chain] = {};
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
        address: exchangeConfig.exchange,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        const signature = log.topics[0];

        if (Object.values(RubicEvents).includes(signature)) {
          const event: any = decodeEventLog({
            abi: RubicExchangeAbi,
            topics: log.topics,
            data: log.data,
          });

          switch (signature) {
            case RubicEvents.RubicSwappedGeneric: {
              const fromToken = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.fromAssetId,
              });
              const toToken = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.toAssetId,
              });
              if (fromToken && toToken) {
                let swapAmountUsd = 0;

                const fromTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: fromToken.chain,
                  address: fromToken.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                if (fromTokenPriceUsd > 0) {
                  swapAmountUsd =
                    formatBigNumberToNumber(event.args.fromAmount.toString(), fromToken.decimals) * fromTokenPriceUsd;
                } else {
                  const toTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: toToken.chain,
                    address: toToken.address,
                    timestamp: options.timestamp,
                    disableWarning: true,
                  });
                  swapAmountUsd =
                    formatBigNumberToNumber(event.args.toAmount.toString(), toToken.decimals) * toTokenPriceUsd;

                  if (toTokenPriceUsd === 0) {
                    logger.warn('failed to get token prices for trade', {
                      service: this.name,
                      protocol: this.protocolConfig.protocol,
                      chain: exchangeConfig.chain,
                      token: `${fromToken.symbol}-${toToken.symbol}`,
                      txn: log.transactionHash,
                      logIndex: log.logIndex,
                    });
                  }
                }

                if (swapAmountUsd) {
                  (protocolData.volumes.trade as number) += swapAmountUsd;

                  if (!protocolData.breakdown[fromToken.chain][fromToken.address]) {
                    protocolData.breakdown[fromToken.chain][fromToken.address] = {
                      ...getInitialProtocolCoreMetrics(),
                      volumes: {
                        bridge: 0,
                        trade: 0,
                      },
                    };
                  }
                  (protocolData.breakdown[fromToken.chain][fromToken.address].volumes.trade as number) += swapAmountUsd;
                  if (!protocolData.breakdown[toToken.chain][toToken.address]) {
                    protocolData.breakdown[toToken.chain][toToken.address] = {
                      ...getInitialProtocolCoreMetrics(),
                      volumes: {
                        bridge: 0,
                        trade: 0,
                      },
                    };
                  }
                  (protocolData.breakdown[toToken.chain][toToken.address].volumes.trade as number) += swapAmountUsd;
                }
              }

              break;
            }
            case RubicEvents.RubicTransferStarted: {
              const bridgeData = event.args.bridgeData;

              const destChainName = getChainNameById(Number(bridgeData.destinationChainId));
              if (destChainName) {
                const token = await this.services.blockchain.evm.getTokenInfo({
                  chain: exchangeConfig.chain,
                  address: bridgeData.sendingAssetId,
                });
                if (token) {
                  const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                    chain: token.chain,
                    address: token.address,
                    timestamp: options.timestamp,
                  });
                  const amountUsd =
                    formatBigNumberToNumber(bridgeData.minAmount.toString(), token.decimals) * tokenPriceUsd;

                  (protocolData.volumes.bridge as number) += amountUsd;

                  if (!protocolData.breakdown[token.chain][token.address]) {
                    protocolData.breakdown[token.chain][token.address] = {
                      ...getInitialProtocolCoreMetrics(),
                      volumes: {
                        bridge: 0,
                        trade: 0,
                      },
                    };
                  }
                  (protocolData.breakdown[token.chain][token.address].volumes.trade as number) += amountUsd;

                  if (!(protocolData.volumeBridgePaths as any)[exchangeConfig.chain][destChainName]) {
                    (protocolData.volumeBridgePaths as any)[exchangeConfig.chain][destChainName] = 0;
                  }
                  (protocolData.volumeBridgePaths as any)[exchangeConfig.chain][destChainName] += amountUsd;
                }
              } else {
                logger.warn('failed to get chain name from bridge txn', {
                  service: this.name,
                  protocol: this.protocolConfig.protocol,
                  chain: exchangeConfig.chain,
                  txn: log.transactionHash,
                  logIndex: log.logIndex,
                  destinationChainId: Number(bridgeData.destinationChainId),
                });
              }

              break;
            }
            case RubicEvents.TokenFee: {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: exchangeConfig.chain,
                address: event.args.token,
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });

                const RubicPart = formatBigNumberToNumber(event.args.RubicPart.toString(), token.decimals);
                const integratorPart = formatBigNumberToNumber(event.args.integratorPart.toString(), token.decimals);
                const feeUsd = (RubicPart + integratorPart) * tokenPriceUsd;

                protocolData.totalFees += feeUsd;
                protocolData.protocolRevenue += feeUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                      trade: 0,
                    },
                  };
                }
                protocolData.breakdown[token.chain][token.address].totalFees += feeUsd;
                protocolData.breakdown[token.chain][token.address].protocolRevenue += feeUsd;
              }

              break;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
