import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { MovementNativeBridgeProtocolConfig } from '../../../configs/protocols/movement';
import OftAdapterAbi from '../../../configs/abi/layerzero/OftAdapter.json';

const Events = {
  OFTSent: '0x85496b760a4b7f8d66384b9df21b381f5d1b1e79f229a47aaf4c232edc2fe59a',
  OFTReceived: '0xefed6d3500546b29533b128a29e3a94d70788727f0507505ac12eaf2e578fd9c',
};

export default class MovementNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.movement';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const movementConfig = this.protocolConfig as MovementNativeBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [movementConfig.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [movementConfig.chain]: {
          [movementConfig.layer2Chain]: 0,
        },
        [movementConfig.layer2Chain]: {
          [movementConfig.chain]: 0,
        },
      },
    };

    if (movementConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      movementConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      movementConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      movementConfig.chain,
      options.endTime,
    );

    for (const oftAdapterConfig of movementConfig.bridges) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: oftAdapterConfig.chain,
        address: oftAdapterConfig.token,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const tokenBalance = await this.services.blockchain.evm.getTokenBalance({
          chain: token.chain,
          address: token.address,
          owner: oftAdapterConfig.address,
          blockNumber: blockNumber,
        });

        const balanceUsd = formatBigNumberToNumber(tokenBalance, token.decimals) * tokenPriceUsd;

        protocolData.totalAssetDeposited += balanceUsd;
        protocolData.totalValueLocked += balanceUsd;

        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
        protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: oftAdapterConfig.chain,
          address: oftAdapterConfig.address,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        const events: Array<any> = logs
          .filter((log) => Object.values(Events).includes(log.topics[0]))
          .map((log) =>
            decodeEventLog({
              abi: OftAdapterAbi,
              topics: log.topics,
              data: log.data,
            }),
          );

        for (const event of events) {
          const amountUsd =
            formatBigNumberToNumber(event.args.amountReceivedLD.toString(), token.decimals) * tokenPriceUsd;

          (protocolData.volumes.bridge as number) += amountUsd;
          (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

          if (protocolData.volumeBridgePaths) {
            if (event.eventName === 'OFTSent') {
              protocolData.volumeBridgePaths[movementConfig.chain][movementConfig.layer2Chain] += amountUsd;
            } else if (event.eventName === 'OFTReceived') {
              protocolData.volumeBridgePaths[movementConfig.layer2Chain][movementConfig.chain] += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
