import BigNumber from 'bignumber.js';

import { OracleConfigs } from '../../configs/oracles/configs';
import { OracleCurrencyBaseConfigs } from '../../configs/oracles/currency';
import logger from '../../lib/logger';
import { compareAddress, formatBigNumberToString, normalizeAddress } from '../../lib/utils';
import ChainlinkLibs from '../../modules/libs/chainlink';
import CurveLibs from '../../modules/libs/curve';
import OracleLibs from '../../modules/libs/custom';
import UniswapLibs from '../../modules/libs/uniswap';
import {
  OracleCurrencyBase,
  OracleSourceChainlink,
  OracleSourceCurvePool,
  OracleSourceMakerRwaPip,
  OracleSourceOffchain,
  OracleSourcePool2,
  OracleSourceSavingDai,
  OracleSourceStakingTokenWrapper,
  OracleTypes,
} from '../../types/oracles';
import BlockchainService from '../blockchains/blockchain';
import { CachingService } from '../caching/caching';
import { getTokenPriceFromBinance } from './binance';
import { GetTokenPriceOptions, IOracleService } from './domains';
import { IBlockchainService } from '../blockchains/domains';
import Erc20Abi from '../../configs/abi/ERC20.json';
import Erc4626Abi from '../../configs/abi/ERC4626.json';
import { OracleTokenBlacklists } from '../../configs/oracles/blacklists';
import UniswapFactoryV2 from '../../configs/abi/uniswap/UniswapV2Factory.json';
import UniswapFactoryV3 from '../../configs/abi/uniswap/UniswapV3Factory.json';
import { AutoOracleConfigs } from '../../configs/oracles';
import { AddressZero } from '../../configs/constants';
import { Token } from '../../types/base';

export default class OracleService extends CachingService implements IOracleService {
  public readonly name: string = 'oracle';
  public readonly blockchain: IBlockchainService | undefined | null;

  constructor(blockchain: IBlockchainService | undefined | null) {
    super();

    this.blockchain = blockchain;
  }

  private getBlockchainService(): IBlockchainService {
    if (this.blockchain) {
      return this.blockchain;
    }

    return new BlockchainService();
  }

  private async getTokenPriceSource(
    source:
      | OracleSourceChainlink
      | OracleSourcePool2
      | OracleSourceSavingDai
      | OracleSourceMakerRwaPip
      | OracleSourceCurvePool
      | OracleSourceStakingTokenWrapper,
    timestamp: number,
  ): Promise<string | null> {
    const sourceCachingKey = `source:${source.type}:${source.chain}:${source.address}:${
      source.type === OracleTypes.makerRwaPip ? (source as OracleSourceMakerRwaPip).ilk : 'any'
    }:${timestamp}`;
    const cachingPrice = await this.getCachingData(sourceCachingKey);
    if (cachingPrice) {
      return cachingPrice;
    }

    const blockchain = this.getBlockchainService();
    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(source.chain, timestamp);

    switch (source.type) {
      case 'chainlink': {
        const answer = await ChainlinkLibs.getPriceFromAggregator(source as OracleSourceChainlink, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'univ2': {
        const answer = await UniswapLibs.getPricePool2(source as OracleSourcePool2, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'univ3': {
        const answer = await UniswapLibs.getPricePool2(source as OracleSourcePool2, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'savingDai': {
        const answer = await OracleLibs.getTokenPrice(source as OracleSourceSavingDai, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'makerRwaPip': {
        const answer = await OracleLibs.getTokenPrice(source as OracleSourceMakerRwaPip, blockNumber);
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'curveMetaPool':
      case 'curveFactoryPool': {
        const answer = await CurveLibs.getCurvePoolPrice({
          config: source as OracleSourceCurvePool,
          blockNumber: blockNumber,
        });
        if (answer) {
          await this.setCachingData(sourceCachingKey, answer);
          return answer;
        }

        break;
      }
      case 'stakingTokenWrapper': {
        const config = source as OracleSourceStakingTokenWrapper;

        if (config.method === 'balance') {
          const [balance, supply] = await blockchain.multicall({
            chain: source.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: Erc20Abi,
                target: config.underlyingToken.address,
                method: 'balanceOf',
                params: [config.address],
              },
              {
                abi: Erc20Abi,
                target: config.address,
                method: 'totalSupply',
                params: [],
              },
            ],
          });
          if (balance && supply !== 0n) {
            return new BigNumber(balance.toString()).dividedBy(new BigNumber(supply.toString())).toString(10);
          }
        } else if (config.method === 'erc4626') {
          const [balance] = await blockchain.multicall({
            chain: source.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: Erc4626Abi,
                target: config.address,
                method: 'convertToAssets',
                params: [
                  new BigNumber(1).multipliedBy(new BigNumber(10).pow(config.underlyingToken.decimals)).toString(10),
                ],
              },
            ],
          });
          if (balance) {
            return formatBigNumberToString(balance.toString(10), config.underlyingToken.decimals);
          }
        }

        break;
      }
    }

    return null;
  }

  private async getTokenCurrencyBasePriceUsd(currency: OracleCurrencyBase, timestamp: number): Promise<string | null> {
    if (OracleCurrencyBaseConfigs[currency]) {
      for (const source of OracleCurrencyBaseConfigs[currency].sources) {
        const priceUsd = await this.getTokenPriceSource(source, timestamp);
        if (priceUsd) {
          return priceUsd;
        }
      }
    }

    return null;
  }

  private async getTokenPriceUsd(options: GetTokenPriceOptions): Promise<string | null> {
    if (OracleTokenBlacklists[options.chain] && OracleTokenBlacklists[options.chain].includes(options.address)) {
      return null;
    }

    let returnPrice = null;
    options.address = normalizeAddress(options.address);

    let priceUsd: string | null = null;

    if (OracleConfigs[options.chain] && OracleConfigs[options.chain][options.address]) {
      for (const source of OracleConfigs[options.chain][options.address].sources) {
        if (source.type === 'stakingTokenWrapper') {
          const stakingTokenWrapperConfig = source as OracleSourceStakingTokenWrapper;
          const pricePerShare = await this.getTokenPriceSource(source, options.timestamp);
          const underlyingPrice = await this.getTokenPriceUsd({
            chain: stakingTokenWrapperConfig.underlyingToken.chain,
            address: stakingTokenWrapperConfig.underlyingToken.address,
            timestamp: options.timestamp,
          });
          if (pricePerShare && underlyingPrice) {
            returnPrice = new BigNumber(pricePerShare).multipliedBy(new BigNumber(underlyingPrice)).toString(10);
            break;
          }
        } else {
          const priceFirst = await this.getTokenPriceSource(source, options.timestamp);
          if (priceFirst) {
            if (source.currency === 'usd' || OracleConfigs[options.chain][options.address].currency === 'usd') {
              priceUsd = priceFirst;
            } else {
              const currencyBasePriceUsd = await this.getTokenCurrencyBasePriceUsd(
                OracleConfigs[options.chain][options.address].currency,
                options.timestamp,
              );
              if (currencyBasePriceUsd) {
                priceUsd = new BigNumber(priceFirst).multipliedBy(new BigNumber(currencyBasePriceUsd)).toString(10);
              }
            }

            if (priceUsd && priceUsd !== '0') {
              returnPrice = priceUsd;
              break;
            }
          }
        }
      }

      if ((returnPrice === null || returnPrice === '0') && OracleConfigs[options.chain][options.address].stablecoin) {
        return '1';
      }

      if (
        (returnPrice === null || returnPrice === '0') &&
        OracleConfigs[options.chain][options.address].offchainSources
      ) {
        const sources = OracleConfigs[options.chain][options.address].offchainSources as Array<OracleSourceOffchain>;
        for (const offchainSource of sources) {
          if (offchainSource.source === 'binance') {
            returnPrice = await getTokenPriceFromBinance(offchainSource, options.timestamp);
          }
        }
      }
    }

    return returnPrice;
  }

  protected async tryGetTokenPriceUsdFromDexes(options: GetTokenPriceOptions): Promise<string | null> {
    const blockchain = this.getBlockchainService();

    if (AutoOracleConfigs[options.chain]) {
      const baseToken = await blockchain.getTokenInfo({
        chain: options.chain,
        address: options.address,
      });

      for (const autoOracleConfig of AutoOracleConfigs[options.chain].dexes) {
        let quotaTokens: Array<Token> = [AutoOracleConfigs[options.chain].wrapToken];
        if (AutoOracleConfigs[options.chain].quotaTokens) {
          quotaTokens = quotaTokens.concat(AutoOracleConfigs[options.chain].quotaTokens as Array<Token>);
        }

        if (autoOracleConfig.type === 'univ2') {
          for (const quotaToken of quotaTokens) {
            const pairAddress = await blockchain.readContract({
              chain: options.chain,
              abi: UniswapFactoryV2,
              target: autoOracleConfig.address,
              method: 'getPair',
              params: [options.address, quotaToken.address],
            });
            if (!compareAddress(pairAddress, AddressZero)) {
              if (baseToken) {
                const priceVsQuota = await this.getTokenPriceSource(
                  {
                    type: OracleTypes.uniswapv2,
                    chain: options.chain,
                    address: pairAddress,
                    baseToken: baseToken,
                    quotaToken: quotaToken,
                  },
                  options.timestamp,
                );
                if (priceVsQuota) {
                  const quotaPriceUsd = await this.getTokenPriceUsd({
                    chain: options.chain,
                    address: quotaToken.address,
                    timestamp: options.timestamp,
                  });

                  if (quotaPriceUsd) {
                    return new BigNumber(priceVsQuota).multipliedBy(quotaPriceUsd).toString(10);
                  }
                }
              }
            }
          }
        } else if (autoOracleConfig.type === 'univ3' && autoOracleConfig.fees) {
          for (const quotaToken of quotaTokens) {
            for (const feeConfig of autoOracleConfig.fees) {
              const poolAddress = await blockchain.readContract({
                chain: options.chain,
                abi: UniswapFactoryV3,
                target: autoOracleConfig.address,
                method: 'getPool',
                params: [options.address, quotaToken.address, feeConfig],
              });
              if (!compareAddress(poolAddress, AddressZero)) {
                if (baseToken) {
                  const priceVsQuota = await this.getTokenPriceSource(
                    {
                      type: OracleTypes.uniswapv3,
                      chain: options.chain,
                      address: poolAddress,
                      baseToken: baseToken,
                      quotaToken: quotaToken,
                    },
                    options.timestamp,
                  );
                  if (priceVsQuota) {
                    const quotaPriceUsd = await this.getTokenPriceUsd({
                      chain: options.chain,
                      address: quotaToken.address,
                      timestamp: options.timestamp,
                    });

                    if (quotaPriceUsd) {
                      return new BigNumber(priceVsQuota).multipliedBy(quotaPriceUsd).toString(10);
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    return null;
  }

  public async getTokenPriceUsdRounded(options: GetTokenPriceOptions): Promise<number> {
    const cachingKey = `${options.chain}:${options.address}:${options.timestamp}`;
    const cachingPriceUsd = await this.getCachingData(cachingKey);
    if (cachingPriceUsd !== undefined && cachingPriceUsd !== null) {
      return cachingPriceUsd;
    }

    let rawPrice = await this.getTokenPriceUsd(options);
    if (rawPrice) {
      return Number(rawPrice);
    }

    // rawPrice = await this.tryGetTokenPriceUsdFromDexes(options);

    await this.setCachingData(cachingKey, rawPrice ? Number(rawPrice) : 0);

    if (!rawPrice) {
      logger.warn('failed to get token price', {
        service: this.name,
        chain: options.chain,
        token: options.address,
        time: options.timestamp,
      });
    }

    return rawPrice ? Number(rawPrice) : 0;
  }
}
