import { OracleSourcePool2 } from '../../types/oracles';
import { TokensBook } from '../data';

export const OracleSourceLBookList: { [key: string]: OracleSourcePool2 } = {
  COOK_WMNT: {
    type: 'lbook',
    chain: 'mantle',
    address: '0xf82ea495de6ac4e436898a726bfe5e271c3657aa',
    baseToken: TokensBook.mantle['0x9f0c013016e8656bc256f948cd4b79ab25c7b94d'],
    quotaToken: TokensBook.mantle['0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8'],
  },
};
