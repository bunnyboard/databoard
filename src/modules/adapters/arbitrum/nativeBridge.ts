import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { Address, decodeAbiParameters, decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import { ContractCall } from '../../../services/blockchains/domains';
import ArbitrumBridgeAbi from '../../../configs/abi/arbitrum/Bridge.json';
import ArbitrumDeployedInboxAbi from '../../../configs/abi/arbitrum/L1Inbox.json';
import Erc20GatewayAbi from '../../../configs/abi/arbitrum/L1ERC20Gateway.json';
import { ArbitrumBridgeProtocolConfig } from '../../../configs/protocols/arbitrum';

const Events = {
  // ERC20 deposit from Ethereum -> Arbitrum
  DepositInitiated: '0xb8910b9960c443aac3240b98585384e3a6f109fbf6969e264c3f183d69aba7e1',

  // native ETH deposit from Ethereum -> Arbitrum
  // emitted by Bridge contract
  MessageDelivered: '0x5e3c1311ea442664e8b1611bfabef659120ea7a0a2cfc0667700bebc69cbffe1',
  // emitted by deployedInbox contract
  InboxMessageDelivered: '0xff64905f73a67fb594e0f940a8075a860db489ad991e032f48c81123eb52d60b',

  // withdraw ERC20 from Arbitrum -> Ethereum
  WithdrawalFinalized: '0x891afe029c75c4f8c5855fc3480598bc5a53739344f6ae575bdb7ea2a79f56b3',

  // Withdraw ETH from Arbitrum -> Ethereum
  BridgeCallTriggered: '0x2d9d115ef3e4a606d698913b1eae831a3cdfe20d9a83d48007b0526749c3d466',
};

export default class ArbitrumNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.arbitrum';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const arbitrumConfig = this.protocolConfig as ArbitrumBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [arbitrumConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [arbitrumConfig.layer2Chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [arbitrumConfig.chain]: {
          [arbitrumConfig.layer2Chain]: 0,
        },
        [arbitrumConfig.layer2Chain]: {
          [arbitrumConfig.chain]: 0,
        },
      },
    };

    if (arbitrumConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      arbitrumConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      arbitrumConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      arbitrumConfig.chain,
      options.endTime,
    );

    // native ETH
    const client = this.services.blockchain.evm.getPublicClient(arbitrumConfig.chain);
    const nativeBalance = await client.getBalance({
      address: arbitrumConfig.bridge as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: arbitrumConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[arbitrumConfig.chain][AddressZero].totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.breakdown[arbitrumConfig.chain][AddressZero].totalValueLocked += nativeBalanceLockedUsd;

    // deposit ETH from Ethereum -> Arbitrum events
    const inboxLogs = await this.services.blockchain.evm.getContractLogs({
      chain: arbitrumConfig.chain,
      address: arbitrumConfig.deployedInbox,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    // withdraw ETH from Arbitrum -> Ethereum
    const bridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: arbitrumConfig.chain,
      address: arbitrumConfig.bridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    // to get ETH deposit from bridge contract and deployed inbox logs
    // we get the MessageDelivered event from bridge contract with kind === 12
    // and the event from deployed inbox with:
    // messageNum (from InboxMessageDelivered event) === messageIndex (from MessageDelivered event)
    const inboxEvents: Array<any> = inboxLogs
      .filter((log) => log.topics[0] === Events.InboxMessageDelivered)
      .map((log) => {
        return decodeEventLog({
          abi: ArbitrumDeployedInboxAbi,
          topics: log.topics,
          data: log.data,
        });
      });
    for (const log of bridgeLogs) {
      if (log.topics[0] === Events.MessageDelivered || log.topics[0] === Events.BridgeCallTriggered) {
        const event: any = decodeEventLog({
          abi: ArbitrumBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        if (log.topics[0] === Events.MessageDelivered) {
          const kind = Number(event.args.kind.toString());
          if (kind === 12) {
            const messageIndex = Number(event.args.messageIndex.toString());
            const inboxEvent = inboxEvents.filter(
              (event) => Number(event.args.messageNum.toString()) === messageIndex,
            )[0];
            if (inboxEvent) {
              try {
                const params: any = decodeAbiParameters(
                  [
                    {
                      name: 'sender',
                      type: 'address',
                    },
                    {
                      name: 'value',
                      type: 'uint256',
                    },
                  ],
                  inboxEvent.args.data,
                );

                const amountUsd = formatBigNumberToNumber(params[1].toString(), 18) * nativeTokenPriceUsd;

                (protocolData.volumes.bridge as number) += amountUsd;
                (protocolData.volumeBridgePaths as any)[arbitrumConfig.chain][arbitrumConfig.layer2Chain] += amountUsd;
                (protocolData.breakdown[arbitrumConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;
              } catch (e: any) {}
            }
          }
        } else {
          const event: any = decodeEventLog({
            abi: ArbitrumBridgeAbi,
            topics: log.topics,
            data: log.data,
          });

          const amountUsd = formatBigNumberToNumber(event.args.value.toString(), 18) * nativeTokenPriceUsd;

          (protocolData.volumes.bridge as number) += amountUsd;

          // withdraw from layer 2 -> ethereum
          (protocolData.volumeBridgePaths as any)[arbitrumConfig.layer2Chain][arbitrumConfig.chain] += amountUsd;
          (protocolData.breakdown[arbitrumConfig.layer2Chain][AddressZero].volumes.bridge as number) += amountUsd;
        }
      }
    }

    // ERC20 tokens activities
    for (const erc20Gateway of arbitrumConfig.erc20Gateways) {
      const calls: Array<ContractCall> = arbitrumConfig.supportedTokens.map((tokenAddress) => {
        return {
          abi: Erc20Abi,
          target: tokenAddress,
          method: 'balanceOf',
          params: [erc20Gateway],
        };
      });

      const results = await this.services.blockchain.evm.multicall({
        chain: arbitrumConfig.chain,
        blockNumber: blockNumber,
        calls: calls,
      });
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: arbitrumConfig.chain,
        address: erc20Gateway,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (let i = 0; i < arbitrumConfig.supportedTokens.length; i++) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: arbitrumConfig.chain,
          address: arbitrumConfig.supportedTokens[i],
        });
        if (token && results[i] && results[i].toString() !== '0') {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const balanceUsd = formatBigNumberToNumber(results[i].toString(), token.decimals) * tokenPriceUsd;

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;
          protocolData.breakdown[arbitrumConfig.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
            totalAssetDeposited: balanceUsd,
            totalValueLocked: balanceUsd,
          };

          for (const log of logs) {
            if (log.topics[0] === Events.DepositInitiated || log.topics[0] === Events.WithdrawalFinalized) {
              const event: any = decodeEventLog({
                abi: Erc20GatewayAbi,
                topics: log.topics,
                data: log.data,
              });

              if (compareAddress(token.address, event.args.l1Token)) {
                const amountUsd =
                  formatBigNumberToNumber(event.args._amount.toString(), token.decimals) * tokenPriceUsd;

                (protocolData.volumes.bridge as number) += amountUsd;
                (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

                if (log.topics[0] === Events.DepositInitiated) {
                  (protocolData.volumeBridgePaths as any)[arbitrumConfig.chain][arbitrumConfig.layer2Chain] +=
                    amountUsd;
                } else {
                  (protocolData.volumeBridgePaths as any)[arbitrumConfig.layer2Chain][arbitrumConfig.chain] +=
                    amountUsd;
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
