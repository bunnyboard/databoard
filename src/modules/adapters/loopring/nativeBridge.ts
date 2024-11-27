import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { AddressZero } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolExtendedAdapter from '../extended';
import { LoopringBridgeProtocolConfig } from '../../../configs/protocols/loopring';
import LoopringExchangeAbi from '../../../configs/abi/loopring/ExchangeV3.json';

const Events = {
  DepositRequested: '0x73ff7b101bcdc22f199e8e1dd9893170a683d6897be4f1086ca05705abb886ae',
  WithdrawalCompleted: '0x0d22d7344fc6871a839149fd89f9fd88a6c29cf797a67114772a9d4df5f8c96b',
};

export default class LoopringNativeBridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.loopring';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const loopring = this.protocolConfig as LoopringBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [loopring.chain]: {
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
        [loopring.chain]: {
          [loopring.layer2Chain]: 0,
        },
        [loopring.layer2Chain]: {
          [loopring.chain]: 0,
        },
      },
    };

    if (loopring.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      loopring.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      loopring.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(loopring.chain, options.endTime);

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: loopring.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const ethBalance = await this.services.blockchain.evm.getTokenBalance({
      chain: loopring.chain,
      address: AddressZero,
      owner: loopring.depositContract,
      blockNumber: blockNumber,
    });

    const totalEthBalanceUsd = formatBigNumberToNumber(ethBalance.toString(), 18) * ethPriceUsd;

    const tokens: Array<Token> = [];
    for (const address of loopring.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: loopring.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }

    const getBalanceResult = await this.getAddressBalanceUsd({
      chain: loopring.chain,
      ownerAddress: loopring.depositContract,
      tokens: tokens,
      blockNumber: blockNumber,
      timestamp: options.timestamp,
    });

    protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd + totalEthBalanceUsd;
    protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd + totalEthBalanceUsd;

    protocolData.breakdown[loopring.chain][AddressZero].totalAssetDeposited += totalEthBalanceUsd;
    protocolData.breakdown[loopring.chain][AddressZero].totalValueLocked += totalEthBalanceUsd;
    for (const [tokenAddress, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
      if (!protocolData.breakdown[loopring.chain][tokenAddress]) {
        protocolData.breakdown[loopring.chain][tokenAddress] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
        };
      }

      protocolData.breakdown[loopring.chain][tokenAddress].totalAssetDeposited += tokenBalance.balanceUsd;
      protocolData.breakdown[loopring.chain][tokenAddress].totalValueLocked += tokenBalance.balanceUsd;
    }

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: loopring.chain,
      address: loopring.exchangeContract,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === Events.DepositRequested || signature === Events.WithdrawalCompleted) {
        const event: any = decodeEventLog({
          abi: LoopringExchangeAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: loopring.chain,
          address: event.args.token,
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

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

          if (signature === Events.DepositRequested) {
            (protocolData.volumeBridgePaths as any)[loopring.layer2Chain][loopring.chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[loopring.chain][loopring.layer2Chain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
