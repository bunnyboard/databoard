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
} from '../../lib/utils';
import { ContractCall } from '../../services/blockchains/domains';
import ExecuteSession from '../../services/executeSession';
import { ProtocolConfig, Token } from '../../types/base';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../types/namespaces';
import { GetProtocolDataOptions, RunAdapterOptions, TestAdapterOptions } from '../../types/options';
import Erc20Abi from '../../configs/abi/ERC20.json';

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

  public async run(options: RunAdapterOptions): Promise<void> {
    //
    // collect current state data
    //
    if (!options.service || options.service === 'state') {
      this.executeSession.startSession('start to update protocol current data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        category: this.protocolConfig.category,
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
        category: this.protocolConfig.category,
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
        category: this.protocolConfig.category,
        fromDate: getDateString(startTime),
        toDate: getDateString(todayTimestamp),
      });

      while (startTime <= todayTimestamp) {
        this.executeSession.startSession('start to update protocol snapshot', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          category: this.protocolConfig.category,
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
          category: this.protocolConfig.category,
          date: getDateString(startTime),
        });

        startTime += TimeUnits.SecondsPerDay;
      }
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
      console.log(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
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

        if (token && results[i] && results[i].toString() !== '0') {
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
}
