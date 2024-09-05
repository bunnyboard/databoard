import { AaveLendingMarketConfig } from '../../../configs/protocols/aave';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import AaveLendingPoolV1Abi from '../../../configs/abi/aave/LendingPoolV1.json';
import AaveLendingPoolV2Abi from '../../../configs/abi/aave/LendingPoolV2.json';
import AaveOracleV1Abi from '../../../configs/abi/aave/OracleV1.json';
import AaveOracleV2Abi from '../../../configs/abi/aave/OracleV2.json';
import AaveDataProviderV1Abi from '../../../configs/abi/aave/DataProviderV1.json';
import AaveDataProviderV2Abi from '../../../configs/abi/aave/DataProviderV2.json';
import AaveDataProviderV3Abi from '../../../configs/abi/aave/DataProviderV3.json';
import { AddressE, AddressZero } from '../../../configs/constants';
import BigNumber from 'bignumber.js';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/base';
import ProtocolAdapter from '../protocol';

export interface AaveMarketRates {
  supply: string;
  borrow: string;
  borrowStable: string;
}

export interface ReserveAndPrice {
  token: Token;
  price: number;
}

export interface AaveHelperGetReserveListOptions {
  config: AaveLendingMarketConfig;
  blockNumber: number;
}

export interface AaveHelperGetReservesAndPricesOptions {
  config: AaveLendingMarketConfig;
  blockNumber: number;
  timestamp: number;
}

export interface AaveHelperGetReserveDataOptions {
  config: AaveLendingMarketConfig;
  blockNumber: number;
  reserveAddress: string;
}

export interface AaveHelperGetIncentiveRewardDataOptions {
  config: AaveLendingMarketConfig;
  blockNumber: number;
  reserveAddress: string;
}

export default class AaveCore extends ProtocolAdapter {
  public readonly name: string = 'adapter.aave 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getReservesList(options: AaveHelperGetReserveListOptions): Promise<any> {
    if (options.config.version === 1) {
      return await this.services.blockchain.evm.readContract({
        chain: options.config.chain,
        abi: AaveLendingPoolV1Abi,
        target: options.config.lendingPool,
        method: 'getReserves',
        params: [],
        blockNumber: options.blockNumber,
      });
    } else {
      // using the same method for vewrsion 2, 3
      return await this.services.blockchain.evm.readContract({
        chain: options.config.chain,
        abi: AaveLendingPoolV2Abi,
        target: options.config.lendingPool,
        method: 'getReservesList',
        params: [],
        blockNumber: options.blockNumber,
      });
    }
  }

  public async getReservesAndPrices(options: AaveHelperGetReservesAndPricesOptions): Promise<Array<ReserveAndPrice>> {
    const reservesAndPrices: Array<ReserveAndPrice> = [];

    let reserveList: Array<string> = await this.getReservesList({
      config: options.config,
      blockNumber: options.blockNumber,
    });

    if (options.config.blacklists) {
      // remove ignored tokens and reserves
      reserveList = reserveList.filter(
        (reserve) => options.config.blacklists && !options.config.blacklists[normalizeAddress(reserve)],
      );
    }

    if (reserveList && options.config.oracle) {
      const reservePrices = await this.services.blockchain.evm.readContract({
        chain: options.config.chain,
        abi: options.config.version === 1 ? AaveOracleV1Abi : AaveOracleV2Abi,
        target: options.config.oracle.address,
        method: 'getAssetsPrices',
        params: [reserveList],
        blockNumber: options.blockNumber,
      });
      if (reservePrices) {
        // can get token price directly from aave oracle
        for (let i = 0; i < reserveList.length; i++) {
          let price = null;
          if (reservePrices[i]) {
            if (options.config.oracle.currency === 'eth') {
              const ethPrice = await this.services.oracle.getTokenPriceUsd({
                chain: 'ethereum',
                address: AddressZero,
                timestamp: options.timestamp,
              });
              if (ethPrice) {
                price = new BigNumber(reservePrices[i].toString())
                  .multipliedBy(new BigNumber(ethPrice))
                  .dividedBy(1e18)
                  .toString(10);
              }
            } else {
              price = formatBigNumberToString(
                reservePrices[i].toString(),
                options.config.oracle && options.config.oracle.decimals ? options.config.oracle.decimals : 8,
              );
            }
          }

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: options.config.chain,
            address: reserveList[i],
          });
          if (!token) {
            continue;
          }

          reservesAndPrices.push({
            token: token,
            price: price ? Number(price) : 0,
          });
        }
      } else {
        // must get token prices from external sources
        for (let i = 0; i < reserveList.length; i++) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: options.config.chain,
            address: reserveList[i],
          });
          if (!token) {
            continue;
          }
          const tokenPrice = await this.services.oracle.getTokenPriceUsd({
            chain: options.config.chain,
            address: reserveList[i],
            timestamp: options.timestamp,
          });

          reservesAndPrices.push({
            token: token,
            price: tokenPrice ? Number(tokenPrice) : 0,
          });
        }
      }
    }

    return reservesAndPrices;
  }

  public async getReserveData(options: AaveHelperGetReserveDataOptions): Promise<any> {
    if (options.config.version === 1) {
      return await this.services.blockchain.evm.multicall({
        chain: options.config.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: AaveDataProviderV1Abi,
            target: options.config.dataProvider,
            method: 'getReserveData',
            params: [compareAddress(options.reserveAddress, AddressZero) ? AddressE : options.reserveAddress],
          },
          {
            abi: AaveDataProviderV1Abi,
            target: options.config.dataProvider,
            method: 'getReserveConfigurationData',
            params: [compareAddress(options.reserveAddress, AddressZero) ? AddressE : options.reserveAddress],
          },
        ],
      });
    } else if (options.config.version === 2) {
      return await this.services.blockchain.evm.multicall({
        chain: options.config.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: AaveDataProviderV2Abi,
            target: options.config.dataProvider,
            method: 'getReserveData',
            params: [options.reserveAddress],
          },
          {
            abi: AaveDataProviderV2Abi,
            target: options.config.dataProvider,
            method: 'getReserveConfigurationData',
            params: [options.reserveAddress],
          },
        ],
      });
    } else if (options.config.version === 3) {
      return await this.services.blockchain.evm.multicall({
        chain: options.config.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: AaveDataProviderV3Abi,
            target: options.config.dataProvider,
            method: 'getReserveData',
            params: [options.reserveAddress],
          },
          {
            abi: AaveDataProviderV3Abi,
            target: options.config.dataProvider,
            method: 'getReserveConfigurationData',
            params: [options.reserveAddress],
          },
        ],
      });
    }
  }
}
