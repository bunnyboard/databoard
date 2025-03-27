import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { AddressZero, Erc20TransferEventSignature } from '../../../configs/constants';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import ProtocolAdapter from '../protocol';
import { BlackrockusdProtocolConfig } from '../../../configs/protocols/blackrock';
import Erc20Abi from '../../../configs/abi/ERC20.json';

export default class BlackrockusdAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.blackrock';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    if (this.protocolConfig.birthday > options.timestamp) {
      return null;
    }

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),

      // total BUILD stablecoins issued
      totalBorrowed: 0,
      volumes: {
        borrow: 0,
        repay: 0,
      },
    };

    const buildConfig = this.protocolConfig as BlackrockusdProtocolConfig;
    for (const token of buildConfig.tokens) {
      if (!protocolData.breakdown[token.chain]) {
        protocolData.breakdown[token.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        token.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        token.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(token.chain, options.endTime);

      const totalSupply = await this.services.blockchain.evm.readContract({
        chain: token.chain,
        abi: Erc20Abi,
        target: token.address,
        method: 'totalSupply',
        params: [],
        blockNumber: blockNumber,
      });

      const tokenSupplyUsd = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', token.decimals);

      protocolData.totalAssetDeposited += tokenSupplyUsd;
      protocolData.totalValueLocked += tokenSupplyUsd;
      (protocolData.totalBorrowed as number) += tokenSupplyUsd;

      if (!protocolData.breakdown[token.chain][token.address]) {
        protocolData.breakdown[token.chain][token.address] = {
          ...getInitialProtocolCoreMetrics(),
          totalBorrowed: 0,
          volumes: {
            borrow: 0,
            repay: 0,
          },
        };
      }
      protocolData.breakdown[token.chain][token.address].totalAssetDeposited += tokenSupplyUsd;
      protocolData.breakdown[token.chain][token.address].totalValueLocked += tokenSupplyUsd;
      (protocolData.breakdown[token.chain][token.address].totalBorrowed as number) += tokenSupplyUsd;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: token.chain,
        address: token.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      const events: Array<any> = logs
        .filter((log) => log.topics[0] === Erc20TransferEventSignature)
        .map((log) =>
          decodeEventLog({
            abi: Erc20Abi,
            topics: log.topics,
            data: log.data,
          }),
        );

      for (const event of events) {
        const from = normalizeAddress(event.args.from);
        const to = normalizeAddress(event.args.to);
        const value = formatBigNumberToNumber(event.args.value.toString(), token.decimals);

        if (from === AddressZero) {
          (protocolData.volumes.borrow as number) += value;
          (protocolData.breakdown[token.chain][token.address].volumes.borrow as number) += value;
        } else if (to === AddressZero) {
          (protocolData.volumes.repay as number) += value;
          (protocolData.breakdown[token.chain][token.address].volumes.repay as number) += value;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
