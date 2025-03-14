import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import SeaportAbi from '../../../configs/abi/opensea/Seaport.json';
import { OpenseaProtocolConfig } from '../../../configs/protocols/opensea';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';

const Events = {
  OrderFulfilled: '0x9d9af8e38d66c62e2c12f0225249fd9d721c54b83f48d9352c97c6cacdcb6f31',
};

export default class OpenseaAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.opensea';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      royaltyRevenue: 0,
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        marketplace: 0,
      },
      breakdownCollectibles: {},
    };

    const openseaConfig = this.protocolConfig as OpenseaProtocolConfig;
    for (const seaportConfig of openseaConfig.seaports) {
      if (seaportConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[seaportConfig.chain]) {
        protocolData.breakdown[seaportConfig.chain] = {};
      }
      if (protocolData.breakdownCollectibles) {
        if (!protocolData.breakdownCollectibles[seaportConfig.chain]) {
          protocolData.breakdownCollectibles[seaportConfig.chain] = {};
        }
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        seaportConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        seaportConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: seaportConfig.chain,
        address: seaportConfig.seaport,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs.filter((log) => log.topics[0] === Events.OrderFulfilled)) {
        const event: any = decodeEventLog({
          abi: SeaportAbi,
          topics: log.topics,
          data: log.data,
        });

        const offerer = event.args.offerer;
        const recipient = event.args.recipient;

        let collection: string | null = null;
        let totalVolumeUsd: number = 0;
        let totalProtocolFeeUsd: number = 0;
        let totalRoyaltyFeeUsd: number = 0;
        for (const conduitItem of event.args.offer.concat(event.args.consideration)) {
          // native ETH or ERC20 tokens
          // https://etherscan.io/address/0x00000000006c3852cbef3e08e8df289169ede581#code#F11#L5
          if (conduitItem.itemType === 0 || conduitItem.itemType === 1) {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: seaportConfig.chain,
              address: conduitItem.token,
            });
            if (token) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });

              const tokenAmountUsd =
                formatBigNumberToNumber(conduitItem.amount.toString(), token.decimals) * tokenPriceUsd;

              totalVolumeUsd += tokenAmountUsd;

              let protocolFeeUsd = 0;
              let royaltyFeeUsd = 0;
              if (conduitItem.recipient) {
                if (openseaConfig.feeRecipients.includes(normalizeAddress(conduitItem.recipient))) {
                  protocolFeeUsd = tokenAmountUsd;
                } else if (
                  !compareAddress(conduitItem.recipient, offerer) &&
                  !compareAddress(conduitItem.recipient, recipient)
                ) {
                  royaltyFeeUsd = tokenAmountUsd;
                }
              }

              totalProtocolFeeUsd += protocolFeeUsd;
              totalRoyaltyFeeUsd += royaltyFeeUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  royaltyRevenue: 0,
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    marketplace: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalFees += protocolFeeUsd + royaltyFeeUsd;
              protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;
              (protocolData.breakdown[token.chain][token.address].royaltyRevenue as number) += royaltyFeeUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.marketplace as number) += tokenAmountUsd;
            }
          } else {
            collection = normalizeAddress(conduitItem.token);
          }
        }

        protocolData.totalFees += totalProtocolFeeUsd + totalRoyaltyFeeUsd;
        protocolData.protocolRevenue += totalProtocolFeeUsd;
        (protocolData.royaltyRevenue as number) += totalRoyaltyFeeUsd;
        (protocolData.volumes.marketplace as number) += totalVolumeUsd;

        if (protocolData.breakdownCollectibles && collection && totalVolumeUsd > 0) {
          if (!protocolData.breakdownCollectibles[seaportConfig.chain][collection]) {
            protocolData.breakdownCollectibles[seaportConfig.chain][collection] = {
              volumeTrade: 0,
              totalFees: 0,
              protocolFee: 0,
              royaltyFee: 0,
            };
          }
          protocolData.breakdownCollectibles[seaportConfig.chain][collection].volumeTrade += totalVolumeUsd;
          protocolData.breakdownCollectibles[seaportConfig.chain][collection].totalFees +=
            totalProtocolFeeUsd + totalRoyaltyFeeUsd;
          protocolData.breakdownCollectibles[seaportConfig.chain][collection].protocolFee += totalProtocolFeeUsd;
          protocolData.breakdownCollectibles[seaportConfig.chain][collection].royaltyFee += totalRoyaltyFeeUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
