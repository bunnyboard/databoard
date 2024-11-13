import logger from '../../../lib/logger';
import { sleep } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import ProtocolAdapter from '../protocol';

export interface GetRawBlockDataResult {
  block: any;
  receipts: Array<any>;
}

interface GetrawBlocksOptions {
  rpcs: Array<string>;
  fromBlock: number;
  toBlock: number;
}

export default class EvmIndexer extends ProtocolAdapter {
  public readonly name: string = 'adapter.evm';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  protected async getRawBlockData(rpc: string, blockNumber: number): Promise<GetRawBlockDataResult> {
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

  protected async getRawBlocks(options: GetrawBlocksOptions): Promise<void> {
    // caching for logging
    let indexBlock = options.fromBlock;
    let lastProgressPercentage = 0;

    logger.info('getting ethereum blocks data', {
      service: this.name,
      chain: this.protocolConfig.protocol,
      blocks: `${options.fromBlock}->${options.toBlock}`,
    });

    while (indexBlock <= options.toBlock) {
      const randomEndpoint = options.rpcs[Math.floor(Math.random() * options.rpcs.length)];
      const rawBlockData = await this.getRawBlockData(randomEndpoint, indexBlock);

      if (rawBlockData.block && rawBlockData.receipts) {
        await this.storages.localdb.writeSingle({
          database: `${this.name}.blocks`,
          key: indexBlock.toString(),
          value: rawBlockData,
        });

        const processBlocks = indexBlock - options.fromBlock + 1;
        const progress = (processBlocks / (options.toBlock - options.fromBlock + 1)) * 100;

        // less logs
        if (progress - lastProgressPercentage >= 5) {
          logger.debug('got and saved blocks data to localdb', {
            service: this.name,
            chain: this.protocolConfig.protocol,
            blocks: `${indexBlock}->${options.fromBlock}`,
            progress: `${progress.toFixed(2)}%`,
          });
          lastProgressPercentage = progress;
        }

        indexBlock += 1;
      } else {
        logger.warn('failed to get block data, retry after 10s', {
          service: this.name,
          chain: this.protocolConfig.protocol,
          number: indexBlock,
          usingRpc: randomEndpoint,
        });
        await sleep(10);
      }
    }
  }
}
