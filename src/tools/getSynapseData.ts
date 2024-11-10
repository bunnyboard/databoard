// get synapse bridge supported tokens

import axios from 'axios';
import fs from 'fs';

import updateTokenInfo from './helpers/updateTokenInfo';
import { Token } from '../types/base';
import BlockchainService from '../services/blockchains/blockchain';
import { getChainNameById } from '../lib/helpers';
import { OracleConfigs } from '../configs/oracles/configs';

(async function () {
  const blockchain = new BlockchainService();

  const tokens: { [key: string]: { [key: string]: Token } } = {};

  try {
    const response = await axios.get(
      // https://docs.synapseprotocol.com/docs/Bridge/REST-API
      'https://api.synapseprotocol.com/tokenlist',
    );
    if (response.data) {
      for (const config of Object.values(response.data)) {
        for (const [chainId, address] of Object.entries((config as any).addresses)) {
          const chainName = getChainNameById(Number(chainId));
          if (chainName) {
            const token = await blockchain.getTokenInfo({
              chain: chainName,
              address: address as string,
            });
            if (token) {
              if (!OracleConfigs[token.chain] || !OracleConfigs[token.chain][token.address]) {
                console.log('oracle not found for token', token.address, token.chain, token.symbol);
                continue;
              }

              if (!tokens[token.chain]) {
                tokens[token.chain] = {};
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

  fs.writeFileSync('./src/configs/data/constants/SynapseTokens.json', JSON.stringify(tokenList));
})();
