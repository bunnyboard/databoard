import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { BlurProtocolConfig } from '../../../configs/protocols/blur';
import MarketplaceV1Abi from '../../../configs/abi/blur/BlurExchange.json';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { AddressZero } from '../../../configs/constants';
import { ChainNames } from '../../../configs/names';
import BlurMarketplaceLibs from './libs';
import logger from '../../../lib/logger';

const v1Events = {
  OrdersMatched: '0x61cbb2a3dee0b6064c2e681aadd61677fb4ef319f0b547508d495626f5a62f64',
};

const v2Events = {
  Execution: '0xf2f66294df6fae7ac681cbe2f6d91c6904485929679dce263e8f6539b7d5c559',
  Execution721Packed: '0x1d5e12b51dee5e4d34434576c3fb99714a85f57b0fd546ada4b0bddd736d12b2',
  Execution721MakerFeePacked: '0x7dc5c0699ac8dd5250cbe368a2fc3b4a2daadb120ad07f6cccea29f83482686e',
  // Execution721TakerFeePacked: '0x0fcf17fac114131b10f37b183c6a60f905911e52802caeeb3e6ea210398b81ab',
};

export default class BlurAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.blur';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const blurConfig = this.protocolConfig as BlurProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [ChainNames.ethereum]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            royaltyRevenue: 0,
            volumes: {
              marketplace: 0,
            },
          },
        },
        [ChainNames.blast]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            royaltyRevenue: 0,
            volumes: {
              marketplace: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      royaltyRevenue: 0,
      volumes: {
        marketplace: 0,
      },
      breakdownCollectibles: {
        [ChainNames.ethereum]: {},
        [ChainNames.blast]: {},
      },
    };

    if (blurConfig.birthday > options.timestamp) {
      return null;
    }

    const ethPriceUsd = await this.services.oracle.getCurrencyPriceUsd({
      currency: 'eth',
      timestamp: options.timestamp,
    });

    //
    // marketplace v1 on ethereum
    //
    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      blurConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      blurConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(blurConfig.chain, options.endTime);

    const getBidPoolBalance = await this.getAddressBalanceUsd({
      chain: blurConfig.chain,
      ownerAddress: blurConfig.bidPool,
      tokens: [
        {
          chain: blurConfig.chain,
          symbol: 'ETH',
          decimals: 18,
          address: AddressZero,
        },
      ],
      blockNumber: blockNumber,
      timestamp: options.timestamp,
    });
    protocolData.totalAssetDeposited += getBidPoolBalance.totalBalanceUsd;
    protocolData.totalValueLocked += getBidPoolBalance.totalBalanceUsd;

    const v1Logs = await this.services.blockchain.evm.getContractLogs({
      chain: blurConfig.chain,
      address: blurConfig.marketplaceV1,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of v1Logs.filter((log) => Object.values(v1Events).includes(log.topics[0]))) {
      const event: any = decodeEventLog({
        abi: MarketplaceV1Abi,
        topics: log.topics,
        data: log.data,
      });

      const priceUsd = formatBigNumberToNumber(event.args.sell.price.toString(), 18) * ethPriceUsd;
      let royalFeeUsd = 0;
      for (const feeItem of event.args.sell.fees) {
        // https://etherscan.io/address/0x983e96c26782a8db500a6fb8ab47a52e1b44862d#code#F1#L73
        royalFeeUsd += formatBigNumberToNumber(feeItem.rate.toString(), 4) * priceUsd;
      }

      // no marketplace protocol fee
      protocolData.totalFees += royalFeeUsd;
      (protocolData.royaltyRevenue as number) += royalFeeUsd;
      (protocolData.volumes.marketplace as number) += priceUsd;
      protocolData.breakdown[blurConfig.chain][AddressZero].totalFees += royalFeeUsd;
      (protocolData.breakdown[blurConfig.chain][AddressZero].royaltyRevenue as number) += royalFeeUsd;
      (protocolData.breakdown[blurConfig.chain][AddressZero].volumes.marketplace as number) += priceUsd;

      const collection = normalizeAddress(event.args.sell.collection);
      if (protocolData.breakdownCollectibles) {
        if (!protocolData.breakdownCollectibles[blurConfig.chain][collection]) {
          protocolData.breakdownCollectibles[blurConfig.chain][collection] = {
            volumeTrade: 0,
            totalFees: 0,
            protocolFee: 0,
            royaltyFee: 0,
          };
        }
        protocolData.breakdownCollectibles[blurConfig.chain][collection].volumeTrade += priceUsd;
        protocolData.breakdownCollectibles[blurConfig.chain][collection].totalFees += royalFeeUsd;
        protocolData.breakdownCollectibles[blurConfig.chain][collection].royaltyFee += royalFeeUsd;
      }
    }

    //
    // marketplaces v2 on ethereum and blast
    //
    for (const v2Config of blurConfig.marketplaceV2) {
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        v2Config.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(v2Config.chain, options.endTime);

      const v2Logs = await this.services.blockchain.evm.getContractLogs({
        chain: v2Config.chain,
        address: v2Config.marketplace,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of v2Logs.filter((log) => Object.values(v2Events).includes(log.topics[0]))) {
        try {
          const result = BlurMarketplaceLibs.decodeEventPacked({
            log: log,
          });

          protocolData.totalFees += result.totalRoyalFeeEth * ethPriceUsd;
          (protocolData.royaltyRevenue as number) += result.totalRoyalFeeEth * ethPriceUsd;
          (protocolData.volumes.marketplace as number) += result.totalVolumeEth * ethPriceUsd;

          protocolData.breakdown[v2Config.chain][AddressZero].totalFees += result.totalRoyalFeeEth * ethPriceUsd;
          (protocolData.breakdown[v2Config.chain][AddressZero].royaltyRevenue as number) +=
            result.totalRoyalFeeEth * ethPriceUsd;
          (protocolData.breakdown[v2Config.chain][AddressZero].volumes.marketplace as number) +=
            result.totalVolumeEth * ethPriceUsd;

          // breakdown by collections
          if (protocolData.breakdownCollectibles) {
            for (const [collection, metrics] of Object.entries(result.collections)) {
              if (!protocolData.breakdownCollectibles[v2Config.chain][collection]) {
                protocolData.breakdownCollectibles[v2Config.chain][collection] = {
                  volumeTrade: 0,
                  totalFees: 0,
                  protocolFee: 0,
                  royaltyFee: 0,
                };
              }
              protocolData.breakdownCollectibles[v2Config.chain][collection].volumeTrade +=
                metrics.voumeEth * ethPriceUsd;
              protocolData.breakdownCollectibles[v2Config.chain][collection].totalFees +=
                metrics.royalFeeEth * ethPriceUsd;
              protocolData.breakdownCollectibles[v2Config.chain][collection].royaltyFee +=
                metrics.royalFeeEth * ethPriceUsd;
            }
          }
        } catch (e: any) {
          logger.warn('failed to decode blur trade txn', {
            service: this.name,
            chain: v2Config.chain,
            txn: log.transactionHash,
          });
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
