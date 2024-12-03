import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { ContractCall } from '../../../services/blockchains/domains';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';
import { PellNetworkProtocolConfig } from '../../../configs/protocols/pellnetwork';
import { ChainNames } from '../../../configs/names';
import PellStrategyManagerAbi from '../../../configs/abi/pellnetwork/StrategyManager.json';
import PellDelegationAbi from '../../../configs/abi/pellnetwork/DelegationManagerV2.json';
import { decodeEventLog } from 'viem';

const Events = {
  // deposit
  Deposit: '0x7cfff908a4b583f36430b25d75964c458d8ede8a99bd61be750e97ee1b2f3a96',

  // withdraw
  WithdrawalQueued: '0x9009ab153e8014fbfb02f2217f5cde7aa7f9ad734ae85ca3ee3f4ca2fdd499f9',
};

export default class PellNetworkAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.pellnetwork';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const pellConfig = this.protocolConfig as PellNetworkProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
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

    const btcPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: ChainNames.ethereum,
      address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
      timestamp: options.timestamp,
    });

    for (const config of pellConfig.configs) {
      if (config.birthday > options.timestamp) {
        continue;
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        config.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(config.chain, options.endTime);

      protocolData.breakdown[config.chain] = {};

      const calls: Array<ContractCall> = config.strategies.map((item) => {
        return {
          abi: Erc20Abi,
          target: item.token,
          method: 'balanceOf',
          params: [item.strategy],
        };
      });

      const balances = await this.services.blockchain.evm.multicall({
        chain: config.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      for (let i = 0; i < config.strategies.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: config.chain,
          address: config.strategies[i].token,
        });
        if (token) {
          const balanceUsd =
            formatBigNumberToNumber(balances[i] ? balances[i].toString() : '0', token.decimals) * btcPriceUsd;

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
        }
      }

      const strategyManagerLogs = await this.services.blockchain.evm.getContractLogs({
        chain: config.chain,
        address: config.strategyManager,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of strategyManagerLogs) {
        if (log.topics[0] === Events.Deposit) {
          const event: any = decodeEventLog({
            abi: PellStrategyManagerAbi,
            topics: log.topics,
            data: log.data,
          });
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: config.chain,
            address: event.args.token,
          });
          if (token) {
            const amountUsd = formatBigNumberToNumber(event.args.shares.toString(), token.decimals) * btcPriceUsd;

            (protocolData.volumes.deposit as number) += amountUsd;

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
            (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
          }
        }
      }

      const delegationLogs = await this.services.blockchain.evm.getContractLogs({
        chain: config.chain,
        address: config.delegation,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of delegationLogs) {
        if (log.topics[0] === Events.WithdrawalQueued) {
          const event: any = decodeEventLog({
            abi: PellDelegationAbi,
            topics: log.topics,
            data: log.data,
          });

          for (let i = 0; i < event.args.withdrawal.strategies.length; i++) {
            const strategy = config.strategies.filter((item) =>
              compareAddress(item.strategy, event.args.withdrawal.strategies[i]),
            )[0];
            if (strategy) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: config.chain,
                address: strategy.token,
              });
              if (token) {
                const amountUsd =
                  formatBigNumberToNumber(event.args.withdrawal.shares[i].toString(), token.decimals) * btcPriceUsd;

                (protocolData.volumes.withdraw as number) += amountUsd;
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
