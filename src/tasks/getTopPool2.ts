// help to get top pools from geckoterminal public APIs

import fs from 'fs';
import BlockchainService from '../services/blockchains/blockchain';
import UniswapV2FactoryAbi from '../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapV2PairAbi from '../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3FactoryAbi from '../configs/abi/uniswap/UniswapV3Factory.json';
import UniswapV3PoolAbi from '../configs/abi/uniswap/UniswapV3Pool.json';
import { Pool2, Pool2Types } from '../types/domains/pool2';
import { ProtocolConfigs, TokenDexBase, TokenList } from '../configs';
import { ContractCall } from '../services/blockchains/domains';
import { compareAddress, normalizeAddress } from '../lib/utils';
import { UniswapDexConfig, UniswapProtocolConfig } from '../configs/protocols/uniswap';
import { ProtocolConfig, Token } from '../types/base';
import { AddressZero } from '../configs/constants';

const dataPath = './src/configs/data/pool2';

const protocolConfigs: Array<UniswapProtocolConfig> = [
  ProtocolConfigs.uniswap,
  // ProtocolConfigs.sushi,
  // ProtocolConfigs.spooky,
  // ProtocolConfigs.pancake,
  // ProtocolConfigs.katana,
  // ProtocolConfigs.camelot,
];

async function getV2Pools(
  blockchain: BlockchainService,
  protocolConfig: ProtocolConfig,
  dexConfig: UniswapDexConfig,
  tokens: Array<Token>,
): Promise<Array<Pool2>> {
  // address => Pool2
  const pools: { [key: string]: Pool2 } = {};

  const baseTokens: Array<string> = TokenDexBase[dexConfig.chain]
    ? TokenDexBase[dexConfig.chain]
    : [dexConfig.wrappedNative];

  for (const baseTokenAddress of baseTokens) {
    const getPairCalls: Array<ContractCall> = tokens.map((token) => {
      return {
        abi: UniswapV2FactoryAbi,
        target: dexConfig.factory,
        method: 'getPair',
        params: [baseTokenAddress, token.address],
      };
    });
    const getPairResults: Array<any> = await blockchain.multicall({
      chain: dexConfig.chain,
      calls: getPairCalls,
    });

    const allPairs = getPairResults.filter((item) => !compareAddress(item, AddressZero));
    const getPairTokenCalls: Array<ContractCall> = [];
    for (const pair of allPairs) {
      getPairTokenCalls.push({
        abi: UniswapV2PairAbi,
        target: pair,
        method: 'token0',
        params: [],
      });
      getPairTokenCalls.push({
        abi: UniswapV2PairAbi,
        target: pair,
        method: 'token1',
        params: [],
      });
    }
    const getPairTokenResults: Array<any> = await blockchain.multicall({
      chain: dexConfig.chain,
      calls: getPairTokenCalls,
    });

    for (let i = 0; i < getPairTokenResults.length; i += 2) {
      const token0 = await blockchain.getTokenInfo({
        chain: dexConfig.chain,
        address: getPairTokenResults[i],
      });
      const token1 = await blockchain.getTokenInfo({
        chain: dexConfig.chain,
        address: getPairTokenResults[i + 1],
      });

      const pairAddress = normalizeAddress(allPairs[i / 2]);
      if (token0 && token1) {
        const feeForLps = dexConfig.feeRateForLiquidityProviders ? dexConfig.feeRateForLiquidityProviders : 0.003;
        const feeForProtocol = dexConfig.feeRateForProtocol ? dexConfig.feeRateForProtocol : 0;

        pools[pairAddress] = {
          chain: dexConfig.chain,
          protocol: protocolConfig.protocol,
          type: dexConfig.version,
          factory: normalizeAddress(dexConfig.factory),
          address: pairAddress,
          feeRate: feeForLps + feeForProtocol,
          token0: token0,
          token1: token1,
        };
      }
    }
  }

  return Object.values(pools);
}

async function getV3Pools(
  blockchain: BlockchainService,
  protocolConfig: ProtocolConfig,
  dexConfig: UniswapDexConfig,
  tokens: Array<Token>,
): Promise<Array<Pool2>> {
  // address => Pool2
  const pools: { [key: string]: Pool2 } = {};

  // 0.01%, 0.05%, 0.25%, 0.3%, 1%
  const fees = [100, 500, 2500, 3000, 10000];

  for (const baseTokenAddress of TokenDexBase[dexConfig.chain]) {
    for (const feeRate of fees) {
      const getPoolCalls: Array<ContractCall> = tokens.map((token) => {
        return {
          abi: UniswapV3FactoryAbi,
          target: dexConfig.factory,
          method: 'getPool',
          params: [baseTokenAddress, token.address, feeRate],
        };
      });
      const getPoolResults: Array<any> = await blockchain.multicall({
        chain: dexConfig.chain,
        calls: getPoolCalls,
      });

      const allPools = getPoolResults.filter((item) => !compareAddress(item, AddressZero));
      const getPoolTokensCalls: Array<ContractCall> = [];
      for (const poolAddress of allPools) {
        getPoolTokensCalls.push({
          abi: UniswapV3PoolAbi,
          target: poolAddress,
          method: 'token0',
          params: [],
        });
        getPoolTokensCalls.push({
          abi: UniswapV3PoolAbi,
          target: poolAddress,
          method: 'token1',
          params: [],
        });
      }
      const getPoolTokenResults: Array<any> = await blockchain.multicall({
        chain: dexConfig.chain,
        calls: getPoolTokensCalls,
      });

      for (let i = 0; i < getPoolTokenResults.length; i += 2) {
        const token0 = await blockchain.getTokenInfo({
          chain: dexConfig.chain,
          address: getPoolTokenResults[i],
        });
        const token1 = await blockchain.getTokenInfo({
          chain: dexConfig.chain,
          address: getPoolTokenResults[i + 1],
        });

        const poolAddress = normalizeAddress(allPools[i / 2]);
        if (token0 && token1) {
          pools[poolAddress] = {
            chain: dexConfig.chain,
            protocol: protocolConfig.protocol,
            type: dexConfig.version,
            factory: normalizeAddress(dexConfig.factory),
            address: poolAddress,
            feeRate: feeRate / 1e6,
            token0: token0,
            token1: token1,
          };
        }
      }
    }
  }

  return Object.values(pools);
}

(async function () {
  const blockchain = new BlockchainService();

  // protocol => poolAddress => Pool2
  const protocolPools: { [key: string]: { [key: string]: Pool2 } } = {};

  for (const protocolConfig of protocolConfigs) {
    protocolPools[protocolConfig.protocol] = {};

    for (const dexConfig of protocolConfig.dexes) {
      if (TokenList[dexConfig.chain]) {
        console.log(
          '... getting pools',
          protocolConfig.protocol,
          dexConfig.chain,
          dexConfig.version,
          dexConfig.factory,
          `${Object.keys(TokenList[dexConfig.chain]).length} tokens`,
        );

        const size = 100;
        const tokens = Object.values(TokenList[dexConfig.chain]);
        for (let startIndex = 0; startIndex < tokens.length; startIndex += size) {
          const pools =
            dexConfig.version === Pool2Types.univ2
              ? await getV2Pools(blockchain, protocolConfig, dexConfig, tokens.slice(startIndex, startIndex + size))
              : await getV3Pools(blockchain, protocolConfig, dexConfig, tokens.slice(startIndex, startIndex + size));

          for (const pool of pools) {
            if (
              dexConfig.blacklistedPools &&
              dexConfig.blacklistedPools.filter((item) => compareAddress(item, pool.address))[0] !== undefined
            ) {
              continue;
            }

            protocolPools[protocolConfig.protocol][pool.address] = pool;
          }
        }
      }
    }
  }

  for (const [protocol, foundPools] of Object.entries(protocolPools)) {
    const fileDataPath = `${dataPath}/${protocol}.json`;
    if (fs.existsSync(fileDataPath)) {
      const existedPools = JSON.parse(fs.readFileSync(fileDataPath).toString());
      for (const existedPool of existedPools) {
        foundPools[existedPool.address] = existedPool;
      }
    }

    fs.writeFileSync(`${dataPath}/${protocol}.json`, JSON.stringify(Object.values(foundPools)));

    console.log(protocol, `updated pools: ${Object.values(foundPools).length}`);
  }
})();
