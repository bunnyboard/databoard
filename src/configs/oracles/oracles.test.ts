import { expect, test } from 'vitest';
import { OracleConfigs } from './configs';

test('should have correct oracle token configs', async function () {
  for (const [chain, configs] of Object.entries(OracleConfigs)) {
    for (const [address, config] of Object.entries(configs)) {
      expect(address).not.equal('');
      expect(config).not.equal(undefined, `${chain}:${address}`);
      expect(config).not.equal(null, `${chain}:${address}`);

      for (const source of config.sources) {
        expect(source).not.equal(undefined, `${chain}:${address}`);
      }
    }
  }
});
