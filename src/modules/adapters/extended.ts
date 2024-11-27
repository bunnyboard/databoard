import { AddressE, AddressF, AddressZero } from '../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../lib/utils';
import { ContractCall } from '../../services/blockchains/domains';
import { ProtocolConfig, Token } from '../../types/base';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import Erc20Abi from '../../configs/abi/ERC20.json';
import ProtocolAdapter from './protocol';

interface GetAddressBalanceUsdOptions {
  chain: string;
  ownerAddress: string;
  tokens: Array<Token>;
  timestamp: number;
  blockNumber?: number;
}

interface GetAddressBalanceUsdResult {
  totalBalanceUsd: number;
  tokenBalanceUsds: {
    [key: string]: {
      priceUsd: number;
      balanceUsd: number;
    };
  };
}

interface GetChainLogsOptions {
  chain: string;
  fromBlock: number;
  toBlock: number;
}

interface GetChainLogItem {
  blockNumber: number;
  transactionHash: string;
  topics: Array<any>;
  data: string;
}

export default class ProtocolExtendedAdapter extends ProtocolAdapter {
  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // helper functions
  // get usd value of given tokens (ERC20 or native) holding by an address
  protected async getAddressBalanceUsd(options: GetAddressBalanceUsdOptions): Promise<GetAddressBalanceUsdResult> {
    const getResult: GetAddressBalanceUsdResult = {
      totalBalanceUsd: 0,
      tokenBalanceUsds: {},
    };

    const callSize = 100;
    for (let startIndex = 0; startIndex < options.tokens.length; startIndex += callSize) {
      const queryTokens = options.tokens.slice(startIndex, startIndex + callSize);
      const calls: Array<ContractCall> = queryTokens.map((token) => {
        return {
          abi: Erc20Abi,
          target: token.address,
          method: 'balanceOf',
          params: [options.ownerAddress],
        };
      });
      const results: any = await this.services.blockchain.evm.multicall({
        chain: options.chain,
        blockNumber: options.blockNumber,
        calls: calls,
      });

      for (let i = 0; i < queryTokens.length; i++) {
        const token = queryTokens[i];

        if (token && results[i] && results[i].toString() !== '0') {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });
          const balanceUsd =
            formatBigNumberToNumber(results[i] ? results[i].toString() : '0', token.decimals) * tokenPriceUsd;

          getResult.totalBalanceUsd += balanceUsd;
          if (!getResult.tokenBalanceUsds[token.address]) {
            getResult.tokenBalanceUsds[token.address] = {
              priceUsd: tokenPriceUsd,
              balanceUsd: 0,
            };
          }
          getResult.tokenBalanceUsds[token.address].balanceUsd += balanceUsd;
        }
      }
    }

    for (const token of options.tokens) {
      if (
        compareAddress(token.address, AddressZero) ||
        compareAddress(token.address, AddressF) ||
        compareAddress(token.address, AddressE)
      ) {
        // count native
        const nativeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });
        const nativeBalance = await this.services.blockchain.evm.getTokenBalance({
          chain: token.chain,
          address: token.address,
          owner: options.ownerAddress,
          blockNumber: options.blockNumber,
        });
        const balanceUsd = formatBigNumberToNumber(nativeBalance, token.decimals) * nativeTokenPriceUsd;

        getResult.totalBalanceUsd += balanceUsd;
        if (!getResult.tokenBalanceUsds[token.address]) {
          getResult.tokenBalanceUsds[token.address] = {
            priceUsd: nativeTokenPriceUsd,
            balanceUsd: 0,
          };
        }
        getResult.tokenBalanceUsds[token.address].balanceUsd += balanceUsd;
      }
    }

    return getResult;
  }

  public async getChainLogs(options: GetChainLogsOptions): Promise<Array<GetChainLogItem>> {
    const localDatabase = `${options.chain}.logs`;

    let logs: Array<GetChainLogItem> = [];

    let startBlock = options.fromBlock;
    while (true) {
      const localDbLogs = await this.storages.localdb.read({
        database: localDatabase,
        key: startBlock.toString(),
      });

      if (!localDbLogs) {
        break;
      }

      logs = logs.concat(localDbLogs);

      startBlock += 1;
    }

    if (startBlock < options.toBlock) {
      const client = this.services.blockchain.evm.getPublicClient(options.chain);
      let rawlogs = await client.getLogs({
        fromBlock: BigInt(startBlock),
        toBlock: BigInt(options.toBlock),
      });

      const items: Array<GetChainLogItem> = rawlogs.map((rawlog) => {
        return {
          blockNumber: Number(rawlog.blockNumber),
          transactionHash: rawlog.transactionHash,
          topics: rawlog.topics,
          data: rawlog.data,
        };
      });

      logs = logs.concat(items);

      // save to local db
      const writeOperations: Array<any> = [];
      for (let i = startBlock; i <= options.toBlock; i++) {
        writeOperations.push({
          key: i.toString(),
          value: items.filter((item) => item.blockNumber === i),
        });
      }

      await this.storages.localdb.writeBatch({
        database: localDatabase,
        values: writeOperations,
      });
    }

    return logs;
  }
}
