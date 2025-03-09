import { test } from 'vitest';
import EulerLibs from './euler';

test('should get vaults data correctly', async function () {
  const vaultData = await EulerLibs.getEulerVaultsData({
    chain: 'sonic',
    vaults: ['0xB38D431e932fEa77d1dF0AE0dFE4400c97e597B8'],
    timestamp: 1741478400,
    fromTime: 1741392000,
    toTime: 1741478400,
  });

  console.log(vaultData);
});
