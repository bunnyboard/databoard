import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { AddressZero } from '../../../configs/constants';
import EclipseTreasuryAbi from '../../../configs/abi/eclipsel2/Treasury.json';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { EclipseL2BridgeProtocolConfig } from '../../../configs/protocols/eclipsel2';

const Events = {
  TreasuryDeposit: '0xe3407208b14fa025330ca187030f118a1c0cdb604aba93ba45c862e6095aee27',
  TreasuryWithdraw: '0xa9186eec1c1f118aa187d90aecd4ff2bf3d2e5412f3750362412ac6f7f572147',
};

export default class Eclipsel2NativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.eclipsel2';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const eclipsel2Config = this.protocolConfig as EclipseL2BridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [eclipsel2Config.chain]: {
          [AddressZero]: {
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
        [eclipsel2Config.chain]: {
          [eclipsel2Config.layer2Chain]: 0,
        },
        [eclipsel2Config.layer2Chain]: {
          [eclipsel2Config.chain]: 0,
        },
      },
    };

    if (eclipsel2Config.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eclipsel2Config.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eclipsel2Config.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eclipsel2Config.chain,
      options.endTime,
    );

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: eclipsel2Config.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const ethBalance = await this.services.blockchain.evm.getTokenBalance({
      chain: eclipsel2Config.chain,
      address: AddressZero,
      owner: eclipsel2Config.treasury,
      blockNumber: blockNumber,
    });

    const totalEthUsd = formatBigNumberToNumber(ethBalance.toString(), 18) * ethPriceUsd;

    protocolData.totalAssetDeposited += totalEthUsd;
    protocolData.totalValueLocked += totalEthUsd;
    protocolData.breakdown[eclipsel2Config.chain][AddressZero].totalAssetDeposited += totalEthUsd;
    protocolData.breakdown[eclipsel2Config.chain][AddressZero].totalValueLocked += totalEthUsd;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: eclipsel2Config.chain,
      address: eclipsel2Config.treasury,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === Events.TreasuryDeposit || signature === Events.TreasuryWithdraw) {
        const event: any = decodeEventLog({
          abi: EclipseTreasuryAbi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = formatBigNumberToNumber(event.args.amountWei.toString(), 18) * ethPriceUsd;

        (protocolData.volumes.bridge as number) += amountUsd;
        (protocolData.breakdown[eclipsel2Config.chain][AddressZero].volumes.bridge as number) += amountUsd;

        if (signature === Events.TreasuryDeposit) {
          // deposit
          (protocolData.volumeBridgePaths as any)[eclipsel2Config.chain][eclipsel2Config.layer2Chain] += amountUsd;
        } else {
          // withdraw
          (protocolData.volumeBridgePaths as any)[eclipsel2Config.layer2Chain][eclipsel2Config.chain] += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
