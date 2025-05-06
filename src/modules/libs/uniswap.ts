import BigNumber from 'bignumber.js';

import ERC20Abi from '../../configs/abi/ERC20.json';
import UniswapV2PairAbi from '../../configs/abi/uniswap/UniswapV2Pair.json';
import UniswapV3PoolAbi from '../../configs/abi/uniswap/UniswapV3Pool.json';
import UniswapV4PositionManagerAbi from '../../configs/abi/uniswap/UniswapV4PositionManager.json';
import UniswapV4StateViewAbi from '../../configs/abi/uniswap/UniswapV4StateView.json';
import { compareAddress, formatBigNumberToNumber } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourcePool2 } from '../../types/oracles';
import OracleService from '../../services/oracle/oracle';
import { Pool2Types } from '../../types/domains/pool2';
import { slice } from 'viem';

export interface GetPool2LpPriceUsdOptions {
  chain: string;
  address: string;
  blockNumber: number;
  timestamp: number;
}

export default class UniswapLibs {
  public static async getPricePool2(source: OracleSourcePool2, blockNumber: number): Promise<string | null> {
    const blockchain = new BlockchainService();

    if (source.type === Pool2Types.univ2) {
      const [baseTokenBalance, quotaTokenBalance] = await blockchain.multicall({
        chain: source.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: ERC20Abi,
            target: source.baseToken.address,
            method: 'balanceOf',
            params: [source.address],
          },
          {
            abi: ERC20Abi,
            target: source.quotaToken.address,
            method: 'balanceOf',
            params: [source.address],
          },
        ],
      });

      if (baseTokenBalance && quotaTokenBalance && baseTokenBalance.toString() !== '0') {
        return new BigNumber(quotaTokenBalance.toString())
          .multipliedBy(new BigNumber(10).pow(source.baseToken.decimals))
          .dividedBy(new BigNumber(baseTokenBalance.toString()))
          .dividedBy(new BigNumber(10).pow(source.quotaToken.decimals))
          .toString(10);
      }
    } else if (source.type === Pool2Types.univ3) {
      // https://blog.uniswap.org/uniswap-v3-math-primer
      let [token0, token1, slot0] = await blockchain.multicall({
        chain: source.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: UniswapV3PoolAbi,
            target: source.address,
            method: 'token0',
            params: [],
          },
          {
            abi: UniswapV3PoolAbi,
            target: source.address,
            method: 'token1',
            params: [],
          },
          {
            abi: UniswapV3PoolAbi,
            target: source.address,
            method: 'slot0',
            params: [],
          },
        ],
      });

      if (slot0 === null) {
        // aerodrome slipstream pool
        slot0 = await blockchain.readContract({
          chain: source.chain,
          abi: [
            {
              inputs: [],
              name: 'slot0',
              outputs: [
                {
                  internalType: 'uint160',
                  name: 'sqrtPriceX96',
                  type: 'uint160',
                },
                {
                  internalType: 'int24',
                  name: 'tick',
                  type: 'int24',
                },
                {
                  internalType: 'uint16',
                  name: 'observationIndex',
                  type: 'uint16',
                },
                {
                  internalType: 'uint16',
                  name: 'observationCardinality',
                  type: 'uint16',
                },
                {
                  internalType: 'uint16',
                  name: 'observationCardinalityNext',
                  type: 'uint16',
                },
                {
                  internalType: 'bool',
                  name: 'unlocked',
                  type: 'bool',
                },
              ],
              stateMutability: 'view',
              type: 'function',
            },
          ],
          target: source.address,
          method: 'slot0',
          params: [],
          blockNumber: blockNumber,
        });
      }

      if (token0 && token1 && slot0) {
        // slot0.sqrtPriceX96
        const sqrtPriceX96 = new BigNumber(slot0[0].toString());
        const buyOneOfToken0 = sqrtPriceX96.dividedBy(2 ** 96).pow(2);

        if (buyOneOfToken0.gt(0)) {
          if (compareAddress(source.baseToken.address, token0)) {
            const decimals = 10 ** source.quotaToken.decimals / 10 ** source.baseToken.decimals;
            return buyOneOfToken0.dividedBy(decimals).toString(10);
          } else if (compareAddress(source.baseToken.address, token1)) {
            const decimals = 10 ** source.baseToken.decimals / 10 ** source.quotaToken.decimals;
            return new BigNumber(1).dividedBy(buyOneOfToken0.dividedBy(decimals)).toString(10);
          }
        }
      }
    } else if (source.type === Pool2Types.univ4) {
      const [positionManager, stateView, poolId] = source.address.split(':');
      const poolIdBytes25 = slice(poolId as `0x${string}`, 0, 25);
      const [poolKeys, slot0] = await blockchain.multicall({
        chain: source.chain,
        blockNumber: blockNumber,
        calls: [
          {
            target: positionManager,
            abi: UniswapV4PositionManagerAbi,
            method: 'poolKeys',
            params: [poolIdBytes25],
          },
          {
            target: stateView,
            abi: UniswapV4StateViewAbi,
            method: 'getSlot0',
            params: [poolId],
          },
        ],
      });

      if (poolKeys && slot0) {
        // slot0.sqrtPriceX96
        const sqrtPriceX96 = new BigNumber(slot0[0].toString());
        const buyOneOfToken0 = sqrtPriceX96.dividedBy(2 ** 96).pow(2);

        if (buyOneOfToken0.gt(0)) {
          if (compareAddress(source.baseToken.address, poolKeys[0])) {
            const decimals = 10 ** source.quotaToken.decimals / 10 ** source.baseToken.decimals;
            return buyOneOfToken0.dividedBy(decimals).toString(10);
          } else if (compareAddress(source.baseToken.address, poolKeys[1])) {
            const decimals = 10 ** source.baseToken.decimals / 10 ** source.quotaToken.decimals;
            return new BigNumber(1).dividedBy(buyOneOfToken0.dividedBy(decimals)).toString(10);
          }
        }
      }
    }

    return null;
  }

  public static async getUniv2LpTokenPriceUsd(options: GetPool2LpPriceUsdOptions): Promise<string | null> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const [token0Address, token1Address] = await blockchain.multicall({
      chain: options.chain,
      blockNumber: options.blockNumber,
      calls: [
        {
          abi: UniswapV2PairAbi,
          target: options.address,
          method: 'token0',
          params: [],
        },
        {
          abi: UniswapV2PairAbi,
          target: options.address,
          method: 'token1',
          params: [],
        },
      ],
    });

    const token0 = await blockchain.getTokenInfo({
      chain: options.chain,
      address: token0Address,
    });
    const token1 = await blockchain.getTokenInfo({
      chain: options.chain,
      address: token1Address,
    });

    if (token0 && token1) {
      const [balance0, balance1, totalSupply] = await blockchain.multicall({
        chain: options.chain,
        blockNumber: options.blockNumber,
        calls: [
          {
            abi: ERC20Abi,
            target: token0.address,
            method: 'balanceOf',
            params: [options.address],
          },
          {
            abi: ERC20Abi,
            target: token1.address,
            method: 'balanceOf',
            params: [options.address],
          },
          {
            abi: ERC20Abi,
            target: options.address,
            method: 'totalSupply',
            params: [],
          },
        ],
      });
      const supply = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', 18);
      if (supply > 0) {
        const token0PriceUsd = await oracle.getTokenPriceUsdRounded({
          chain: token0.chain,
          address: token0.address,
          timestamp: options.timestamp,
        });

        if (token0PriceUsd > 0) {
          return (
            (formatBigNumberToNumber(balance0 ? balance0.toString() : '0', token0.decimals) * token0PriceUsd * 2) /
            supply
          ).toString();
        } else {
          const token1PriceUsd = await oracle.getTokenPriceUsdRounded({
            chain: token1.chain,
            address: token1.address,
            timestamp: options.timestamp,
          });
          if (token1PriceUsd > 0) {
            return (
              (formatBigNumberToNumber(balance1 ? balance1.toString() : '0', token1.decimals) * token1PriceUsd * 2) /
              supply
            ).toString();
          }
        }
      }
    }

    return null;
  }
}
