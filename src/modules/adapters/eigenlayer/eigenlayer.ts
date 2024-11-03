import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { EigenLayerProtocolConfig } from '../../../configs/protocols/eigenlayer';
import { ContractCall } from '../../../services/blockchains/domains';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import DelegationManagerAbi from '../../../configs/abi/eigenlayer/DelegationManager.json';
import PodManagerAbi from '../../../configs/abi/eigenlayer/EigenPodManager.json';
import EigenPodAbi from '../../../configs/abi/eigenlayer/EigenPod.json';
import EigenLayerIndexer from './indexer';
import { AddressZero } from '../../../configs/constants';
import envConfig from '../../../configs/envConfig';

const Events = {
  // deposit
  OperatorSharesIncreased: '0x1ec042c965e2edd7107b51188ee0f383e22e76179041ab3a9d18ff151405166c',

  // withdraw
  OperatorSharesDecreased: '0x6909600037b75d7b4733aedd815442b5ec018a827751c832aaff64eba5d6d2dd',
};

export default class EigenLayerAdapter extends EigenLayerIndexer {
  public readonly name: string = 'adapter.eigenlayer';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const eigenConfig = this.protocolConfig as EigenLayerProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [eigenConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
        },
      },

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    if (eigenConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eigenConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eigenConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eigenConfig.chain,
      options.endTime,
    );

    const calls: Array<ContractCall> = eigenConfig.strategies.map((item) => {
      return {
        abi: Erc20Abi,
        target: item.token,
        method: 'balanceOf',
        params: [item.address],
      };
    });

    const balances = await this.services.blockchain.evm.multicall({
      chain: eigenConfig.chain,
      blockNumber: blockNumber,
      calls: calls,
    });

    const tokenAndPrices: {
      [key: string]: {
        token: Token;
        priceUsd: number;
      };
    } = {};
    for (let i = 0; i < eigenConfig.strategies.length; i++) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: eigenConfig.chain,
        address: eigenConfig.strategies[i].token,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: eigenConfig.chain,
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

        tokenAndPrices[token.address] = {
          token: token,
          priceUsd: tokenPriceUsd,
        };
      }
    }

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: eigenConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    if (await this.storages.database.isConnected()) {
      // to query total ETH staked in Beacon chain
      // we need get all Pod Deployed contracts
      // by indexing PodDeployed events from PodManager contract
      await this.indexHistoricalLogs(eigenConfig);

      // now we count ETH staked by number of active validator * 32
      const podDeployedLogs = await this.storages.database.query({
        collection: envConfig.mongodb.collections.contractLogs.name,
        query: {
          chain: eigenConfig.chain,
          address: normalizeAddress(eigenConfig.podManager),
          blockNumber: {
            $lte: blockNumber,
          },
        },
      });

      const pods: Array<string> = [];
      for (const log of podDeployedLogs) {
        const event: any = decodeEventLog({
          abi: PodManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        pods.push(normalizeAddress(event.args.eigenPod));
      }

      const callSize = 100;
      for (let startIndex = 0; startIndex < pods.length; startIndex += callSize) {
        const queryPods = pods.slice(startIndex, startIndex + callSize);

        const calls: Array<ContractCall> = queryPods.map((item) => {
          return {
            abi: EigenPodAbi,
            target: item,
            method: 'activeValidatorCount',
            params: [],
          };
        });

        const results = await this.services.blockchain.evm.multicall({
          chain: eigenConfig.chain,
          blockNumber: blockNumber,
          calls: calls,
        });

        for (const result of results) {
          const totalValidator = result ? Number(result) : 0;
          const balanceUsd = totalValidator * 32 * ethPriceUsd;

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;
          (protocolData.totalSupplied as number) += balanceUsd;

          protocolData.breakdown[eigenConfig.chain][AddressZero].totalAssetDeposited += balanceUsd;
          protocolData.breakdown[eigenConfig.chain][AddressZero].totalValueLocked += balanceUsd;
          (protocolData.breakdown[eigenConfig.chain][AddressZero].totalSupplied as number) += balanceUsd;
        }
      }
    }

    const delegationManagerLogs = await this.services.blockchain.evm.getContractLogs({
      chain: eigenConfig.chain,
      address: eigenConfig.delegationManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const ethStrategy = '0xbeac0eeeeeeeeeeeeeeeeeeeeeeeeeeeeeebeac0';
    for (const log of delegationManagerLogs) {
      if (log.topics[0] === Events.OperatorSharesIncreased || log.topics[0] === Events.OperatorSharesDecreased) {
        const event: any = decodeEventLog({
          abi: DelegationManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        let amountUsd = 0;
        let tokenAddress = AddressZero;

        if (compareAddress(event.args.strategy, ethStrategy)) {
          amountUsd = formatBigNumberToNumber(event.args.shares.toString(), 18) * ethPriceUsd;
        } else {
          const strategyConfig = eigenConfig.strategies.filter((item) =>
            compareAddress(item.address, event.args.strategy),
          )[0];
          if (strategyConfig) {
            const token = tokenAndPrices[normalizeAddress(strategyConfig.token)];
            if (token) {
              tokenAddress = token.token.address;
              amountUsd = formatBigNumberToNumber(event.args.shares.toString(), token.token.decimals) * token.priceUsd;
            }
          }
        }

        if (log.topics[0] === Events.OperatorSharesIncreased) {
          (protocolData.volumes.deposit as number) += amountUsd;
          (protocolData.breakdown[eigenConfig.chain][tokenAddress].volumes.deposit as number) += amountUsd;
        } else {
          (protocolData.volumes.withdraw as number) += amountUsd;
          (protocolData.breakdown[eigenConfig.chain][tokenAddress].volumes.withdraw as number) += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
