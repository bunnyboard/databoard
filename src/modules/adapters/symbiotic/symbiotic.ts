import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { ContractCall } from '../../../services/blockchains/domains';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';
import { SymbioticProtocolConfig } from '../../../configs/protocols/symbiotic';
import { decodeEventLog } from 'viem';
import CollateralAbi from '../../../configs/abi/symbiotic/DefaultCollateral.json';

const Events = {
  // deposit
  Deposit: '0x5548c837ab068cf56a2c2479df0882a4922fd203edb7517321831d95078c5f62',

  // withdraw
  Withdraw: '0x9b1bfa7fa9ee420a16e124f794c35ac9f90472acc99140eb2f6447c714cad8eb',
};

export default class SymbioticAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.symbiotic';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const symbioticConfig = this.protocolConfig as SymbioticProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [symbioticConfig.chain]: {},
      },

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    if (symbioticConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      symbioticConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      symbioticConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      symbioticConfig.chain,
      options.endTime,
    );

    const calls: Array<ContractCall> = symbioticConfig.defaultCollaterals.map((item) => {
      return {
        abi: Erc20Abi,
        target: item.token,
        method: 'balanceOf',
        params: [item.address],
      };
    });

    const balances = await this.services.blockchain.evm.multicall({
      chain: symbioticConfig.chain,
      blockNumber: blockNumber,
      calls: calls,
    });

    for (let i = 0; i < symbioticConfig.defaultCollaterals.length; i++) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: symbioticConfig.chain,
        address: symbioticConfig.defaultCollaterals[i].token,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: symbioticConfig.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const balanceUsd =
          formatBigNumberToNumber(balances[i] ? balances[i].toString() : '0', token.decimals) * tokenPriceUsd;

        protocolData.totalAssetDeposited += balanceUsd;
        protocolData.totalValueLocked += balanceUsd;
        (protocolData.totalSupplied as number) += balanceUsd;

        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          };
        }

        protocolData.breakdown[token.chain][token.address].totalAssetDeposited += balanceUsd;
        protocolData.breakdown[token.chain][token.address].totalValueLocked += balanceUsd;
        (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += balanceUsd;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: symbioticConfig.chain,
          address: symbioticConfig.defaultCollaterals[i].address,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          if (log.topics[0] === Events.Deposit || log.topics[0] === Events.Withdraw) {
            const event: any = decodeEventLog({
              abi: CollateralAbi,
              topics: log.topics,
              data: log.data,
            });

            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            if (log.topics[0] === Events.Deposit) {
              (protocolData.volumes.deposit as number) += amountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
            } else {
              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
