import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { Usdt0ProtocolConfig } from '../../../configs/protocols/usdt0';
import StargatePoolV2Abi from '../../../configs/abi/stargate/PoolV2.json';
import { StargateChainIds } from '../../../configs/protocols/stargate';

const EventOFTSent = '0x85496b760a4b7f8d66384b9df21b381f5d1b1e79f229a47aaf4c232edc2fe59a';

export default class Usdt0Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.usdt0';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const usdt0Config = this.protocolConfig as Usdt0ProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    for (const pool of usdt0Config.pools) {
      if (pool.birthday > options.timestamp) {
        continue;
      }

      const token = pool.token;
      const tokenPriceUsd = 1; // 1 USDT

      if (!protocolData.breakdown[pool.chain]) {
        protocolData.breakdown[pool.chain] = {
          [pool.token.address]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        };
      }

      if (!(protocolData.volumeBridgePaths as any)[pool.chain]) {
        (protocolData.volumeBridgePaths as any)[pool.chain] = {};
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(pool.chain, options.beginTime);
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(pool.chain, options.endTime);

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: pool.chain,
        address: pool.adapter,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const event of logs
        .filter((log) => log.topics[0] === EventOFTSent)
        .map((log) =>
          decodeEventLog({
            abi: StargatePoolV2Abi,
            topics: log.topics,
            data: log.data,
          }),
        ) as Array<any>) {
        const chainId = Number(event.args.dstEid);
        let destChainName: string | null = null;
        for (const [stargateChainId, chainName] of Object.entries(StargateChainIds)) {
          if (chainId.toString() === stargateChainId) {
            destChainName = chainName;
          }
        }

        if (!destChainName) {
          continue;
        }

        const volumeAmountUsd =
          formatBigNumberToNumber(event.args.amountSentLD.toString(), token.decimals) * tokenPriceUsd;

        (protocolData.volumes.bridge as number) += volumeAmountUsd;
        (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += volumeAmountUsd;

        if (!(protocolData.volumeBridgePaths as any)[pool.chain][destChainName]) {
          (protocolData.volumeBridgePaths as any)[pool.chain][destChainName] = 0;
        }
        (protocolData.volumeBridgePaths as any)[pool.chain][destChainName] += volumeAmountUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
