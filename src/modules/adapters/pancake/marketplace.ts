import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { PancakenftProtocolConfig } from '../../../configs/protocols/pancake';
import MarketplaceAbi from '../../../configs/abi/pancake/ERC721NFTMarketV1.json';
import { AddressZero } from '../../../configs/constants';

const Events = {
  Trade: '0xdaac0e40b8f01e970d08d4e8ae57ac31a5845fffde104c43f05e19bbec78491e',
};

export default class PancakenftAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.pancakenft';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const pancakenftConfig = this.protocolConfig as PancakenftProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [pancakenftConfig.chain]: {
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
        [pancakenftConfig.chain]: {},
      },
    };

    if (pancakenftConfig.birthday > options.timestamp) {
      return null;
    }

    const bnbPriceUsd = await this.services.oracle.getCurrencyPriceUsd({
      currency: 'bnb',
      timestamp: options.timestamp,
    });

    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      pancakenftConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      pancakenftConfig.chain,
      options.endTime,
    );

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: pancakenftConfig.chain,
      address: pancakenftConfig.marketplace,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
      const event: any = decodeEventLog({
        abi: MarketplaceAbi,
        topics: log.topics,
        data: log.data,
      });

      const askPrice = formatBigNumberToNumber(event.args.askPrice.toString(), 18);
      const netPrice = formatBigNumberToNumber(event.args.netPrice.toString(), 18);
      const protocolFeeUsd = (askPrice - netPrice) * bnbPriceUsd;
      const salePriceUsd = askPrice * bnbPriceUsd;

      protocolData.totalFees += protocolFeeUsd;
      protocolData.protocolRevenue += protocolFeeUsd;
      (protocolData.volumes.marketplace as number) += salePriceUsd;

      // breakdown currency
      protocolData.breakdown[pancakenftConfig.chain][AddressZero].totalFees += protocolFeeUsd;
      protocolData.breakdown[pancakenftConfig.chain][AddressZero].protocolRevenue += protocolFeeUsd;
      (protocolData.breakdown[pancakenftConfig.chain][AddressZero].volumes.marketplace as number) += salePriceUsd;

      if (protocolData.breakdownCollectibles) {
        const collection = normalizeAddress(event.args.collection);
        if (!protocolData.breakdownCollectibles[pancakenftConfig.chain][collection]) {
          protocolData.breakdownCollectibles[pancakenftConfig.chain][collection] = {
            volumeTrade: 0,
            totalFees: 0,
            protocolFee: 0,
            royaltyFee: 0,
          };
        }
        protocolData.breakdownCollectibles[pancakenftConfig.chain][collection].volumeTrade += salePriceUsd;
        protocolData.breakdownCollectibles[pancakenftConfig.chain][collection].totalFees += protocolFeeUsd;
        protocolData.breakdownCollectibles[pancakenftConfig.chain][collection].protocolFee += protocolFeeUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
