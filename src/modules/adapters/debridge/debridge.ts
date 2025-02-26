import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import ProtocolAdapter from '../protocol';
import { DebridgeInternalChanIds, DebridgeProtocolConfig } from '../../../configs/protocols/debridge';
import DlnSourceAbi from '../../../configs/abi/debridge/DlnSource.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { getChainNameById } from '../../../lib/helpers';

const Events = {
  CreatedOrder: '0xfc8703fd57380f9dd234a89dce51333782d49c5902f307b02f03e014d18fe471',
};

export default class DebridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.debridge';

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
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    const debridgeConfig = this.protocolConfig as DebridgeProtocolConfig;
    for (const networkConfig of debridgeConfig.networks) {
      if (networkConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[networkConfig.chain]) {
        protocolData.breakdown[networkConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[networkConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[networkConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        networkConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        networkConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        networkConfig.chain,
        options.endTime,
      );

      const tokens: Array<Token> = [];
      for (const address of networkConfig.tokens) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: networkConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: networkConfig.chain,
        ownerAddress: networkConfig.dlnSource,
        tokens: tokens,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

      for (const [address, balance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        if (balance.balanceUsd > 0) {
          if (!protocolData.breakdown[networkConfig.chain][address]) {
            protocolData.breakdown[networkConfig.chain][address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                bridge: 0,
              },
            };
          }
          protocolData.breakdown[networkConfig.chain][address].totalAssetDeposited += balance.balanceUsd;
          protocolData.breakdown[networkConfig.chain][address].totalValueLocked += balance.balanceUsd;
        }
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: networkConfig.chain,
        address: networkConfig.dlnSource,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      const events: Array<any> = logs
        .filter((log) => log.topics[0] === Events.CreatedOrder)
        .map((log) =>
          decodeEventLog({
            abi: DlnSourceAbi,
            topics: log.topics,
            data: log.data,
          }),
        );

      const feeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: networkConfig.chain,
        address: networkConfig.feeToken,
        timestamp: options.timestamp,
      });

      for (const event of events) {
        if (event) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: networkConfig.chain,
            address: event.args.order.giveTokenAddress,
          });

          if (token) {
            const feeAmountUsd = feeTokenPriceUsd * networkConfig.feeFlatAmount;

            if (
              networkConfig.blacklistTokens &&
              networkConfig.blacklistTokens.find((item) => compareAddress(item, token.address))
            ) {
              continue;
            }

            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const tokenAmountUsd =
              formatBigNumberToNumber(event.args.order.giveAmount.toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalFees += feeAmountUsd;
            protocolData.protocolRevenue += feeAmountUsd;
            (protocolData.volumes.bridge as number) += tokenAmountUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                volumes: {
                  bridge: 0,
                },
              };
            }
            protocolData.breakdown[token.chain][token.address].totalFees += feeAmountUsd;
            protocolData.breakdown[token.chain][token.address].protocolRevenue += feeAmountUsd;
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += tokenAmountUsd;

            const takeChainId = Number(event.args.order.takeChainId);
            const destinationChain = DebridgeInternalChanIds[takeChainId]
              ? DebridgeInternalChanIds[takeChainId]
              : getChainNameById(takeChainId);
            if (destinationChain) {
              if (!(protocolData.volumeBridgePaths as any)[networkConfig.chain][destinationChain]) {
                (protocolData.volumeBridgePaths as any)[networkConfig.chain][destinationChain] = 0;
              }
              (protocolData.volumeBridgePaths as any)[networkConfig.chain][destinationChain] += tokenAmountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
