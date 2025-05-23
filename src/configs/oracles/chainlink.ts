import { OracleSourceChainlink } from '../../types/oracles';

// name => OracleSourceChainlink
export const OracleSourceChainlinkList: { [key: string]: OracleSourceChainlink } = {
  ETH_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x5f4ec3df9cbd43714fe2740f5e3616155c5b8419',
    decimals: 8,
  },
  BTC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xf4030086522a5beea4988f8ca5b36dbc97bee88c',
    decimals: 8,
  },
  WBTC_BTC: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xfdfd9c85ad200c506cf9e21f1fd8dd01932fbb23',
    decimals: 8,
  },
  BNB_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0x0567f2323251f0aab15c8dfb1967e4e8a7d42aee',
    decimals: 8,
  },
  MATIC_USD: {
    type: 'chainlink',
    chain: 'polygon',
    address: '0xab594600376ec9fd91f8e885dadf0ce036862de0',
    decimals: 8,
  },
  AVAX_USD: {
    type: 'chainlink',
    chain: 'avalanche',
    address: '0x0a77230d17318075983913bc2145db16c7366156',
    decimals: 8,
  },
  FTM_USD: {
    type: 'chainlink',
    chain: 'fantom',
    address: '0xf4766552D15AE4d256Ad41B6cf2933482B0680dc',
    decimals: 8,
  },
  DAI_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xaed0c38402a5d19df6e4c03f4e2dced6e29c1ee9',
    decimals: 8,
  },
  USDT_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x3e7d1eab13ad0104d2750b8863b489d65364e32d',
    decimals: 8,
  },
  USDC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x8fffffd4afb6115b954bd326cbe7b4ba576818f6',
    decimals: 8,
  },
  EUR_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xb49f677943bc038e9857d61e7d053caa2c1734c1',
    decimals: 8,
  },
  BAT_ETH: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x0d16d4528239e9ee52fa531af613acdb23d88c94',
    decimals: 18,
  },
  LINK_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x2c1d072e956affc0d435cb7ac38ef18d24d9127c',
    decimals: 8,
  },
  KNC_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xf8ff43e991a81e6ec886a3d281a2c6cc19ae70fc',
    decimals: 8,
  },
  BUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x833d8eb16d306ed1fbb5d7a2e019e106b960965a',
    decimals: 8,
  },
  GUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xa89f5d2365ce98b3cd68012b6f503ab1416245fc',
    decimals: 8,
  },
  FIL_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0xe5dbfd9003bff9df5feb2f4f445ca00fb121fb83',
    decimals: 8,
  },
  USDP_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x09023c0da49aaf8fc3fa3adf34c6a7016d38d5e3',
    decimals: 8,
  },
  TRX_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0xf4c5e535756d11994fcbb12ba8add0192d9b88be',
    decimals: 8,
  },
  BCH_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0x43d80f616daf0b0b42a928eed32147dc59027d41',
    decimals: 8,
  },
  AUD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x77f9710e7d0a19669a13c055f62cd80d313df022',
    decimals: 8,
  },
  GBP_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x5c0ab2d9b5a7ed9f470386e82bb36a3613cdd4b5',
    decimals: 8,
  },
  JPY_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0xbce206cae7f0ec07b545edde332a47c2f75bbeb3',
    decimals: 8,
  },
  KRW_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x01435677fb11763550905594a16b645847c1d0f3',
    decimals: 8,
  },
  CHF_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x449d117117838ffa61263b61da6301aa2a88b13a',
    decimals: 8,
  },
  DOGE_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    address: '0x3ab0a0d137d4f946fbb19eecc6e92e64660231c8',
    decimals: 8,
  },
  SOL_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    address: '0x4ffc43a60e009b551865a93d232e33fce9f01507',
    decimals: 8,
  },
  XVS_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0xbf63f430a79d4036a5900c19818aff1fa710f206',
    decimals: 8,
  },
  XRP_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0x93a67d414896a280bf8ffb3b389fe3686e014fda',
    decimals: 8,
  },
  DOT_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0xc333eb0086309a16aa7c8308dfd32c8bba0a2592',
    decimals: 8,
  },
  LTC_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0x74e72f37a8c415c8f1a98ed42e78ff997435791d',
    decimals: 8,
  },
  ADA_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0xa767f745331d267c7751297d982b050c93985627',
    decimals: 8,
  },
  crvUSD_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xeef0c605546958c1f899b6fb336c20671f9cd49f',
    decimals: 8,
  },
  GHO_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x3f12643d3f6f874d39c2a4c9f2cd6f2dbac877fc',
    decimals: 8,
  },
  EOS_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0xd5508c8Ffdb8F15cE336e629fD4ca9AdB48f50F0',
    decimals: 8,
  },
  XTZ_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0x9A18137ADCF7b05f033ad26968Ed5a9cf0Bf8E6b',
    decimals: 8,
  },
  ATOM_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0xb056B7C804297279A9a673289264c17E6Dc6055d',
    decimals: 8,
  },
  INJ_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0x63A9133cd7c611d6049761038C16f238FddA71d7',
    decimals: 8,
  },
  wstETH_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x164b276057258d81941e97B0a900D4C7B358bCe0',
    decimals: 8,
  },
  KLAY_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0xfD07b211044572898cDbcb1435f0a1369Fd15726',
    decimals: 8,
  },
  GLMR_USD: {
    type: 'chainlink',
    chain: 'moonbeam',
    currency: 'usd',
    address: '0x4497B606be93e773bbA5eaCFCb2ac5E2214220Eb',
    decimals: 8,
  },
  NEAR_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0x0Fe4D87883005fCAFaF56B81d09473D9A29dCDC3',
    decimals: 8,
  },
  CELO_USD: {
    type: 'chainlink',
    chain: 'celo',
    currency: 'usd',
    address: '0x0568fD19986748cEfF3301e55c0eb1E729E0Ab7e',
    decimals: 8,
  },
  XLM_USD: {
    type: 'chainlink',
    chain: 'bnbchain',
    currency: 'usd',
    address: '0x27Cc356A5891A3Fe6f84D0457dE4d108C6078888',
    decimals: 8,
  },

  // custom list
  midasTBILL_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x056339C044055819E8Db84E71f5f2E1F536b2E5b',
    decimals: 8,
  },
  midasBASIS_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0xE4f2AE539442e1D3Fb40F03ceEbF4A372a390d24',
    decimals: 8,
  },
  midasBTC_BTC: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'btc',
    address: '0xA537EF0343e83761ED42B8E017a1e495c9a189Ee',
    decimals: 8,
  },
  XAU_USD: {
    type: 'chainlink',
    chain: 'ethereum',
    currency: 'usd',
    address: '0x214eD9Da11D2fbe465a6fc601a91E62EbEc1a0D6',
    decimals: 8,
  },
  S_USD: {
    type: 'chainlink',
    chain: 'sonic',
    currency: 'usd',
    address: '0xc76dFb89fF298145b417d221B2c747d84952e01d',
    decimals: 8,
  },
  MNT_USD: {
    type: 'chainlink',
    chain: 'mantle',
    currency: 'usd',
    address: '0xD97F20bEbeD74e8144134C4b148fE93417dd0F96',
    decimals: 8,
  },
};
