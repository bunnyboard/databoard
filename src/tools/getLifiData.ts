// get Li.fi supported tokens
import axios from 'axios';
import fs from 'fs';

import { compareAddress, normalizeAddress } from '../lib/utils';
// import updateTokenInfo from './helpers/updateTokenInfo';
import { BlockchainConfigs } from '../configs/blockchains';
import { Token } from '../types/base';
// import { OracleConfigs } from '../configs/oracles/configs';
import { AddressE, AddressZero } from '../configs/constants';

// help to get supported tokens on li.fi
(async function () {
  const tokens: Array<Token> = [];

  try {
    const response = await axios.get('https://li.quest/v1/tokens');

    if (response.data.tokens) {
      for (const [chainId, supportedTokens] of Object.entries(response.data.tokens)) {
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

            // if (!OracleConfigs[token.chain] || !OracleConfigs[token.chain][token.address]) {
            //   console.log('oracle not found for token', token.address, token.chain, token.symbol);
            //   continue;
            // }

            tokens.push(token);
          }
        } else {
          console.log(`blockchain not found with chainId: ${chainId}`);
        }
      }
    }
  } catch (e: any) {
    console.log(e);
  }

  // updateTokenInfo(tokens);

  fs.writeFileSync('./src/configs/data/constants/LifiTokens.json', JSON.stringify(tokens));
})();
