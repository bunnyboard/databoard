// get Hyphen bridge supported tokens
// https://hyphen.biconomy.io/bridge

import axios from 'axios';
import fs from 'fs';

import updateTokenInfo from './helpers/updateTokenInfo';
import { BlockchainConfigs } from '../configs/blockchains';
import { Token } from '../types/base';
import { OracleConfigs } from '../configs/oracles/configs';
import BlockchainService from '../services/blockchains/blockchain';

(async function () {
  const blockchain = new BlockchainService();

  const tokens: { [key: string]: { [key: string]: Token } } = {};

  for (const chainConfig of Object.values(BlockchainConfigs)) {
    tokens[chainConfig.name] = {};

    try {
      const response = await axios.get(
        `https://hyphen-v2-api.biconomy.io/api/v1/admin/supported-token/list?networkId=${chainConfig.chainId}`,
      );
      if (response.data && response.data.supportedPairList) {
        for (const config of response.data.supportedPairList as Array<any>) {
          const token = await blockchain.getTokenInfo({
            chain: chainConfig.name,
            address: config.address,
          });

          if (token) {
            if (!OracleConfigs[token.chain][token.address]) {
              console.log('oracle not found for token', token.address, token.chain, token.symbol);
              continue;
            }

            tokens[token.chain][token.address] = token;
          }
        }
      }
    } catch (e: any) {
      console.log(e);
    }
  }

  let tokenList: Array<Token> = [];
  for (const tokenConfigs of Object.values(tokens)) {
    tokenList = tokenList.concat(Object.values(tokenConfigs));
  }

  updateTokenInfo(tokenList);

  fs.writeFileSync('./src/configs/data/constants/HyphenTokens.json', JSON.stringify(tokenList));
})();
