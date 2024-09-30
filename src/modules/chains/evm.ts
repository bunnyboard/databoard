import BigNumber from 'bignumber.js';
import { AddressZero } from '../../configs/constants';
import envConfig from '../../configs/envConfig';
import logger from '../../lib/logger';
import { normalizeAddress } from '../../lib/utils';
import { IOracleService } from '../../services/oracle/domains';
import { ChainConfig } from '../../types/base';
import { ChainData } from '../../types/domains/chain';
import { ContextStorages } from '../../types/namespaces';
import ChainAdapter, { ChainBlockData, GetChainDataOptions } from './adapter';
import axios from 'axios';

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

    if (!block) {
      return null;
    }

    const chainBlockData: ChainBlockData = {
      chain: this.chainConfig.chain,
      number: blockNumber,
      timestamp: parseInt(block.timestamp, 16),
      resourceLimit: parseInt(block.gasLimit, 16).toString(),
      resourceUsed: parseInt(block.gasUsed, 16).toString(),
      totalTransactions: 0,
      senderAddresses: {},
    };

    // update sender address list
    for (const transaction of block.transactions) {
      const gasPrice = parseInt(transaction.gasPrice, 16);

      // ignore layer 2 system transactions with gasPrice is ZERO
      if (gasPrice > 0) {
        chainBlockData.totalTransactions += 1;

        const sender = normalizeAddress(transaction.from);
        if (!chainBlockData.senderAddresses[sender]) {
          chainBlockData.senderAddresses[sender] = 0;
        }
        chainBlockData.senderAddresses[sender] += 1;
      }
    }

    // const baseFeePerGas = parseInt(block.baseFeePerGas ? block.baseFeePerGas : '0x0', 16);
    // const gasUsed = parseInt(block.gasUsed, 16);
    // const baseFees = formatBigNumberToNumber((baseFeePerGas * gasUsed).toString(), 18);

    // // if this is layer chain, baseFees is also total transaction fees
    // if (this.chainConfig.layer2) {
    //   chainBlockData.totalFees += baseFees;
    // } else {
    //   // eip1559 enabled, baseFees is burnt
    //   if (this.chainConfig.eip1559 && this.chainConfig.eip1559 < blockNumber) {
    //     chainBlockData.totalFeesBurnt += baseFees;
    //   }

    //   const receipts = await this.queryNodeRpc('eth_getBlockReceipts', [`0x${blockNumber.toString(16)}`]);
    //   for (const receipt of receipts) {
    //     const gasUsed = parseInt(receipt.gasUsed, 16);
    //     const effectiveGasPrice = parseInt(receipt.effectiveGasPrice, 16);
    //     const transactionFee = formatBigNumberToNumber((gasUsed * effectiveGasPrice).toString(), 18);

    //     chainBlockData.totalFees += transactionFee;

    //     // on bsc, we track BNB burnt by count feeBurned events on BSC: Validator Set contract
    //     // https://bscscan.com/tx/0x4d8fa84bb2e6e72da504c5f26c94a37530a42ddb8da19b9885dd2f23612784a9#eventlog
    //     if (this.chainConfig.chain === ChainNames.bnbchain) {
    //       for (const log of receipt.logs) {
    //         if (log.topics[0] === '0x627059660ea01c4733a328effb2294d2f86905bf806da763a89cee254de8bee5') {
    //           const event: any = decodeEventLog({
    //             abi: ValidatorSetAbi,
    //             topics: log.topics,
    //             data: log.data,
    //           });
    //           chainBlockData.totalFeesBurnt += formatBigNumberToNumber(event.args.amount.toString(), 18);
    //         }
    //       }
    //     }
    //   }
    // }

    // // validator rewards
    // chainBlockData.blockReward =
    //   chainBlockData.totalFees > chainBlockData.totalFeesBurnt
    //     ? chainBlockData.totalFees - chainBlockData.totalFeesBurnt
    //     : chainBlockData.totalFees;

    return chainBlockData;
  }

  public async getChainData(options: GetChainDataOptions): Promise<ChainData | null> {
    const blocks: Array<ChainBlockData> = await this.storages.database.query({
      collection: envConfig.mongodb.collections.chainBlocks.name,
      query: {
        chain: this.chainConfig.chain,
        timestamp: {
          $gte: options.beginTime,
          $lte: options.endTime,
        },
      },
    });

    const chainData: ChainData = {
      chain: this.chainConfig.chain,
      family: this.chainConfig.family,
      timestamp: options.timestamp,
      nativeCoinPrice: await this.priceOracle.getTokenPriceUsdRounded({
        chain: this.chainConfig.chain,
        address: AddressZero,
        timestamp: options.timestamp,
      }),
      totalTransactions: 0,
      activeAddresses: 0,
      blockUtilization: 0,
      throughput: 0,
      resourceLimit: '0',
      resourceUsed: '0',
    };

    let addresses: { [key: string]: boolean } = {};
    for (const block of blocks) {
      chainData.resourceLimit = new BigNumber(chainData.resourceLimit)
        .plus(new BigNumber(block.resourceLimit))
        .toString(10);
      chainData.resourceUsed = new BigNumber(chainData.resourceUsed)
        .plus(new BigNumber(block.resourceUsed))
        .toString(10);

      for (const address of Object.keys(block.senderAddresses)) {
        addresses[address] = true;
      }

      chainData.totalTransactions += block.totalTransactions;
    }

    if (chainData.resourceLimit !== '0') {
      chainData.blockUtilization = new BigNumber(chainData.resourceUsed)
        .dividedBy(new BigNumber(chainData.resourceLimit))
        .toNumber();
    }
    chainData.throughput = new BigNumber(chainData.resourceUsed)
      .dividedBy(options.endTime - options.beginTime)
      .toNumber();
    chainData.activeAddresses = Object.keys(addresses).length;

    return chainData;
  }
}
