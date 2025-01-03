import { DecoderEvents } from '../../configs/decoder';
import { HandleLogOptions } from './types';
import { handleUniswapV2FactoryPairCreated, handleUniswapV2PairMint } from './hanlders/uniswap';

export async function handleEventLog(options: HandleLogOptions): Promise<void> {
  const { log } = options;

  const signature = log.topics[0] as string;

  switch (signature) {
    case DecoderEvents.UniswapV2Factory_PairCreated: {
      await handleUniswapV2FactoryPairCreated(options);
      break;
    }
    case DecoderEvents.UniswapV2Pair_Mint: {
      await handleUniswapV2PairMint(options);
      break;
    }
  }
}
