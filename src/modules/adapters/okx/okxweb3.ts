import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog, fromHex } from 'viem';
import AdapterDataHelper from '../helpers';
import { Okxweb3ProtocolConfig } from '../../../configs/protocols/okxweb3';
import DexRouterAbi from '../../../configs/abi/okx/DexRouter.json';
import xBridgeAbi from '../../../configs/abi/okx/xBridge.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
// import logger from '../../../lib/logger';
import { getChainNameById } from '../../../lib/helpers';

const Events = {
  LogBridgeTo: '0xf6481cbc1da19356c5cb6b884be507da735b89f21dc4bbb7c9b7cc0968b03b7a',
  LogSwapAndBridgeTo: '0xb9dae57db52a734b183c77227c96068231beb6a93a060ca7a9d3164f716714ea',
  OrderRecord: '0x1bb43f2da90e35f7b0cf38521ca95a49e68eb42fac49924930a5bd73cdf7576c',
};

export default class Okxweb3Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.okxweb3';

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
        // we count token swaps on okx web3 as trade volume
        trade: 0,
        // we count token bridge on okx web3 as trade volume
        bridge: 0,
      },
      breakdownChains: {},
      volumeBridgePaths: {},
    };

    const okxConfig = this.protocolConfig as Okxweb3ProtocolConfig;
    for (const chainConfig of okxConfig.chains) {
      if (chainConfig.birthday > options.timestamp) {
        continue;
      }

      if (!(protocolData as any).breakdownChains[chainConfig.chain]) {
        (protocolData as any).breakdownChains[chainConfig.chain] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            trade: 0,
            bridge: 0,
          },
        };
      }

      if (!(protocolData.volumeBridgePaths as any)[chainConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[chainConfig.chain] = {};
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.endTime,
      );

      let logs: Array<any> = [];
      for (const address of chainConfig.dexRouters.concat(chainConfig.xBridgeRouter)) {
        logs = logs.concat(
          await this.services.blockchain.evm.getContractLogs({
            chain: chainConfig.chain,
            address: address,
            fromBlock: beginBlock,
            toBlock: endBlock,
          }),
        );
      }

      for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
        const event: any = decodeEventLog({
          abi: DexRouterAbi.concat(xBridgeAbi),
          topics: log.topics,
          data: log.data,
        });

        switch (event.eventName) {
          case 'OrderRecord':
          case 'LogSwapAndBridgeTo': {
            console.log(log.transactionHash);

            let fromToken: Token | null = null;
            let toToken: Token | null = null;
            let fromTokenPriceUsd = 0;
            let toTokenPriceUsd = 0;
            let volumeUsd = 0;

            fromToken = await this.services.blockchain.evm.getTokenInfo({
              chain: chainConfig.chain,
              address: event.args.fromToken,
            });
            if (fromToken) {
              fromTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: fromToken.chain,
                address: fromToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (fromTokenPriceUsd > 0) {
                volumeUsd =
                  formatBigNumberToNumber(event.args.fromAmount.toString(), fromToken.decimals) * fromTokenPriceUsd;
              }
            }

            if (volumeUsd === 0) {
              toToken = await this.services.blockchain.evm.getTokenInfo({
                chain: chainConfig.chain,
                address: event.args.toToken,
              });
              if (toToken) {
                toTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: toToken.chain,
                  address: toToken.address,
                  timestamp: options.timestamp,
                  disableWarning: true,
                });
                volumeUsd =
                  formatBigNumberToNumber(event.args.returnAmount.toString(), toToken.decimals) * toTokenPriceUsd;
              }
            }

            if (fromTokenPriceUsd === 0 && toTokenPriceUsd === 0) {
              // logger.warn('failed to get token prices for trade', {
              //   service: this.name,
              //   protocol: this.protocolConfig.protocol,
              //   chain: chainConfig.chain,
              //   token: `${fromToken?.symbol}-${toToken?.symbol}`,
              //   logIndex: log.logIndex,
              //   txn: log.transactionHash,
              // });
            }

            if (volumeUsd > 0) {
              (protocolData.volumes.trade as number) += volumeUsd;
              ((protocolData.breakdownChains as any)[chainConfig.chain].volumes.trade as number) += volumeUsd;

              if (event.eventName === 'LogSwapAndBridgeTo') {
                (protocolData.volumes.bridge as number) += volumeUsd;
                ((protocolData.breakdownChains as any)[chainConfig.chain].volumes.bridge as number) += volumeUsd;

                const toChainId = fromHex(event.args.ext[1].toString(), 'number');
                const destChain = getChainNameById(toChainId);
                if (destChain) {
                  if (!(protocolData.volumeBridgePaths as any)[chainConfig.chain][destChain]) {
                    (protocolData.volumeBridgePaths as any)[chainConfig.chain][destChain] = 0;
                  }
                  (protocolData.volumeBridgePaths as any)[chainConfig.chain][destChain] += volumeUsd;
                }
              }
            }

            break;
          }

          case 'LogBridgeTo': {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: chainConfig.chain,
              address: event.args.token,
            });
            if (token) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });

              const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

              (protocolData.volumes.bridge as number) += amountUsd;
              ((protocolData.breakdownChains as any)[chainConfig.chain].volumes.bridge as number) += amountUsd;

              const toChainId = fromHex(event.args.ext[1].toString(), 'number');
              const destChain = getChainNameById(toChainId);
              if (destChain) {
                if (!(protocolData.volumeBridgePaths as any)[chainConfig.chain][destChain]) {
                  (protocolData.volumeBridgePaths as any)[chainConfig.chain][destChain] = 0;
                }
                (protocolData.volumeBridgePaths as any)[chainConfig.chain][destChain] += amountUsd;
              }
            }

            break;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
