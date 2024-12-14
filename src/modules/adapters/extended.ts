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

// interface LogItem {
//   chain: string;
//   transactionHash: string;
//   logIndex: number;
//   blockNumber: number;
//   topics: Array<string>;
//   data: string;
// }

// interface GetChainLogsOptions {
//   chain: string;
//   fromBlock: number;
//   toBlock: number;
// }

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

        if (token && results[i]) {
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

  // when query events of protocol which have many contracts like Uniswap
  // we got a problem of query events from a single contract, one-by-one
  // it take too long
  // this function provide a solution of query logs from blockchain blocks
  // save them into database and will be reused by multiple protocols later
  // public async indexChainLogs(options: GetChainLogsOptions): Promise<void> {
  //   let syncFromBlock = options.fromBlock;
  //   let syncToBlock = options.toBlock;

  //   // first we check current database block state: oldest and latest block number
  //   const oldestBlockSyncKey = `sync-chain-logs-${options.chain}-oldest`;
  //   const latestBlockSyncKey = `sync-chain-logs-${options.chain}-latest`;

  //   const oldestSyncState = await this.storages.database.find({
  //     collection: envConfig.mongodb.collections.caching.name,
  //     query: {
  //       name: oldestBlockSyncKey,
  //     }
  //   });
  //   const latestSyncState = await this.storages.database.find({
  //     collection: envConfig.mongodb.collections.caching.name,
  //     query: {
  //       name: latestBlockSyncKey,
  //     }
  //   });

  //   if (oldestSyncState && latestSyncState) {
  //     if ()
  //   }
  // }
}
