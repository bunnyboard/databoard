// get celer cbridge supported tokens
// https://cbridge-docs.celer.network/developer/api-reference/gateway-gettransferconfigsforall

import axios from 'axios';
import fs from 'fs';

import updateTokenInfo from './helpers/updateTokenInfo';
import { Token } from '../types/base';
import { OracleConfigs } from '../configs/oracles/configs';
import BlockchainService from '../services/blockchains/blockchain';
import { getChainNameById } from '../lib/helpers';

(async function () {
  const blockchain = new BlockchainService();

  const tokens: { [key: string]: { [key: string]: Token } } = {};

  try {
    const response = await axios.get('https://cbridge-prod2.celer.app/v2/getTransferConfigsForAll');
    if (response.data) {
      for (const [chainId, chainConfig] of Object.entries(response.data.chain_token)) {
        const chainName = getChainNameById(Number(chainId));
        if (chainName) {
          tokens[chainName] = {};

          for (const tokenConfig of (chainConfig as any).token) {
            const token = await blockchain.getTokenInfo({
              chain: chainName,
              address: tokenConfig.token.address,
            });
            if (token) {
              if (!OracleConfigs[token.chain] || !OracleConfigs[token.chain][token.address]) {
                console.log('oracle not found for token', token.address, token.chain, token.symbol);
                continue;
              }

              tokens[token.chain][token.address] = token;
            }
          }
        }
      }
    }
  } catch (e: any) {
    console.log(e);
  }

  let tokenList: Array<Token> = [];
  for (const tokenConfigs of Object.values(tokens)) {
    tokenList = tokenList.concat(Object.values(tokenConfigs));
  }

  updateTokenInfo(tokenList);

  fs.writeFileSync('./src/configs/data/constants/CbridgeTokens.json', JSON.stringify(tokenList));
})();
