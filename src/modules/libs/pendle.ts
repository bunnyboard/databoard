import BlockchainService from '../../services/blockchains/blockchain';
import OracleService from '../../services/oracle/oracle';
import PendleMarketAbi from '../../configs/abi/pendle/PendleMarket.json';
import SyTokenAbi from '../../configs/abi/pendle/SyToken.json';
import { formatBigNumberToNumber } from '../../lib/utils';

interface GetPoolLpTokenPriceUsdOptions {
  chain: string;
  address: string;
  blockNumber: number;
  timestamp: number;
}

export default class PendleLibs {
  public static async getPoolLpTokenPriceUsd(options: GetPoolLpTokenPriceUsdOptions): Promise<string | null> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const [readTokens, marketTotalSupply, marketDecimals] = await blockchain.multicall({
      chain: options.chain,
      blockNumber: options.blockNumber,
      calls: [
        {
          abi: PendleMarketAbi,
          target: options.address,
          method: 'readTokens',
          params: [],
        },
        {
          abi: PendleMarketAbi,
          target: options.address,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: PendleMarketAbi,
          target: options.address,
          method: 'decimals',
          params: [],
        },
      ],
    });

    const marketSupply = formatBigNumberToNumber(
      marketTotalSupply ? marketTotalSupply.toString() : '0',
      Number(marketDecimals),
    );
    if (marketSupply === 0) {
      return null;
    }

    const [syToken, ,] = readTokens;
    if (syToken) {
      const [assetInfo, syTotalSupply, syDecimals] = await blockchain.multicall({
        chain: options.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: SyTokenAbi,
            target: syToken,
            method: 'assetInfo',
            params: [],
          },
          {
            abi: SyTokenAbi,
            target: syToken,
            method: 'totalSupply',
            params: [],
          },
          {
            abi: SyTokenAbi,
            target: syToken,
            method: 'decimals',
            params: [],
          },
        ],
      });

      const token = await blockchain.getTokenInfo({
        chain: options.chain,
        address: assetInfo[1],
      });
      if (token) {
        const tokenPriceUsd = await oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const totalDepositUsd =
          formatBigNumberToNumber(syTotalSupply ? syTotalSupply.toString() : '0', Number(syDecimals)) * tokenPriceUsd;

        return (totalDepositUsd / marketSupply).toString();
      }
    }

    return null;
  }
}
