import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import { KyberswapProtocolConfig } from '../../../configs/protocols/kyberswap';
import MetaAggregatorAbi from '../../../configs/abi/kyberswap/MetaAggregationRouterV2.json';
import { SolidityUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';

const Swapped = '0xd6d4f5681c246c9f42c203e287975af1601f8df8035a9251f79aab5c8f09e2f8';
const Fee = '0x4c39b7ce5f4f514f45cb6f82b171b8b0b7f2cbf488ad28e4eff451588e2f014b';

export default class KyberswapAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.kyberswap';

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
        // kyberswap is dex aggregator
        // we count token swaps on kyberswap as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const kyberswapConfig = this.protocolConfig as KyberswapProtocolConfig;
    for (const routerConfig of kyberswapConfig.routers) {
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
        address: routerConfig.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        const signature = log.topics[0];
        if (signature === Swapped) {
          const event: any = decodeEventLog({
            abi: MetaAggregatorAbi,
            topics: log.topics,
            data: log.data,
          });

          let sellToken: Token | null = null;
          let buyToken: Token | null = null;
          let sellTokenPriceUsd = 0;
          let buyTokenPriceUsd = 0;
          let volumeUsd = 0;

          // kyberswap log max uint256 value if spender spend all token in their wallet
          if (event.args.spentAmount.toString() !== SolidityUnits.Uint256MaxValue) {
            sellToken = await this.services.blockchain.evm.getTokenInfo({
              chain: routerConfig.chain,
              address: event.args.srcToken,
            });

            if (sellToken) {
              sellTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: sellToken.chain,
                address: sellToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              volumeUsd =
                formatBigNumberToNumber(event.args.spentAmount.toString(), sellToken.decimals) * sellTokenPriceUsd;
            }
          }

          if (volumeUsd === 0) {
            buyToken = await this.services.blockchain.evm.getTokenInfo({
              chain: routerConfig.chain,
              address: event.args.dstToken,
            });
            if (buyToken) {
              buyTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: buyToken.chain,
                address: buyToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              volumeUsd =
                formatBigNumberToNumber(event.args.returnAmount.toString(), buyToken.decimals) * buyTokenPriceUsd;
            }
          }

          if (sellTokenPriceUsd === 0 && buyTokenPriceUsd === 0) {
            logger.warn('failed to get token prices for trade', {
              service: this.name,
              protocol: this.protocolConfig.protocol,
              chain: routerConfig.chain,
              logIndex: log.logIndex,
              token: `${sellToken?.symbol}-${buyToken?.symbol}`,
              txn: log.transactionHash,
            });
          }

          (protocolData.volumes.trade as number) += volumeUsd;
          ((protocolData.breakdownChains as any)[routerConfig.chain].volumes.trade as number) += volumeUsd;
        } else if (signature === Fee) {
          const event: any = decodeEventLog({
            abi: MetaAggregatorAbi,
            topics: log.topics,
            data: log.data,
          });

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: routerConfig.chain,
            address: event.args.token,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
              disableWarning: true,
            });
            const feeUsd = formatBigNumberToNumber(event.args.totalFee.toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalFees += feeUsd;
            protocolData.protocolRevenue += feeUsd;
            ((protocolData.breakdownChains as any)[routerConfig.chain].totalFees as number) += feeUsd;
            ((protocolData.breakdownChains as any)[routerConfig.chain].protocolRevenue as number) += feeUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
