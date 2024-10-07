import BigNumber from 'bignumber.js';
import { AddressZero } from '../../configs/constants';
import { normalizeAddress } from '../../lib/utils';
import { ChainData } from '../../types/domains/chain';
import { ContextServices, ContextStorages } from '../../types/namespaces';
import ChainAdapter, { GetChainDataOptions } from './adapter';
import { Blockchain } from '../../types/configs';
import logger from '../../lib/logger';

export default class EvmChainAdapter extends ChainAdapter {
  public readonly name: string = 'chain.evm';

  constructor(services: ContextServices, storages: ContextStorages, chainConfig: Blockchain) {
    super(services, storages, chainConfig);
  }

  public async getLatestBlockNumber(): Promise<number> {
    return this.services.blockchain.evm.getLastestBlockNumber(this.chainConfig.name);
  }

  public async getChainData(options: GetChainDataOptions): Promise<ChainData | null> {
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      this.chainConfig.name,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      this.chainConfig.name,
      options.endTime,
    );

    logger.info('start to get chain data from blocks', {
      service: this.name,
      chain: this.chainConfig.name,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const publicClient = await this.services.blockchain.evm.getPublicClient(this.chainConfig.name);
    const nativeCoinPrice = await this.services.oracle.getTokenPriceUsdRounded({
      chain: this.chainConfig.name,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const chainData: ChainData = {
      chain: this.chainConfig.name,
      family: this.chainConfig.family,
      timestamp: options.timestamp,
      nativeCoinPrice: nativeCoinPrice,
      totalTransactions: 0,
      activeAddresses: 0,
      blockUsage: 0,
      throughput: 0,
      resourceLimit: '0',
      resourceUsed: '0',
    };

    const senderAddresses: { [key: string]: boolean } = {};
    for (let blockNumber = beginBlock; blockNumber <= endBlock; blockNumber++) {
      const blockResponse = await publicClient.getBlock({
        blockNumber: BigInt(blockNumber),
        includeTransactions: true,
      });
      if (blockResponse) {
        chainData.resourceLimit = new BigNumber(chainData.resourceLimit)
          .plus(new BigNumber(blockResponse.gasLimit.toString()))
          .toString(10);
        chainData.resourceUsed = new BigNumber(chainData.resourceUsed)
          .plus(new BigNumber(blockResponse.gasUsed.toString()))
          .toString(10);

        chainData.totalTransactions += blockResponse.transactions.length;

        for (const transaction of blockResponse.transactions) {
          senderAddresses[normalizeAddress(transaction.from)] = true;
        }
      }

      const totalBlocks = endBlock - beginBlock + 1;
      const processedBlocks = blockNumber - beginBlock + 1;
      const progress = ((processedBlocks / totalBlocks) * 100).toFixed(2);
      if ((blockNumber - beginBlock) % 100 === 0 && blockNumber - beginBlock > 0) {
        logger.debug('processing chain data from blocks', {
          service: this.name,
          chain: this.chainConfig.name,
          currentBlock: blockNumber,
          progress: `${processedBlocks}/${totalBlocks}~${progress}%`,
        });
      }
    }

    chainData.blockUsage = new BigNumber(chainData.resourceUsed)
      .multipliedBy(100)
      .dividedBy(new BigNumber(chainData.resourceLimit))
      .toNumber();
    chainData.throughput = new BigNumber(chainData.resourceUsed)
      .dividedBy(options.endTime - options.beginTime)
      .toNumber();

    chainData.activeAddresses = Object.keys(senderAddresses).length;

    return chainData;
  }
}
