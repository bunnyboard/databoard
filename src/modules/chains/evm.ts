import logger from '../../lib/logger';
import { formatBigNumberToNumber, normalizeAddress } from '../../lib/utils';
import { IOracleService } from '../../services/oracle/domains';
import { ChainConfig } from '../../types/base';
import { ContextStorages } from '../../types/namespaces';
import ChainAdapter, { ChainBlockData } from './adapter';
import axios from 'axios';
import ValidatorSetAbi from '../../configs/abi/binance/ValidatorSet.json';
import { decodeEventLog } from 'viem';
import { ChainNames } from '../../configs/names';

export default class EvmChainAdapter extends ChainAdapter {
  public readonly name: string = 'chain.evm';

  constructor(priceOracle: IOracleService, storages: ContextStorages, chainConfig: ChainConfig) {
    super(priceOracle, storages, chainConfig);
  }

  private async queryNodeRpc(method: string, params: Array<any>): Promise<any> {
    do {
      const randomNode = this.getRantomRpc();
      try {
        const response = await axios.post(randomNode, {
          id: 1,
          jsonrpc: '2.0',
          method: method,
          params: params,
        });
        if (response && response.data && response.data.result) {
          return response.data.result;
        }
      } catch (e: any) {
        logger.warn('failed to query node rpc', {
          service: this.name,
          chain: this.chainConfig.chain,
          nodeRpc: randomNode,
          method: method,
          params: JSON.stringify(params).toString(),
          error: e.message,
        });
      }
    } while (true);
  }

  private getRantomRpc(): string {
    return this.chainConfig.nodeRpcs[Math.floor(Math.random() * this.chainConfig.nodeRpcs.length)];
  }

  public async getLatestBlockNumber(): Promise<number> {
    const response = await this.queryNodeRpc('eth_blockNumber', []);

    if (response) {
      return parseInt(response);
    }

    return 0;
  }

  public async getBlockData(blockNumber: number): Promise<ChainBlockData | null> {
    const block = await this.queryNodeRpc('eth_getBlockByNumber', [`0x${blockNumber.toString(16)}`, true]);

    if (block) {
      const chainBlockData: ChainBlockData = {
        chain: this.chainConfig.chain,
        number: blockNumber,
        timestamp: parseInt(block.timestamp, 16),
        totalFees: 0,
        totalFeesBurnt: 0,
        blockReward: 0,
        resourceLimit: parseInt(block.gasLimit, 16).toString(),
        resourceUsed: parseInt(block.gasUsed, 16).toString(),
        totalTransactions: 0,
        senderAddresses: [],
      };

      // update sender address list
      const senders: { [key: string]: boolean } = {};
      for (const transaction of block.transactions) {
        const gasPrice = parseInt(transaction.gasPrice, 16);

        // ignore layer 2 system transactions with gasPrice is ZERO
        if (gasPrice > 0) {
          chainBlockData.totalTransactions += 1;
          senders[normalizeAddress(transaction.from)] = true;
        }
      }
      chainBlockData.senderAddresses = Object.keys(senders);

      const baseFeePerGas = parseInt(block.baseFeePerGas ? block.baseFeePerGas : '0x0', 16);
      const gasUsed = parseInt(block.gasUsed, 16);
      const baseFees = formatBigNumberToNumber((baseFeePerGas * gasUsed).toString(), 18);

      // if this is layer chain, baseFees is also total transaction fees
      if (this.chainConfig.layer2) {
        chainBlockData.totalFees += baseFees;
      } else {
        // eip1559 enabled, baseFees is burnt
        if (this.chainConfig.eip1559 && this.chainConfig.eip1559 < blockNumber) {
          chainBlockData.totalFeesBurnt += baseFees;
        }

        // need to count receipts to calculate total fees
        const receipts = await this.queryNodeRpc('eth_getBlockReceipts', [`0x${blockNumber.toString(16)}`]);
        if (receipts) {
          for (const receipt of receipts) {
            const gasUsed = parseInt(receipt.gasUsed, 16);
            const effectiveGasPrice = parseInt(receipt.effectiveGasPrice, 16);
            const transactionFee = formatBigNumberToNumber((gasUsed * effectiveGasPrice).toString(), 18);

            chainBlockData.totalFees += transactionFee;

            if (this.chainConfig.chain === ChainNames.bnbchain) {
              // on bsc, we track BNB burnt by count feeBurned events on BSC: Validator Set contract
              // https://bscscan.com/tx/0x4d8fa84bb2e6e72da504c5f26c94a37530a42ddb8da19b9885dd2f23612784a9#eventlog
              for (const log of receipt.logs) {
                if (log.topics[0] === '0x627059660ea01c4733a328effb2294d2f86905bf806da763a89cee254de8bee5') {
                  const event: any = decodeEventLog({
                    abi: ValidatorSetAbi,
                    topics: log.topics,
                    data: log.data,
                  });
                  chainBlockData.totalFeesBurnt += formatBigNumberToNumber(event.args.amount.toString(), 18);
                }
              }
            }
          }
        }
      }

      // validator rewards
      chainBlockData.blockReward = chainBlockData.totalFees - chainBlockData.totalFeesBurnt;

      return chainBlockData;
    }

    return null;
  }
}