import { expect, test } from 'vitest';
import GmxLibs from './gmx';

test('should get arbitrum GLP price correctly', async function () {
  const blockNumber = 317669151;
  const timestamp = 1742428800;

  const glpPriceUsd = await GmxLibs.getGlpTokenPriceUsd({
    chain: 'arbitrum',
    address: '0x4277f8f2c384827b5273592ff7cebd9f2c1ac258',
    blockNumber,
    timestamp,
  });

  expect(glpPriceUsd).equal('1.3470566591030997');
});

test('should get arbitrum HLP price correctly', async function () {
  const blockNumber = 317669151;
  const timestamp = 1742428800;

  const glpPriceUsd = await GmxLibs.getGlpTokenPriceUsd({
    chain: 'arbitrum',
    address: '0x4307fbdcd9ec7aea5a1c2958decaa6f316952bab',
    blockNumber,
    timestamp,
  });

  expect(glpPriceUsd).equal('0.22411596445341048');
});

test('should get avalanche GLP price correctly', async function () {
  const blockNumber = 58991327;
  const timestamp = 1742428800;

  const glpPriceUsd = await GmxLibs.getGlpTokenPriceUsd({
    chain: 'avalanche',
    address: '0x01234181085565ed162a948b6a5e88758cd7c7b8',
    blockNumber,
    timestamp,
  });

  expect(glpPriceUsd).equal('1.4652700519954296');
});
