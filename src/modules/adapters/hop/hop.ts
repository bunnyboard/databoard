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
import SwapPoolAbi from '../../../configs/abi/hop/SwapPool.json';
import { decodeEventLog } from 'viem';
import { getChainNameById } from '../../../lib/helpers';

const Events = {
  TransferSentToL2: '0x0a0607688c86ec1775abcdbab7b33a3a35a6c9cde677c9be880150c231cc6b0b',
  AddLiquidity: '0x189c623b666b1b45b83d7178f39b8c087cb09774317ca2f53c2d3c3726f222a2',
  RemoveLiquidity: '0x88d38ed598fdd809c2bf01ee49cd24b7fdabf379a83d29567952b60324d58cef',
  RemoveLiquidityOne: '0x43fb02998f4e03da2e0e6fff53fdbf0c40a9f45f145dc377fc30615d7d7a8a64',
  RemoveLiquidityImbalance: '0x3631c28b1f9dd213e0319fb167b554d76b6c283a41143eb400a0d1adb1af1755',
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
        deposit: 0,
        withdraw: 0,
        bridge: 0,
      },
      totalSupplied: 0,
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
              totalSupplied: 0,
              volumes: {
                deposit: 0,
                withdraw: 0,
                bridge: 0,
              },
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;

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

          if (bridgeConfig.pools[i].pool) {
            const tokenBalance = await this.services.blockchain.evm.getTokenBalance({
              chain: bridgeConfig.chain,
              address: token.address,
              owner: bridgeConfig.pools[i].pool as string,
              blockNumber: blockNumber,
            });
            if (tokenBalance) {
              const balanceUsd = formatBigNumberToNumber(tokenBalance, token.decimals) * tokenPriceUsd;

              protocolData.totalAssetDeposited += balanceUsd;
              protocolData.totalValueLocked += balanceUsd;
              (protocolData.totalSupplied as number) += balanceUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  totalSupplied: 0,
                  volumes: {
                    deposit: 0,
                    withdraw: 0,
                    bridge: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
              protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
              (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;

              const poolLogs = await this.services.blockchain.evm.getContractLogs({
                chain: bridgeConfig.chain,
                address: bridgeConfig.pools[i].pool as string,
                fromBlock: beginBlock,
                toBlock: endBlock,
              });
              for (const log of poolLogs) {
                const signature = log.topics[0];
                if (
                  signature === Events.AddLiquidity ||
                  signature === Events.RemoveLiquidity ||
                  signature === Events.RemoveLiquidityOne ||
                  signature === Events.RemoveLiquidityImbalance
                ) {
                  const event: any = decodeEventLog({
                    abi: SwapPoolAbi,
                    topics: log.topics,
                    data: log.data,
                  });

                  switch (signature) {
                    case Events.AddLiquidity: {
                      const amountUsd =
                        formatBigNumberToNumber(event.args.tokenAmounts[0].toString(), token.decimals) * tokenPriceUsd;
                      (protocolData.volumes.deposit as number) += amountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
                      break;
                    }
                    case Events.RemoveLiquidity:
                    case Events.RemoveLiquidityImbalance: {
                      const amountUsd =
                        formatBigNumberToNumber(event.args.tokenAmounts[0].toString(), token.decimals) * tokenPriceUsd;
                      (protocolData.volumes.withdraw as number) += amountUsd;
                      (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                      break;
                    }
                    case Events.RemoveLiquidityOne: {
                      const boughtId = Number(event.args.boughtId);
                      if (boughtId === 0) {
                        const amountUsd =
                          formatBigNumberToNumber(event.args.tokensBought.toString(), token.decimals) * tokenPriceUsd;
                        (protocolData.volumes.withdraw as number) += amountUsd;
                        (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                      }
                      break;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
