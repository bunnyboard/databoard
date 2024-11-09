import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import AaveAdapter from '../aave/aave';
import { GetReserveDataOptions, ReserveData } from '../aave/core';
import AaveOracleV1Abi from '../../../configs/abi/aave/OracleV1.json';
import AaveOracleV2Abi from '../../../configs/abi/aave/OracleV2.json';
import { AddressZero } from '../../../configs/constants';
import BigNumber from 'bignumber.js';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { ChainNames } from '../../../configs/names';

// fork AaveAdapter to fix the Avalon oracle contract wrong data
export default class AvalonAdapter extends AaveAdapter {
  public readonly name: string = 'adapter.avalon';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getAllReserveData(options: GetReserveDataOptions): Promise<Array<ReserveData>> {
    const reserves: Array<ReserveData> = [];

    const reserveList: Array<string> | null = await this.getReservesList(options);
    if (reserveList && options.config.oracle) {
      let reserveOraclePrices = await this.services.blockchain.evm.readContract({
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
              const ethPrice = await this.services.oracle.getTokenPriceUsdRounded({
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
            tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: options.config.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
          }

          const [reserveData, reserveConfigurationData] = await this.getReserveData(
            options.config,
            token.address,
            options.blockNumber,
          );

          // fix avalon oracle
          if (
            options.config.chain === ChainNames.merlin &&
            options.timestamp === 1719878400 &&
            (compareAddress(token.address, '0x69181a1f082ea83a152621e4fa527c936abfa501') ||
              compareAddress(token.address, '0x4dcb91cc19aadfe5a6672781eb09abad00c19e4c'))
          ) {
            reserves.push({
              token: token,
              priceUsd: 0,
              data: reserveData,
              configData: reserveConfigurationData,
            });
          } else {
            reserves.push({
              token: token,
              priceUsd: tokenPriceUsd,
              data: reserveData,
              configData: reserveConfigurationData,
            });
          }
        }
      }
    }

    return reserves;
  }
}
