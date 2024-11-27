import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import { StarknetNativeBridgeConfig } from '../../../configs/protocols/starknet';
import StarknetBridgeAbi from '../../../configs/abi/starknet/StarknetTokenBridge.json';
import ProtocolExtendedAdapter from '../extended';

const Events = {
  Deposit: '0x5f971bd00bf3ffbca8a6d72cdd4fd92cfd4f62636161921d1e5a64f0b64ccb6d',
  Withdrawal: '0x2717ead6b9200dd235aad468c9809ea400fe33ac69b5bfaa6d3e90fc922b6398',
};

export default class StarknetNativeBridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.starknet';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const starknetConfig = this.protocolConfig as StarknetNativeBridgeConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [starknetConfig.chain]: {
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
        [starknetConfig.chain]: {
          [starknetConfig.layer2Chain]: 0,
        },
        [starknetConfig.layer2Chain]: {
          [starknetConfig.chain]: 0,
        },
      },
    };

    if (starknetConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      starknetConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      starknetConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      starknetConfig.chain,
      options.endTime,
    );

    const tokens: Array<Token> = [];
    for (const address of starknetConfig.tokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: starknetConfig.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);

        protocolData.breakdown[token.chain][token.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
        };
      }
    }

    for (const bridgeConfig of starknetConfig.bridges) {
      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: starknetConfig.chain,
        tokens: tokens,
        ownerAddress: bridgeConfig.bridge,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

      for (const [tokenAddress, balance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        protocolData.breakdown[starknetConfig.chain][tokenAddress].totalAssetDeposited += balance.balanceUsd;
        protocolData.breakdown[starknetConfig.chain][tokenAddress].totalValueLocked += balance.balanceUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: starknetConfig.chain,
        address: bridgeConfig.bridge,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.Deposit || log.topics[0] === Events.Withdrawal) {
          const event: any = decodeEventLog({
            abi: StarknetBridgeAbi,
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
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

            if (log.topics[0] === Events.Deposit) {
              (protocolData.volumeBridgePaths as any)[starknetConfig.chain][starknetConfig.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumeBridgePaths as any)[starknetConfig.layer2Chain][starknetConfig.chain] += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
