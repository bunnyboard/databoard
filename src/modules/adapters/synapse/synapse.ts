import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { decodeEventLog } from 'viem';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { SynapseProtocolConfig } from '../../../configs/protocols/synapse';
import SynapseBridgeAbi from '../../../configs/abi/synapse/SynapseBridge.json';
import FastBridgeRfqAbi from '../../../configs/abi/synapse/FastBridge.json';
import { getChainNameById } from '../../../lib/helpers';
import ProtocolAdapter from '../protocol';

const TokenDeposit = '0xda5273705dbef4bf1b902a131c2eac086b7e1476a8ab0cb4da08af1fe1bd8e3b';
const TokenDepositAndSwap = '0x79c15604b92ef54d3f61f0c40caab8857927ca3d5092367163b4562c1699eb5f';
const TokenRedeemAndSwap = '0x91f25e9be0134ec851830e0e76dc71e06f9dade75a9b84e9524071dbbc319425';
const BridgeRequested = '0x120ea0364f36cdac7983bcfdd55270ca09d7f9b314a2ebc425a3b01ab1d6403a';

export default class SynapseAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.synapse';

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
      totalSupplied: 0,
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    const synapseConfig = this.protocolConfig as SynapseProtocolConfig;
    for (const bridgeConfig of synapseConfig.bridges) {
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

      const countBalanceAddresses: Array<string> = [];
      if (bridgeConfig.bridge) {
        countBalanceAddresses.push(bridgeConfig.bridge);
      }
      if (bridgeConfig.liquidityPools) {
        for (const liquidityPool of bridgeConfig.liquidityPools) {
          countBalanceAddresses.push(liquidityPool);
        }
      }
      for (const addressToCount of countBalanceAddresses) {
        const getBalanceUsdResult = await this.getAddressBalanceUsd({
          chain: bridgeConfig.chain,
          ownerAddress: addressToCount,
          tokens: bridgeConfig.tokens,
          timestamp: options.timestamp,
          blockNumber: blockNumber,
        });

        protocolData.totalAssetDeposited += getBalanceUsdResult.totalBalanceUsd;
        protocolData.totalValueLocked += getBalanceUsdResult.totalBalanceUsd;
        (protocolData.totalSupplied as number) += getBalanceUsdResult.totalBalanceUsd;

        for (const [tokenAddress, balanceUsd] of Object.entries(getBalanceUsdResult.tokenBalanceUsds)) {
          if (!protocolData.breakdown[bridgeConfig.chain][tokenAddress]) {
            protocolData.breakdown[bridgeConfig.chain][tokenAddress] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                bridge: 0,
              },
            };
          }
          protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalAssetDeposited += balanceUsd.balanceUsd;
          protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalValueLocked += balanceUsd.balanceUsd;
          (protocolData.breakdown[bridgeConfig.chain][tokenAddress].totalSupplied as number) += balanceUsd.balanceUsd;
        }
      }

      // count volumes
      if (bridgeConfig.bridge) {
        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: bridgeConfig.chain,
          address: bridgeConfig.bridge,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        for (const log of logs) {
          if (
            log.topics[0] === TokenDeposit ||
            log.topics[0] === TokenDepositAndSwap ||
            log.topics[0] === TokenRedeemAndSwap
          ) {
            const event: any = decodeEventLog({
              abi: SynapseBridgeAbi,
              topics: log.topics,
              data: log.data,
            });

            if (!bridgeConfig.tokens.filter((item) => compareAddress(item.address, event.args.token))[0]) {
              // count supported token only
              continue;
            }

            const destChainName = getChainNameById(Number(event.args.chainId));
            if (!destChainName) {
              continue;
            }

            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: bridgeConfig.chain,
              address: event.args.token,
            });

            if (token) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });

              const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;
              const feeAmountUsd = amountUsd * 0.001; // 0.1%

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  totalSupplied: 0,
                  volumes: {
                    bridge: 0,
                  },
                };
              }

              if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName]) {
                (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] = 0;
              }

              protocolData.totalFees += feeAmountUsd;
              protocolData.supplySideRevenue += feeAmountUsd;
              (protocolData.volumes.bridge as number) += amountUsd;

              protocolData.breakdown[token.chain][token.address].totalFees += feeAmountUsd;
              protocolData.breakdown[token.chain][token.address].supplySideRevenue += feeAmountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

              (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] += amountUsd;
            }
          }
        }
      }

      if (bridgeConfig.fastBridgeRfq) {
        const fastBridgeLogs = await this.services.blockchain.evm.getContractLogs({
          chain: bridgeConfig.chain,
          address: bridgeConfig.fastBridgeRfq,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of fastBridgeLogs) {
          if (log.topics[0] === BridgeRequested) {
            const event: any = decodeEventLog({
              abi: FastBridgeRfqAbi,
              topics: log.topics,
              data: log.data,
            });

            if (!bridgeConfig.tokens.filter((item) => compareAddress(item.address, event.args.originToken))[0]) {
              // count supported token only
              continue;
            }

            const destChainName = getChainNameById(Number(event.args.chainId));
            if (!destChainName) {
              continue;
            }

            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: bridgeConfig.chain,
              address: event.args.originToken,
            });

            if (token) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: token.chain,
                address: token.address,
                timestamp: options.timestamp,
              });
              const originAmount = formatBigNumberToNumber(event.args.originAmount.toString(), token.decimals);
              const destAmount = formatBigNumberToNumber(event.args.destAmount.toString(), token.decimals);
              const amountUsd = originAmount * tokenPriceUsd;
              const feeAmountUsd = (originAmount - destAmount) * tokenPriceUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    bridge: 0,
                  },
                };
              }

              if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName]) {
                (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] = 0;
              }

              protocolData.totalFees += feeAmountUsd;
              protocolData.protocolRevenue += feeAmountUsd;
              (protocolData.volumes.bridge as number) += amountUsd;

              protocolData.breakdown[token.chain][token.address].totalFees += feeAmountUsd;
              protocolData.breakdown[token.chain][token.address].protocolRevenue += feeAmountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

              (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChainName] += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
