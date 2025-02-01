import AggregatorAbi from '../../configs/abi/chainlink/EACAggregator.json';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceChainlink } from '../../types/oracles';

export default class ChainlinkLibs {
  public static async getPriceFromAggregator(
    config: OracleSourceChainlink,
    blockNumber: number,
  ): Promise<string | null> {
    const blockchain = new BlockchainService();
    const latestAnswer = await blockchain.readContract({
      chain: config.chain,
      abi: AggregatorAbi,
      target: config.address,
      method: 'latestAnswer',
      params: [],
      blockNumber,
    });

    if (latestAnswer !== null) {
      return formatBigNumberToString(latestAnswer ? latestAnswer.toString() : '0', config.decimals);
    } else {
      const latestRoundData = await blockchain.readContract({
        chain: config.chain,
        abi: AggregatorAbi,
        target: config.address,
        method: 'latestRoundData',
        params: [],
        blockNumber,
      });
      return latestRoundData
        ? formatBigNumberToString(latestRoundData[1] ? latestRoundData[1].toString() : '0', config.decimals)
        : null;
    }

    return null;
  }
}
