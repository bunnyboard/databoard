import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { SynapseProtocolConfig } from '../../../configs/protocols/synapse';
import SynapseBridgeAbi from '../../../configs/abi/synapse/SynapseBridge.json';
import FastBridgeRfqAbi from '../../../configs/abi/synapse/FastBridge.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import envConfig from '../../../configs/envConfig';
import { ContractCall } from '../../../services/blockchains/domains';

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
      category: this.protocolConfig.category,
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

            const chainId = Number(event.args.chainId);
            let destChainName: string | null = null;
            for (const chain of Object.values(envConfig.blockchains)) {
              if (chain.chainId === chainId) {
                destChainName = chain.name;
              }
            }
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

        if (bridgeConfig.bridgeTokens) {
          const calls: Array<ContractCall> = bridgeConfig.bridgeTokens.map((tokenAddress) => {
            return {
              abi: Erc20Abi,
              target: tokenAddress,
              method: 'balanceOf',
              params: [bridgeConfig.bridge],
            };
          });
          const results: any = await this.services.blockchain.evm.multicall({
            chain: bridgeConfig.chain,
            blockNumber: blockNumber,
            calls: calls,
          });
          if (results) {
            for (let i = 0; i < bridgeConfig.bridgeTokens.length; i++) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: bridgeConfig.chain,
                address: bridgeConfig.bridgeTokens[i],
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                const balanceUsd =
                  formatBigNumberToNumber(results[i] ? results[i].toString() : '0', token.decimals) * tokenPriceUsd;

                protocolData.totalAssetDeposited += balanceUsd;
                protocolData.totalValueLocked += balanceUsd;
                (protocolData.totalSupplied as number) += balanceUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    totalSupplied: 0,
                    volumes: {
                      bridge: 0,
                    },
                  };
                }
                protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
                protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
                (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
              }
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

            const destChainId = Number(event.args.destChainId);
            let destChainName: string | null = null;
            for (const chain of Object.values(envConfig.blockchains)) {
              if (chain.chainId === destChainId) {
                destChainName = chain.name;
              }
            }
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

      if (bridgeConfig.liquidityPools) {
        for (const liquidityPool of bridgeConfig.liquidityPools) {
          const calls: Array<ContractCall> = liquidityPool.tokens.map((tokenAddress) => {
            return {
              abi: Erc20Abi,
              target: tokenAddress,
              method: 'balanceOf',
              params: [bridgeConfig.bridge],
            };
          });
          const results: any = await this.services.blockchain.evm.multicall({
            chain: bridgeConfig.chain,
            blockNumber: blockNumber,
            calls: calls,
          });
          if (results) {
            for (let i = 0; i < liquidityPool.tokens.length; i++) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: bridgeConfig.chain,
                address: liquidityPool.tokens[i],
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                const balanceUsd =
                  formatBigNumberToNumber(results[i] ? results[i].toString() : '0', token.decimals) * tokenPriceUsd;

                protocolData.totalAssetDeposited += balanceUsd;
                protocolData.totalValueLocked += balanceUsd;
                (protocolData.totalSupplied as number) += balanceUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    totalSupplied: 0,
                    volumes: {
                      bridge: 0,
                    },
                  };
                }
                protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
                protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
                (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
