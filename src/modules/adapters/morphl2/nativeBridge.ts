import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { AddressZero } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { MorphL2BridgeProtocolConfig } from '../../../configs/protocols/morphl2';
import EthGatewayAbi from '../../../configs/abi/morphl2/L1ETHGateway.json';
import Erc20GatewayAbi from '../../../configs/abi/morphl2/L1StandardERC20Gateway.json';
import ProtocolExtendedAdapter from '../extended';

const Events = {
  DepositETH: '0xa900620ce06f0a525c07f9b89600c2297c6da3322a0cd2f034fbded0c1148eda',
  FinalizeWithdrawETH: '0x96db5d1cee1dd2760826bb56fabd9c9f6e978083e0a8b88559c741a29e9746e7',

  DepositERC20: '0x1a6c38816de45937fd5cd974f9694fe10e64163ba12a92abf0f4b6b23ad88672',
  FinalizeWithdrawERC20: '0xc6f985873b37805705f6bce756dce3d1ff4b603e298d506288cce499926846a7',
};

export default class MorphL2NativeBridgeAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.morphl2 🐨';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const morphl2Config = this.protocolConfig as MorphL2BridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [morphl2Config.chain]: {
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
        [morphl2Config.chain]: {
          [morphl2Config.layer2Chain]: 0,
        },
        [morphl2Config.layer2Chain]: {
          [morphl2Config.chain]: 0,
        },
      },
    };

    if (morphl2Config.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      morphl2Config.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      morphl2Config.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      morphl2Config.chain,
      options.endTime,
    );

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: morphl2Config.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const ethBalance = await this.services.blockchain.evm.getTokenBalance({
      chain: morphl2Config.chain,
      address: AddressZero,
      owner: morphl2Config.crossDomainMessage,
      blockNumber: blockNumber,
    });

    const totalEthUsd = formatBigNumberToNumber(ethBalance.toString(), 18) * ethPriceUsd;
    protocolData.totalAssetDeposited += totalEthUsd;
    protocolData.totalValueLocked += totalEthUsd;
    protocolData.breakdown[morphl2Config.chain][AddressZero].totalAssetDeposited += totalEthUsd;
    protocolData.breakdown[morphl2Config.chain][AddressZero].totalValueLocked += totalEthUsd;

    const ethGatewaylogs = await this.services.blockchain.evm.getContractLogs({
      chain: morphl2Config.chain,
      address: morphl2Config.ethGateway,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of ethGatewaylogs) {
      if (log.topics[0] === Events.DepositETH || log.topics[0] === Events.FinalizeWithdrawETH) {
        const event: any = decodeEventLog({
          abi: EthGatewayAbi,
          topics: log.topics,
          data: log.data,
        });
        const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;
        (protocolData.volumes.bridge as number) += amountUsd;
        (protocolData.breakdown[morphl2Config.chain][AddressZero].volumes.bridge as number) += amountUsd;
        if (log.topics[0] === Events.DepositETH) {
          (protocolData.volumeBridgePaths as any)[morphl2Config.chain][morphl2Config.layer2Chain] += amountUsd;
        } else {
          (protocolData.volumeBridgePaths as any)[morphl2Config.layer2Chain][morphl2Config.chain] += amountUsd;
        }
      }
    }

    const tokens: Array<Token> = [];
    for (const address of morphl2Config.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: morphl2Config.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }

    for (const erc20Gateway of morphl2Config.erc20Gateways) {
      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: morphl2Config.chain,
        ownerAddress: erc20Gateway,
        tokens: tokens,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

      for (const [tokenAddress, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        if (!protocolData.breakdown[morphl2Config.chain][tokenAddress]) {
          protocolData.breakdown[morphl2Config.chain][tokenAddress] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          };
        }

        protocolData.breakdown[morphl2Config.chain][tokenAddress].totalAssetDeposited += tokenBalance.balanceUsd;
        protocolData.breakdown[morphl2Config.chain][tokenAddress].totalValueLocked += tokenBalance.balanceUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: morphl2Config.chain,
        address: erc20Gateway,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.DepositERC20 || log.topics[0] === Events.FinalizeWithdrawERC20) {
          const event: any = decodeEventLog({
            abi: Erc20GatewayAbi,
            topics: log.topics,
            data: log.data,
          });
          const token = tokens.filter((item) => compareAddress(item.address, event.args.l1Token))[0];
          if (token) {
            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridge: 0,
                },
              };
            }

            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * tokenPriceUsd;

            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.breakdown[morphl2Config.chain][AddressZero].volumes.bridge as number) += amountUsd;

            if (log.topics[0] === Events.DepositERC20) {
              (protocolData.volumeBridgePaths as any)[morphl2Config.chain][morphl2Config.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumeBridgePaths as any)[morphl2Config.layer2Chain][morphl2Config.chain] += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
