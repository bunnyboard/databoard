import { expect, test } from 'vitest';
import { TokensBook } from '../../configs/data';
import LBookLibs from './lbook';

test('should get token price correctly', async function () {
  const blockNumber = 59729914;
  const tokenPrice = await LBookLibs.getPricePool2(
    {
      type: 'lbook',
      chain: 'avalanche',
      address: '0x864d4e5Ee7318e97483DB7EB0912E09F161516EA',
      baseToken: TokensBook.avalanche['0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'],
      quotaToken: TokensBook.avalanche['0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e'],
    },
    blockNumber,
  );

  expect(tokenPrice).equal('18.345418630997344');
});

test('should get token price correctly', async function () {
  const blockNumber = 77843853;
  const tokenPrice = await LBookLibs.getPricePool2(
    {
      type: 'lbook',
      chain: 'mantle',
      address: '0xf82ea495de6ac4e436898a726bfe5e271c3657aa',
      baseToken: TokensBook.mantle['0x9f0c013016e8656bc256f948cd4b79ab25c7b94d'],
      quotaToken: TokensBook.mantle['0x78c1b0c915c4faa5fffa6cabf0219da63d7f4cb8'],
    },
    blockNumber,
  );

  expect(tokenPrice).equal('0.011967317363901567');
});
