import { OracleSourceDexLpToken, OracleTypes } from '../../types/oracles';

export const OracleSourceDexLpTokenList: {
  [key: string]: OracleSourceDexLpToken;
} = {
  Balv2_LP_AURA_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9',
  },
  Balv2_LP_rETH_STABLE: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x1e19cf2d73a72ef1332c882f20534b6519be0276',
  },
  Balv2_LP_rETH_weETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x05ff47afada98a98982113758878f9a8b9fdda0a',
  },
  Balv2_LP_ezETH_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x596192bb6e41802428ac943d2f1476c1af25cc0e',
  },
  Balv2_LP_svETH_wstETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xdedb11a6a23263469567c2881a9b9f8629ee0041',
  },
  Balv2_LP_VCX_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x577a7f7ee659aa14dc16fd384b3f8078e23f1920',
  },
  Balv2_LP_auraBAL_STABLE: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x3dd0843a028c86e0b760b1a76929d1c5ef93a2dd',
  },
  Balv2_LP_MIMO_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xee3959fd00a0b996d801fc34b7ce566bd037f5f5',
  },
  Balv2_LP_wstETH_ACX: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x36be1e97ea98ab43b4debf92742517266f5731a3',
  },
  Balv2_LP_STG_USDC: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x3ff3a210e57cfe679d9ad1e9ba6453a716c56a2e',
  },
  Balv2_LP_ezETH_weETH_rswETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x848a5564158d84b8a8fb68ab5d004fae11619a54',
  },
  Balv2_LP_BAL_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x5c6ee304399dbdb9c8ef030ab642b10820db8f56',
  },
  Balv2_LP_GOLD_WETH_USDC: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x433f09ca08623e48bac7128b7105de678e37d988',
  },
  Balv2_LP_ECLP_AURA_USDC: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x5f62fd24941b585b91eb059e0ea1a7e729357511',
  },
  Balv2_LP_ankrETh_wstETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x3fd4954a851ead144c2ff72b1f5a38ea5976bd54',
  },
  Balv2_LP_wstETH_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x7967fa58b9501600d96bd843173b9334983ee6e6',
  },
  Balv2_LP_wstETH_WETH_BPT: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x9791d590788598535278552eecd4b211bfc790cb',
  },
  Balv2_LP_bpt_ethtri: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x5f8893506ddc4c271837187d14a9c87964a074dc',
  },
  Curve_LP_cvxCRV_CRV: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0x971add32ea87f10bd192671630be3be8a11b8623',
  },
  Curve_LP_stETH_ETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0x21e27a5e5513d6e65c4f830167390997aa84843a',
  },
  Curve_LP_MIM_3Crv: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0x5a6a4d54456819380173272a5e8e9b9904bdf41b',
  },
  Curve_LP_steCRV: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0xDC24316b9AE028F1497c275EB9192a3Ea0f67022',
  },
  Pendle_market_stETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'pendle',
    address: '0xc374f7ec85f8c7de3207a10bb1978ba104bda3b2',
  },
  Pendle_market_weETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'pendle',
    address: '0x7d372819240d14fb477f17b964f95f33beb4c704',
  },
  Pendle_market_agETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'pendle',
    address: '0x6010676bc2534652ad1ef5fa8073dcf9ad7ebfbe',
  },
  Univ2_LP_BSX_WETH: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x7fea0384f38ef6ae79bb12295a9e10c464204f52',
  },
  Univ2_LP_WELL_WETH: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x89d0f320ac73dd7d9513ffc5bc58d1161452a657',
  },
  Univ2_LP_KLIMA_WETH: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xb37642e87613d8569fd8ec80888ea6c63684e79e',
  },
  Univ2_LP_VIRTUAL_cbBTC: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xb909f567c5c2bb1a4271349708cc4637d7318b4a',
  },
  Univ2_LP_VELO_USDC: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x8134a2fdc127549480865fb8e5a9e8a8a95a54c5',
  },
  Univ2_LP_wstETH_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x6da98bde0068d10ddd11b468b197ea97d96f96bc',
  },
  Univ2_LP_HBR_WBNB: {
    chain: 'bnbchain',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x5134729cd5a5b40336bc3ca71349f2c108718428',
  },
  Curve_LP_FRAX_USDC: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0xdcef968d416a41cdac0ed8702fac8128a64241a2',
  },
  Balv2_LP_stETH_STABLE: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x32296969ef14eb0c6d29669c550d4a0449130230',
  },
  Balv2_LP_ankrETH_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x8a34b5ad76f528bfec06c80d85ef3b53da7fc300',
  },
  Balv2_LP_stafiETH_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xb08885e6026bab4333a80024ec25a1a3e1ff2b8a',
  },
  Balv2_LP_swETH_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x02d928e68d8f10c0358566152677db51e1e2dc8c',
  },
  Balv2_LP_swETH_aWETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xae8535c23afedda9304b03c68a3563b75fc8f92b',
  },
  Balv2_LP_ankrETH_wstETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xdfe6e7e18f6cc65fa13c8d8966013d4fda74b6ba',
  },
  Balv2_LP_ETHx_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x4cbde5c4b4b53ebe4af4adb85404725985406163',
  },
  Balv2_LP_vETH_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xb54e6aadbf1ac1a3ef2a56e358706f0f8e320a03',
  },
  Balv2_LP_a_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x60d604890feaa0b5460b28a424407c24fe89374a',
  },
  Balv2_LP_a_WETH2: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xbb6881874825e60e1160416d6c426eae65f2459e',
  },
  Univ2_LP_PENDLE_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xbfca4230115de8341f3a3d5e8845ffb3337b2be3',
  },
  Univ2_LP_ARB_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xa6c5c7d189fa4eb5af8ba34e63dcdd3a635d433f',
  },
  Univ2_LP_GRAIL_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xc9da32c3b444f15412f7feac6104d1e258d23b1b',
  },
  Univ2_LP_frxETH_WETH: {
    chain: 'bnbchain',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x8a420aaca0c92e3f97cdcfdd852e01ac5b609452',
  },
  Curve_LP_GHO_USR: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0x4628f13651ead6793f8d838b34b8f8522fb0cc52',
  },
  Univ2_LP_iFARM_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xd2a7084369cc93672b2ca868757a9f327e3677a4',
  },
  Univ2_LP_GNOME_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x60f7116d7c451ac5a5159f60fc5fc36336b742c4',
  },
  Univ2_LP_GENE_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xa0c79678bcfbea0a358d5fea563100893c37a848',
  },
  Univ2_LP_DeltaSwap_USDC_WETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x755f72d7f22efaed6e00e589a8c7bd95a666fef0',
  },
  Balv2_LP_wstETH_sfrxETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xc2598280bfea1fe18dfcabd21c7165c40c6859d3',
  },
  Univ2_LP_DOLA_USDC: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xb720fbc32d60bb6dcc955be86b98d8fd3c4ba645',
  },
  Univ2_LP_DOLA_USDC2: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x6c5019d345ec05004a7e7b0623a91a0d9b8d590d',
  },
  Univ2_LP_wstETH_OP: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x7178f61694ba9109205b8d6f686282307625e62d',
  },
  Univ2_LP_USDC_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x0df083de449f75691fc5a36477a6f3284c269108',
  },
  Univ2_LP_USDC_LUSD: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x207addb05c548f262219f6bfc6e11c02d0f7fdbe',
  },
  Univ2_LP_mooBIFI_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x6ed6df1c23c51cb7cc67a348cc8d9e6108ea3bfe',
  },
  Univ2_LP_POOL_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xdb1fe6da83698885104da02a6e0b3b65c0b0de80',
  },
  Curve_LP_2BTC: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0x1dc5c0f8668a9f54ed922171d578011850ca0341',
  },
  Univ2_LP_USDC_WETH2: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x67f56ac099f11ad5f65e2ec804f75f2cea6ab8c5',
  },
  Univ2_LP_tBTC_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xadbb23bcc3c1b9810491897cb0690cf645b858b1',
  },
  Univ2_LP_VELO_USDC2: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xa0a215de234276cac1b844fd58901351a50fec8a',
  },
  Univ2_LP_SNX_USDC: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x894d6ea97767ebecefe01c9410f6bd67935aa952',
  },
  Balv2_LP_OATH_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xd13d81af624956327a24d0275cbe54b0ee0e9070',
  },
  Balv2_LP_instETH_wstETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xc9eb4b8ce914ee451360b315ffd1d1af8df96be9',
  },
  Balv2_LP_rETH_WETH: {
    chain: 'optimism',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x4fd63966879300cafafbb35d157dc5229278ed23',
  },
  Univ2_LP_HBR_WBNB2: {
    chain: 'bnbchain',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x5134729cd5a5b40336bc3ca71349f2c108718428',
  },
  Univ2_LP_USDR_USDC: {
    chain: 'polygon',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xd17cb0f162f133e339c0bbfc18c36c357e681d6b',
  },
  Univ2_LP_RNT_USDT: {
    chain: 'polygon',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x4097073e82edac2d758ecfd594139a891340d59d',
  },
  Univ2_LP_WBTC_WETH: {
    chain: 'polygon',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x4b9e26a02121a1c541403a611b542965bd4b68ce',
  },
  Univ2_LP_USDC_WETH3: {
    chain: 'polygon',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x3cc20a6795c4b57d9817399f68e83e71c8626580',
  },
  Balv2_LP_MaticX_WMATIC: {
    chain: 'polygon',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xcd78a20c597e367a4e478a2411ceb790604d7c8f',
  },
  Balv2_LP_sAVAX_WAVAX: {
    chain: 'avalanche',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xfd2620c9cfcec7d152467633b3b0ca338d3d78cc',
  },
  Univ2_LP_axlwstETH_wstETH: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x83fe9065ed68506a0d2ece59cd71c43bbff6e450',
  },
  Univ2_LP_axlUSDC_USDC: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x3ae5285e7fc52d7a09457784eece8ecb40d461b7',
  },
  Univ2_LP_GENOME_WETH: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x963ceee215e5b0b1dcb221c3ba398de66abc73d9',
  },
  Univ2_LP_STAR_USDC: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xf45f6cdbcd0d2d4bf4d9758b032a66a2cf4e55c8',
  },
  Univ2_LP_OVN_USD: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x61366a4e6b1db1b85dd701f2f4bfa275ef271197',
  },
  Univ2_LP_DOLA_USDbC: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0x0b25c51637c43decd6cc1c1e3da4518d54ddb528',
  },
  Univ2_LP_SPOT_USDC: {
    chain: 'base',
    type: OracleTypes.dexLpToken,
    method: 'univ2',
    address: '0xa43455d99eb63473cfa186b388c1bc2ea1b63924',
  },
  Balv2_LP_APW_WETH: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0x093254005743b7af89e24f645730ba2dd8441333',
  },
  Balv2_LP_paUSD_GYD: {
    chain: 'ethereum',
    type: OracleTypes.dexLpToken,
    method: 'balv2',
    address: '0xae2d97cbbc13b67988eced2aba0f6939655ed3de',
  },
  Curve_LP_IBTC_WBTC: {
    chain: 'arbitrum',
    type: OracleTypes.dexLpToken,
    method: 'curve',
    address: '0xe957ce03ccdd88f02ed8b05c9a3a28abef38514a',
  },
};
