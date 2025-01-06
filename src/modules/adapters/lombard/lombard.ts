import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { AddressZero, Erc20TransferEventSignature, MockBitcoinAddress } from '../../../configs/constants';
import ProtocolExtendedAdapter from '../extended';
import { LombardProtocolConfig } from '../../../configs/protocols/lombard';
import { ChainNames } from '../../../configs/names';
import { decodeEventLog } from 'viem';

export default class LombardAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.lombard';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const lombardConfig = this.protocolConfig as LombardProtocolConfig;

    if (lombardConfig.birthday > options.timestamp) {
      return null;
    }

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),

      // total LBTC supply
      totalBorrowed: 0,

      volumes: {
        // mint/redeem LBTC
        borrow: 0,
        repay: 0,

        // deposit/withdraw collaterals
        deposit: 0,
        withdraw: 0,
      },
    };

    for (const poolConfig of lombardConfig.pools) {
      if (poolConfig.birthday > options.timestamp) {
        continue;
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.endTime,
      );

      const lbtcToken = await this.services.blockchain.evm.getTokenInfo({
        chain: poolConfig.chain,
        address: poolConfig.lbtc,
      });

      if (!lbtcToken) {
        continue;
      }

      if (!protocolData.breakdown[poolConfig.chain]) {
        protocolData.breakdown[poolConfig.chain] = {};
      }

      // get total BTC deposited by LBTC totalSupply
      const lbtcTotalSupply = await this.services.blockchain.evm.readContract({
        chain: poolConfig.chain,
        abi: Erc20Abi,
        target: poolConfig.lbtc,
        method: 'totalSupply',
        params: [],
        blockNumber: blockNumber,
      });
      const lbtcPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: poolConfig.chain,
        address: poolConfig.lbtc,
        timestamp: options.timestamp,
      });

      const totalSupplyUsd = formatBigNumberToNumber(lbtcTotalSupply.toString(), lbtcToken.decimals) * lbtcPriceUsd;

      protocolData.totalAssetDeposited += totalSupplyUsd;
      protocolData.totalValueLocked += totalSupplyUsd;
      (protocolData.totalBorrowed as number) += totalSupplyUsd;

      if (poolConfig.native) {
        // BTC locked on bitcoin blockchain
        if (!protocolData.breakdown[ChainNames.bitcoin]) {
          protocolData.breakdown[ChainNames.bitcoin] = {};
        }
        if (!protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress]) {
          protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              // deposit/withdraw BTC
              deposit: 0,
              withdraw: 0,
            },
          };
        }
        protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalAssetDeposited += totalSupplyUsd;
        protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalValueLocked += totalSupplyUsd;
      } else if (poolConfig.pmm && poolConfig.pmmToken) {
        // BTC locked via pmm module
        const pmmToken = await this.services.blockchain.evm.getTokenInfo({
          chain: poolConfig.chain,
          address: poolConfig.pmmToken,
        });
        if (pmmToken) {
          // total pmm token locked
          if (!protocolData.breakdown[pmmToken.chain][pmmToken.address]) {
            protocolData.breakdown[pmmToken.chain][pmmToken.address] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                // deposit/withdraw pmm token
                deposit: 0,
                withdraw: 0,
              },
            };
          }
          protocolData.breakdown[pmmToken.chain][pmmToken.address].totalAssetDeposited += totalSupplyUsd;
          protocolData.breakdown[pmmToken.chain][pmmToken.address].totalValueLocked += totalSupplyUsd;
        }
      }

      // total LBTC issued
      if (!protocolData.breakdown[lbtcToken.chain][lbtcToken.address]) {
        protocolData.breakdown[lbtcToken.chain][lbtcToken.address] = {
          ...getInitialProtocolCoreMetrics(),

          // total LBTC supply
          totalBorrowed: 0,

          volumes: {
            // mint/redeem LBTC
            borrow: 0,
            repay: 0,
          },
        };
      }
      (protocolData.breakdown[lbtcToken.chain][lbtcToken.address].totalBorrowed as number) += totalSupplyUsd;

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: poolConfig.chain,
        address: poolConfig.lbtc,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs
        .filter((item) => item.topics[0] === Erc20TransferEventSignature)
        .map((log) =>
          decodeEventLog({
            abi: Erc20Abi,
            topics: log.topics,
            data: log.data,
          }),
        )) {
        const event: any = log;
        const amountUsd = formatBigNumberToNumber(event.args.value.toString(), lbtcToken.decimals) * lbtcPriceUsd;

        if (compareAddress(event.args.from, AddressZero)) {
          // mint LBTC - deposit BTC

          (protocolData.volumes.borrow as number) += amountUsd;
          (protocolData.volumes.deposit as number) += amountUsd;

          (protocolData.breakdown[lbtcToken.chain][lbtcToken.address].volumes.borrow as number) += amountUsd;
          if (poolConfig.native) {
            (protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].volumes.deposit as number) += amountUsd;
          } else if (poolConfig.pmmToken) {
            (protocolData.breakdown[poolConfig.chain][normalizeAddress(poolConfig.pmmToken)].volumes
              .deposit as number) += amountUsd;
          }
        } else if (compareAddress(event.args.to, AddressZero)) {
          // burn LBTC - withdraw BTC - change 0.0001 BTC
          // https://docs.lombard.finance/technical-documentation/protocol-fees#unstaking-fees

          (protocolData.volumes.borrow as number) += amountUsd;
          (protocolData.volumes.deposit as number) += amountUsd;

          (protocolData.breakdown[lbtcToken.chain][lbtcToken.address].volumes.repay as number) += amountUsd;
          if (poolConfig.native) {
            (protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].volumes.withdraw as number) += amountUsd;
          } else if (poolConfig.pmmToken) {
            (protocolData.breakdown[poolConfig.chain][normalizeAddress(poolConfig.pmmToken)].volumes
              .withdraw as number) += amountUsd;
          }

          const unstakingFee = 0.0001 * lbtcPriceUsd;
          protocolData.totalFees += unstakingFee;
          protocolData.protocolRevenue += unstakingFee;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
