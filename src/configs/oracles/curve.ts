import { OracleSourceCurvePool } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceCurveList: {
  [key: string]: OracleSourceCurvePool;
} = {
  MIM_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x5a6a4d54456819380173272a5e8e9b9904bdf41b',
    baseToken: TokensBook.ethereum['0xdf3ac4f479375802a821f7b7b46cd7eb5e4262cc'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  lybraUSD_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x2673099769201c08e9a5e63b25fbaf25541a6557',
    baseToken: TokensBook.ethereum['0x99d8a9c45b2eca8864373a26d1459e3dff1e17f3'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  GUSD_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x4f062658eaaf2c1ccf8c8e36d6824cdf41167956',
    baseToken: TokensBook.ethereum['0x056fd409e1d7a124bd7017459dfea2f387b6d5cd'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  mUSD_METAPOOL: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x8474ddbe98f5aa3179b3b3f5942d724afcdec9f6',
    baseToken: TokensBook.ethereum['0xe2f2a5c287993345a840db3b0845fbc70f5935a5'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
    quotaTokenIndex: 1,
  },
  mkUSD_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xf980b4a4194694913af231de69ab4593f5e0fcdc',
    baseToken: TokensBook.ethereum['0x4591dbff62656e7859afe5e45f6f47d3669fbb28'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  ULTRA_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xc03fef1c425956a3cd5762022e511e0d4148b3d6',
    baseToken: TokensBook.ethereum['0x35282d87011f87508d457f08252bc5bfa52e10a0'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  eUSD_USDC: {
    type: 'curveMetaPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xaeda92e6a3b1028edc139a4ae56ec881f3064d4f',
    baseToken: TokensBook.ethereum['0xa0d69e286b938e21cbf7e51d71f6a4c8918f482f'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 2,
  },
  OETH_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0x94b17476a93b3262d87b9a326965d1e91f9c13e7',
    baseToken: TokensBook.ethereum['0x856c4efb76c1d1ae02e20ceb03a2a6a08b0b8dc3'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    quotaTokenIndex: 0,
  },
  ynETH_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'wstETH',
    address: '0x19b8524665abac613d82ece5d8347ba44c714bdd',
    baseToken: TokensBook.ethereum['0x09db87a538bd693e9d08544577d5ccfaa6373a48'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    quotaTokenIndex: 1,
  },
  ETHx_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0x59ab5a5b5d617e478a2479b0cad80da7e2831492',
    baseToken: TokensBook.ethereum['0xa35b1b31ce002fbf2058d22f30f95d405200a15b'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0x0000000000000000000000000000000000000000'],
    quotaTokenIndex: 0,
  },
  FXN_ETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0xc15f285679a1ef2d25f53d4cbd0265e1d02f2a92',
    baseToken: TokensBook.ethereum['0x365accfca291e7d3914637abf1f7635db165bb09'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0x0000000000000000000000000000000000000000'],
    quotaTokenIndex: 0,
  },
  sBTC_WBTC_renBTC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'btc',
    address: '0x7fc77b5c7614e1533320ea6ddc2eb61fa00a9714',
    baseToken: TokensBook.ethereum['0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6'],
    baseTokenIndex: 2,
    quotaToken: TokensBook.ethereum['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
    quotaTokenIndex: 1,
  },
  tETH_wstETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'wstETH',
    address: '0xa10d15538e09479186b4d3278ba5c979110dddb1',
    baseToken: TokensBook.ethereum['0xd11c452fc99cf405034ee446803b6f6c1f6d5ed8'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    quotaTokenIndex: 1,
  },
  msETH_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0xa4c567c662349bec3d0fb94c4e7f85ba95e208e4',
    baseToken: TokensBook.ethereum['0x64351fc9810adad17a690e4e1717df5e7e085160'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    quotaTokenIndex: 1,
  },
  alETH_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0x8efd02a0a40545f32dba5d664cbbc1570d3fedf6',
    baseToken: TokensBook.ethereum['0x0100546f2cd4c9d97f798ffc9755e47865ff7ee6'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    quotaTokenIndex: 1,
  },
  USR_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x3ee841f47947fefbe510366e4bbb49e145484195',
    baseToken: TokensBook.ethereum['0x66a1e37c9b0eaddca17d3662d6c05f4decf3e110'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  eBTC_WBTC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'btc',
    address: '0x7704d01908afd31bf647d969c295bb45230cd2d6',
    baseToken: TokensBook.ethereum['0x657e8c867d8b37dcc18fa4caead9c45eb088c642'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
    quotaTokenIndex: 1,
  },
  DLCBTC_WBTC: {
    type: 'curveFactoryPool',
    chain: 'arbitrum',
    currency: 'btc',
    address: '0xe957ce03ccdd88f02ed8b05c9a3a28abef38514a',
    baseToken: TokensBook.arbitrum['0x050c24dbf1eec17babe5fc585f06116a259cc77a'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.arbitrum['0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f'],
    quotaTokenIndex: 0,
  },
  RLP_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x8e001d4bac0eae1eea348dfc22f9b8bda67dd211',
    baseToken: TokensBook.ethereum['0x4956b52ae2ff65d74ca2d61207523288e4528f96'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 0,
  },
  USDL_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xab96aa0ee764924f49fbb372f3b4db9c2cb24ea2',
    baseToken: TokensBook.ethereum['0xbdc7c08592ee4aa51d06c27ee23d5087d65adbcd'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  BOLD_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xadb6851875b7496e3d565b754d8a79508480a203',
    baseToken: TokensBook.ethereum['0xb01dd87b29d187f3e3a4bf6cdaebfb97f3d9ab98'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  USDX_USDT: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x3f131bb401c5f322bce82e1f06fb25aca08d3f7e',
    baseToken: TokensBook.ethereum['0xf3527ef8de265eaa3716fb312c12847bfba66cef'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
    quotaTokenIndex: 1,
  },
  USDtb_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xc2921134073151490193ac7369313c8e0b08e1e7',
    baseToken: TokensBook.ethereum['0xc139190f447e929f090edeb554d95abb8b18ac1c'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 0,
  },
  ElectronicEUSD_USDC: {
    type: 'curveFactoryPool',
    chain: 'arbitrum',
    currency: 'usd',
    address: '0x93a416206b4ae3204cfe539edfee6bc05a62963e',
    baseToken: TokensBook.arbitrum['0x12275dcb9048680c4be40942ea4d92c74c63b844'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
    quotaTokenIndex: 1,
  },
  lvlUSD_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x1220868672d5b10f3e1cb9ab519e4d0b08545ea4',
    baseToken: TokensBook.ethereum['0x7c1156e515aa1a2e851674120074968c905aaf37'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 0,
  },
  frxUSD_USDe: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xdbb1d219d84eacefb850ee04cacf2f1830934580',
    baseToken: TokensBook.ethereum['0xcacd6fd266af91b8aed52accc382b4e165586e29'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0x4c9edd5852cd905f086c759e8383e09bff1e68b3'],
    quotaTokenIndex: 1,
  },
  GEAR_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0x0e9b5b092cad6f1c5e6bc7f89ffe1abb5c95f1c2',
    baseToken: TokensBook.ethereum['0xba3335588d9403515223f109edc4eb7269a9ab5d'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    quotaTokenIndex: 1,
  },
  fxUSD_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x5018be882dcce5e3f2f3b0913ae2096b9b3fb61f',
    baseToken: TokensBook.ethereum['0x085780639cc2cacd35e474e71f4d000e2405d8f6'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 0,
  },
  vETH_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0x6685fcfce05e7502bf9f0aa03b36025b09374726',
    baseToken: TokensBook.ethereum['0x38d64ce1bdf1a9f24e0ec469c9cade61236fb4a0'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    quotaTokenIndex: 1,
  },
  rTBL_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xc4d375edda8d3211a52399bb6583d600015696a3',
    baseToken: TokensBook.ethereum['0x526be1c610616be0e8e69893fc6766fddfbada61'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 0,
  },
  USDN_USDT: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xf01627c39b427654dc984571b3ae32e4136813ec',
    baseToken: TokensBook.ethereum['0xde17a000ba631c5d7c2bd9fb692efea52d90dee2'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
    quotaTokenIndex: 0,
  },
  MONEY_DAI: {
    type: 'curveFactoryPool',
    chain: 'arbitrum',
    currency: 'usd',
    address: '0xdf96c0334d628e2fd084111761ae1016f3a1fb3d',
    baseToken: TokensBook.arbitrum['0x69420f9e38a4e60a62224c489be4bf7a94402496'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.arbitrum['0xda10009cbd5d07dd0cecc66161fc93d7c9000da1'],
    quotaTokenIndex: 0,
  },
  RSUP_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0xee351f12eae8c2b8b9d1b9bfd3c5dd565234578d',
    baseToken: TokensBook.ethereum['0x419905009e4656fdc02418c7df35b1e61ed5f726'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    quotaTokenIndex: 0,
  },
  PRISMA_WETH: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'eth',
    address: '0x322135dd9cbae8afa84727d9ae1434b5b3eba44b',
    baseToken: TokensBook.ethereum['0xda47862a83dac0c112ba89c6abc2159b95afd71c'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
    quotaTokenIndex: 0,
  },
  USDO_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xc57ce1ac61081c51596e55de38d35b19720d421e',
    baseToken: TokensBook.ethereum['0x8238884ec9668ef77b90c6dff4d1a9f4f4823bfe'],
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
  yUSD_USDC: {
    type: 'curveFactoryPool',
    chain: 'arbitrum',
    currency: 'usd',
    address: '0xc5f859f5aa1881cff4521c513982799895f7d01a',
    baseToken: TokensBook.arbitrum['0x895e15020c3f52ddd4d8e9514eb83c39f53b1579'],
    baseTokenIndex: 1,
    quotaToken: TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
    quotaTokenIndex: 0,
  },
  BOLDv2_USDC: {
    type: 'curveFactoryPool',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xefc6516323fbd28e80b85a497b65a86243a54b3e',
    baseToken: {
      chain: 'ethereum',
      symbol: 'BOLD',
      decimals: 18,
      address: '0x6440f144b7e50d6a8439336510312d2f54beb01d',
    },
    baseTokenIndex: 0,
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    quotaTokenIndex: 1,
  },
};
