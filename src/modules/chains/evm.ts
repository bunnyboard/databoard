import logger from '../../lib/logger';
import { formatBigNumberToNumber, normalizeAddress } from '../../lib/utils';
import { IOracleService } from '../../services/oracle/domains';
import { ChainConfig } from '../../types/base';
import { ContextStorages } from '../../types/namespaces';
import ChainAdapter, { ChainBlockData } from './adapter';
import axios from 'axios';

export default class EvmChainAdapter extends ChainAdapter {
  public readonly name: string = 'chain.evm';

  constructor(priceOracle: IOracleService, storages: ContextStorages, chainConfig: ChainConfig) {
    super(priceOracle, storages, chainConfig);
  }

  private async queryNodeRpc(nodeRpc: string, method: string, params: Array<any>): Promise<any> {
    try {
      const response = await axios.post(nodeRpc, {
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
        nodeRpc: nodeRpc,
        method: method,
        params: params.toString(),
      });
    }

    return null;
  }

  private getRantomRpc(): string {
    return this.chainConfig.nodeRpcs[Math.floor(Math.random() * this.chainConfig.nodeRpcs.length)];
  }

  public async getLatestBlockNumber(): Promise<number> {
    const response = await this.queryNodeRpc(this.getRantomRpc(), 'eth_blockNumber', []);

    if (response) {
      return parseInt(response);
    }

    return 0;
  }

  public async getBlockData(blockNumber: number): Promise<ChainBlockData | null> {
    let block: any = null;

    do {
      block = await this.queryNodeRpc(this.getRantomRpc(), 'eth_getBlockByNumber', [
        `0x${blockNumber.toString(16)}`,
        true,
      ]);

      if (block) {
        const blockData: ChainBlockData = {
          chain: this.chainConfig.chain,
          number: blockNumber,
          timestamp: parseInt(block.timestamp, 16),
          totalTransactions: 0,
          senderAddresses: [],
          totalFees: 0,
          utilization: (parseInt(block.gasUsed, 16) / parseInt(block.gasLimit, 16)) * 100,
          validator: normalizeAddress(block.miner),
          validatorReward: 0,
        };

        const senders: { [key: string]: boolean } = {};
        for (const transaction of block.transactions) {
          const gasPrice = parseInt(transaction.gasPrice, 16);

          // ignore layer 2 system transactions with gasPrice is ZERO
          if (gasPrice > 0) {
            blockData.totalTransactions += 1;
            senders[normalizeAddress(transaction.from)] = true;
          }
        }

        if (this.chainConfig.eip1559) {
          const baseFeePerGas = parseInt(block.baseFeePerGas, 16);
          const gasUsed = parseInt(block.gasUsed, 16);
          blockData.totalFeesBurnt = formatBigNumberToNumber((baseFeePerGas * gasUsed).toString(), 18);

          const receipts = await this.queryNodeRpc(this.getRantomRpc(), 'eth_getBlockReceipts', [
            `0x${blockNumber.toString(16)}`,
          ]);

          if (receipts) {
            for (const receipt of receipts) {
              const gasUsed = parseInt(receipt.gasUsed, 16);
              const effectiveGasPrice = parseInt(receipt.effectiveGasPrice, 16);
              const transactionFee = formatBigNumberToNumber((gasUsed * effectiveGasPrice).toString(), 18);

              blockData.totalFees += transactionFee;
            }

            blockData.senderAddresses = Object.keys(senders);
            blockData.validatorReward = blockData.totalFees - blockData.totalFeesBurnt;

            return blockData;
          }
        } else {
          const baseFeePerGas = parseInt(block.baseFeePerGas, 16);
          const gasUsed = parseInt(block.gasUsed, 16);

          blockData.totalFees = formatBigNumberToNumber((baseFeePerGas * gasUsed).toString(), 18);
          blockData.validatorReward = formatBigNumberToNumber((baseFeePerGas * gasUsed).toString(), 18);
          blockData.senderAddresses = Object.keys(senders);

          return blockData;
        }
      }
    } while (true);
  }
}
