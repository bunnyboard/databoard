import { AddressE, AddressF, AddressZero } from '../../configs/constants';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../lib/utils';
import { ContractCall, MulticallOptions } from '../../services/blockchains/domains';
import { ProtocolConfig, Token } from '../../types/base';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import Erc20Abi from '../../configs/abi/ERC20.json';
import ProtocolAdapter from './protocol';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { CustomQueryChainLogsBlockRange, DefaultQueryChainLogsBlockRange } from '../../configs';

interface GetAddressBalanceUsdOptions {
  chain: string;
  ownerAddress: string;
  tokens: Array<Token>;
  timestamp: number;
  blockNumber?: number;
}

interface GetAddressBalanceUsdResult {
  totalBalanceUsd: number;
  tokenBalanceUsds: {
    [key: string]: {
      priceUsd: number;
      balanceUsd: number;
    };
  };
}

interface IndexContracLogsOptions {
  chain: string;
  address: string;
  fromBlock: number;
  toBlock: number;
}

interface IndexChainLogsOptions {
  chain: string;
  signatures: Array<string>;
  fromBlock: number;
  toBlock: number;
}

export default class ProtocolExtendedAdapter extends ProtocolAdapter {
  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // helper functions
  // get usd value of given tokens (ERC20 or native) holding by an address
  protected async getAddressBalanceUsd(options: GetAddressBalanceUsdOptions): Promise<GetAddressBalanceUsdResult> {
    const getResult: GetAddressBalanceUsdResult = {
      totalBalanceUsd: 0,
      tokenBalanceUsds: {},
    };

    const callSize = 100;
    for (let startIndex = 0; startIndex < options.tokens.length; startIndex += callSize) {
      const queryTokens = options.tokens.slice(startIndex, startIndex + callSize);
      const calls: Array<ContractCall> = queryTokens.map((token) => {
        return {
          abi: Erc20Abi,
          target: token.address,
          method: 'balanceOf',
          params: [options.ownerAddress],
        };
      });
      const results: any = await this.services.blockchain.evm.multicall({
        chain: options.chain,
        blockNumber: options.blockNumber,
        calls: calls,
      });

      for (let i = 0; i < queryTokens.length; i++) {
        const token = queryTokens[i];

        if (token && results[i]) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const balanceUsd =
            formatBigNumberToNumber(results[i] ? results[i].toString() : '0', token.decimals) * tokenPriceUsd;

          getResult.totalBalanceUsd += balanceUsd;
          if (!getResult.tokenBalanceUsds[token.address]) {
            getResult.tokenBalanceUsds[token.address] = {
              priceUsd: tokenPriceUsd,
              balanceUsd: 0,
            };
          }
          getResult.tokenBalanceUsds[token.address].balanceUsd += balanceUsd;
        }
      }
    }

    for (const token of options.tokens) {
      if (
        compareAddress(token.address, AddressZero) ||
        compareAddress(token.address, AddressF) ||
        compareAddress(token.address, AddressE)
      ) {
        // count native
        const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });
        const nativeBalance = await this.services.blockchain.evm.getTokenBalance({
          chain: token.chain,
          address: token.address,
          owner: options.ownerAddress,
          blockNumber: options.blockNumber,
        });
        const balanceUsd = formatBigNumberToNumber(nativeBalance, token.decimals) * nativeTokenPriceUsd;

        getResult.totalBalanceUsd += balanceUsd;
        if (!getResult.tokenBalanceUsds[token.address]) {
          getResult.tokenBalanceUsds[token.address] = {
            priceUsd: nativeTokenPriceUsd,
            balanceUsd: 0,
          };
        }
        getResult.tokenBalanceUsds[token.address].balanceUsd += balanceUsd;
      }
    }

    return getResult;
  }

  // the same as blockchain multicall but with a execution-time counting
  public async multicall(options: MulticallOptions): Promise<any> {
    const startCallTime = new Date().getTime();

    const result = await this.services.blockchain.evm.multicall(options);

    const endCallTime = new Date().getTime();
    const elapsed = endCallTime - startCallTime;

    // > 30s
    if (elapsed > 30000) {
      logger.warn('blockchain multicall took too long', {
        service: this.name,
        chain: options.chain,
        calls: options.calls.length,
        blockNumber: options.blockNumber,
        took: `${Number(elapsed / 1000).toFixed(2)}s`,
      });
    }

    return result;
  }

  /**
   * Index logs by given contract address
   *
   * @param options the contract options to index
   */
  public async indexContractLogs(options: IndexContracLogsOptions): Promise<void> {
    const cachingStateKey = `contractLogs-${options.chain}-${normalizeAddress(options.address)}`;
    const cachingState = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: cachingStateKey,
      },
    });

    let startBlock = options.fromBlock;
    if (cachingState) {
      startBlock = cachingState.blockNumber;
    }

    logger.info('start to index contract logs', {
      service: 'adapter.extended',
      chain: options.chain,
      address: options.address,
      fromBlock: startBlock,
      toBlock: options.toBlock,
    });

    const blockRange = 10000;
    while (startBlock < options.toBlock) {
      const toBlock = startBlock + blockRange > options.toBlock ? options.toBlock : startBlock + blockRange;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: options.chain,
        address: options.address,
        fromBlock: startBlock,
        toBlock: toBlock,
      });

      const operations: Array<any> = logs.map((log) => {
        return {
          updateOne: {
            filter: {
              chain: options.chain,
              address: normalizeAddress(log.address),
              transactionHash: log.transactionHash,
              logIndex: Number(log.logIndex),
            },
            update: {
              $set: {
                chain: options.chain,
                address: normalizeAddress(log.address),
                transactionHash: log.transactionHash,
                logIndex: Number(log.logIndex),
                blockNumber: Number(log.blockNumber),
                topics: log.topics,
                data: log.data,
              },
            },
            upsert: true,
          },
        };
      });

      await this.storages.database.bulkWrite({
        collection: envConfig.mongodb.collections.contractLogs.name,
        operations: operations,
      });

      startBlock = toBlock + 1;

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: cachingStateKey,
        },
        updates: {
          name: cachingStateKey,
          blockNumber: startBlock,
        },
        upsert: true,
      });
    }
  }

  /**
   * Index logs by chain and event signatures (topics[0])
   *
   * @param options the options to logs index
   */
  public async indexChainLogs(options: IndexChainLogsOptions): Promise<void> {
    const cachingStateKey = `chainLogs-${options.chain}`;
    const cachingState = await this.storages.database.find({
      collection: envConfig.mongodb.collections.caching.name,
      query: {
        name: cachingStateKey,
      },
    });

    let startBlock = options.fromBlock;
    if (cachingState) {
      startBlock = cachingState.blockNumber;
    }

    logger.info('start to index chain logs', {
      service: 'adapter.extended',
      chain: options.chain,
      signatures: options.signatures.length,
      fromBlock: startBlock,
      toBlock: options.toBlock,
    });

    const client = this.services.blockchain.evm.getPublicClient(options.chain);
    const blockRange = CustomQueryChainLogsBlockRange[options.chain]
      ? CustomQueryChainLogsBlockRange[options.chain]
      : DefaultQueryChainLogsBlockRange;
    while (startBlock < options.toBlock) {
      const toBlock = startBlock + blockRange > options.toBlock ? options.toBlock : startBlock + blockRange;

      const logs = await client.getLogs({
        fromBlock: BigInt(Number(startBlock)),
        toBlock: BigInt(Number(toBlock)),
      });

      const operations: Array<any> = logs
        .filter((log) => log.topics[0] && options.signatures.includes(log.topics[0].toString()))
        .map((log) => {
          return {
            updateOne: {
              filter: {
                chain: options.chain,
                address: normalizeAddress(log.address),
                transactionHash: log.transactionHash,
                logIndex: Number(log.logIndex),
              },
              update: {
                $set: {
                  chain: options.chain,
                  address: normalizeAddress(log.address),
                  transactionHash: log.transactionHash,
                  logIndex: Number(log.logIndex),
                  blockNumber: Number(log.blockNumber),
                  topics: log.topics,
                  data: log.data,
                },
              },
              upsert: true,
            },
          };
        });

      await this.storages.database.bulkWrite({
        collection: envConfig.mongodb.collections.contractLogs.name,
        operations: operations,
      });

      startBlock = toBlock + 1;

      await this.storages.database.update({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: cachingStateKey,
        },
        updates: {
          name: cachingStateKey,
          blockNumber: startBlock,
        },
        upsert: true,
      });
    }
  }
}
