import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { Address, decodeEventLog } from 'viem';
import { AddressOne, AddressZero } from '../../../configs/constants';
import { ZksyncNativeBridgeProtocolConfig } from '../../../configs/protocols/zksync';
import ZksyncBridgeAbi from '../../../configs/abi/zksync/L1SharedBridge.json';
import { BlockchainConfigs } from '../../../configs/blockchains';
import ProtocolExtendedAdapter from '../extended';

const Events = {
  // deposit from ethereum -> zksync
  BridgehubDepositInitiated: '0x8768405a01370685449c74c293804d6c9cc216d170acdbdba50b33ed4144447f',

  // withdraw from zksync -> ethereum
  WithdrawalFinalizedSharedBridge: '0x05518b128f0a9b11ddddebd5211a7fc2f4a689dab3a3e258d93eb13049983c3e',
};

export default class ZksyncNativeBridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.zksync';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const zksyncConfig = this.protocolConfig as ZksyncNativeBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [zksyncConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [zksyncConfig.layer2Chain]: {
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
        [zksyncConfig.chain]: {
          [zksyncConfig.layer2Chain]: 0,
        },
        [zksyncConfig.layer2Chain]: {
          [zksyncConfig.chain]: 0,
        },
      },
    };

    if (zksyncConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      zksyncConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      zksyncConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      zksyncConfig.chain,
      options.endTime,
    );

    // count ERC20 tokens balances
    const tokens: Array<Token> = [];
    for (const address of zksyncConfig.tokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: zksyncConfig.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }
    const getBalanceResults = await this.getAddressBalanceUsd({
      chain: zksyncConfig.chain,
      ownerAddress: zksyncConfig.shareBridge,
      timestamp: options.timestamp,
      blockNumber: blockNumber,
      tokens: tokens,
    });
    protocolData.totalAssetDeposited += getBalanceResults.totalBalanceUsd;
    protocolData.totalValueLocked += getBalanceResults.totalBalanceUsd;
    for (const [address, tokenBalance] of Object.entries(getBalanceResults.tokenBalanceUsds)) {
      if (!protocolData.breakdown[zksyncConfig.chain][address]) {
        protocolData.breakdown[zksyncConfig.chain][address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
        };
      }

      protocolData.breakdown[zksyncConfig.chain][address].totalAssetDeposited += tokenBalance.balanceUsd;
      protocolData.breakdown[zksyncConfig.chain][address].totalValueLocked += tokenBalance.balanceUsd;
    }

    // native ETH balance
    const client = this.services.blockchain.evm.getPublicClient(zksyncConfig.chain);
    const nativeBalance = await client.getBalance({
      address: zksyncConfig.shareBridge as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: zksyncConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[zksyncConfig.chain][AddressZero].totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.breakdown[zksyncConfig.chain][AddressZero].totalValueLocked += nativeBalanceLockedUsd;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: zksyncConfig.chain,
      address: zksyncConfig.shareBridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (
        log.topics[0] === Events.BridgehubDepositInitiated ||
        log.topics[0] === Events.WithdrawalFinalizedSharedBridge
      ) {
        const event: any = decodeEventLog({
          abi: ZksyncBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        const chainId = Number(event.args.chainId);
        const l1Token = normalizeAddress(event.args.l1Token);

        if (
          chainId === BlockchainConfigs.zksync.chainId &&
          getBalanceResults.tokenBalanceUsds[l1Token] &&
          getBalanceResults.tokenBalanceUsds[l1Token].priceUsd > 0
        ) {
          let token: Token | null = null;
          if (compareAddress(l1Token, AddressOne)) {
            token = await this.services.blockchain.evm.getTokenInfo({
              chain: zksyncConfig.chain,
              address: AddressOne,
            });
          } else {
            token = tokens.filter((item) => compareAddress(item.address, l1Token))[0];
          }

          if (token) {
            const amountUsd =
              formatBigNumberToNumber(event.args.amount.toString(), token.decimals) *
              getBalanceResults.tokenBalanceUsds[l1Token].priceUsd;

            if (log.topics[0] === Events.BridgehubDepositInitiated) {
              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[zksyncConfig.chain][zksyncConfig.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[zksyncConfig.layer2Chain][zksyncConfig.chain] += amountUsd;
            }

            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
