import { expect, test } from 'vitest';

import BitcoreService from './bitcore';

const bitcore = new BitcoreService();

test('get 1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv balance at 1704067200 correctly', async function () {
  const address = '1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv';
  const timestamp = 1704067200;
  const balance = await bitcore.getAddressBalance('bitcoin', address, timestamp);

  expect(balance).equal('51546');
});

test('get 1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv balance at 1413158400 correctly', async function () {
  const address = '1wiz18xYmhRX6xStj2b9t1rwWX4GKUgpv';
  const timestamp = 1413158400;
  const balance = await bitcore.getAddressBalance('bitcoin', address, timestamp);

  expect(balance).equal('5000000000');
});
