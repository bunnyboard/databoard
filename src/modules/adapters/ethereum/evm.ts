import BigNumber from 'bignumber.js';
import envConfig from '../../../configs/envConfig';
import { EvmChainProtocolConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import { normalizeAddress, sleep } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import {
  ContractMetrics,
  Erc20Metrics,
  EvmChainBlockMetrics,
  EvmChainData,
  RecipientAddressMetrics,
  SenderAddressMetrics,
} from '../../../types/domains/chain';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { Erc20TransferEventSignature } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { randomBytes } from 'crypto';
import { CustomChainIndexWorkers, DefaultChainIndexWorkers } from '../../../configs';
import { GetProtocolDataOptions } from '../../../types/options';
import BlockchainAdapter from '../blockchain';

export interface GetRawBlockDataResult {
  block: any;
  receipts: Array<any>;
}

interface GetrawBlocksOptions {
  rpcs: Array<string>;
  fromBlock: number;
  toBlock: number;
}

export default class EvmChainAdapter extends BlockchainAdapter {
  public readonly name: string = 'adapter.evm';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public transformBlockData(block: any, receipts: Array<any>): any {
    const feeBurnt = block.baseFeePerGas
      ? new BigNumber(block.baseFeePerGas, 16).multipliedBy(new BigNumber(block.gasUsed, 16)).toString(10)
      : '0';

    let totalFee = new BigNumber(0);
    const senderAddresses: { [key: string]: SenderAddressMetrics } = {};
    const recipientAddresses: { [key: string]: RecipientAddressMetrics } = {};
    const erc20Metrics: { [key: string]: Erc20Metrics } = {};
    const contractAddresses: { [key: string]: ContractMetrics } = {};
    for (const receipt of receipts) {
      const txnFee = new BigNumber(receipt.gasUsed, 16).multipliedBy(new BigNumber(receipt.effectiveGasPrice, 16));
      totalFee = totalFee.plus(txnFee);

      const from = normalizeAddress(receipt.from);
      const to = receipt.to ? normalizeAddress(receipt.to) : null;

      if (!senderAddresses[from]) {
        senderAddresses[from] = {
          totalTxns: 0,
          gasSpent: '0',
        };
      }
      senderAddresses[from].totalTxns += 1;
      senderAddresses[from].gasSpent = new BigNumber(senderAddresses[from].gasSpent).plus(txnFee).toString(10);

      if (to) {
        if (!recipientAddresses[to]) {
          recipientAddresses[to] = {
            totalTxns: 0,
            gasconsumed: '0',
          };
        }
        recipientAddresses[to].totalTxns += 1;
        recipientAddresses[to].gasconsumed = new BigNumber(recipientAddresses[to].gasconsumed)
          .plus(txnFee)
          .toString(10);
      }

      for (const log of receipt.logs) {
        const address = normalizeAddress(log.address);

        if (!contractAddresses[address]) {
          contractAddresses[address] = {
            totalEmittedEvents: 0,
          };
        }
        contractAddresses[address].totalEmittedEvents += 1;

        if (log.topics[0] === Erc20TransferEventSignature) {
          try {
            const event: any = decodeEventLog({
              abi: Erc20Abi,
              topics: log.topics,
              data: log.data,
            });

            if (!erc20Metrics[address]) {
              erc20Metrics[address] = {
                totalTransferEvents: 0,
                totalTransferValue: '0',
              };
            }
            erc20Metrics[address].totalTransferEvents += 1;
            erc20Metrics[address].totalTransferValue = new BigNumber(erc20Metrics[address].totalTransferValue)
              .plus(event.args.value.toString())
              .toString(10);
          } catch (e: any) {
            // ignore the log
          }
        }
      }
    }

    const chainConfig = this.protocolConfig as EvmChainProtocolConfig;
    return {
      chain: chainConfig.protocol,
      number: new BigNumber(block.number, 16).toNumber(),
      timestamp: new BigNumber(block.timestamp, 16).toNumber(),
      totalTxns: block.transactions.length,
      senderAddresses: senderAddresses,
      recipientAddresses: recipientAddresses,
      gasLimit: new BigNumber(block.gasLimit, 16).toString(10),
      gasUsed: new BigNumber(block.gasUsed, 16).toString(10),
      totalFee: totalFee.toString(10),
      totalFeeBurn: feeBurnt,
      erc20Transfers: erc20Metrics,
      contractAddresses: contractAddresses,
    } as EvmChainBlockMetrics;
  }

  public async getRawBlockData(rpc: string, blockNumber: number): Promise<GetRawBlockDataResult> {
    const result: GetRawBlockDataResult = {
      block: null,
      receipts: [],
    };

    const getBlockResponse = await fetch(rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'any',
        jsonrpc: '2.0',
        method: 'eth_getBlockByNumber',
        params: [`0x${blockNumber.toString(16)}`, true],
      }),
    });

    if (getBlockResponse.status === 200) {
      const getBlockResponseBody = await getBlockResponse.json();
      result.block = getBlockResponseBody.result;
    }

    await sleep(0.1);

    const getReceiptsResponse = await fetch(rpc, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: 'any',
        jsonrpc: '2.0',
        method: 'eth_getBlockReceipts',
        params: [`0x${blockNumber.toString(16)}`],
      }),
    });

    if (getReceiptsResponse.status === 200) {
      const getReceiptsResponseBody = await getReceiptsResponse.json();
      result.receipts = getReceiptsResponseBody.result;
    }

    return result;
  }

  private async runWorkerIndexBlocks(worketId: string, options: GetrawBlocksOptions): Promise<void> {
    // caching for logging
    let indexBlock = options.fromBlock;
    let lastProgressPercentage = 0;

    const chainConfig = this.protocolConfig as EvmChainProtocolConfig;

    logger.info('getting chain blocks data', {
      service: this.name,
      workerId: worketId,
      chain: this.protocolConfig.protocol,
      blocks: `${options.fromBlock}->${options.toBlock}`,
    });

    while (indexBlock <= options.toBlock) {
      const existedBlock: any = await this.storages.database.find({
        collection: envConfig.mongodb.collections.datasyncChainBlocks.name,
        query: {
          chain: chainConfig.protocol,
          number: indexBlock,
        },
      });

      if (existedBlock) {
        indexBlock += 1;
        continue;
      }

      // get block from rpc
      const randomEndpoint = options.rpcs[Math.floor(Math.random() * options.rpcs.length)];
      const rawBlockData = await this.getRawBlockData(randomEndpoint, indexBlock);

      if (rawBlockData && rawBlockData.block && rawBlockData.receipts) {
        const blockMetrics: any = this.transformBlockData(rawBlockData.block, rawBlockData.receipts);

        await this.storages.database.update({
          collection: envConfig.mongodb.collections.datasyncChainBlocks.name,
          keys: {
            chain: chainConfig.protocol,
            number: blockMetrics.number,
          },
          updates: {
            ...blockMetrics,
          },
          upsert: true,
        });

        const processBlocks = indexBlock - options.fromBlock + 1;
        const progress = (processBlocks / (options.toBlock - options.fromBlock + 1)) * 100;

        // less logs
        if (progress - lastProgressPercentage >= 5) {
          logger.debug('indexed blocks data to database', {
            service: this.name,
            workerId: worketId,
            chain: this.protocolConfig.protocol,
            blocks: `${indexBlock}->${options.fromBlock}`,
            progress: `${progress.toFixed(2)}%`,
          });
          lastProgressPercentage = progress;
        }

        indexBlock += 1;
      } else {
        logger.warn('failed to get block data, retry after 2s', {
          service: this.name,
          workerId: worketId,
          chain: this.protocolConfig.protocol,
          number: indexBlock,
          usingRpc: randomEndpoint,
        });
        await sleep(2);
      }
    }

    // update worker sync status
    await this.storages.database.update({
      collection: envConfig.mongodb.collections.caching.name,
      keys: {
        name: worketId,
      },
      updates: {
        name: worketId,
        syncDone: true,
      },
      upsert: true,
    });

    return;
  }

  public async indexBlocks(options: GetrawBlocksOptions): Promise<void> {
    const chainConfig = this.protocolConfig as EvmChainProtocolConfig;

    const numberOfWorkers = CustomChainIndexWorkers[chainConfig.protocol]
      ? CustomChainIndexWorkers[chainConfig.protocol]
      : DefaultChainIndexWorkers;

    const blocksToIndex: Array<number> = [];
    for (let i = options.fromBlock; i <= options.toBlock; i++) {
      blocksToIndex.push(i);
    }

    const blocksPerWorker = Math.round(blocksToIndex.length / numberOfWorkers);

    const randomSyncKey = randomBytes(8).toString('hex');
    const workerConfigs: Array<{
      workerId: string;
      blocks: Array<number>;
    }> = [];
    for (let i = 0; i < numberOfWorkers; i++) {
      workerConfigs.push({
        workerId: `${randomSyncKey}_${i.toString()}`,
        blocks: blocksToIndex.splice(0, blocksPerWorker),
      });
    }

    // start run workers async
    for (const workerConfig of workerConfigs) {
      this.runWorkerIndexBlocks(workerConfig.workerId, {
        rpcs: options.rpcs,
        fromBlock: workerConfig.blocks[0],
        toBlock: workerConfig.blocks[workerConfig.blocks.length - 1],
      });
    }

    // we need to check every worker status
    let allWorkersSyncDone = true;
    do {
      allWorkersSyncDone = true;

      for (const workerConfig of workerConfigs) {
        const workerSyncDone = await this.storages.database.find({
          collection: envConfig.mongodb.collections.caching.name,
          query: {
            name: workerConfig.workerId,
          },
        });
        if (!workerSyncDone) {
          allWorkersSyncDone = false;
        }
      }

      await sleep(10);
    } while (!allWorkersSyncDone);

    for (const workerConfig of workerConfigs) {
      await this.storages.database.delete({
        collection: envConfig.mongodb.collections.caching.name,
        keys: {
          name: workerConfig.workerId,
        },
      });
    }

    return;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<EvmChainData | null> {
    const chainConfig = this.protocolConfig as EvmChainProtocolConfig;

    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      chainConfig.protocol,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      chainConfig.protocol,
      options.endTime,
    );

    await this.indexBlocks({
      rpcs: chainConfig.publicRpcs,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const chainData: EvmChainData = {
      chain: chainConfig.protocol,
      timestamp: options.timestamp,
      totalBlocks: 0,
      totalTxns: 0,
      totalFee: '0',
      totalFeeBurn: '0',
      gasLimit: '0',
      gasUsed: '0',
    };

    for (let blockNumber = beginBlock; blockNumber <= endBlock; blockNumber++) {
      const blockMetrics: EvmChainBlockMetrics | null | undefined = await this.storages.database.find({
        collection: envConfig.mongodb.collections.datasyncChainBlocks.name,
        query: {
          chain: chainConfig.protocol,
          number: blockNumber,
        },
      });
      if (blockMetrics) {
        chainData.totalBlocks += 1;
        chainData.totalTxns += blockMetrics.totalTxns;
        chainData.totalFee = new BigNumber(chainData.totalFee).plus(new BigNumber(blockMetrics.totalFee)).toString(10);
        chainData.gasLimit = new BigNumber(chainData.gasLimit).plus(new BigNumber(blockMetrics.gasLimit)).toString(10);
        chainData.gasUsed = new BigNumber(chainData.gasUsed).plus(new BigNumber(blockMetrics.gasUsed)).toString(10);

        if (chainData.totalFeeBurn && blockMetrics.totalFeeBurn) {
          chainData.totalFeeBurn = new BigNumber(chainData.totalFeeBurn)
            .plus(new BigNumber(blockMetrics.totalFeeBurn))
            .toString(10);
        }
      }
    }

    return chainData;
  }
}
