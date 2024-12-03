import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';
import VaultAbi from '../../../configs/abi/mellow/MellowVault.json';
import { MellowProtocolConfig } from '../../../configs/protocols/mellow';
import { decodeEventLog } from 'viem';

const Events = {
  // deposit
  Deposit: '0xff195810018e2867a43eaac646e6b3fc71bc32d776175995704b6bc10d7fada8',

  // withdraw
  WithdrawalRequested: '0x390acd8a6485f0c0b379ba564699e9a4fd3ed26cd9d957a50d56320b4bf2309b',
};

export default class MellowAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.mellow';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const mellowConfig = this.protocolConfig as MellowProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    for (const chainConfig of mellowConfig.chains) {
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

      for (const vaultConfig of chainConfig.vaults) {
        const vaultTokens: Array<Token> = [];

        const underlyingBalances = await this.services.blockchain.evm.readContract({
          chain: chainConfig.chain,
          abi: VaultAbi,
          target: vaultConfig.vault,
          method: 'underlyingTvl',
          params: [],
          blockNumber: blockNumber,
        });
        if (underlyingBalances) {
          const assets = underlyingBalances[0];
          const amounts = underlyingBalances[1];
          for (let i = 0; i < assets.length; i++) {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: chainConfig.chain,
              address: assets[i],
            });
            if (token) {
              vaultTokens.push(token);

              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });

              const balanceUsd =
                formatBigNumberToNumber(amounts[i] ? amounts[i].toString() : '0', token.decimals) * tokenPriceUsd;

              protocolData.totalAssetDeposited += balanceUsd;
              protocolData.totalValueLocked += balanceUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    deposit: 0,
                    withdraw: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
              protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
            }
          }
        }

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: chainConfig.chain,
          address: vaultConfig.vault,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          if (log.topics[0] === Events.Deposit || log.topics[0] === Events.WithdrawalRequested) {
            const event: any = decodeEventLog({
              abi: VaultAbi,
              topics: log.topics,
              data: log.data,
            });

            if (log.topics[0] === Events.Deposit) {
              for (let i = 0; i < vaultTokens.length; i++) {
                const token = vaultTokens[i];
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                const amountUsd =
                  formatBigNumberToNumber(event.args.amounts[i] ? event.args.amounts[i] : '0', token.decimals) *
                  tokenPriceUsd;

                (protocolData.volumes.deposit as number) += amountUsd;
                (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
              }
            } else {
              for (let i = 0; i < vaultTokens.length; i++) {
                const token = vaultTokens[i];
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                const amountUsd =
                  formatBigNumberToNumber(
                    event.args.request.minAmounts[i] ? event.args.request.minAmounts[i] : '0',
                    18, // 18 decimals
                  ) * tokenPriceUsd;

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
