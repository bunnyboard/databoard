import PriceFeedAbi from '../../configs/abi/pyth/PythPriceFeed.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourcePyth } from '../../types/oracles';

export default class PythLibs {
  public static async getPriceFromFeed(config: OracleSourcePyth, blockNumber: number): Promise<string | null> {
    const blockchain = new BlockchainService();

    const result = await blockchain.readContract({
      chain: config.chain,
      abi: PriceFeedAbi,
      target: config.address,
      method: 'getPrice',
      params: [config.assetId],
      blockNumber,
    });

    if (result) {
      return formatBigNumberToString(result.price ? result.price.toString() : '0', Math.abs(Number(result.expo)));
    } else {
      const unsafePrice = await blockchain.readContract({
        chain: config.chain,
        abi: PriceFeedAbi,
        target: config.address,
        method: 'getPriceUnsafe',
        params: [config.assetId],
        blockNumber,
      });
      if (unsafePrice) {
        return formatBigNumberToString(
          unsafePrice.price ? unsafePrice.price.toString() : '0',
          Math.abs(Number(unsafePrice.expo)),
        );
      }
    }

    return null;
  }
}
