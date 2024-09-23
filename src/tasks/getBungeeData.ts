// get Bungee supported tokens
import axios from 'axios';

import { compareAddress, normalizeAddress } from '../lib/utils';
import updateTokenInfo from './helpers/updateTokenInfo';
import { BlockchainConfigs } from '../configs/blockchains';
import { Token } from '../types/base';
import { OracleConfigs } from '../configs/oracles/configs';
import { AddressE, AddressZero } from '../configs/constants';

// help to get supported tokens on Bungee.Exchange
(async function () {
  // address => Token
  const tokens: { [key: string]: Token } = {};

  try {
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

            tokens[normalizeAddress(supportedToken.address)] = token;

            if (!OracleConfigs[token.chain][token.address]) {
              console.log('oracle not found for token', token);
            }
          }
        } else {
          console.log(`blockchain not found with chainId: ${chainId}`);
        }
      }
    }
  } catch (e: any) {
    console.log(e);
  }

  updateTokenInfo(Object.values(tokens));
})();
