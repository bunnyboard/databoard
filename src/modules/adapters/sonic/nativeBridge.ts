import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { SonicNativeBridgeProtocolConfig } from '../../../configs/protocols/sonic';
import TokenDepositAbi from '../../../configs/abi/sonic/TokenDeposit.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';

const Events = {
  Deposit: '0x2c0f148b435140de488c1b34647f1511c646f7077e87007bacf22ef9977a16d8',
  Claim: '0xa27580a77a01c86ee8598d930ae5f9a0ec6f146c6e0e9e9f50b95bacb3378718',
};

export default class SonicNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.sonic';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const sonicConfig = this.protocolConfig as SonicNativeBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [sonicConfig.sourceChain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [sonicConfig.sourceChain]: {
          [sonicConfig.destChain]: 0,
        },
        [sonicConfig.destChain]: {
          [sonicConfig.sourceChain]: 0,
        },
      },
    };

    if (sonicConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      sonicConfig.sourceChain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      sonicConfig.sourceChain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      sonicConfig.sourceChain,
      options.endTime,
    );

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: sonicConfig.sourceChain,
      address: sonicConfig.bridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const address of sonicConfig.tokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: sonicConfig.sourceChain,
        address: address,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });
        const tokenBalance = await this.services.blockchain.evm.getTokenBalance({
          chain: token.chain,
          address: token.address,
          owner: sonicConfig.bridge,
          blockNumber: blockNumber,
        });

        const tokenBalanceUsd =
          formatBigNumberToNumber(tokenBalance ? tokenBalance.toString() : '0', token.decimals) * tokenPriceUsd;

        protocolData.totalAssetDeposited += tokenBalanceUsd;
        protocolData.totalValueLocked += tokenBalanceUsd;

        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalAssetDeposited += tokenBalanceUsd;
        protocolData.breakdown[token.chain][token.address].totalValueLocked += tokenBalanceUsd;

        const events: Array<any> = logs
          .filter((item) => Object.values(Events).includes(item.topics[0]))
          .map((item) =>
            decodeEventLog({
              abi: TokenDepositAbi,
              topics: item.topics,
              data: item.data,
            }),
          )
          .filter((item: any) => compareAddress(item.args.token, token.address));

        for (const event of events) {
          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

          (protocolData.volumes.bridge as number) += amountUsd;
          (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

          if (event.eventName === 'Deposit') {
            (protocolData.volumeBridgePaths as any)[sonicConfig.sourceChain][sonicConfig.destChain] += amountUsd;
          } else if (event.eventName === 'Claim') {
            (protocolData.volumeBridgePaths as any)[sonicConfig.destChain][sonicConfig.sourceChain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
