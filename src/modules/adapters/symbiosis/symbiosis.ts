import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import PortalAbi from '../../../configs/abi/symbiosis/Portal.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { SymbiosisProtocolConfig } from '../../../configs/protocols/symbiosis';

const Events = {
  BurnCompleted: '0xaeef64b7687b985665b6620c7fa271b6f051a3fbe2bfc366fb9c964602eb6d26',
  SynthesizeRequest: '0x31325fe0a1a2e6a5b1e41572156ba5b4e94f0fae7e7f63ec21e9b5ce1e4b3eab',
};

export default class SymbiosisAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.symbiosis';

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
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    const symbiosisConfig = this.protocolConfig as SymbiosisProtocolConfig;

    // bridge transactions on symbiosis happend on 3 chains
    // source chain -> s chain (boba BNB) -> destination chain
    // to be able to map source chain with desination chain
    // we must check the SynthesizeRequest id from source chain
    // to be equal to BurnCompleted crossChainID on destination chain
    // docs: https://docs.symbiosis.finance/crosschain-liquidity-engine/symbiosis-routing-contracts
    const portalEvents: { [key: string]: Array<any> } = {};
    for (const portalConfig of symbiosisConfig.portals) {
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        portalConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        portalConfig.chain,
        options.endTime,
      );
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: portalConfig.chain,
        address: portalConfig.portal,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      const events: Array<any> = logs
        .filter((log) => Object.values(Events).includes(log.topics[0]))
        .map((log) =>
          decodeEventLog({
            abi: PortalAbi,
            topics: log.topics,
            data: log.data,
          }),
        );

      portalEvents[portalConfig.chain] = events;
    }

    for (const [sourceChain, sourceChainEvents] of Object.entries(portalEvents)) {
      if (!protocolData.breakdown[sourceChain]) {
        protocolData.breakdown[sourceChain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[sourceChain]) {
        (protocolData.volumeBridgePaths as any)[sourceChain] = {};
      }

      for (const sourceChainEvent of sourceChainEvents) {
        if (sourceChainEvent.eventName === 'SynthesizeRequest') {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: sourceChain,
            address: sourceChainEvent.args.token,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            let targetChain: null | string = null;
            let feeAmountUsd = 0;
            const tokenAmountUsd =
              formatBigNumberToNumber(sourceChainEvent.args.amount.toString(), token.decimals) * tokenPriceUsd;

            // we need to find the match BurnCompleted event on destination chain
            for (const [destinationChain, destinationEvents] of Object.entries(portalEvents)) {
              if (destinationChain !== sourceChain) {
                for (const destinationEvent of destinationEvents) {
                  if (destinationEvent.args.crossChainID === sourceChainEvent.args.id) {
                    const destinationChainToken = await this.services.blockchain.evm.getTokenInfo({
                      chain: destinationChain,
                      address: destinationEvent.args.token,
                    });
                    if (destinationChainToken) {
                      feeAmountUsd =
                        formatBigNumberToNumber(
                          destinationEvent.args.bridgingFee.toString(),
                          destinationChainToken.decimals,
                        ) * tokenPriceUsd;
                    }
                    targetChain = destinationChain;

                    break;
                  }
                }
              }
            }

            if (tokenAmountUsd > 0) {
              protocolData.totalFees += feeAmountUsd;
              protocolData.protocolRevenue += feeAmountUsd;
              (protocolData.volumes.bridge as number) += tokenAmountUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  totalSupplied: 0,
                  volumes: {
                    bridge: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalFees += feeAmountUsd;
              protocolData.breakdown[token.chain][token.address].protocolRevenue += feeAmountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += tokenAmountUsd;

              if (targetChain) {
                if (!(protocolData.volumeBridgePaths as any)[sourceChain][targetChain]) {
                  (protocolData.volumeBridgePaths as any)[sourceChain][targetChain] = 0;
                }
                (protocolData.volumeBridgePaths as any)[sourceChain][targetChain] += tokenAmountUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
