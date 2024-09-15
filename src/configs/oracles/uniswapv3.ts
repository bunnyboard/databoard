import { OracleSourcePool2 } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceUniswapv3List: { [key: string]: OracleSourcePool2 } = {
  RAI_DAI: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xcb0c5d9d92f4f2f80cce7aa271a1e148c226e19d',
    baseToken: TokensBook.ethereum['0x03ab458634910aad20ef5f1c8ee96f1d6ac54919'],
    quotaToken: TokensBook.ethereum['0x6b175474e89094c44da98b954eedeac495271d0f'],
  },
  ENS_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x92560c178ce069cc014138ed3c2f5221ba71f58a',
    baseToken: TokensBook.ethereum['0xc18360217d8f7ab5e7c516566761ea12ce7f9d72'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  LUSD_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x4e0924d3a751be199c426d52fb1f2337fa96f736',
    baseToken: TokensBook.ethereum['0x5f98805a4e8be255a32880fdec7f6728c6568ba0'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  wstETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x109830a1aaad605bbf02a9dfa7b0b92ec2fb7daa',
    baseToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  wstETH_WETH_2: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xd340b57aacdd10f96fc1cf10e15921936f41e29c',
    baseToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  cbETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x840deeef2f115cf50da625f7368c24af6fe74410',
    baseToken: TokensBook.ethereum['0xbe9895146f7af43049ca1c1ae358b0541ea49704'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  rETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xa4e0faa58465a2d369aa21b3e42d43374c6f9613',
    baseToken: TokensBook.ethereum['0xae78736cd615f374d3085123a210448e74fc6393'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  LDO_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xa3f558aebaecaf0e11ca4b2199cc5ed341edfd74',
    baseToken: TokensBook.ethereum['0x5a98fcbea516cf06857215779fd812ca3bef1b32'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  RPL_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xe42318ea3b998e8355a3da364eb9d48ec725eb45',
    baseToken: TokensBook.ethereum['0xd33526068d116ce69f19a9ee46f0bd304f21a51f'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  STG_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x8592064903ef23d34e4d5aaaed40abf6d96af186',
    baseToken: TokensBook.ethereum['0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  agEUR_USDC: {
    type: 'univ3',
    chain: 'polygon',
    address: '0x3fa147d6309abeb5c1316f7d8a7d8bd023e0cd80',
    baseToken: TokensBook.polygon['0xe0b52e49357fd4daf2c15e02058dce6bc0057db4'],
    quotaToken: TokensBook.polygon['0x2791bca1f2de4661ed88a30c99a7a9449aa84174'],
  },
  OP_WETH: {
    type: 'univ3',
    chain: 'optimism',
    address: '0x68f5c0a2de713a54991e01858fd27a3832401849',
    baseToken: TokensBook.optimism['0x4200000000000000000000000000000000000042'],
    quotaToken: TokensBook.optimism['0x4200000000000000000000000000000000000006'],
  },
  stMATIC_WMATIC: {
    type: 'univ3',
    chain: 'polygon',
    address: '0x59db5ea66958b19641b6891fc373b44b567ea15c',
    baseToken: TokensBook.polygon['0x3a58a54c066fdc0f2d55fc9c89f0415c92ebf3c4'],
    quotaToken: TokensBook.polygon['0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270'],
  },
  ARB_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0xc6f780497a95e246eb9449f5e4770916dcd6396a',
    baseToken: TokensBook.arbitrum['0x912ce59144191c1204e64559fe8253a0e49e6548'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  wBETH_ETH: {
    type: 'univ3',
    chain: 'bnbchain',
    address: '0x379044e32f5a162233e82de19da852255d0951b8',
    baseToken: TokensBook.bnbchain['0xa2e3356610840701bdf5611a53974510ae27e2e1'],
    quotaToken: TokensBook.bnbchain['0x2170ed0880ac9a755fd29b2688956bd959f933f8'],
  },
  RDNT_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0x446bf9748b4ea044dd759d9b9311c70491df8f29',
    baseToken: TokensBook.arbitrum['0x3082cc23568ea640225c2467653db90e9250aaa0'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  FDUSD_USDT: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xcdfc3d54c8452b12285abb8c102df09ce83b8334',
    baseToken: TokensBook.ethereum['0xc5f0f7b66764F6ec8C8Dff7BA683102295E16409'],
    quotaToken: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
  },
  GMX_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0x1aeedd3727a6431b8f070c0afaa81cc74f273882',
    baseToken: TokensBook.arbitrum['0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  PYUSD_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x13394005c1012e708fce1eb974f1130fdc73a5ce',
    baseToken: TokensBook.ethereum['0x6c3ea9036406852006290770bedfcaba0e23a0e8'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  weETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x7A415B19932c0105c82FDB6b720bb01B0CC2CAe3',
    baseToken: TokensBook.ethereum['0xcd5fe23c85820f7b72d0926fc9b05b43e359b7ee'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  frxETH_FRAX: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x36c060cc4b088c830a561e959a679a58205d3f56',
    baseToken: TokensBook.ethereum['0x5e8422345238f34275888049021821e8e08caa1f'],
    quotaToken: TokensBook.ethereum['0x853d955acef822db058eb8505911ed77f175b99e'],
  },
  swETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x30ea22c879628514f1494d4bbfef79d21a6b49a2',
    baseToken: TokensBook.ethereum['0xf951e335afb289353dc249e82926178eac7ded78'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  ETHx_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x1b9669b12959ad51b01fabcf01eabdfadb82f578',
    baseToken: TokensBook.ethereum['0xa35b1b31ce002fbf2058d22f30f95d405200a15b'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  mevETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x441adc2957f9a7f7a5faaa1457fd039b0c2336e3',
    baseToken: TokensBook.ethereum['0x24ae2da0f361aa4be46b48eb19c91e02c5e4f27e'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  pxETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x02edd21f1db8eb146be60998e9801691e725f119',
    baseToken: TokensBook.ethereum['0x04c154b66cb340f3ae24111cc767e0184ed00cc6'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  AJNA_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xb79323dded09eabae6366ce11c51ec53b3fcd57e',
    baseToken: TokensBook.ethereum['0x9a96ec9b57fb64fbc60b423d1f4da7691bd35079'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  RBN_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xfe0df74636bc25c7f2400f22fe7dae32d39443d2',
    baseToken: TokensBook.ethereum['0x6123b0049f904d730db3c36a31167d9d4121fa6b'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  PRIME_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x16588709ca8f7b84829b43cc1c5cb7e84a321b16',
    baseToken: TokensBook.ethereum['0xb23d80f5fefcddaa212212f028021b41ded428cf'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  COW_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xfcfdfc98062d13a11cec48c44e4613eb26a34293',
    baseToken: TokensBook.ethereum['0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  DEGEN_WETH: {
    type: 'univ3',
    chain: 'base',
    address: '0xc9034c3e7f58003e6ae0c8438e7c8f4598d5acaa',
    baseToken: TokensBook.base['0x4ed4e862860bed51a9570b96d89af5e1b0efefed'],
    quotaToken: TokensBook.base['0x4200000000000000000000000000000000000006'],
  },
  MNW_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x78194ba1a135a71f7fba71fda7cdd3885872b8ff',
    baseToken: TokensBook.ethereum['0xd3e4ba569045546d09cf021ecc5dfe42b1d7f6e4'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  ACX_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x508acdc358be2ed126b1441f0cff853dec49d40f',
    baseToken: TokensBook.ethereum['0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  FORT_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x1a3fb049c2d88a16b927be6a4cae48ca38d93d4c',
    baseToken: TokensBook.ethereum['0x41545f8b9472d758bb669ed8eaeeecd7a9c4ec29'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  PERP_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xcd83055557536eff25fd0eafbc56e74a1b4260b3',
    baseToken: TokensBook.ethereum['0xbc396689893d065f41bc2c6ecbee5e0085233447'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  GROW_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x61847189477150832d658d8f34f84c603ac269af',
    baseToken: TokensBook.ethereum['0x761a3557184cbc07b7493da0661c41177b2f97fa'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  NMR_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x8df016708a66377dae191ca6f9fff4705a3d951f',
    baseToken: TokensBook.ethereum['0x1776e1f26f98b1a5df9cd347953a26dd3cb46671'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  MCB_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0x3788156ac53b52b5178c78eae873aba4e2ccb4e6',
    baseToken: TokensBook.arbitrum['0x4e352cf164e64adcbad318c3a1e222e9eba4ce42'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  XSDG_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x6279653c28f138c8b31b8a0f6f8cd2c58e8c1705',
    baseToken: TokensBook.ethereum['0x70e8de73ce538da2beed35d14187f6959a8eca96'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  INST_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xc1cd3d0913f4633b43fcddbcd7342bc9b71c676f',
    baseToken: TokensBook.ethereum['0x6f40d4a6237c257fff2db00fa0510deeecd303eb'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  AMKT_WBTC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xe901ebcbf2788b316074dd5d770a12d974911f14',
    baseToken: TokensBook.ethereum['0xf17a3fe536f8f7847f1385ec1bc967b2ca9cae8d'],
    quotaToken: TokensBook.ethereum['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
  },
  MNT_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xf4c5e0f4590b6679b3030d29a84857f226087fef',
    baseToken: TokensBook.ethereum['0x3c3a81e81dc49a522a592e7622a7e711c06bf354'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  BONK_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0x90ad8c666f4ce24c822e6ead6b54f3be96351048',
    baseToken: TokensBook.arbitrum['0x09199d9a5f4448d0848e4395d065e1ad9c4a1f74'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  cmUMAMI_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0xb3b7c0e969bde7294eac345be3e81982ddf9577f',
    baseToken: TokensBook.arbitrum['0x1922c36f3bc762ca300b4a46bb2102f84b1684ab'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  CELR_WETH: {
    type: 'univ3',
    chain: 'arbitrum',
    address: '0xfa5738670cfad9745a58305101c6fa9c4e42e615',
    baseToken: TokensBook.arbitrum['0x3a8b787f78d775aecfeea15706d4221b40f345ab'],
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  KROM_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x6ae0cdc5d2b89a8dcb99ad6b3435b3e7f7290077',
    baseToken: TokensBook.ethereum['0x3af33bef05c2dcb3c7288b77fe1c8d2aeba4d789'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  MVX_WETH: {
    type: 'univ3',
    chain: 'polygon',
    address: '0xfb9caae5a5c0ab91f68542124c05d1efbb97d151',
    baseToken: TokensBook.polygon['0x2760e46d9bb43dafcbecaad1f64b93207f9f0ed7'],
    quotaToken: TokensBook.polygon['0x7ceb23fd6bc0add59e62ac25578270cff1b9f619'],
  },
  USDM_USDT: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x4a25dbdf9629b1782c3e2c7de3bdce41f1c7f801',
    baseToken: TokensBook.ethereum['0xbbaec992fc2d637151daf40451f160bf85f3c8c1'],
    quotaToken: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
  },
  USDe_USDT: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x435664008f38b0650fbc1c9fc971d0a3bc2f1e47',
    baseToken: TokensBook.ethereum['0x4c9edd5852cd905f086c759e8383e09bff1e68b3'],
    quotaToken: TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'],
  },
  USDA_EURA: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x580ee6b001348fa0deb675f4d55259c96c4a3a31',
    baseToken: TokensBook.ethereum['0x0000206329b97db379d5e1bf586bbdb969c63274'],
    quotaToken: TokensBook.ethereum['0x1a7e4e63778b4f12a199c062f3efdd288afcbce8'],
  },
  ezETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xbe80225f09645f172b079394312220637c440a63',
    baseToken: TokensBook.ethereum['0xbf5495efe5db9ce00f80364c8b423567e58d2110'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  osETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xc2a6798447bb70e5abcf1b0d6aeec90bc14fca55',
    baseToken: TokensBook.ethereum['0xf1c9acdc66974dfb6decb12aa385b9cd01190e38'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  LIT_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xc410573af188f56062ee744cc3d6f2843f5bc13b',
    baseToken: TokensBook.ethereum['0xfae103dc9cf190ed75350761e95403b7b8afa6c0'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  rswETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x89556c9d2b44c20dc367bf24fa86e5f1f4e44c7f',
    baseToken: TokensBook.ethereum['0xfd0205066521550d7d7ab19da8f72bb004b4c341'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  tBTC_WBTC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xdbac78be00503d10ae0074e5e5873a61fc56647c',
    baseToken: TokensBook.ethereum['0x18084fba666a33d37592fa2633fd49a74dd93a88'],
    quotaToken: TokensBook.ethereum['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
  },
  GRAI_USDC: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x5db3d38bd40c862ba1fdb2286c32a62ab954d36d',
    baseToken: TokensBook.ethereum['0x15f74458ae0bfdaa1a96ca1aa779d715cc1eefe4'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  rsETH_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x059615ebf32c946aaab3d44491f78e4f8e97e1d3',
    baseToken: TokensBook.ethereum['0xa1290d69c65a6fe4df752f95823fae25cb99e5a7'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  RLB_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x059615ebf32c946aaab3d44491f78e4f8e97e1d3',
    baseToken: TokensBook.ethereum['0x510100d5143e011db24e2aa38abe85d73d5b2177'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  weETHs_WETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0x174eff1363c4b446f3425315bd6c12f305823d6a',
    baseToken: TokensBook.ethereum['0x917cee801a67f933f2e6b33fc0cd1ed2d5909d88'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  pzETH_wstETH: {
    type: 'univ3',
    chain: 'ethereum',
    address: '0xfc354f5cf57125a7d85e1165f4fcdfd3006db61a',
    baseToken: TokensBook.ethereum['0x8c9532a60e0e7c6bbd2b2c1303f63ace1c3e9811'],
    quotaToken: TokensBook.ethereum['0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0'],
  },
};
