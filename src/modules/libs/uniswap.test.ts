import { expect, test } from 'vitest';
import UniswapLibs from './uniswap';
import { Pool2Types } from '../../types/domains/pool2';
import { ChainNames } from '../../configs/names';
import { TokenList } from '../../configs';

test('should get v4 pool price correctly', async function () {
  const price = await UniswapLibs.getPricePool2(
    {
      type: Pool2Types.univ4,
      chain: ChainNames.ethereum,
      address:
        '0xbd216513d74c8cf14cf4747e6aaa6420ff64ee9e:0x7ffe42c4a5deea5b0fec41c94c136cf115597227:0xb98437c7ba28c6590dd4e1cc46aa89eed181f97108e5b6221730d41347bc817f',
      baseToken: TokenList.ethereum['0x2260fac5e5542a773aa44fbcfedf7c193bc2c599'],
      quotaToken: TokenList.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'],
    },
    22423705,
  );

  expect(price?.toString().split('.')[0]).equal('94285');
});
