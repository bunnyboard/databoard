import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { ContractCall } from '../../../services/blockchains/domains';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';
import { KarakProtocolConfig } from '../../../configs/protocols/karak';
import { decodeEventLog } from 'viem';
import VaultAbi from '../../../configs/abi/karak/Vault.json';

const Events = {
  // deposit
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',

  // withdraw
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
};

export default class KarakAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.karak';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const karakConfig = this.protocolConfig as KarakProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    for (const chainConfig of karakConfig.chainConfigs) {
      if (chainConfig.birthday > options.timestamp) {
        continue;
      }

      protocolData.breakdown[chainConfig.chain] = {};

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.endTime,
      );

      const calls: Array<ContractCall> = chainConfig.vaults.map((item) => {
        return {
          abi: Erc20Abi,
          target: item.token,
          method: 'balanceOf',
          params: [item.address],
        };
      });

      const balances = await this.services.blockchain.evm.multicall({
        chain: chainConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      for (let i = 0; i < chainConfig.vaults.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: chainConfig.chain,
          address: chainConfig.vaults[i].token,
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: chainConfig.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          const balanceUsd =
            formatBigNumberToNumber(balances[i] ? balances[i].toString() : '0', token.decimals) * tokenPriceUsd;

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;
          (protocolData.totalSupplied as number) += balanceUsd;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
              },
            };
          }

          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
          (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;

          const logs = await this.services.blockchain.evm.getContractLogs({
            chain: chainConfig.chain,
            address: chainConfig.vaults[i].address,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of logs) {
            if (log.topics[0] === Events.Deposit || log.topics[0] === Events.Withdraw) {
              const event: any = decodeEventLog({
                abi: VaultAbi,
                topics: log.topics,
                data: log.data,
              });

              const amountUsd = formatBigNumberToNumber(event.args.assets.toString(), token.decimals) * tokenPriceUsd;

              if (log.topics[0] === Events.Deposit) {
                (protocolData.volumes.deposit as number) += amountUsd;
                (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
              } else {
                (protocolData.volumes.withdraw as number) += amountUsd;
                (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
