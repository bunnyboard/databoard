import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { RangoProtocolConfig } from '../../../configs/protocols/rango';
import RangoSwapperV1Abi from '../../../configs/abi/rango/RangoSwapper.json';
import RangoSwapperV2Abi from '../../../configs/abi/rango/RangoSwapperV2.json';
import { logger } from '@sentry/core';
import { getChainNameById } from '../../../lib/helpers';

const Events = {
  FeeInfo: '0xf14fbd8b6e3ad3ae34babfa1f3b6a099f57643662f4cfc24eb335ae8718f534b',

  RangoSwap: '0xc9ca33b4e1816939874cee596ae23410b4f3b26f345e8a93d5779a213ed5ab87',
  RangoBridgeInitiated: '0xa551f5e7134cc110651fa6eb8a0423535b3ea90eedb01463af70e6798a75d426',

  RangoSwapV2: '0x0e9201911743fd4d03e146f00ad23945dc8f3ffc200906eff25179a52b726f17',
  RangoBridgeInitiatedV2: '0x012c155f3836c4edb9222305b909a109f9efa46288efffe40a0e66da3a9a9800',
};

export default class RangoAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.rango';

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
        trade: 0,
        bridge: 0,
      },
      breakdownChains: {},
      volumeBridgePaths: {},
    };

    const rangoConfig = this.protocolConfig as RangoProtocolConfig;
    for (const exchangeConfig of rangoConfig.exchanges) {
      if (exchangeConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData as any).breakdownChains[exchangeConfig.chain]) {
        (protocolData as any).breakdownChains[exchangeConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            trade: 0,
            bridge: 0,
          },
        };
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
        address: exchangeConfig.diamond,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
        const signature = log.topics[0];

        let event: any = null;

        if (signature === Events.RangoSwapV2 || signature === Events.RangoBridgeInitiatedV2) {
          event = decodeEventLog({
            abi: RangoSwapperV2Abi,
            topics: log.topics,
            data: log.data,
          });
        } else {
          event = decodeEventLog({
            abi: RangoSwapperV1Abi,
            topics: log.topics,
            data: log.data,
          });
        }

        switch (signature) {
          case Events.FeeInfo: {
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

              const platformFee = formatBigNumberToNumber(event.args.platformFee.toString(), token.decimals);
              const destinationExecutorFee = formatBigNumberToNumber(
                event.args.destinationExecutorFee.toString(),
                token.decimals,
              );
              const affiliateFee = formatBigNumberToNumber(event.args.affiliateFee.toString(), token.decimals);
              const totalFeesUsd = (platformFee + destinationExecutorFee + affiliateFee) * tokenPriceUsd;

              protocolData.totalFees += totalFeesUsd;
              protocolData.protocolRevenue += totalFeesUsd;

              (protocolData.breakdownChains as any)[exchangeConfig.chain].totalFees += totalFeesUsd;
              (protocolData.breakdownChains as any)[exchangeConfig.chain].protocolRevenue += totalFeesUsd;
            }

            break;
          }

          case Events.RangoSwap:
          case Events.RangoSwapV2: {
            let volumeUsd = 0;

            const fromToken = await this.services.blockchain.evm.getTokenInfo({
              chain: exchangeConfig.chain,
              address: event.args.fromToken,
            });
            const toToken = await this.services.blockchain.evm.getTokenInfo({
              chain: exchangeConfig.chain,
              address: event.args.toToken,
            });

            if (fromToken && toToken) {
              const amountIn = formatBigNumberToNumber(event.args.amountIn.toString(), fromToken.decimals);
              const amountOut = formatBigNumberToNumber(event.args.outputAmount.toString(), toToken.decimals);

              const fromTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: fromToken.chain,
                address: fromToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (fromTokenPriceUsd > 0) {
                volumeUsd = amountIn * fromTokenPriceUsd;
              } else {
                const toTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: toToken.chain,
                  address: toToken.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                if (toTokenPriceUsd > 0) {
                  volumeUsd = amountOut * toTokenPriceUsd;
                } else {
                  logger.warn('failed to get token prices for trade', {
                    service: this.name,
                    protocol: this.protocolConfig.protocol,
                    chain: exchangeConfig.chain,
                    token: `${fromToken.symbol}-${toToken.symbol}`,
                    logIndex: log.logIndex,
                    txn: log.transactionHash,
                  });
                }
              }
            }

            (protocolData.volumes.trade as number) += volumeUsd;
            ((protocolData.breakdownChains as any)[exchangeConfig.chain].volumes.trade as number) += volumeUsd;

            break;
          }

          case Events.RangoBridgeInitiated:
          case Events.RangoBridgeInitiatedV2: {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: exchangeConfig.chain,
              address: event.args.bridgeToken,
            });
            const destChanName = getChainNameById(Number(event.args.destinationChainId));

            if (token && destChanName) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              const bridgeVolumeUsd =
                formatBigNumberToNumber(event.args.bridgeAmount.toString(), token.decimals) * tokenPriceUsd;

              (protocolData.volumes.bridge as number) += bridgeVolumeUsd;
              ((protocolData.breakdownChains as any)[exchangeConfig.chain].volumes.bridge as number) += bridgeVolumeUsd;

              if (!(protocolData.volumeBridgePaths as any)[exchangeConfig.chain][destChanName]) {
                (protocolData.volumeBridgePaths as any)[exchangeConfig.chain][destChanName] = 0;
              }
              (protocolData.volumeBridgePaths as any)[exchangeConfig.chain][destChanName] += bridgeVolumeUsd;
            }

            break;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
