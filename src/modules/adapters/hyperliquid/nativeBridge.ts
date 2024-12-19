import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolExtendedAdapter from '../extended';
import { HyperLiquidBridgeProtocolConfig } from '../../../configs/protocols/hyperliquid';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { decodeEventLog } from 'viem';
import { Erc20TransferEventSignature } from '../../../configs/constants';

export default class HyperLiquidNativeBridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.hyperliquid';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const hlConfigs = this.protocolConfig as HyperLiquidBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [hlConfigs.chain]: {
          [hlConfigs.USDC.address]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [hlConfigs.chain]: {
          [hlConfigs.layer2Chain]: 0,
        },
        [hlConfigs.layer2Chain]: {
          [hlConfigs.chain]: 0,
        },
      },
    };

    if (hlConfigs.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      hlConfigs.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      hlConfigs.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(hlConfigs.chain, options.endTime);

    // count USDC balance
    const usdcBalanceRaw = await this.services.blockchain.evm.getTokenBalance({
      chain: hlConfigs.USDC.chain,
      address: hlConfigs.USDC.address,
      owner: hlConfigs.bridge2,
      blockNumber: blockNumber,
    });

    protocolData.totalAssetDeposited += formatBigNumberToNumber(
      usdcBalanceRaw ? usdcBalanceRaw.toString() : '0',
      hlConfigs.USDC.decimals,
    );
    protocolData.totalValueLocked += formatBigNumberToNumber(
      usdcBalanceRaw ? usdcBalanceRaw.toString() : '0',
      hlConfigs.USDC.decimals,
    );

    const usdcLogs = await this.services.blockchain.evm.getContractLogs({
      chain: hlConfigs.chain,
      address: hlConfigs.USDC.address,
      fromBlock: beginBlock,
      toBlock: endBlock,
      blockRange: 2000,
    });
    for (const log of usdcLogs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: Erc20Abi,
          topics: log.topics,
          data: log.data,
        });

        if (compareAddress(event.from, hlConfigs.bridge2) || compareAddress(event.to, hlConfigs.bridge2)) {
          const amountUsd = formatBigNumberToNumber(event.args.value.toString(), hlConfigs.USDC.decimals);

          (protocolData.volumes.bridge as number) += amountUsd;
          (protocolData.breakdown[hlConfigs.USDC.chain][hlConfigs.USDC.address].volumes.bridge as number) += amountUsd;

          if (compareAddress(event.to, hlConfigs.bridge2)) {
            (protocolData.volumeBridgePaths as any)[hlConfigs.layer2Chain][hlConfigs.chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[hlConfigs.chain][hlConfigs.layer2Chain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
