import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { AddressZero } from '../../../configs/constants';
import TaikoBridgeAbi from '../../../configs/abi/taiko/TaikoBridge.json';
import TaikoErc20VaultAbi from '../../../configs/abi/taiko/TaikoErc20Vault.json';
import { decodeEventLog } from 'viem';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { TaikoBridgeProtocolConfig } from '../../../configs/protocols/taiko';
import ProtocolExtendedAdapter from '../extended';

const Events = {
  MessageSent: '0xe33fd33b4f45b95b1c196242240c5b5233129d724b578f95b66ce8d8aae93517',
  MessageProcessed: '0x8580f507761043ecdd2bdca084d6fb0109150b3d9842d854d34e3dea6d69387d',

  TokenSent: '0x256f5c87f6ab8d238ac244067613227eb6e2cd65299121135d4f778e8581e03d',
  TokenReceived: '0x75a051823424fc80e92556c41cb0ad977ae1dcb09c68a9c38acab86b11a69f89',
};

export default class TaikoNativeBridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.taiko 🥁';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const taikoConfig = this.protocolConfig as TaikoBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [taikoConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [taikoConfig.layer2Chain]: {
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
        [taikoConfig.chain]: {
          [taikoConfig.layer2Chain]: 0,
        },
        [taikoConfig.layer2Chain]: {
          [taikoConfig.chain]: 0,
        },
      },
    };

    if (taikoConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      taikoConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      taikoConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      taikoConfig.chain,
      options.endTime,
    );

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: taikoConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const ethBalance = await this.services.blockchain.evm.getTokenBalance({
      chain: taikoConfig.chain,
      address: AddressZero,
      owner: taikoConfig.taikoBridge,
      blockNumber: blockNumber,
    });

    const totalEthUsd = formatBigNumberToNumber(ethBalance.toString(), 18) * ethPriceUsd;

    protocolData.totalAssetDeposited += totalEthUsd;
    protocolData.totalValueLocked += totalEthUsd;
    protocolData.breakdown[taikoConfig.chain][AddressZero].totalAssetDeposited += totalEthUsd;
    protocolData.breakdown[taikoConfig.chain][AddressZero].totalValueLocked += totalEthUsd;

    const tokens: Array<Token> = [];
    for (const address of taikoConfig.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: taikoConfig.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }
    const getBalanceResult = await this.getAddressBalanceUsd({
      chain: taikoConfig.chain,
      ownerAddress: taikoConfig.taikoErc20Vault,
      tokens: tokens,
      blockNumber: blockNumber,
      timestamp: options.timestamp,
    });

    protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
    protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

    for (const [tokenAddress, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
      if (!protocolData.breakdown[taikoConfig.chain][tokenAddress]) {
        protocolData.breakdown[taikoConfig.chain][tokenAddress] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
        };
      }

      protocolData.breakdown[taikoConfig.chain][tokenAddress].totalAssetDeposited += tokenBalance.balanceUsd;
      protocolData.breakdown[taikoConfig.chain][tokenAddress].totalValueLocked += tokenBalance.balanceUsd;
    }

    let logs = await this.services.blockchain.evm.getContractLogs({
      chain: taikoConfig.chain,
      address: taikoConfig.taikoBridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    logs = logs.concat(
      await this.services.blockchain.evm.getContractLogs({
        chain: taikoConfig.chain,
        address: taikoConfig.taikoErc20Vault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      }),
    );
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === Events.MessageSent || signature === Events.MessageProcessed) {
        const event: any = decodeEventLog({
          abi: TaikoBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        // deposit/withdraw ETH
        if (event.args.message.data === '0x') {
          const amountUsd = formatBigNumberToNumber(event.args.message.value.toString(), 18) * ethPriceUsd;

          (protocolData.volumes.bridge as number) += amountUsd;
          (protocolData.breakdown[taikoConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;

          if (signature === Events.MessageSent) {
            // deposit
            (protocolData.volumeBridgePaths as any)[taikoConfig.chain][taikoConfig.layer2Chain] += amountUsd;
          } else {
            // withdraw
            (protocolData.volumeBridgePaths as any)[taikoConfig.layer2Chain][taikoConfig.chain] += amountUsd;
          }
        }
      } else if (signature === Events.TokenSent || signature === Events.TokenReceived) {
        const event: any = decodeEventLog({
          abi: TaikoErc20VaultAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
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

          if (signature === Events.TokenSent) {
            // deposit
            (protocolData.volumeBridgePaths as any)[taikoConfig.chain][taikoConfig.layer2Chain] += amountUsd;
          } else {
            // withdraw
            (protocolData.volumeBridgePaths as any)[taikoConfig.layer2Chain][taikoConfig.chain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
