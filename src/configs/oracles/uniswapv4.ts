import { OracleSourcePool2 } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceUniswapv4List: { [key: string]: OracleSourcePool2 } = {
  SUPR_ETH: {
    type: 'univ4',
    chain: 'ethereum',
    address:
      '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e:0x7ffe42c4a5deea5b0fec41c94c136cf115597227:0xfc5d02b3c43fca064390fd6907a8dec6ba1d73d97f57b54e7a3aeb210a646b60',
    baseToken: TokensBook.ethereum['0x17906b1cd88aa8efaefc5e82891b52a22219bd45'],
    quotaToken: TokensBook.ethereum['0x0000000000000000000000000000000000000000'],
  },
  HOOF_ETH: {
    type: 'univ4',
    chain: 'ethereum',
    address:
      '0x4529a01c7a0410167c5740c487a8de60232617bf:0x86e8631a016f9068c3f085faf484ee3f5fdee8f2:0x61ffb67fdf08fe2640571b5283e5c2c218d0afdf4181a81a9c0296ad0a197d03',
    baseToken: {
      chain: 'unichain',
      symbol: 'HOOF',
      decimals: 18,
      address: '0x39538c45f6fd0b0dd3e595ed1c2671875fee9f17',
    },
    quotaToken: {
      chain: 'unichain',
      symbol: 'ETH',
      decimals: 18,
      address: '0x0000000000000000000000000000000000000000',
    },
  },
};
