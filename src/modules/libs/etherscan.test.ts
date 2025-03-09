import { expect, test } from 'vitest';
import EtherscanLibs from './etherscan';

test('should get logs correctly - chain ethereum', async function () {
  const logs = await EtherscanLibs.getLogsByTopic0({
    chain: 'ethereum',
    fromBlock: 12878387,
    toBlock: 12878388,
    topic0: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  });

  expect(logs.length).equal(39);
});

test('should get logs correctly - chain arbitrum', async function () {
  const logs = await EtherscanLibs.getLogsByTopic0({
    chain: 'arbitrum',
    fromBlock: 312711380,
    toBlock: 312773469,
    topic0: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  });

  expect(logs.length).equal(4288);
});

test('should get logs correctly - chain bnbchain', async function () {
  const logs = await EtherscanLibs.getLogsByTopic0({
    chain: 'bnbchain',
    fromBlock: 47221755,
    toBlock: 47221759,
    topic0: '0xd78ad95fa46c994b6551d0da85fc275fe613ce37657fb8d5e3d130840159d822',
  });

  expect(logs.length).equal(160);
});
