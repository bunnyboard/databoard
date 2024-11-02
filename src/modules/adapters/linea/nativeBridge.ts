import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { Address, decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import { LineaNativeBridgeProtocolConfig } from '../../../configs/protocols/linea';
import MessageServiceAbi from '../../../configs/abi/linea/MessageService.json';
import TokenBridgeAbi from '../../../configs/abi/linea/TokenBridge.json';

const Events = {
  // ERC20 deposit/withdraw
  BridgingInitiated: '0xde5fcf0a1aebed387067eb25655de732ccfc43fe5b5a3d91d367c26e773fcd1c',
  BridgingInitiatedV2: '0x8780a94875b70464f8ac6c28851501d32e7fd4ee574e4b94beb28923a3c42d9c',
  BridgingFinalized: '0xd28a2d30314c6a2f46b657c15ee4d7ffc33b2817e78f341a260e216cebfbdbef',
  BridgingFinalizedV2: '0x6ed06519caca659cdefa71015c79a561928d3cf8cc4a3e9739fde9fb5fb38d64',

  // native ETH deposit/withdraw
  MessageSent: '0xe856c2b8bd4eb0027ce32eeaf595c21b0b6b4644b326e5b7bd80a1cf8db72e6c',
};

export default class LineaNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.linea';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const lineaConfig = this.protocolConfig as LineaNativeBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [lineaConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [lineaConfig.layer2Chain]: {
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
        [lineaConfig.chain]: {
          [lineaConfig.layer2Chain]: 0,
        },
        [lineaConfig.layer2Chain]: {
          [lineaConfig.chain]: 0,
        },
      },
    };

    if (lineaConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lineaConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lineaConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lineaConfig.chain,
      options.endTime,
    );

    // count native ETH balance of MessageService contract on L1
    const client = this.services.blockchain.evm.getPublicClient(lineaConfig.chain);
    const nativeBalance = await client.getBalance({
      address: lineaConfig.messageServiceL1 as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: lineaConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[lineaConfig.chain][AddressZero].totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.breakdown[lineaConfig.chain][AddressZero].totalValueLocked += nativeBalanceLockedUsd;

    const l1MessageServiceLogs = await this.services.blockchain.evm.getContractLogs({
      chain: lineaConfig.chain,
      address: lineaConfig.messageServiceL1,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of l1MessageServiceLogs) {
      if (log.topics[0] === Events.MessageSent) {
        const event: any = decodeEventLog({
          abi: MessageServiceAbi,
          topics: log.topics,
          data: log.data,
        });
        const nativeAmountUsd = formatBigNumberToNumber(event.args._value.toString(), 18) * nativeTokenPriceUsd;

        (protocolData.volumes.bridge as number) += nativeAmountUsd;
        (protocolData.breakdown[lineaConfig.chain][AddressZero].volumes.bridge as number) += nativeAmountUsd;

        // deposit ETH from ethereum -> linea
        (protocolData.volumeBridgePaths as any)[lineaConfig.chain][lineaConfig.layer2Chain] += nativeAmountUsd;
      }
    }

    const beginBlockL2 = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lineaConfig.layer2Chain,
      options.beginTime,
    );
    const endBlockL2 = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      lineaConfig.layer2Chain,
      options.endTime,
    );
    const l2MessageServiceLogs = await this.services.blockchain.evm.getContractLogs({
      chain: lineaConfig.chain,
      address: lineaConfig.messageServiceL2,
      fromBlock: beginBlockL2,
      toBlock: endBlockL2,
    });
    for (const log of l2MessageServiceLogs) {
      if (log.topics[0] === Events.MessageSent) {
        const event: any = decodeEventLog({
          abi: MessageServiceAbi,
          topics: log.topics,
          data: log.data,
        });
        const nativeAmountUsd = formatBigNumberToNumber(event.args._value.toString(), 18) * nativeTokenPriceUsd;

        (protocolData.volumes.bridge as number) += nativeAmountUsd;
        (protocolData.breakdown[lineaConfig.chain][AddressZero].volumes.bridge as number) += nativeAmountUsd;

        // withdraw ETH from linea -> ethereum
        (protocolData.volumeBridgePaths as any)[lineaConfig.layer2Chain][lineaConfig.chain] += nativeAmountUsd;
      }
    }

    const tokens: Array<Token> = [];
    for (const address of lineaConfig.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: lineaConfig.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }
    const getBalanceResult = await this.getAddressBalanceUsd({
      chain: lineaConfig.chain,
      ownerAddress: lineaConfig.tokenBridge,
      tokens: tokens,
      blockNumber: blockNumber,
      timestamp: options.timestamp,
    });

    protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
    protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

    for (const [address, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
      protocolData.breakdown[lineaConfig.chain][address] = {
        ...getInitialProtocolCoreMetrics(),
        volumes: {
          bridge: 0,
        },
      };
      protocolData.breakdown[lineaConfig.chain][address].totalAssetDeposited += tokenBalance.balanceUsd;
      protocolData.breakdown[lineaConfig.chain][address].totalValueLocked += tokenBalance.balanceUsd;
    }

    const tokenBridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: lineaConfig.chain,
      address: lineaConfig.tokenBridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of tokenBridgeLogs) {
      const signature = log.topics[0];
      if (
        signature === Events.BridgingInitiated ||
        signature === Events.BridgingInitiatedV2 ||
        signature === Events.BridgingFinalized ||
        signature === Events.BridgingFinalizedV2
      ) {
        const event: any = decodeEventLog({
          abi: TokenBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        let token: Token | undefined = undefined;
        if (signature === Events.BridgingInitiated || signature === Events.BridgingInitiatedV2) {
          token = tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
        } else {
          token = tokens.filter((item) => compareAddress(item.address, event.args.nativeToken))[0];
        }

        if (token) {
          const tokenPriceUsd = getBalanceResult.tokenBalanceUsds[token.address]
            ? getBalanceResult.tokenBalanceUsds[token.address].priceUsd
            : 0;
          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

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

          if (signature === Events.BridgingInitiated || signature === Events.BridgingInitiatedV2) {
            (protocolData.volumeBridgePaths as any)[lineaConfig.chain][lineaConfig.layer2Chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[lineaConfig.layer2Chain][lineaConfig.chain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
