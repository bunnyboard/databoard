import { expect, test } from 'vitest';
import { DexscanConfigs } from '../../configs/dexscan';

test('should have configs correctly', function () {
  for (const factoryConfig of DexscanConfigs.factories) {
    // have base tokens config for chain
    expect(DexscanConfigs.baseTokens[factoryConfig.chain] !== undefined).equal(
      true,
      `no dex base tokens configs for ${factoryConfig.chain}`,
    );

    // should have univ3 factories birth block
    expect(DexscanConfigs.univ3Birthblocks[factoryConfig.chain] !== undefined).equal(
      true,
      `no univ3Birthblocks configs for ${factoryConfig.chain}`,
    );
  }
});
