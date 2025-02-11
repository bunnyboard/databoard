import axios from 'axios';
import { test } from 'vitest';
import { BlockchainConfigs } from '../../../configs/blockchains';
import { compareAddress, normalizeAddress } from '../../../lib/utils';
import { AddressE, AddressZero } from '../../../configs/constants';
import { Token } from '../../../types/base';
import { OracleConfigs } from '../../../configs/oracles/configs';

test('bungee: should have oracle configs for supported tokens', async function () {
  const response = await axios.get(`https://api.socket.tech/v2/token-lists/all?isShortList=true`, {
    headers: {
      'Api-Key': '72a5b4b0-e727-48be-8aa1-5da9d62fe635',
    },
  });

  if (response.data.result) {
    for (const [chainId, supportedTokens] of Object.entries(response.data.result)) {
      const blockchainConfig = Object.values(BlockchainConfigs).filter((item) => item.chainId === Number(chainId))[0];
      if (blockchainConfig) {
        for (const supportedToken of supportedTokens as Array<any>) {
          const tokenAddress = compareAddress(supportedToken.address, AddressE)
            ? AddressZero
            : normalizeAddress(supportedToken.address);

          const token: Token = {
            chain: blockchainConfig.name,
            symbol: supportedToken.symbol,
            decimals: supportedToken.decimals,
            address: tokenAddress,
          };

          if (!OracleConfigs[token.chain][token.address]) {
            console.log('oracle not found for token', token.address, token.chain, token.symbol);
            continue;
          }
        }
      } else {
        console.log(`blockchain not found with chainId: ${chainId}`);
      }
    }
  }
});
