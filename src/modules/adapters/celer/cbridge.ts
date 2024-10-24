import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { CbridgeProtocolConfig } from '../../../configs/protocols/celer';
import { decodeEventLog } from 'viem';
import BridgeAbi from '../.././../configs/abi/celer/Bridge.json';
import { getChainNameById } from '../../../lib/helpers';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';

const SendEvent = '0x89d8051e597ab4178a863a5190407b98abfeff406aa8db90c59af76612e58f01';

export default class CbridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.cbridge 🌈';

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
        deposit: 0,
        withdraw: 0,
      },
      volumeBridgePaths: {},
    };

    const cbridgeConfig = this.protocolConfig as CbridgeProtocolConfig;
    for (const bridgeConfig of cbridgeConfig.bridges) {
      if (bridgeConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[bridgeConfig.chain]) {
        protocolData.breakdown[bridgeConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[bridgeConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bridgeConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bridgeConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bridgeConfig.chain,
        options.endTime,
      );

      // count total value locked
      const addresses: Array<string> = [bridgeConfig.bridge];
      if (bridgeConfig.originTokenVaultV1) {
        addresses.push(bridgeConfig.originTokenVaultV1);
      }
      if (bridgeConfig.originTokenVaultV2) {
        addresses.push(bridgeConfig.originTokenVaultV2);
      }

      // caching token prices
      const tokenPriceUsd: { [key: string]: number } = {};

      for (const addressToCount of addresses) {
        const getBalanceResult = await this.getAddressBalanceUsd({
          chain: bridgeConfig.chain,
          ownerAddress: addressToCount,
          tokens: bridgeConfig.tokens,
          timestamp: options.timestamp,
          blockNumber: blockNumber,
        });

        protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
        protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

        for (const [tokenAddress, tokenData] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
          if (!protocolData.breakdown[bridgeConfig.chain][tokenAddress]) {
            protocolData.breakdown[bridgeConfig.chain][tokenAddress] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                bridge: 0,
                deposit: 0,
                withdraw: 0,
              },
            };
          }
          protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalAssetDeposited += tokenData.balanceUsd;
          protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalValueLocked += tokenData.balanceUsd;

          tokenPriceUsd[tokenAddress] = tokenData.priceUsd;
        }
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: bridgeConfig.chain,
        address: bridgeConfig.bridge,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === SendEvent) {
          const event: any = decodeEventLog({
            abi: BridgeAbi,
            topics: log.topics,
            data: log.data,
          });

          const token = bridgeConfig.tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
          if (token) {
            const destChainName = getChainNameById(Number(event.args.dstChainId));
            if (destChainName) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: bridgeConfig.chain,
                address: event.args.token,
              });
              if (token) {
                const priceUsd = tokenPriceUsd[token.address] ? tokenPriceUsd[token.address] : 0;
                const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * priceUsd;

                (protocolData.volumes.bridge as number) += amountUsd;
                (protocolData.breakdown[bridgeConfig.chain][token.address].volumes.bridge as number) += amountUsd;

                // fees range from 0-0.5%, we assume avg 0.25%
                const feeUsd = (amountUsd * 0.25) / 100;
                protocolData.totalFees += feeUsd;
                protocolData.protocolRevenue += feeUsd;
                protocolData.breakdown[bridgeConfig.chain][token.address].totalFees += feeUsd;
                protocolData.breakdown[bridgeConfig.chain][token.address].protocolRevenue += feeUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
