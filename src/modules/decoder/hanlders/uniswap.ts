import { decodeEventLog, parseAbi } from 'viem';
import { HandleLogOptions } from '../types';
import { DecoderAbis } from '../../../configs/decoder';
import { normalizeAddress } from '../../../lib/utils';
import envConfig from '../../../configs/envConfig';

export async function handleUniswapV2FactoryPairCreated(options: HandleLogOptions): Promise<void> {
  const { context, chain, log } = options;

  const signature = log.topics[0];

  const event: any = decodeEventLog({
    abi: parseAbi([DecoderAbis[signature]]),
    topics: log.topics,
    data: log.data,
  });

  const pair = normalizeAddress(event.args[2]);
  const token0 = normalizeAddress(event.args[0]);
  const token1 = normalizeAddress(event.args[1]);
  const factory = normalizeAddress(log.address);
  const blockNumber = Number(log.blockNumber);

  await context.storages.database.update({
    collection: envConfig.mongodb.collections.decodeDexPool2.name,
    keys: {
      chain: chain,
      address: pair,
      token0: token0,
      token1: token1,
    },
    updates: {
      chain: chain,
      factory: factory,
      address: pair,
      token0: token0,
      token1: token1,
      createdAtBlockNumber: blockNumber,
    },
    upsert: true,
  });

  process.exit(0);
}

export async function handleUniswapV2PairMint(options: HandleLogOptions): Promise<void> {
  const { context, chain, log } = options;

  const signature = log.topics[0];

  const event: any = decodeEventLog({
    abi: parseAbi([DecoderAbis[signature]]),
    topics: log.topics,
    data: log.data,
  });

  const pair = normalizeAddress(event.args[2]);
  const token0 = normalizeAddress(event.args[0]);
  const token1 = normalizeAddress(event.args[1]);
  const factory = normalizeAddress(log.address);
  const blockNumber = Number(log.blockNumber);

  await context.storages.database.update({
    collection: envConfig.mongodb.collections.decodeDexPool2.name,
    keys: {
      chain: chain,
      address: pair,
      token0: token0,
      token1: token1,
    },
    updates: {
      chain: chain,
      factory: factory,
      address: pair,
      token0: token0,
      token1: token1,
      createdAtBlockNumber: blockNumber,
    },
    upsert: true,
  });

  process.exit(0);
}
