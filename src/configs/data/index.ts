import TokenListArbitrum from './tokenlists/arbitrum.json';
import TokenListAvalanche from './tokenlists/avalanche.json';
import TokenListBase from './tokenlists/base.json';
import TokenListBlast from './tokenlists/blast.json';
import TokenListBnbchain from './tokenlists/bnbchain.json';
import TokenListEthereum from './tokenlists/ethereum.json';
import TokenListFantom from './tokenlists/fantom.json';
import TokenListGnosis from './tokenlists/gnosis.json';
import TokenListLinea from './tokenlists/linea.json';
import TokenListManta from './tokenlists/manta.json';
import TokenListMantle from './tokenlists/mantle.json';
import TokenListMerlin from './tokenlists/merlin.json';
import TokenListMetis from './tokenlists/metis.json';
import TokenListOptimism from './tokenlists/optimism.json';
import TokenListPolygon from './tokenlists/polygon.json';
import TokenListScroll from './tokenlists/scroll.json';
import TokenListZksync from './tokenlists/zksync.json';
import TokenListCronos from './tokenlists/cronos.json';
import TokenListRonin from './tokenlists/ronin.json';

export const TokensBook = {
  ethereum: TokenListEthereum,
  arbitrum: TokenListArbitrum,
  base: TokenListBase,
  optimism: TokenListOptimism,
  polygon: TokenListPolygon,
  bnbchain: TokenListBnbchain,
  avalanche: TokenListAvalanche,
  fantom: TokenListFantom,
  metis: TokenListMetis,
  gnosis: TokenListGnosis,
  scroll: TokenListScroll,
  blast: TokenListBlast,
  linea: TokenListLinea,
  zksync: TokenListZksync,
  manta: TokenListManta,
  mantle: TokenListMantle,
  merlin: TokenListMerlin,
  cronos: TokenListCronos,
  ronin: TokenListRonin,
};

// these tokens will be used for dex data calculation
export const TokenBookDexBase = {
  ethereum: [
    '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
    '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48', // USDC
    '0xdac17f958d2ee523a2206206994597c13d831ec7', // USDT
    '0x6b175474e89094c44da98b954eedeac495271d0f', // DAI
  ],
  arbitrum: [
    '0x82af49447d8a07e3bd95bd0d56f35241523fbab1', // WETH
  ],
  optimism: [
    '0x4200000000000000000000000000000000000006', // WETH
  ],
  avalanche: [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
  ],
  base: [
    '0x4200000000000000000000000000000000000006', // WETH
  ],
  polygon: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
  ],
  bnbchain: [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
  ],
  cronos: [
    '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', // WCRO
  ],
  ronin: [
    '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4', // WRON
  ],
  gnosis: [
    '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d', // WXDAI
  ],
  fantom: [
    '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83', // WFTM
  ],
  celo: [
    '0x471ece3750da237f93b8e339c536989b8978a438', // CELO
  ],
  blast: [
    '0x4300000000000000000000000000000000000004', // WETH
  ],
  zora: [
    '0x4200000000000000000000000000000000000006', // WETH
  ],
  zksync: [
    '0x5aea5775959fbc2557cc8789bc1bf90a239d9a91', // WETH
  ],
  linea: [
    '0xe5d7c2a44ffddf6b295a15c148167daaaf5cf34f', // WETH
  ],
  scroll: [
    '0x5300000000000000000000000000000000000004', // WETH
  ],
  polygonzkevm: [
    '0x4f9a0e7fd2bf6067db6994cf12e4495df938e6e9', // WETH
  ],
};
