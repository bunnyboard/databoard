import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { CbridgeProtocolConfig } from '../../../configs/protocols/celer';
import { decodeEventLog } from 'viem';
import BridgeAbi from '../.././../configs/abi/celer/Bridge.json';
import OriginVaultV1Abi from '../.././../configs/abi/celer/OriginalTokenVault.json';
import OriginVaultV2Abi from '../.././../configs/abi/celer/OriginalTokenVaultV2.json';
import { getChainNameById } from '../../../lib/helpers';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolExtendedAdapter from '../extended';

// on bridge contract
const SendEvent = '0x89d8051e597ab4178a863a5190407b98abfeff406aa8db90c59af76612e58f01';

// on vault contract
const DepositedV1 = '0x89d8051e597ab4178a863a5190407b98abfeff406aa8db90c59af76612e58f01';

// on vault v2 contract
const DepositedV2 = '0x28d226819e371600e26624ebc4a9a3947117ee2760209f816c789d3a99bf481b';

export default class CbridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.cbridge 🌈';

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
              },
            };
          }
          protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalAssetDeposited += tokenData.balanceUsd;
          protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalValueLocked += tokenData.balanceUsd;

          tokenPriceUsd[tokenAddress] = tokenData.priceUsd;
        }
      }

      const bridgeLogs = await this.services.blockchain.evm.getContractLogs({
        chain: bridgeConfig.chain,
        address: bridgeConfig.bridge,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of bridgeLogs) {
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

                // fees range from 0-0.5%, we assume avg 0.25%
                const feeUsd = (amountUsd * 0.25) / 100;

                protocolData.totalFees += feeUsd;
                protocolData.protocolRevenue += feeUsd;
                (protocolData.volumes.bridge as number) += amountUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                    },
                  };
                }
                protocolData.breakdown[token.chain][token.address].totalFees += feeUsd;
                protocolData.breakdown[token.chain][token.address].protocolRevenue += feeUsd;
                (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

                if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName]) {
                  (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] = 0;
                }
                (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] += amountUsd;
              }
            }
          }
        }
      }

      let vaultLogs: Array<any> = [];

      if (bridgeConfig.originTokenVaultV1) {
        const vaultV1Logs = await this.services.blockchain.evm.getContractLogs({
          chain: bridgeConfig.chain,
          address: bridgeConfig.originTokenVaultV1,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        vaultLogs = vaultLogs.concat(vaultV1Logs);
      }

      if (bridgeConfig.originTokenVaultV2) {
        const vaultV2Logs = await this.services.blockchain.evm.getContractLogs({
          chain: bridgeConfig.chain,
          address: bridgeConfig.originTokenVaultV2,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        vaultLogs = vaultLogs.concat(vaultV2Logs);
      }

      for (const log of vaultLogs) {
        if (log.topics[0] === DepositedV1 || log.topics[0] === DepositedV2) {
          const event: any = decodeEventLog({
            abi: log.topics[0] === DepositedV1 ? OriginVaultV1Abi : OriginVaultV2Abi,
            topics: log.topics,
            data: log.data,
          });

          const token = bridgeConfig.tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
          if (token) {
            const destChainName = getChainNameById(Number(event.args.mintChainId));
            if (destChainName) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: bridgeConfig.chain,
                address: event.args.token,
              });
              if (token) {
                const priceUsd = tokenPriceUsd[token.address] ? tokenPriceUsd[token.address] : 0;
                const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * priceUsd;

                (protocolData.volumes.bridge as number) += amountUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                    },
                  };
                }
                (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

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
