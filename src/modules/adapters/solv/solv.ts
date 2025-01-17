import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { SolvProtocolConfig } from '../../../configs/protocols/solv';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import axios from 'axios';
import { ChainNames } from '../../../configs/names';
import { AddressZero, Erc20TransferEventSignature, MockBitcoinAddress } from '../../../configs/constants';
import { decodeEventLog } from 'viem';

export default class SolvAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.solv';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const solvConfig = this.protocolConfig as SolvProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [ChainNames.bitcoin]: {
          [MockBitcoinAddress]: {
            ...getInitialProtocolCoreMetrics(),
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        // mint/burn SolvBTC
        borrow: 0,
        repay: 0,
      },
    };

    // get BTC balance
    const btcPriceUsd = await this.services.oracle.getCurrencyPriceUsd({
      currency: 'btc',
      timestamp: options.timestamp,
    });
    const btcAddressess = (await axios.get(solvConfig.activeAddressListApi)).data.bitcoin;
    for (const btcAddress of btcAddressess) {
      const balance = await this.services.blockchain.bitcore.getAddressBalance(
        ChainNames.bitcoin,
        btcAddress,
        options.timestamp,
      );
      const balanceUsd = formatBigNumberToNumber(balance, 8) * btcPriceUsd;

      protocolData.totalAssetDeposited += balanceUsd;
      protocolData.totalValueLocked += balanceUsd;
      protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalAssetDeposited += balanceUsd;
      protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalValueLocked += balanceUsd;
    }

    for (const pool of solvConfig.pools) {
      if (pool.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[pool.chain]) {
        protocolData.breakdown[pool.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        pool.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(pool.chain, options.beginTime);
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(pool.chain, options.endTime);

      // get total SolvBTC supply
      const solvBTC = normalizeAddress(pool.solvBTC);
      const solvBtcPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: pool.chain,
        address: pool.solvBTC,
        timestamp: options.timestamp,
      });
      const totalSupply = await this.services.blockchain.evm.readContract({
        chain: pool.chain,
        abi: Erc20Abi,
        target: pool.solvBTC,
        method: 'totalSupply',
        params: [],
        blockNumber: blockNumber,
      });

      const balanceUsd = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', 18) * solvBtcPriceUsd;

      (protocolData.totalSupplied as number) += balanceUsd;

      if (!protocolData.breakdown[pool.chain][solvBTC]) {
        protocolData.breakdown[pool.chain][solvBTC] = {
          ...getInitialProtocolCoreMetrics(),
          totalSupplied: 0,
          volumes: {
            borrow: 0,
            repay: 0,
          },
        };
      }
      (protocolData.breakdown[pool.chain][solvBTC].totalSupplied as number) += balanceUsd;

      for (const vault of pool.vaults) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: pool.chain,
          address: vault.token,
        });
        if (token) {
          const balance = await this.services.blockchain.evm.getTokenBalance({
            chain: token.chain,
            address: token.address,
            owner: vault.vault,
            blockNumber: blockNumber,
          });
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const balanceUsd =
            formatBigNumberToNumber(balance ? balance.toString() : '0', token.decimals) * tokenPriceUsd;

          protocolData.totalAssetDeposited += balanceUsd;
          protocolData.totalValueLocked += balanceUsd;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
        }
      }

      // count mint/burn SolvBTC volumes
      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: pool.chain,
        address: pool.solvBTC,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const event of logs
        .filter((log) => log.topics[0] === Erc20TransferEventSignature)
        .map((log) =>
          decodeEventLog({
            abi: Erc20Abi,
            topics: log.topics,
            data: log.data,
          }),
        )
        .filter(
          (event: any) => compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero),
        ) as Array<any>) {
        const amountUsd = formatBigNumberToNumber(event.args.value.toString(), 18) * solvBtcPriceUsd;

        if (compareAddress(event.args.from, AddressZero)) {
          (protocolData.volumes.borrow as number) += amountUsd;
          (protocolData.breakdown[pool.chain][solvBTC].volumes.borrow as number) += amountUsd;
        } else if (compareAddress(event.args.to, AddressZero)) {
          (protocolData.volumes.repay as number) += amountUsd;
          (protocolData.breakdown[pool.chain][solvBTC].volumes.repay as number) += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData, { uncountBorrowRepayAsMoneyFlow: true });
  }
}
