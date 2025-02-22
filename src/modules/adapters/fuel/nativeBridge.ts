import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { AddressZero } from '../../../configs/constants';
import { FuelBridgeProtocolConfig } from '../../../configs/protocols/fuel';
import PreDepositAbi from '../../../configs/abi/fuel/PreDeposits.json';
import Erc20BridgeAbi from '../../../configs/abi/fuel/FuelERC20GatewayV4.json';
import { decodeEventLog } from 'viem';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';

const Events = {
  // count deposit volume by Deposit and Migration in PreDeposit contract
  // count withdraw volume by Withdraw on PreDeposit contract and WithdrawERC20 on BridgeERC20 contract

  // PreDeposit
  Deposit: '0x4fde9e5d7200f715524c39d7165496d6f0ac51f4766ac6e3a5741e11128cc05e',
  Migration: '0x39ff1576caf5e264e5bbbacaebb8cc991095027fb6767760a6999f8a99da5c57',
  Withdraw: '0xabf7ab13182369b5ffd4445f0a4f0bbed727090252425ddef0a765e21cd8f607',

  // ERC20Bridge
  WithdrawERC20: '0x028ab133c73f6c00ad0c5896ef40eff18378acd3d7f2ecf573c2706582bf73bf',
};

export default class FuelNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.fuel';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const fuelConfig = this.protocolConfig as FuelBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [fuelConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [fuelConfig.layer2Chain]: {
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
        [fuelConfig.chain]: {
          [fuelConfig.layer2Chain]: 0,
        },
        [fuelConfig.layer2Chain]: {
          [fuelConfig.chain]: 0,
        },
      },
    };

    if (fuelConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      fuelConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      fuelConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(fuelConfig.chain, options.endTime);

    const tokens: Array<Token> = [];
    for (const address of fuelConfig.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: fuelConfig.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }

    const tokenPrices: { [key: string]: number } = {};
    for (const bridgeAddress of [fuelConfig.fuelPreDeposit, fuelConfig.fuelBridge, fuelConfig.fuelErc20Bridge]) {
      const getBalanceResult = await this.getAddressBalanceUsd({
        chain: fuelConfig.chain,
        ownerAddress: bridgeAddress,
        tokens: tokens,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
      protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

      for (const [tokenAddress, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
        if (!protocolData.breakdown[fuelConfig.chain][tokenAddress]) {
          protocolData.breakdown[fuelConfig.chain][tokenAddress] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          };
        }

        protocolData.breakdown[fuelConfig.chain][tokenAddress].totalAssetDeposited += tokenBalance.balanceUsd;
        protocolData.breakdown[fuelConfig.chain][tokenAddress].totalValueLocked += tokenBalance.balanceUsd;

        tokenPrices[tokenAddress] = tokenBalance.priceUsd;
      }
    }

    let logs = await this.services.blockchain.evm.getContractLogs({
      chain: fuelConfig.chain,
      address: fuelConfig.fuelPreDeposit,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    logs = logs.concat(
      await this.services.blockchain.evm.getContractLogs({
        chain: fuelConfig.chain,
        address: fuelConfig.fuelErc20Bridge,
        fromBlock: beginBlock,
        toBlock: endBlock,
      }),
    );
    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === Events.Deposit || signature === Events.Migration || signature === Events.Withdraw) {
        const event: any = decodeEventLog({
          abi: PreDepositAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
        if (token) {
          const tokenPriceUsd = tokenPrices[token.address] ? tokenPrices[token.address] : 0;
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

          if (signature === Events.Withdraw) {
            (protocolData.volumeBridgePaths as any)[fuelConfig.layer2Chain][fuelConfig.chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[fuelConfig.chain][fuelConfig.layer2Chain] += amountUsd;
          }
        }
      } else if (signature === Events.WithdrawERC20) {
        const event: any = decodeEventLog({
          abi: Erc20BridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = tokens.filter((item) => compareAddress(item.address, event.args.tokenAddress))[0];
        if (token) {
          const tokenPriceUsd = tokenPrices[token.address] ? tokenPrices[token.address] : 0;
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

          // withdraw
          (protocolData.volumeBridgePaths as any)[fuelConfig.layer2Chain][fuelConfig.chain] += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
