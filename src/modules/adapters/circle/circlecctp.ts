import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { CircleCctpDomainChains, CircleCctpProtocolConfig } from '../../../configs/protocols/circle';
import TokenMessengerAbi from '../../../configs/abi/circle/TokenMessenger.json';
import AdapterDataHelper from '../helpers';

const DepositForBurn = '0x2fa9ca894982930190727e75500a97d8dc500233a5065e0f3126c48fbe0343c0';

export default class CircleCctpAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.circlecctp';

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

    const circleCctpConfig = this.protocolConfig as CircleCctpProtocolConfig;
    for (const messengerConfig of circleCctpConfig.messengers) {
      if (!protocolData.breakdown[messengerConfig.chain]) {
        protocolData.breakdown[messengerConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[messengerConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[messengerConfig.chain] = {};
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        messengerConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        messengerConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: messengerConfig.chain,
        address: messengerConfig.tokenMessenger,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === DepositForBurn) {
          const event: any = decodeEventLog({
            abi: TokenMessengerAbi,
            topics: log.topics,
            data: log.data,
          });

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: messengerConfig.chain,
            address: event.args.burnToken,
          });
          const destChain = CircleCctpDomainChains[Number(event.args.destinationDomain)];
          if (token && destChain) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridge: 0,
                },
              };
            }

            if (!(protocolData.volumeBridgePaths as any)[messengerConfig.chain][destChain]) {
              (protocolData.volumeBridgePaths as any)[messengerConfig.chain][destChain] = 0;
            }

            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
            (protocolData.volumeBridgePaths as any)[messengerConfig.chain][destChain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
