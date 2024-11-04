import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import logger from '../../../lib/logger';
import { ParaswapProtocolConfig } from '../../../configs/protocols/paraswap';
import SwapperV5Abi from '../../../configs/abi/paraswap/AugustusSwapperV5.json';

const BoughtV3 = '0x4cc7e95e48af62690313a0733e93308ac9a73326bc3c29f1788b1191c376d5b6';
const SwappedV3 = '0xe00361d207b252a464323eb23d45d42583e391f2031acdd2e9fa36efddd43cb0';
const SwappedDirect = '0xd2d73da2b5fd52cd654d8fd1b514ad57355bad741de639e3a1c3a20dd9f17347';

export default class ParaswapAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.paraswap';

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
        // paraswap is dex aggregator
        // we count token swaps on paraswap as trade volume
        trade: 0,
      },
      breakdownChains: {},
    };

    const paraswapConfig = this.protocolConfig as ParaswapProtocolConfig;
    for (const swapperConfig of paraswapConfig.swappers) {
      if (swapperConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData as any).breakdownChains[swapperConfig.chain]) {
        (protocolData as any).breakdownChains[swapperConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            trade: 0,
          },
        };
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        swapperConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        swapperConfig.chain,
        options.endTime,
      );
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: swapperConfig.chain,
        address: swapperConfig.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        const signature = log.topics[0];
        if (signature === BoughtV3 || signature === SwappedV3 || signature === SwappedDirect) {
          const event: any = decodeEventLog({
            abi: SwapperV5Abi,
            topics: log.topics,
            data: log.data,
          });

          const sellToken = await this.services.blockchain.evm.getTokenInfo({
            chain: swapperConfig.chain,
            address: event.args.srcToken,
          });
          const buyToken = await this.services.blockchain.evm.getTokenInfo({
            chain: swapperConfig.chain,
            address: event.args.destToken,
          });

          if (sellToken && buyToken) {
            const sellAmount = formatBigNumberToNumber(event.args.srcAmount.toString(), sellToken.decimals);
            const buyAmount = formatBigNumberToNumber(event.args.receivedAmount.toString(), buyToken.decimals);

            let tradeAmountUsd = 0;

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
            } else {
              tradeAmountUsd = sellAmount * sellTokenPriceUsd;
            }

            if (tradeAmountUsd === 0) {
              logger.warn('failed to get token prices for trade', {
                service: this.name,
                protocol: this.protocolConfig.protocol,
                chain: swapperConfig.chain,
                logIndex: log.logIndex,
                txn: log.transactionHash,
              });
            } else {
              (protocolData.volumes.trade as number) += tradeAmountUsd;
              ((protocolData.breakdownChains as any)[swapperConfig.chain].volumes.trade as number) += tradeAmountUsd;
            }
          }
        }
      }
    }

    return protocolData;
  }
}
