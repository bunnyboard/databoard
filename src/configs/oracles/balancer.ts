import { OracleSourceBalancerPool } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceBalancerList: {
  [key: string]: OracleSourceBalancerPool;
} = {
  GYD_USDC: {
    type: 'balv2_Gyro_ECLP',
    chain: 'ethereum',
    currency: 'usd',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0xc2aa60465bffa1a88f5ba471a59ca0435c3ec5c1',
    poolId: '0xc2aa60465bffa1a88f5ba471a59ca0435c3ec5c100020000000000000000062c',
    baseToken: TokensBook.ethereum['0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a'],
    quotaToken: TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
  },
  AURA_WETH: {
    type: 'balv2_Weight',
    chain: 'ethereum',
    currency: 'eth',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9',
    poolId: '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9000200000000000000000274',
    baseWeight: 0.5, // 50%
    baseToken: TokensBook.ethereum['0xc0c293ce456ff0ed870add98a0828dd4d2903dbf'],
    quotaWeight: 0.5, // 50%
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  QI_DAO_WETH: {
    type: 'balv2_Weight',
    chain: 'ethereum',
    currency: 'eth',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0x39eb558131e5ebeb9f76a6cbf6898f6e6dce5e4e',
    poolId: '0x39eb558131e5ebeb9f76a6cbf6898f6e6dce5e4e0002000000000000000005c8',
    baseWeight: 0.8, // 80%
    baseToken: TokensBook.ethereum['0x559b7bfc48a5274754b08819f75c5f27af53d53b'],
    quotaWeight: 0.2, // 20%
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  mevETH_WETH: {
    type: 'balv2_Gyro_ECLP',
    chain: 'ethereum',
    currency: 'eth',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0xb3b675a9a3cb0df8f66caf08549371bfb76a9867',
    poolId: '0xb3b675a9a3cb0df8f66caf08549371bfb76a9867000200000000000000000611',
    baseToken: TokensBook.ethereum['0x24ae2da0f361aa4be46b48eb19c91e02c5e4f27e'],
    quotaToken: TokensBook.ethereum['0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2'],
  },
  SYNO_WETH: {
    type: 'balv2_Weight',
    chain: 'arbitrum',
    currency: 'eth',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0xeb3e64ad9314d20bf943ac72fb69f272603f9cce',
    poolId: '0xeb3e64ad9314d20bf943ac72fb69f272603f9cce0002000000000000000004f5',
    baseWeight: 0.8, // 80%
    baseToken: TokensBook.arbitrum['0x577fd586c9e6ba7f2e85e025d5824dbe19896656'],
    quotaWeight: 0.2, // 20%
    quotaToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
  },
  ZBU_USDC: {
    type: 'balv2_Weight',
    chain: 'base',
    currency: 'usd',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0x59501a303b1bdf5217617745acec4d99107383f0',
    poolId: '0x59501a303b1bdf5217617745acec4d99107383f0000200000000000000000197',
    baseWeight: 0.5,
    baseToken: TokensBook.base['0x2c8c89c442436cc6c0a77943e09c8daf49da3161'],
    quotaWeight: 0.5,
    quotaToken: TokensBook.base['0x833589fcd6edb6e08f4c7c32d4f71b54bda02913'],
  },
  IMO_WETH: {
    type: 'balv2_Weight',
    chain: 'base',
    currency: 'eth',
    vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
    address: '0x007bb7a4bfc214df06474e39142288e99540f2b3',
    poolId: '0x007bb7a4bfc214df06474e39142288e99540f2b3000200000000000000000191',
    baseWeight: 0.8,
    baseToken: TokensBook.base['0x5a7a2bf9ffae199f088b25837dcd7e115cf8e1bb'],
    quotaWeight: 0.2,
    quotaToken: TokensBook.base['0x4200000000000000000000000000000000000006'],
  },
};
