import { test } from 'vitest';
import MorphoLibs from './morpho';

test('should get meta vault data correctly', async function () {
  const vaultData = await MorphoLibs.getMorphoVaultsData({
    chain: 'ethereum',
    vaults: ['0x8eB67A509616cd6A7c1B3c8C21D48FF57df3d458'],
    timestamp: 1741478400,
    fromTime: 1741392000,
    toTime: 1741478400,
  });

  console.log(vaultData);
});
