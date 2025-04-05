import { expect, test } from 'vitest';
import AlgebraLibs from './algebra';
import { TokensBook } from '../../configs/data';

test('should get token price correctly', async function () {
  const blockNumber = 323017980;
  const tokenPrice = await AlgebraLibs.getPricePool2(
    {
      type: 'algebra',
      chain: 'arbitrum',
      address: '0xb1026b8e7276e7ac75410f1fcbbe21796e8f7526',
      baseToken: TokensBook.arbitrum['0x82af49447d8a07e3bd95bd0d56f35241523fbab1'],
      quotaToken: TokensBook.arbitrum['0xaf88d065e77c8cc2239327c5edb3a432268e5831'],
    },
    blockNumber,
  );

  expect(tokenPrice).equal('1821.97040898331211680969');
});
