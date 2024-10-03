import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import SpokePoolAbi from '../../../configs/abi/across/SpokePool.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { AcrossProtocolConfig } from '../../../configs/protocols/across';
import { BlockchainConfigs } from '../../../configs/blockchains';

const V3FundsDeposited = '0xa123dc29aebf7d0c3322c8eeb5b999e859f39937950ed31056532713d0de396f';
const FilledV3Relay = '0x571749edf1d5c9599318cdbc4e28a6475d65e87fd3b2ddbe1e9a8d5e7a0f0ff7';

export default class AcrossAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.across ❎';

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
        bridgeOut: 0,
        bridgeIn: 0,
      },
      volumeBridgePaths: {},
    };

    const acrossConfig = this.protocolConfig as AcrossProtocolConfig;
    for (const spokePoolConfig of acrossConfig.spokePools) {
      if (!protocolData.breakdown[spokePoolConfig.chain]) {
        protocolData.breakdown[spokePoolConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[spokePoolConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[spokePoolConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        spokePoolConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        spokePoolConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        spokePoolConfig.chain,
        options.endTime,
      );

      if (spokePoolConfig.tokens) {
        const hubPool = await this.services.blockchain.evm.readContract({
          chain: spokePoolConfig.chain,
          abi: SpokePoolAbi,
          target: spokePoolConfig.address,
          method: 'hubPool',
          params: [],
          blockNumber: blockNumber,
        });

        for (const tokenAddress of spokePoolConfig.tokens) {
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: spokePoolConfig.chain,
            address: tokenAddress,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const tokenBalance = await this.services.blockchain.evm.readContract({
              chain: token.chain,
              abi: Erc20Abi,
              target: token.address,
              method: 'balanceOf',
              params: [hubPool],
              blockNumber: blockNumber,
            });
            const amountUsd = formatBigNumberToNumber(tokenBalance.toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalAssetDeposited += amountUsd;
            protocolData.totalValueLocked += amountUsd;
            (protocolData.totalSupplied as number) + amountUsd;

            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridgeIn: 0,
                  bridgeOut: 0,
                },
              };
            }

            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += amountUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += amountUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += amountUsd;
          }
        }
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: spokePoolConfig.chain,
        address: spokePoolConfig.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === V3FundsDeposited || log.topics[0] === FilledV3Relay) {
          const event: any = decodeEventLog({
            abi: SpokePoolAbi,
            topics: log.topics,
            data: log.data,
          });

          if (log.topics[0] === V3FundsDeposited) {
            const inputToken = await this.services.blockchain.evm.getTokenInfo({
              chain: spokePoolConfig.chain,
              address: event.args.inputToken,
            });

            if (inputToken) {
              const inputTokenPrice = await this.services.oracle.getTokenPriceUsdRounded({
                chain: inputToken.chain,
                address: inputToken.address,
                timestamp: options.timestamp,
              });

              const destinationChainId = Number(event.args.destinationChainId);
              let destChainName = `unknown:${destinationChainId}`;
              for (const chainConfig of Object.values(BlockchainConfigs)) {
                if (chainConfig.chainId === destinationChainId) {
                  destChainName = chainConfig.name;
                  break;
                }
              }

              const amountUsd =
                formatBigNumberToNumber(event.args.inputAmount.toString(), inputToken.decimals) * inputTokenPrice;
              const outputAmountUsd =
                formatBigNumberToNumber(event.args.outputAmount.toString(), inputToken.decimals) * inputTokenPrice;
              const feesUsd = amountUsd > outputAmountUsd ? amountUsd - outputAmountUsd : 0;

              if (!protocolData.breakdown[inputToken.chain][inputToken.address]) {
                protocolData.breakdown[inputToken.chain][inputToken.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    bridgeIn: 0,
                    bridgeOut: 0,
                  },
                };
              }

              if (!(protocolData.volumeBridgePaths as any)[spokePoolConfig.chain][destChainName]) {
                (protocolData.volumeBridgePaths as any)[spokePoolConfig.chain][destChainName] = 0;
              }

              protocolData.totalFees += feesUsd;
              protocolData.supplySideRevenue += feesUsd;
              (protocolData.volumes.bridgeOut as number) += amountUsd;

              protocolData.breakdown[inputToken.chain][inputToken.address].totalFees += amountUsd;
              protocolData.breakdown[inputToken.chain][inputToken.address].supplySideRevenue += amountUsd;
              (protocolData.breakdown[inputToken.chain][inputToken.address].volumes.bridgeOut as number) += amountUsd;

              (protocolData.volumeBridgePaths as any)[spokePoolConfig.chain][destChainName] += amountUsd;
            }
          } else if (log.topics[0] === FilledV3Relay) {
            const outputToken = await this.services.blockchain.evm.getTokenInfo({
              chain: spokePoolConfig.chain,
              address: event.args.outputToken,
            });
            if (outputToken) {
              const outputTokenPrice = await this.services.oracle.getTokenPriceUsdRounded({
                chain: outputToken.chain,
                address: outputToken.address,
                timestamp: options.timestamp,
              });

              const amountUsd =
                formatBigNumberToNumber(event.args.outputAmount.toString(), outputToken.decimals) * outputTokenPrice;

              if (!protocolData.breakdown[outputToken.chain][outputToken.address]) {
                protocolData.breakdown[outputToken.chain][outputToken.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    bridgeIn: 0,
                    bridgeOut: 0,
                  },
                };
              }

              (protocolData.volumes.bridgeIn as number) += amountUsd;
              (protocolData.breakdown[outputToken.chain][outputToken.address].volumes.bridgeIn as number) += amountUsd;

              // fees were already count on source chain spoke pool
            }
          }
        }
      }
    }

    return protocolData;
  }
}
