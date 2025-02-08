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
    '0xaf88d065e77c8cc2239327c5edb3a432268e5831', // USDC
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC.e
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
  ],
  optimism: [
    '0x4200000000000000000000000000000000000006', // WETH
    '0x912ce59144191c1204e64559fe8253a0e49e6548', // ARB
    '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9', // USDT
    '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8', // USDC
  ],
  avalanche: [
    '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7', // WAVAX
  ],
  base: [
    '0x4200000000000000000000000000000000000006', // WETH
  ],
  polygon: [
    '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270', // WMATIC
    '0x7ceb23fd6bc0add59e62ac25578270cff1b9f619', // WETH
  ],
  bnbchain: [
    '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c', // WBNB
    '0x55d398326f99059ff775485246999027b3197955', // USDT
    '0xe9e7cea3dedca5984780bafc599bd69add087d56', // BUSD
    '0x2170ed0880ac9a755fd29b2688956bd959f933f8', // ETH
  ],
  cronos: [
    '0x5c7f8a570d578ed84e63fdfa7b1ee72deae1ae23', // WCRO
  ],
  ronin: [
    '0xe514d9deb7966c8be0ca922de8a064264ea6bcd4', // WRON
    '0xc99a6a985ed2cac1ef41640596c5a5f9f4e19ef5', // WETH
    '0x0b7007c13325c48911f73a2dad5fa5dcbf808adc', // USDC
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
