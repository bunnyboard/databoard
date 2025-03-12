import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { SuperrareProtocolConfig } from '../../../configs/protocols/superrare';
import MarketplaceAbi from '../../../configs/abi/superrare/Marketplace.json';
import { formatBigNumberToNumber } from '../../../lib/utils';

const Events = {
  Sold: '0x6f9e7bc841408072f4a49e469f90e1a634b85251803662bc8e5c220b28782472',
  AuctionSettled: '0xef4e2262a841641690bb931801dc0d1923e6b417cd217f91f8049d8aa9f5f086',
  AcceptOffer: '0x97c3d2068ce177bc33d84acecc45eededcf298c4a9d4340ae03d4afbb3993f7b',
};

export default class SuperrareAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.superrare';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const superrareConfig = this.protocolConfig as SuperrareProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [superrareConfig.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumeMarketplace: {
        sale: 0,
      },
    };

    if (superrareConfig.birthday > options.timestamp) {
      return null;
    }

    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      superrareConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      superrareConfig.chain,
      options.endTime,
    );

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: superrareConfig.chain,
      address: superrareConfig.marketplace,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
      const event: any = decodeEventLog({
        abi: MarketplaceAbi,
        topics: log.topics,
        data: log.data,
      });

      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: superrareConfig.chain,
        address: event.args._currencyAddress,
      });

      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const amountUsd = formatBigNumberToNumber(event.args._amount.toString(), token.decimals) * tokenPriceUsd;

        // https://docs.rare.xyz/for-developers/core-protocol/auxiliary-contracts#marketplace-settings
        const feeUsd = amountUsd * 0.15;

        protocolData.totalFees += feeUsd;
        protocolData.protocolRevenue += feeUsd;
        (protocolData.volumeMarketplace as any).sale += amountUsd;
        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumeMarketplace: {
              sale: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalFees += feeUsd;
        protocolData.breakdown[token.chain][token.address].protocolRevenue += feeUsd;
        (protocolData.breakdown[token.chain][token.address].volumeMarketplace as any).sale += amountUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
