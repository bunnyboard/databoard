import { expect, test } from 'vitest';
import BalancerLibs from './balancer';

test('should get pool LP token price correctly', async function () {
  const blockNumber = 20232154;
  const timestamp = 1742256000;
  const address = '0xcfca23ca9ca720b6e98e3eb9b6aa0ffc4a5c08b9';

  const lpPriceUsd = await BalancerLibs.getPoolLpTokenPriceUsd({
    chain: 'ethereum',
    address,
    blockNumber,
    timestamp,
  });

  expect(lpPriceUsd).equal('23.869782618013648');
});
