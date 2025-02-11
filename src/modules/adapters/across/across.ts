import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import SpokePoolAbi from '../../../configs/abi/across/SpokePool.json';
import SpokePoolV2Abi from '../../../configs/abi/across/SpokePoolV2.json';
import { decodeAbiParameters, decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { AcrossProtocolConfig } from '../../../configs/protocols/across';
import { BlockchainConfigs } from '../../../configs/blockchains';
import AdapterDataHelper from '../helpers';
import ProtocolExtendedAdapter from '../extended';

// v2
const FundsDeposited = '0xafc4df6845a4ab948b492800d3d8a25d538a102a2bc07cd01f1cfa097fddcff6';

// v3
const V3FundsDeposited = '0xa123dc29aebf7d0c3322c8eeb5b999e859f39937950ed31056532713d0de396f';
const V3FundsDepositedV2 = '0x32ed1a409ef04c7b0227189c3a103dc5ac10e775a15b785dcc510201f7c25ad3';

// count total assets locked in spokePool as totalValueLocked
// count total assets locked in hubPool (ethereum) as totalSupplied (liquidity)
export default class AcrossAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.across';

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

      // total asets are locked in hubPool
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

      const tokens: Array<Token> = [];
      for (const address of spokePoolConfig.tokens) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: spokePoolConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: spokePoolConfig.chain,
        ownerAddress: spokePoolConfig.address,
        tokens: tokens,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

      for (const [address, balance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        if (balance.balanceUsd > 0) {
          if (!protocolData.breakdown[spokePoolConfig.chain][address]) {
            protocolData.breakdown[spokePoolConfig.chain][address] = {
              ...getInitialProtocolCoreMetrics(),
              totalSupplied: 0,
              volumes: {
                bridge: 0,
              },
            };
          }
          protocolData.breakdown[spokePoolConfig.chain][address].totalAssetDeposited += balance.balanceUsd;
          protocolData.breakdown[spokePoolConfig.chain][address].totalValueLocked += balance.balanceUsd;
        }
      }

      if (spokePoolConfig.hubPool) {
        const hubPoolBalance = await this.getAddressBalanceUsd({
          chain: spokePoolConfig.chain,
          ownerAddress: spokePoolConfig.hubPool,
          tokens: tokens,
          timestamp: options.timestamp,
          blockNumber: blockNumber,
        });

        protocolData.totalAssetDeposited += hubPoolBalance.totalBalanceUsd;
        protocolData.totalValueLocked += hubPoolBalance.totalBalanceUsd;
        (protocolData.totalSupplied as number) += hubPoolBalance.totalBalanceUsd;
        for (const [address, balance] of Object.entries(hubPoolBalance.tokenBalanceUsds)) {
          if (balance.balanceUsd > 0) {
            if (!protocolData.breakdown[spokePoolConfig.chain][address]) {
              protocolData.breakdown[spokePoolConfig.chain][address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
                volumes: {
                  bridge: 0,
                },
              };
            }
            protocolData.breakdown[spokePoolConfig.chain][address].totalAssetDeposited += balance.balanceUsd;
            protocolData.breakdown[spokePoolConfig.chain][address].totalValueLocked += balance.balanceUsd;
            (protocolData.breakdown[spokePoolConfig.chain][address].totalSupplied as number) += balance.balanceUsd;
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
        if (
          log.topics[0] === FundsDeposited ||
          log.topics[0] === V3FundsDeposited ||
          log.topics[0] === V3FundsDepositedV2
        ) {
          const event: any = decodeEventLog({
            abi: log.topics[0] === V3FundsDepositedV2 ? SpokePoolV2Abi : SpokePoolAbi,
            topics: log.topics,
            data: log.data,
          });

          const destinationChainId = Number(event.args.destinationChainId);
          let destChainName: string | null = null;
          for (const chainConfig of Object.values(BlockchainConfigs)) {
            if (chainConfig.chainId === destinationChainId) {
              destChainName = chainConfig.name;
              break;
            }
          }

          if (!destChainName) {
            continue;
          }

          let tokenAddress = event.args.inputToken ? event.args.inputToken : event.args.originToken;
          if (log.topics[0] === V3FundsDepositedV2) {
            tokenAddress = decodeAbiParameters([{ type: 'address' }], tokenAddress)[0];
          }

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

            const amountRaw = event.args.inputAmount !== undefined ? event.args.inputAmount : event.args.amount;
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
