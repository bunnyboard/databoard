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
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { ProtocolConfig, Token } from '../../../types/base';
import ProtocolAdapter from '../protocol';

export interface ReserveAndPrice {
  token: Token;
  price: number;
}

export interface ReserveData {
  token: Token;
  priceUsd: number;

  // getReserveData from DataProvider contract
  data: any;

  // getReserveConfigurationData from DataProvider contract
  configData: any;
}

export interface GetReserveDataOptions {
  config: AaveLendingMarketConfig;
  blockNumber: number;
  timestamp: number;
}

export default class AaveCore extends ProtocolAdapter {
  public readonly name: string = 'adapter.aave 👻';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getReservesList(options: GetReserveDataOptions): Promise<any> {
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

  public async getAllReserveData(options: GetReserveDataOptions): Promise<Array<ReserveData>> {
    const reserves: Array<ReserveData> = [];

    const reserveList: Array<string> | null = await this.getReservesList(options);
    if (reserveList && options.config.oracle) {
      const reserveOraclePrices = await this.services.blockchain.evm.readContract({
        chain: options.config.chain,
        abi: options.config.version === 1 ? AaveOracleV1Abi : AaveOracleV2Abi,
        target: options.config.oracle.address,
        method: 'getAssetsPrices',
        params: [reserveList],
        blockNumber: options.blockNumber,
      });

      for (let i = 0; i < reserveList.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: options.config.chain,
          address: reserveList[i],
        });
        if (token) {
          let tokenPriceUsd = 0;
          if (reserveOraclePrices && reserveOraclePrices[i]) {
            if (options.config.oracle.currency === 'eth') {
              const ethPrice = await this.services.oracle.getTokenPriceUsd({
                chain: 'ethereum',
                address: AddressZero,
                timestamp: options.timestamp,
              });
              if (ethPrice) {
                tokenPriceUsd = new BigNumber(reserveOraclePrices[i].toString())
                  .multipliedBy(new BigNumber(ethPrice))
                  .dividedBy(1e18)
                  .toNumber();
              }
            } else {
              tokenPriceUsd = formatBigNumberToNumber(
                reserveOraclePrices[i].toString(),
                options.config.oracle && options.config.oracle.decimals ? options.config.oracle.decimals : 8,
              );
            }
          } else {
            const priceRaw = await this.services.oracle.getTokenPriceUsd({
              chain: options.config.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            tokenPriceUsd = priceRaw ? Number(priceRaw) : 0;
          }

          const [reserveData, reserveConfigurationData] = await this.getReserveData(
            options.config,
            token.address,
            options.blockNumber,
          );

          reserves.push({
            token: token,
            priceUsd: tokenPriceUsd,
            data: reserveData,
            configData: reserveConfigurationData,
          });
        }
      }
    }

    return reserves;
  }

  public async getReserveData(
    config: AaveLendingMarketConfig,
    reserveAddress: string,
    blockNumber: number,
  ): Promise<any> {
    if (config.version === 1) {
      return await this.services.blockchain.evm.multicall({
        chain: config.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: AaveDataProviderV1Abi,
            target: config.dataProvider,
            method: 'getReserveData',
            params: [compareAddress(reserveAddress, AddressZero) ? AddressE : reserveAddress],
          },
          {
            abi: AaveDataProviderV1Abi,
            target: config.dataProvider,
            method: 'getReserveConfigurationData',
            params: [compareAddress(reserveAddress, AddressZero) ? AddressE : reserveAddress],
          },
        ],
      });
    } else if (config.version === 2) {
      return await this.services.blockchain.evm.multicall({
        chain: config.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: AaveDataProviderV2Abi,
            target: config.dataProvider,
            method: 'getReserveData',
            params: [reserveAddress],
          },
          {
            abi: AaveDataProviderV2Abi,
            target: config.dataProvider,
            method: 'getReserveConfigurationData',
            params: [reserveAddress],
          },
        ],
      });
    } else if (config.version === 3) {
      return await this.services.blockchain.evm.multicall({
        chain: config.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: AaveDataProviderV3Abi,
            target: config.dataProvider,
            method: 'getReserveData',
            params: [reserveAddress],
          },
          {
            abi: AaveDataProviderV3Abi,
            target: config.dataProvider,
            method: 'getReserveConfigurationData',
            params: [reserveAddress],
          },
        ],
      });
    }
  }
}
