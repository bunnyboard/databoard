import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { HopProtocolConfig } from '../../../configs/protocols/hop';
import { ContractCall } from '../../../services/blockchains/domains';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { AddressZero } from '../../../configs/constants';
import L1Erc20BridgeAbi from '../../../configs/abi/hop/L1_ERC20_Bridge.json';
import { decodeEventLog } from 'viem';
import { getChainNameById } from '../../../lib/helpers';

const Events = {
  TransferSentToL2: '0x0a0607688c86ec1775abcdbab7b33a3a35a6c9cde677c9be880150c231cc6b0b',
};

export default class HopAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.hop';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const hopConfig = this.protocolConfig as HopProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    for (const bridgeConfig of hopConfig.bridges) {
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

      protocolData.breakdown[bridgeConfig.chain] = {};
      (protocolData.volumeBridgePaths as any)[bridgeConfig.chain] = {};

      const calls: Array<ContractCall> = [];
      for (const poolConfig of bridgeConfig.pools) {
        calls.push({
          abi: Erc20Abi,
          target: poolConfig.token,
          method: 'balanceOf',
          params: [poolConfig.bridge],
        });
      }

      const results = await this.services.blockchain.evm.multicall({
        chain: bridgeConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });

      for (let i = 0; i < bridgeConfig.pools.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: bridgeConfig.chain,
          address: bridgeConfig.pools[i].token,
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          let balanceUsd =
            formatBigNumberToNumber(results[i] ? results[i].toString() : '0', token.decimals) * tokenPriceUsd;

          if (compareAddress(token.address, AddressZero)) {
            const nativeBalance = await this.services.blockchain.evm.getTokenBalance({
              chain: bridgeConfig.chain,
              address: token.address,
              owner: bridgeConfig.pools[i].bridge,
              blockNumber: blockNumber,
            });
            balanceUsd = formatBigNumberToNumber(nativeBalance.toString(), token.decimals) * tokenPriceUsd;
          }

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                bridge: 0,
              },
            };
          }

          const logs = await this.services.blockchain.evm.getContractLogs({
            chain: bridgeConfig.chain,
            address: bridgeConfig.pools[i].bridge,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of logs) {
            if (log.topics[0] === Events.TransferSentToL2) {
              const event: any = decodeEventLog({
                abi: L1Erc20BridgeAbi,
                topics: log.topics,
                data: log.data,
              });

              const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;
              const feeUsd = formatBigNumberToNumber(event.args.relayerFee.toString(), token.decimals) * tokenPriceUsd;

              protocolData.totalFees += feeUsd;
              protocolData.protocolRevenue += feeUsd;
              (protocolData.volumes.bridge as number) += amountUsd;

              protocolData.breakdown[token.chain][token.address].totalFees += feeUsd;
              protocolData.breakdown[token.chain][token.address].protocolRevenue += feeUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

              const destChainName = getChainNameById(Number(event.args.chainId));
              if (destChainName) {
                if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName]) {
                  (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] = 0;
                }
                (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] += amountUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
