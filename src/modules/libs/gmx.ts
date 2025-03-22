import { TokensBook } from '../../configs/data';
import BlockchainService from '../../services/blockchains/blockchain';
import OracleService from '../../services/oracle/oracle';
import { Token } from '../../types/base';
import Erc20Abi from '../../configs/abi/ERC20.json';
import { ContractCall } from '../../services/blockchains/domains';
import { formatBigNumberToNumber, normalizeAddress } from '../../lib/utils';

export interface GetGlpPriceUsdOptions {
  chain: string;
  address: string;
  blockNumber: number;
  timestamp: number;
}

const GlpConfigs: {
  [key: string]: {
    [key: string]: {
      vault: string;
      glpToken: string;
      tokens: Array<Token>;
    };
  };
} = {
  arbitrum: {
    '0x4277f8f2c384827b5273592ff7cebd9f2c1ac258': {
      vault: '0x489ee077994b6658eafa855c308275ead8097c4a',
      glpToken: '0x4277f8f2c384827b5273592ff7cebd9f2c1ac258',
      tokens: [
        TokensBook.arbitrum['0x17fc002b466eec40dae837fc4be5c67993ddbd6f'],
        TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
        TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
        TokensBook.arbitrum['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
        TokensBook.arbitrum['0xf97f4df75117a78c1a5a0dbb814af92458539fb4'],
        TokensBook.arbitrum['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'],
        TokensBook.arbitrum['0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0'],
        TokensBook.arbitrum['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'],
        TokensBook.arbitrum['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'],
      ],
    },
    '0x7cbaf5a14d953ff896e5b3312031515c858737c8': {
      vault: '0x3e0199792ce69dc29a0a36146bfa68bd7c8d6633',
      glpToken: '0x7cbaf5a14d953ff896e5b3312031515c858737c8',
      tokens: [
        TokensBook.arbitrum['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'],
        TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
        TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
        TokensBook.arbitrum['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
        TokensBook.arbitrum['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'],
        TokensBook.arbitrum['0x912ce59144191c1204e64559fe8253a0e49e6548'],
        TokensBook.arbitrum['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'],
      ],
    },
    '0x4307fbdcd9ec7aea5a1c2958decaa6f316952bab': {
      vault: '0x56cc5a9c0788e674f17f7555dc8d3e2f1c0313c0',
      glpToken: '0x4307fbdcd9ec7aea5a1c2958decaa6f316952bab',
      tokens: [
        TokensBook.arbitrum['0xff970a61a04b1ca14834a43f5de4533ebddb5cc8'],
        TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
        TokensBook.arbitrum['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'],
        TokensBook.arbitrum['0x57f5e098cad7a3d1eed53991d4d66c45c9af7812'],
        TokensBook.arbitrum['0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9'],
        TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
        TokensBook.arbitrum['0x912ce59144191c1204e64559fe8253a0e49e6548'],
        TokensBook.arbitrum['0xf97f4df75117a78c1a5a0dbb814af92458539fb4'],
        TokensBook.arbitrum['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'],
        TokensBook.arbitrum['0x5979d7b546e38e414f7e9822514be443a4800529'],
      ],
    },
  },
  avalanche: {
    '0x01234181085565ed162a948b6a5e88758cd7c7b8': {
      vault: '0x9ab2De34A33fB459b538c43f251eB825645e8595',
      glpToken: '0x01234181085565ed162a948b6a5e88758CD7c7b8',
      tokens: [
        TokensBook.avalanche['0x152b9d0fdc40c096757f570a51e494bd4b943e50'],
        TokensBook.avalanche['0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'],
        TokensBook.avalanche['0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab'],
        TokensBook.avalanche['0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'],
        TokensBook.avalanche['0x50b7545627a5162f82a992c33b87adc75187b218'],
        TokensBook.avalanche['0xa7d7079b0fead91f3e65f86e8915cb59c1a4c664'],
        TokensBook.avalanche['0x130966628846bfd36ff31a822705796e8cb8c18d'],
      ],
    },
  },
};

export default class GmxLibs {
  // get price of GMC gmx.io v1 GLP token
  // 0x4277f8f2c384827b5273592ff7cebd9f2c1ac258
  public static async getGlpTokenPriceUsd(options: GetGlpPriceUsdOptions): Promise<string | null> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const config = GlpConfigs[options.chain][normalizeAddress(options.address)];
    if (config) {
      const calls: Array<ContractCall> = [
        {
          abi: Erc20Abi,
          target: config.glpToken,
          method: 'totalSupply',
          params: [],
        },
      ];

      for (const token of config.tokens) {
        calls.push({
          abi: Erc20Abi,
          target: token.address,
          method: 'balanceOf',
          params: [config.vault],
        });
      }

      let results = await blockchain.multicall({
        chain: options.chain,
        blockNumber: options.blockNumber,
        calls: calls,
      });

      if (results) {
        const totalSupply = formatBigNumberToNumber(results[0] ? results[0].toString() : '0', 18);
        if (totalSupply > 0) {
          // remove the first item from multicall
          // it is titalSupply from GLP contract
          results = results.slice(1);

          let totalBalanceUsd = 0;
          for (let i = 0; i < config.tokens.length; i++) {
            const tokenPriceUsd = await oracle.getTokenPriceUsdRounded({
              chain: config.tokens[i].chain,
              address: config.tokens[i].address,
              timestamp: options.timestamp,
            });

            totalBalanceUsd +=
              formatBigNumberToNumber(results[i] ? results[i].toString() : '0', config.tokens[i].decimals) *
              tokenPriceUsd;
          }

          return (totalBalanceUsd / totalSupply).toString();
        }
      }
    }

    return null;
  }
}
