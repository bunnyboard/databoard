import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { JoepegsProtocolConfig } from '../../../configs/protocols/joepegs';
import JoepegsExchangeAbi from '../../../configs/abi/joepegs/JoepegExchange.json';
import { formatBigNumberToNumber } from '../../../lib/utils';

const Events = {
  TakerAsk: '0x68cd251d4d267c6e2034ff0088b990352b97b2002c0476587d0c4da889c11330',
  TakerBid: '0x95fb6205e23ff6bda16a2d1dba56b9ad7c783f67c96fa149785052f47696f2be',
};

export default class JoepegsAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.joepegs';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const joepegsConfig = this.protocolConfig as JoepegsProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [joepegsConfig.chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumeMarketplace: {
        sale: 0,
      },
    };

    if (joepegsConfig.birthday > options.timestamp) {
      return null;
    }

    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      joepegsConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      joepegsConfig.chain,
      options.endTime,
    );

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: joepegsConfig.chain,
      address: joepegsConfig.exchange,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of logs.filter((log) => Object.values(Events).includes(log.topics[0]))) {
      const event: any = decodeEventLog({
        abi: JoepegsExchangeAbi,
        topics: log.topics,
        data: log.data,
      });

      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: joepegsConfig.chain,
        address: event.args.currency,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const priceUsd = formatBigNumberToNumber(event.args.price.toString(), token.decimals) * tokenPriceUsd;

        // https://snowscan.xyz/address/0x777bF9ac3529fD2CD1B6e2dd63dFAE8Fd44aEc96#readProxyContract#F2
        const protocolFeeUsd = priceUsd * 0.025; // 2.5%

        protocolData.totalFees += protocolFeeUsd;
        protocolData.protocolRevenue += protocolFeeUsd;
        (protocolData.volumeMarketplace as any).sale += priceUsd;
        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumeMarketplace: {
              sale: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalFees += protocolFeeUsd;
        protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolFeeUsd;
        (protocolData.breakdown[token.chain][token.address].volumeMarketplace as any).sale += priceUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
