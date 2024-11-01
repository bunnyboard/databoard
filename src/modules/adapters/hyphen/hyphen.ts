import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { HyphenProtocolConfig } from '../../../configs/protocols/hyphen';
import { decodeEventLog } from 'viem';
import LiquidityPoolAbi from '../../../configs/abi/hyphen/LiquidityPool.json';
import LiquidityProvidersAbi from '../../../configs/abi/hyphen/LiquidityProviders.json';
import { getChainNameById } from '../../../lib/helpers';

const LiquidityPoolEvents: any = {
  LiquidityAdded: '0xa21288bdd948f634bcd5a8bfc9825db1b01914f370ef82149e123b7c8dc3b65b',
  LiquidityRemoved: '0x70516e69d9b3069ff3184583d867f7a832772e850ba89b554ae06ff752474f9e',

  // count fees
  AssetSent: '0x6bfd5ee5792d66b151a3fab9f56ee828a0f1c3216d4b752e267cd5590326b15c',

  // count bridge volumes
  Deposit: '0x522e11fa05593b306c8df10d2b0b8e01eec48f9d0a9427a7a93f21ff90d66fb1',
  DepositAndSwap: '0xe0c1647854700a22165488c301138e1e29036e60ec14c1e78653b1e0c918f874',
};

export default class HyphenAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.hphen';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {},
      totalSupplied: 0,
    };

    const hyphenConfig = this.protocolConfig as HyphenProtocolConfig;
    for (const liquidityPoolConfig of hyphenConfig.liquidityPools) {
      if (liquidityPoolConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[liquidityPoolConfig.chain]) {
        protocolData.breakdown[liquidityPoolConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[liquidityPoolConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[liquidityPoolConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        liquidityPoolConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        liquidityPoolConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        liquidityPoolConfig.chain,
        options.endTime,
      );

      // count total value locked
      const getBalanceUsdResult = await this.getAddressBalanceUsd({
        chain: liquidityPoolConfig.chain,
        ownerAddress: liquidityPoolConfig.liquidityPool,
        tokens: liquidityPoolConfig.tokens,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceUsdResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceUsdResult.totalBalanceUsd;
      (protocolData.totalSupplied as number) += getBalanceUsdResult.totalBalanceUsd;

      for (const [tokenAddress, balanceAndPrice] of Object.entries(getBalanceUsdResult.tokenBalanceUsds)) {
        if (!protocolData.breakdown[liquidityPoolConfig.chain][tokenAddress]) {
          protocolData.breakdown[liquidityPoolConfig.chain][tokenAddress] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              bridge: 0,
            },
          };
        }
        protocolData.breakdown[liquidityPoolConfig.chain][tokenAddress].totalAssetDeposited +=
          balanceAndPrice.balanceUsd;
        protocolData.breakdown[liquidityPoolConfig.chain][tokenAddress].totalValueLocked += balanceAndPrice.balanceUsd;
        (protocolData.breakdown[liquidityPoolConfig.chain][tokenAddress].totalSupplied as number) +=
          balanceAndPrice.balanceUsd;
      }

      const liquidityPoolLogs = await this.services.blockchain.evm.getContractLogs({
        chain: liquidityPoolConfig.chain,
        address: liquidityPoolConfig.liquidityPool,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      const liquidityProvidersLogs = await this.services.blockchain.evm.getContractLogs({
        chain: liquidityPoolConfig.chain,
        address: liquidityPoolConfig.liquidityProviders,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of liquidityPoolLogs.concat(liquidityProvidersLogs)) {
        const signature = log.topics[0];
        if (
          signature === LiquidityPoolEvents.Deposit ||
          signature === LiquidityPoolEvents.DepositAndSwap ||
          signature === LiquidityPoolEvents.AssetSent
        ) {
          const event: any = decodeEventLog({
            abi: LiquidityPoolAbi,
            topics: log.topics,
            data: log.data,
          });
          if (signature === LiquidityPoolEvents.AssetSent) {
            // count fees
            const token = liquidityPoolConfig.tokens.filter((item) =>
              compareAddress(item.address, event.args.asset),
            )[0];
            if (token) {
              const tokenPriceUsd = getBalanceUsdResult.tokenBalanceUsds[token.address]
                ? getBalanceUsdResult.tokenBalanceUsds[token.address].priceUsd
                : 0;

              const lpFeeUsd = formatBigNumberToNumber(event.args.lpFee.toString(), token.decimals) * tokenPriceUsd;
              const transferFeeUsd =
                formatBigNumberToNumber(event.args.transferFee.toString(), token.decimals) * tokenPriceUsd;

              protocolData.totalFees += lpFeeUsd + transferFeeUsd;
              protocolData.supplySideRevenue += lpFeeUsd;
              protocolData.protocolRevenue += transferFeeUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  totalSupplied: 0,
                  volumes: {
                    deposit: 0,
                    withdraw: 0,
                    bridge: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalFees += lpFeeUsd + transferFeeUsd;
              protocolData.breakdown[token.chain][token.address].supplySideRevenue += lpFeeUsd;
              protocolData.breakdown[token.chain][token.address].protocolRevenue += transferFeeUsd;
            }
          } else {
            // count volumes
            const token = liquidityPoolConfig.tokens.filter((item) =>
              compareAddress(item.address, event.args.tokenAddress),
            )[0];
            if (token) {
              const destChainName = getChainNameById(Number(event.args.toChainId));
              if (destChainName) {
                const tokenPriceUsd = getBalanceUsdResult.tokenBalanceUsds[token.address]
                  ? getBalanceUsdResult.tokenBalanceUsds[token.address].priceUsd
                  : 0;

                const bridgeAmountUsd =
                  formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

                (protocolData.volumes.bridge as number) += bridgeAmountUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    totalSupplied: 0,
                    volumes: {
                      deposit: 0,
                      withdraw: 0,
                      bridge: 0,
                    },
                  };
                }
                (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += bridgeAmountUsd;

                if (!(protocolData.volumeBridgePaths as any)[liquidityPoolConfig.chain][destChainName]) {
                  (protocolData.volumeBridgePaths as any)[liquidityPoolConfig.chain][destChainName] = 0;
                }
                (protocolData.volumeBridgePaths as any)[liquidityPoolConfig.chain][destChainName] += bridgeAmountUsd;
              }
            }
          }
        } else if (
          signature === LiquidityPoolEvents.LiquidityAdded ||
          signature === LiquidityPoolEvents.LiquidityRemoved
        ) {
          const event: any = decodeEventLog({
            abi: LiquidityProvidersAbi,
            topics: log.topics,
            data: log.data,
          });
          const token = liquidityPoolConfig.tokens.filter((item) =>
            compareAddress(item.address, event.args.tokenAddress),
          )[0];
          if (token) {
            const tokenPriceUsd = getBalanceUsdResult.tokenBalanceUsds[token.address]
              ? getBalanceUsdResult.tokenBalanceUsds[token.address].priceUsd
              : 0;
            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                volumes: {
                  deposit: 0,
                  withdraw: 0,
                  bridge: 0,
                },
              };
            }

            if (signature === LiquidityPoolEvents.LiquidityAdded) {
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

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
