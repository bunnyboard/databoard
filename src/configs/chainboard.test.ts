import { describe, expect, test } from 'vitest';
import { ChainBoardConfigs } from './chainboards';
import axios, { HttpStatusCode } from 'axios';

describe('can make requests using public nodes', async function () {
  for (const [chain, chainConfig] of Object.entries(ChainBoardConfigs)) {
    describe(`can make requests using public nodes - blockchain:${chain}`, async function () {
      chainConfig.nodeRpcs.map((nodeRpc) =>
        test(`can make rpc requests using node: ${nodeRpc}`, async function () {
          const response = await axios.post(nodeRpc, {
            id: 1,
            jsonrpc: '2.0',
            method: 'eth_blockNumber',
            params: [],
          });

          expect(response.status).equal(HttpStatusCode.Ok);
          expect(response.data).not.equal(null);
          expect(response.data).not.equal(undefined);
          expect(response.data.result).not.equal(null);
          expect(response.data.result).not.equal(undefined);
        }),
      );
    });
  }
});
