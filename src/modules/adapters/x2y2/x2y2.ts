import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeAbiParameters, decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import ExchangeAbi from '../../../configs/abi/x2y2/Exchange.json';
import { X2y2ProtocolConfig } from '../../../configs/protocols/x2y2';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';

const Events = {
  EvInventory: '0x3cbb63f144840e5b1b0a38a7c19211d2e89de4d7c5faf8b2d3c1776c302d1d33',
};

export default class X2y2Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.x2y2';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const x2y2Config = this.protocolConfig as X2y2ProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [x2y2Config.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      royaltyRevenue: 0,
      volumes: {
        marketplace: 0,
      },
      breakdownCollectibles: {
        [x2y2Config.chain]: {},
      },
    };

    if (x2y2Config.birthday > options.timestamp) {
      return null;
    }

    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      x2y2Config.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(x2y2Config.chain, options.endTime);

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: x2y2Config.chain,
      address: x2y2Config.exchange,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
      const event: any = decodeEventLog({
        abi: ExchangeAbi,
        topics: log.topics,
        data: log.data,
      });

      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: x2y2Config.chain,
        address: event.args.currency,
      });

      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const amountUsd = formatBigNumberToNumber(event.args.detail.price.toString(), token.decimals) * tokenPriceUsd;

        let protocolFeeUsd = 0;
        let royaltyFeeUsd = 0;
        for (const feeConfig of event.args.detail.fees) {
          const feeUsd = amountUsd * formatBigNumberToNumber((feeConfig as any).percentage.toString(), 6);

          if (compareAddress(feeConfig.to, x2y2Config.feeManagement)) {
            protocolFeeUsd += feeUsd;
          } else {
            royaltyFeeUsd += feeUsd;
          }
        }

        protocolData.totalFees += protocolFeeUsd + royaltyFeeUsd;
        protocolData.protocolRevenue += protocolFeeUsd;
        (protocolData.royaltyRevenue as number) += royaltyFeeUsd;
        (protocolData.volumes.marketplace as number) += amountUsd;
        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            royaltyRevenue: 0,
            volumes: {
              marketplace: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalFees += protocolFeeUsd + royaltyFeeUsd;
        protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;
        (protocolData.breakdown[token.chain][token.address].royaltyRevenue as number) += royaltyFeeUsd;
        (protocolData.breakdown[token.chain][token.address].volumes.marketplace as number) += amountUsd;

        if (protocolData.breakdownCollectibles && amountUsd > 0) {
          const pairs = decodeAbiParameters(
            [
              {
                type: 'tuple[]',
                components: [
                  {
                    type: 'address',
                  },
                  {
                    type: 'uint256',
                  },
                ],
              },
            ],
            event.args.item.data,
          );

          const collection = normalizeAddress(pairs[0][0][0]);
          if (!protocolData.breakdownCollectibles[x2y2Config.chain][collection]) {
            protocolData.breakdownCollectibles[x2y2Config.chain][collection] = {
              volumeTrade: 0,
              totalFees: 0,
              protocolFee: 0,
              royaltyFee: 0,
            };
          }
          protocolData.breakdownCollectibles[x2y2Config.chain][collection].volumeTrade += amountUsd;
          protocolData.breakdownCollectibles[x2y2Config.chain][collection].totalFees += protocolFeeUsd + royaltyFeeUsd;
          protocolData.breakdownCollectibles[x2y2Config.chain][collection].protocolFee += protocolFeeUsd;
          protocolData.breakdownCollectibles[x2y2Config.chain][collection].royaltyFee += royaltyFeeUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
