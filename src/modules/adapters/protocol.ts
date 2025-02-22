import { AddressE, AddressF, AddressZero, TimeUnits } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import {
  compareAddress,
  formatBigNumberToNumber,
  getDateString,
  getStartDayTimestamp,
  getTimestamp,
  getTodayUTCTimestamp,
  normalizeAddress,
} from '../../lib/utils';
import { ContractCall } from '../../services/blockchains/domains';
import ExecuteSession from '../../services/executeSession';
import { ProtocolConfig } from '../../types/base';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import {
  GetAddressBalanceUsdOptions,
  GetAddressBalanceUsdResult,
  GetChainLogsOptions,
  GetProtocolDataOptions,
  IndexContracLogsOptions,
  RunAdapterOptions,
  TestAdapterOptions,
} from '../../types/options';
import Erc20Abi from '../../configs/abi/ERC20.json';
import { CustomQueryChainLogsBlockRange, DefaultQueryChainLogsBlockRange } from '../../configs';

export default class ProtocolAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  public protocolConfig: ProtocolConfig;

  public executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    this.services = services;
    this.storages = storages;
    this.protocolConfig = protocolConfig;
    this.executeSession = new ExecuteSession();
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<any | null> {
    return null;
  }

  public async getAddressBalanceUsd(options: GetAddressBalanceUsdOptions): Promise<GetAddressBalanceUsdResult> {
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

  public async run(options: RunAdapterOptions): Promise<void> {
    //
    // collect current state data
    //
    if (!options.service || options.service === 'state') {
      this.executeSession.startSession('start to update protocol current data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
      });

      const currentTimestamp = getTimestamp();
      const last24HoursTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
      const last48HoursTimestamp = last24HoursTimestamp - TimeUnits.SecondsPerDay;

      const last24HoursData = await this.getProtocolData({
        timestamp: currentTimestamp,
        beginTime: last24HoursTimestamp,
        endTime: currentTimestamp,
      });
      const last48HoursData = await this.getProtocolData({
        timestamp: last24HoursTimestamp,
        beginTime: last48HoursTimestamp,
        endTime: last24HoursTimestamp,
      });
      if (last24HoursData) {
        if (last48HoursData) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.protocolDataStates.name,
            keys: {
              protocol: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
              last24HoursData: last48HoursData,
            },
            upsert: true,
          });
        } else {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.protocolDataStates.name,
            keys: {
              protocol: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
            },
            upsert: true,
          });
        }
      }

      this.executeSession.endSession('updated current data for protocol', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
      });
    }

    //
    // collect snapshots
    //
    if (!options.service || options.service === 'snapshot') {
      const currentTimestamp = getTimestamp();
      let startTime = options.fromTime ? options.fromTime : this.protocolConfig.birthday;

      // we make sure startTime is start day (00:00 UTC+0) timestamp
      startTime = getStartDayTimestamp(startTime);

      if (!options.force) {
        // we find the latest snapshot timestamp
        const latestSnapshot = (
          await this.storages.database.query({
            collection: envConfig.mongodb.collections.protocolDataSnapshots.name,
            query: {
              protocol: this.protocolConfig.protocol,
            },
            options: {
              limit: 1,
              skip: 0,
              order: { timestamp: -1 },
            },
          })
        )[0];
        if (latestSnapshot) {
          startTime = latestSnapshot.timestamp;
        }
      }

      const todayTimestamp = getTodayUTCTimestamp();
      logger.info('start to update protocol snapshots data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        fromDate: getDateString(startTime),
        toDate: getDateString(todayTimestamp),
      });

      while (startTime <= todayTimestamp) {
        this.executeSession.startSession('start to update protocol snapshot', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          date: getDateString(startTime),
        });

        let endTime = startTime + TimeUnits.SecondsPerDay - 1;
        if (endTime > currentTimestamp) {
          endTime = currentTimestamp;
        }

        const dataTimeframe24Hours = await this.getProtocolData({
          timestamp: startTime,
          beginTime: startTime,
          endTime: endTime,
        });
        if (dataTimeframe24Hours) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.protocolDataSnapshots.name,
            keys: {
              protocol: dataTimeframe24Hours.protocol,
              timestamp: dataTimeframe24Hours.timestamp,
            },
            updates: {
              ...dataTimeframe24Hours,
            },
            upsert: true,
          });
        }

        this.executeSession.endSession('updated snapshot data for protocol', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          date: getDateString(startTime),
        });

        startTime += TimeUnits.SecondsPerDay;
      }
    }
  }

  public async indexChainLogs(options: GetChainLogsOptions): Promise<void> {
    const syncBlocksRanges: Array<{
      fromBlock: number;
      toBlock: number;
    }> = [];

    for (let indexBlock = options.fromBlock; indexBlock <= options.toBlock; indexBlock++) {
      const blockLogs = await this.storages.database.find({
        collection: envConfig.mongodb.collections.blockLogs.name,
        query: {
          chain: options.chain,
          number: indexBlock,
        },
      });
      if (!blockLogs) {
        const blockRange = {
          fromBlock: indexBlock,
          toBlock: indexBlock,
        };

        let indexToBlock = indexBlock + 1;
        let toBlockLogs: any = null;
        while (!toBlockLogs) {
          toBlockLogs = await this.storages.database.find({
            collection: envConfig.mongodb.collections.blockLogs.name,
            query: {
              chain: options.chain,
              number: indexToBlock,
            },
          });

          if (indexToBlock === options.toBlock) {
            break;
          }

          indexToBlock += 1;
        }

        blockRange.toBlock = indexToBlock;

        syncBlocksRanges.push(blockRange);

        indexBlock = indexToBlock;
      }
    }

    for (const blockRange of syncBlocksRanges) {
      await this._indexChainLogs({
        chain: options.chain,
        fromBlock: blockRange.fromBlock,
        toBlock: blockRange.toBlock,
      });
    }
  }

  private async _indexChainLogs(options: GetChainLogsOptions): Promise<void> {
    // custom config for every chain if possible
    const blockRange = CustomQueryChainLogsBlockRange[options.chain]
      ? CustomQueryChainLogsBlockRange[options.chain]
      : DefaultQueryChainLogsBlockRange;

    const client = this.services.blockchain.evm.getPublicClient(options.chain);

    // caching for logging
    let lastProgressPercentage = 0;
    let indexBlock = options.fromBlock;
    while (indexBlock <= options.toBlock) {
      const toBlock = indexBlock + blockRange > options.toBlock ? options.toBlock : indexBlock + blockRange;

      const logs = await client.getLogs({
        fromBlock: BigInt(indexBlock),
        toBlock: BigInt(toBlock),
      });

      for (let blockNumber = indexBlock; blockNumber <= toBlock; blockNumber++) {
        const blockLogs = logs
          .filter((log) => Number(log.blockNumber) === blockNumber)
          .map((log) => {
            return {
              chain: options.chain,
              address: normalizeAddress(log.address),
              transactionHash: log.transactionHash,
              logIndex: Number(log.logIndex),
              blockNumber: Number(log.blockNumber),
              topics: log.topics,
              data: log.data,
            };
          });

        await this.storages.database.update({
          collection: envConfig.mongodb.collections.blockLogs.name,
          keys: {
            chain: options.chain,
            number: blockNumber,
          },
          updates: {
            chain: options.chain,
            number: blockNumber,
            logs: blockLogs,
          },
          upsert: true,
        });
      }

      const processBlocks = toBlock - options.fromBlock;
      const progress = (processBlocks / (options.toBlock - options.fromBlock)) * 100;

      // less logs
      if (progress - lastProgressPercentage >= 5) {
        logger.debug('get and index chain logs', {
          service: this.name,
          chain: options.chain,
          blocks: `${indexBlock}->${options.toBlock}`,
          progress: `${progress.toFixed(2)}%`,
        });
        lastProgressPercentage = progress;
      }

      indexBlock = toBlock + 1;
    }
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const current = getTimestamp();
    const fromTime = options.timestamp ? options.timestamp : current - TimeUnits.SecondsPerDay;
    const toTime = options.timestamp ? options.timestamp + TimeUnits.SecondsPerDay : current;

    if (options.output === 'json') {
      console.log(
        JSON.stringify(
          await this.getProtocolData({
            timestamp: fromTime,
            beginTime: fromTime,
            endTime: toTime,
          }),
        ),
      );
    } else {
      logger.inspect(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
  }
}
