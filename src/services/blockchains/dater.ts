// help to query block at given timestamp from node rpc only
// using Viem provider
// thank you to: https://github.com/monosux/ethereum-block-by-date/tree/master

import { PublicClient, createPublicClient, http } from 'viem';
import envConfig from '../../configs/envConfig';
import { ChainNames } from '../../configs/names';
import axios, { RawAxiosRequestHeaders } from 'axios';
import { logAxiosError } from '../../lib/logger';
import { getTimestamp, sleep } from '../../lib/utils';

export default class BlockDater {
  private chain: string;
  private client: PublicClient;
  private checkedBlocks: any = {};
  private savedBlocks: any = {};

  // boundaries
  private latestBlock: any;
  private firstBlock: any;
  private blockTime: number = 0;

  constructor(chain: string) {
    this.chain = chain;

    let rpcUrl = envConfig.blockchains[chain].nodeRpc;
    if (this.chain === ChainNames.cronos) {
      // rpcUrl = 'https://evm.cronos.org';
    } else if (this.chain === ChainNames.linea) {
      rpcUrl = 'https://rpc.linea.build';
    }

    this.client = createPublicClient({
      batch: {
        multicall: true,
      },
      transport: http(rpcUrl, {
        timeout: 10000, // 10 secs
        retryCount: 2,
        retryDelay: 5000, // 5 secs
      }),
    });
  }

  public async getBlockNumberByTimestamp(timestamp: number, after = true, refresh = false): Promise<number> {
    const current = getTimestamp();
    if (timestamp > current) {
      timestamp = current;
    }

    if (this.chain === ChainNames.seievm) {
      return await this.getFromExplorerApi('https://seitrace.com/pacific-1/api/v1', timestamp);
    }

    if (this.chain === ChainNames.mantle) {
      return await this.getFromExplorerApi('https://api.mantlescan.xyz/api', timestamp);
    }

    if (this.firstBlock === undefined || this.latestBlock === undefined || this.blockTime === undefined || refresh) {
      await this.getBoundaries();
    }

    if (timestamp <= Number(this.firstBlock.timestamp)) {
      return 1;
    }

    if (timestamp >= this.latestBlock.timestamp) {
      return Number(this.latestBlock.number);
    }

    this.checkedBlocks[timestamp] = [];

    let predictedBlock = await this.getBlockWrapper(
      Math.floor((timestamp - Number(this.firstBlock.timestamp)) / this.blockTime),
    );

    return await this.findBetter(timestamp, predictedBlock, after);
  }

  private async findBetter(
    timestamp: number,
    predictedBlock: any,
    after: boolean,
    blockTime = this.blockTime,
  ): Promise<number> {
    if (await this.isBetterBlock(timestamp, predictedBlock, after)) return predictedBlock.number;

    const difference = timestamp - Number(predictedBlock.timestamp);

    let skip = Math.ceil(difference / (blockTime === 0 ? 1 : blockTime));
    if (skip === 0) {
      skip = difference < 0 ? -1 : 1;
    }

    const nextPredictedBlock = await this.getBlockWrapper(
      await this.getNextBlock(timestamp, predictedBlock.number, skip),
    );

    blockTime = Math.abs(
      (Number(predictedBlock.timestamp) - Number(nextPredictedBlock.timestamp)) /
        (Number(predictedBlock.number) - Number(nextPredictedBlock.number)),
    );

    return this.findBetter(timestamp, nextPredictedBlock, after, blockTime);
  }

  private async isBetterBlock(timestamp: number, predictedBlock: any, after: boolean): Promise<boolean> {
    const blockTime = Number(predictedBlock.timestamp);
    if (after) {
      if (blockTime < timestamp) return false;
      const previousBlock = await this.getBlockWrapper(Number(predictedBlock.number) - 1);
      if (blockTime >= timestamp && Number(previousBlock.timestamp) < timestamp) return true;
    } else {
      if (blockTime >= timestamp) return false;
      const nextBlock = await this.getBlockWrapper(predictedBlock.number + 1);
      if (blockTime < timestamp && Number(nextBlock.timestamp) >= timestamp) return true;
    }
    return false;
  }

  private async getBoundaries() {
    this.latestBlock = await this.getBlockWrapper('latest');
    this.firstBlock = await this.getBlockWrapper(1);
    this.blockTime =
      (Number(this.latestBlock.timestamp) - Number(this.firstBlock.timestamp)) / (Number(this.latestBlock.number) - 1);
  }

  private async getBlockWrapper(blockNumberOrTag: any): Promise<any> {
    if (this.savedBlocks[blockNumberOrTag]) {
      return this.savedBlocks[blockNumberOrTag];
    }

    let block = null;
    do {
      block =
        blockNumberOrTag === 'latest'
          ? await this.client.getBlock({
              blockTag: 'latest',
            })
          : await this.client.getBlock({
              blockNumber: BigInt(blockNumberOrTag),
            });

      this.savedBlocks[blockNumberOrTag] = {
        timestamp: Number(block.timestamp),
        number: Number(block.number),
      };

      return this.savedBlocks[blockNumberOrTag];
    } while (block == null);
  }

  private async getNextBlock(timestamp: number, currentBlock: number, skip: number): Promise<number> {
    let nextBlock = currentBlock + skip;

    if (nextBlock > this.latestBlock.number) {
      nextBlock = this.latestBlock.number;
    }

    if (this.checkedBlocks[timestamp].includes(nextBlock)) {
      return this.getNextBlock(timestamp, currentBlock, skip < 0 ? --skip : ++skip);
    }

    this.checkedBlocks[timestamp].push(nextBlock);

    return nextBlock < 1 ? 1 : nextBlock;
  }

  private async getFromExplorerApi(endpoint: string, timestamp: number): Promise<number> {
    let url = `${endpoint}?module=block&action=getblocknobytime&timestamp=${timestamp}&closest=after`;
    try {
      await sleep(5);
      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
        } as RawAxiosRequestHeaders,
      });

      if (
        response &&
        response.data &&
        (response.data.status === '1' || response.data.status === 1) &&
        response.data.result
      ) {
        if (response.data.result.blockNumber) {
          return Number(response.data.result.blockNumber);
        } else {
          return Number(response.data.result);
        }
      }
    } catch (e: any) {
      logAxiosError(e);
    }

    return 0;
  }
}
