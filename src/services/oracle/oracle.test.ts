import { expect, describe, test } from 'vitest';

import { getTimestamp } from '../../lib/utils';
import OracleService from './oracle';

const oracle = new OracleService(null);

const tokens = [
  'ethereum:0x1151cb3d861920e07a38e03eead12c32178567f6',
  'arbitrum:0x09199d9a5f4448d0848e4395d065e1ad9c4a1f74',
];

const timestamp = getTimestamp();

describe('should be able to get token prices', async function () {
  tokens.map((token) =>
    test(`should be able to get token price ${token}`, async function () {
      const [chain, address] = token.split(':');
      const tokenPriceUsd = await oracle.getTokenPriceUsdRounded({
        chain: chain,
        address: address,
        timestamp: timestamp,
      });
      expect(tokenPriceUsd).greaterThan(0);
    }),
  );
});
