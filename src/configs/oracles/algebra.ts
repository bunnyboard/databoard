import { OracleSourcePool2 } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceAlgebraList: { [key: string]: OracleSourcePool2 } = {
  VRTX_USDC: {
    type: 'algebra',
    chain: 'arbitrum',
    address: '0x3cf4cb6ce8cf3b147e6c444cf66526f5f0c16b92',
    baseToken: TokensBook.arbitrum['0x95146881b86b3ee99e63705ec87afe29fcc044d9'],
    quotaToken: TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
  },
};
