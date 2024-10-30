import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { Address, decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import EthGatewayAbi from '../../../configs/abi/scroll/L1ETHGateway.json';
import Erc20GatewayAbi from '../../../configs/abi/scroll/L1StandardERC20Gateway.json';
import { ScrollBridgeProtocolConfig } from '../../../configs/protocols/scroll';

const Events = {
  // ERC20 deposit
  DepositERC20: '0x31cd3b976e4d654022bf95c68a2ce53f1d5d94afabe0454d2832208eeb40af25',
  FinalizeWithdrawERC20: '0xc6f985873b37805705f6bce756dce3d1ff4b603e298d506288cce499926846a7',

  // native ETH deposit
  DepositETH: '0x6670de856ec8bf5cb2b7e957c5dc24759716056f79d97ea5e7c939ca0ba5a675',
  FinalizeWithdrawETH: '0x96db5d1cee1dd2760826bb56fabd9c9f6e978083e0a8b88559c741a29e9746e7',
};

export default class ScrollNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.scroll 📜';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const scrollConfig = this.protocolConfig as ScrollBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [scrollConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [scrollConfig.layer2Chain]: {
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
        [scrollConfig.chain]: {
          [scrollConfig.layer2Chain]: 0,
        },
        [scrollConfig.layer2Chain]: {
          [scrollConfig.chain]: 0,
        },
      },
    };

    if (scrollConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      scrollConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      scrollConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      scrollConfig.chain,
      options.endTime,
    );

    // native ETH
    const client = this.services.blockchain.evm.getPublicClient(scrollConfig.chain);
    const nativeBalance = await client.getBalance({
      address: scrollConfig.messengerProxy as Address,
      blockNumber: BigInt(blockNumber),
    });
    const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: scrollConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const nativeBalanceLockedUsd =
      formatBigNumberToNumber(nativeBalance ? nativeBalance.toString() : '0', 18) * nativeTokenPriceUsd;

    protocolData.totalAssetDeposited += nativeBalanceLockedUsd;
    protocolData.totalValueLocked += nativeBalanceLockedUsd;
    protocolData.breakdown[scrollConfig.chain][AddressZero] = {
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      totalAssetDeposited: nativeBalanceLockedUsd,
      totalValueLocked: nativeBalanceLockedUsd,
    };

    const ethGatewayLogs = await this.services.blockchain.evm.getContractLogs({
      chain: scrollConfig.chain,
      address: scrollConfig.ethGateway,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of ethGatewayLogs.filter(
      (item) => item.topics[0] === Events.DepositETH || item.topics[0] === Events.FinalizeWithdrawETH,
    )) {
      const event: any = decodeEventLog({
        abi: EthGatewayAbi,
        topics: log.topics,
        data: log.data,
      });

      const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * nativeTokenPriceUsd;

      (protocolData.volumes.bridge as number) += amountUsd;
      (protocolData.breakdown[scrollConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;

      if (log.topics[0] === Events.DepositETH) {
        (protocolData.volumeBridgePaths as any)[scrollConfig.chain][scrollConfig.layer2Chain] += amountUsd;
      } else {
        (protocolData.volumeBridgePaths as any)[scrollConfig.layer2Chain][scrollConfig.chain] += amountUsd;
      }
    }

    // ERC20 tokens activities
    for (const erc20Gateway of scrollConfig.erc20Gateways) {
      const tokens: Array<Token> = [];
      for (const address of erc20Gateway.supportedTokens) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: scrollConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: scrollConfig.chain,
        ownerAddress: erc20Gateway.gateway,
        tokens: tokens,
        timestamp: options.timestamp,
        blockNumber: blockNumber,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

      for (const [address, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        if (!protocolData.breakdown[scrollConfig.chain][address]) {
          protocolData.breakdown[scrollConfig.chain][address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          };
        }
        protocolData.breakdown[scrollConfig.chain][address].totalAssetDeposited += tokenBalance.balanceUsd;
        protocolData.breakdown[scrollConfig.chain][address].totalValueLocked += tokenBalance.balanceUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: scrollConfig.chain,
        address: erc20Gateway.gateway,
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
            const tokenPriceUsd = getBalanceResult.tokenBalanceUsds[token.address]
              ? getBalanceResult.tokenBalanceUsds[token.address].priceUsd
              : 0;
            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

            if (log.topics[0] === Events.DepositERC20) {
              (protocolData.volumeBridgePaths as any)[scrollConfig.chain][scrollConfig.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumeBridgePaths as any)[scrollConfig.layer2Chain][scrollConfig.chain] += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
