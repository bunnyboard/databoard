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
  cmETH_WETH: {
    type: 'lbook',
    chain: 'mantle',
    address: '0xf0601aa87a7341a38034b49f9517dd3adc2ddec4',
    baseToken: TokensBook.mantle['0xe6829d9a7ee3040e1276fa75293bde931859e8fa'],
    quotaToken: TokensBook.mantle['0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111'],
  },
  avUSD_USDC: {
    type: 'lbook',
    chain: 'avalanche',
    address: '0xbe36f03f83d773dd05caa41ea0891fd92ba3ed6c',
    baseToken: TokensBook.avalanche['0x24de8771bc5ddb3362db529fc3358f2df3a0e346'],
    quotaToken: TokensBook.avalanche['0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'],
  },
};
