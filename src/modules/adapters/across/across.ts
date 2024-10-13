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
import AdapterDataHelper from '../helpers';
import { ChainNames } from '../../../configs/names';

// v2
const FundsDeposited = '0xafc4df6845a4ab948b492800d3d8a25d538a102a2bc07cd01f1cfa097fddcff6';

// v3
const V3FundsDeposited = '0xa123dc29aebf7d0c3322c8eeb5b999e859f39937950ed31056532713d0de396f';

export default class AcrossAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.across';

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

    const acrossConfig = this.protocolConfig as AcrossProtocolConfig;
    for (const spokePoolConfig of acrossConfig.spokePools) {
      if (spokePoolConfig.birthday > options.timestamp) {
        continue;
      }

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

        if (hubPool) {
          for (const tokenAddress of spokePoolConfig.tokens) {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: spokePoolConfig.chain,
              address: tokenAddress,
            });
            if (token) {
              const tokenBalance = await this.services.blockchain.evm.readContract({
                chain: token.chain,
                abi: Erc20Abi,
                target: token.address,
                method: 'balanceOf',
                params: [hubPool],
                blockNumber: blockNumber,
              });
              if (tokenBalance && tokenBalance.toString() !== '0') {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });

                const amountUsd = formatBigNumberToNumber(tokenBalance.toString(), token.decimals) * tokenPriceUsd;

                protocolData.totalAssetDeposited += amountUsd;
                protocolData.totalValueLocked += amountUsd;
                (protocolData.totalSupplied as number) += amountUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                    },
                  };
                }

                protocolData.breakdown[token.chain][token.address].totalAssetDeposited += amountUsd;
                protocolData.breakdown[token.chain][token.address].totalValueLocked += amountUsd;
                (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += amountUsd;
              }
            }
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
        if (log.topics[0] === FundsDeposited || log.topics[0] === V3FundsDeposited) {
          const event: any = decodeEventLog({
            abi: SpokePoolAbi,
            topics: log.topics,
            data: log.data,
          });

          const tokenAddress = event.args.inputToken ? event.args.inputToken : event.args.originToken;
          const inputToken = await this.services.blockchain.evm.getTokenInfo({
            chain: spokePoolConfig.chain,
            address: tokenAddress,
          });

          if (inputToken) {
            const inputTokenPrice = await this.services.oracle.getTokenPriceUsdRounded({
              chain: inputToken.chain,
              address: inputToken.address,
              timestamp: options.timestamp,
            });

            const destinationChainId = Number(event.args.destinationChainId);
            let destChainName = destinationChainId === 480 ? ChainNames.worldchain : `unknown:${destinationChainId}`;
            for (const chainConfig of Object.values(BlockchainConfigs)) {
              if (chainConfig.chainId === destinationChainId) {
                destChainName = chainConfig.name;
                break;
              }
            }

            const amountRaw = event.args.inputAmount ? event.args.inputAmount : event.args.amount;
            const amountUsd = formatBigNumberToNumber(amountRaw.toString(), inputToken.decimals) * inputTokenPrice;

            let totalFees = 0;
            if (log.topics[0] === FundsDeposited) {
              const relayerFeePct = formatBigNumberToNumber(event.args.relayerFeePct, 18);
              totalFees = amountUsd * relayerFeePct;
            } else {
              const outputAmountUsd =
                formatBigNumberToNumber(event.args.outputAmount.toString(), inputToken.decimals) * inputTokenPrice;
              totalFees = amountUsd > outputAmountUsd ? amountUsd - outputAmountUsd : 0;
            }

            if (!protocolData.breakdown[inputToken.chain][inputToken.address]) {
              protocolData.breakdown[inputToken.chain][inputToken.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridge: 0,
                },
              };
            }

            if (!(protocolData.volumeBridgePaths as any)[spokePoolConfig.chain][destChainName]) {
              (protocolData.volumeBridgePaths as any)[spokePoolConfig.chain][destChainName] = 0;
            }

            protocolData.totalFees += totalFees;
            protocolData.supplySideRevenue += totalFees;
            (protocolData.volumes.bridge as number) += amountUsd;

            protocolData.breakdown[inputToken.chain][inputToken.address].totalFees += totalFees;
            protocolData.breakdown[inputToken.chain][inputToken.address].supplySideRevenue += totalFees;
            (protocolData.breakdown[inputToken.chain][inputToken.address].volumes.bridge as number) += amountUsd;

            (protocolData.volumeBridgePaths as any)[spokePoolConfig.chain][destChainName] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
