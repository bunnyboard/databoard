import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import AdapterDataHelper from '../helpers';
import { OpenoceanProtocolConfig } from '../../../configs/protocols/openocean';

const EventSwapped = '0x76af224a143865a50b41496e1a73622698692c565c1214bc862f18e22d829c5e';

// https://docs.openocean.finance/protocol/introduction/fees-overview#fees-on-openocean
const FeeRatePerSwap = 0.001; // 0.1%

const ExchangeAbis = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: 'address',
        name: 'sender',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'srcToken',
        type: 'address',
      },
      {
        indexed: true,
        internalType: 'contract IERC20',
        name: 'dstToken',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'dstReceiver',
        type: 'address',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'amount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'spentAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'returnAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'minReturnAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'uint256',
        name: 'guaranteedAmount',
        type: 'uint256',
      },
      {
        indexed: false,
        internalType: 'address',
        name: 'referrer',
        type: 'address',
      },
    ],
    name: 'Swapped',
    type: 'event',
  },
];

export default class OpenoceanAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.openocean';

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
      },
      breakdownChains: {},
    };

    const config = this.protocolConfig as OpenoceanProtocolConfig;
    for (const exchangeConfig of config.exchanges) {
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
        address: exchangeConfig.exchange,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === EventSwapped) {
          const event: any = decodeEventLog({
            abi: ExchangeAbis,
            topics: log.topics,
            data: log.data,
          });

          if (log.topics[0] === EventSwapped) {
            const sellToken = await this.services.blockchain.evm.getTokenInfo({
              chain: exchangeConfig.chain,
              address: event.args.srcToken,
            });
            const buyToken = await this.services.blockchain.evm.getTokenInfo({
              chain: exchangeConfig.chain,
              address: event.args.dstToken,
            });

            if (sellToken && buyToken) {
              const sellAmount = formatBigNumberToNumber(event.args.spentAmount.toString(), sellToken.decimals);
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
                  chain: exchangeConfig.chain,
                  token: `${sellToken.symbol}-${buyToken.symbol}`,
                  logIndex: log.logIndex,
                  txn: log.transactionHash,
                });
              } else {
                const amountUsd = sellAmount * sellTokenPriceUsd;
                const feesUsd = amountUsd * FeeRatePerSwap;

                protocolData.totalFees += feesUsd;
                protocolData.protocolRevenue += feesUsd;
                (protocolData.volumes.trade as number) += amountUsd;

                (protocolData.breakdownChains as any)[exchangeConfig.chain].totalFees += feesUsd;
                (protocolData.breakdownChains as any)[exchangeConfig.chain].protocolRevenue += feesUsd;
                ((protocolData.breakdownChains as any)[exchangeConfig.chain].volumes.trade as number) += amountUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
