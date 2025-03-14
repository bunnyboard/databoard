import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import ProcessorAbi from '../../../configs/abi/magiceden/PaymentProcessor.json';
import { MagicedenProtocolConfig } from '../../../configs/protocols/magiceden';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';

const Events = {
  BuyListingERC721: '0xffb29e9cf48456d56b6d414855b66a7ec060ce2054dcb124a1876310e1b7355c',
  BuyListingERC1155: '0x1217006325a98bdcc6afc9c44965bb66ac7460a44dc57c2ac47622561d25c45a',
  AcceptOfferERC721: '0x8b87c0b049fe52718fe6ff466b514c5a93c405fb0de8fbd761a23483f9f9e198',
  AcceptOfferERC1155: '0x6f4c56c4b9a9d2479f963d802b19d17b02293ce1225461ac0cb846c482ee3c3e',
};

export default class MagicedenAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.magiceden';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      royaltyRevenue: 0,
      volumes: {
        marketplace: 0,
      },
      breakdownCollectibles: {},
    };

    const magicedenConfig = this.protocolConfig as MagicedenProtocolConfig;
    for (const processorConfig of magicedenConfig.paymentProcessors) {
      if (processorConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[processorConfig.chain]) {
        protocolData.breakdown[processorConfig.chain] = {};
      }
      if (protocolData.breakdownCollectibles) {
        if (!protocolData.breakdownCollectibles[processorConfig.chain]) {
          protocolData.breakdownCollectibles[processorConfig.chain] = {};
        }
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        processorConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        processorConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: processorConfig.chain,
        address: processorConfig.processor,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
        const event: any = decodeEventLog({
          abi: ProcessorAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: processorConfig.chain,
          address: event.args.paymentCoin,
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          const salePriceUsd = formatBigNumberToNumber(event.args.salePrice.toString(), token.decimals) * tokenPriceUsd;

          (protocolData.volumes.marketplace as number) += salePriceUsd;
          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              royaltyRevenue: 0,
              volumes: {
                marketplace: 0,
              },
            };
          }
          (protocolData.breakdown[token.chain][token.address].volumes.marketplace as number) += salePriceUsd;

          if (protocolData.breakdownCollectibles) {
            const collection = normalizeAddress(event.args.tokenAddress);
            if (!protocolData.breakdownCollectibles[processorConfig.chain][collection]) {
              protocolData.breakdownCollectibles[processorConfig.chain][collection] = {
                volumeTrade: 0,
                totalFees: 0,
                protocolFee: 0,
                royaltyFee: 0,
              };
            }
            protocolData.breakdownCollectibles[processorConfig.chain][collection].volumeTrade += salePriceUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
