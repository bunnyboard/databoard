import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { ContractCall } from '../../../services/blockchains/domains';
import { PendleChainConfig, PendleProtocolConfig } from '../../../configs/protocols/pendle';
import PendleMarketAbi from '../../../configs/abi/pendle/PendleMarket.json';
import PendleSyTokenAbi from '../../../configs/abi/pendle/SyToken.json';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { SolidityUnits } from '../../../configs/constants';

export default class PendleAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.pendle';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private async getAllSyTokens(chainConfig: PendleChainConfig): Promise<Array<string>> {
    const syTokens: { [key: string]: true } = {};

    const getMarketTokensCalls: Array<ContractCall> = [];
    for (const market of chainConfig.markets) {
      getMarketTokensCalls.push({
        abi: PendleMarketAbi,
        target: market,
        method: 'readTokens',
        params: [],
      });
    }
    const getMarketTokensResults = await this.services.blockchain.evm.multicall({
      chain: chainConfig.chain,
      calls: getMarketTokensCalls,
    });

    for (const marketTokens of getMarketTokensResults) {
      const [syToken, , ,] = marketTokens;
      if (syToken) {
        syTokens[normalizeAddress(syToken)] = true;
      }
    }

    return Object.keys(syTokens);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    if (this.protocolConfig.birthday > options.timestamp) {
      return null;
    }

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
    };

    const pendleConfig = this.protocolConfig as PendleProtocolConfig;
    for (const chainConfig of pendleConfig.chains) {
      if (chainConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[chainConfig.chain]) {
        protocolData.breakdown[chainConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        chainConfig.chain,
        options.endTime,
      );

      // multiple markets can use the same ST token
      // we count total assets locked in unique ST tokens not unique markets
      const syTokens = await this.getAllSyTokens(chainConfig);

      const getSyTokenInfoCalls: Array<ContractCall> = [];
      const exchangeRateCalls: Array<ContractCall> = [];
      for (const syTokenAddress of syTokens) {
        getSyTokenInfoCalls.push({
          abi: PendleSyTokenAbi,
          target: syTokenAddress,
          method: 'assetInfo',
          params: [],
        });
        getSyTokenInfoCalls.push({
          abi: PendleSyTokenAbi,
          target: syTokenAddress,
          method: 'totalSupply',
          params: [],
        });
        getSyTokenInfoCalls.push({
          abi: PendleSyTokenAbi,
          target: syTokenAddress,
          method: 'decimals',
          params: [],
        });
        getSyTokenInfoCalls.push({
          abi: PendleSyTokenAbi,
          target: syTokenAddress,
          method: 'exchangeRate',
          params: [],
        });

        exchangeRateCalls.push({
          abi: PendleSyTokenAbi,
          target: syTokenAddress,
          method: 'exchangeRate',
          params: [],
        });
      }
      const getSyTokenInfoResults = await this.services.blockchain.evm.multicall({
        chain: chainConfig.chain,
        blockNumber: blockNumber,
        calls: getSyTokenInfoCalls,
      });
      const before_exchangeRateResults = await this.services.blockchain.evm.multicall({
        chain: chainConfig.chain,
        blockNumber: beginBlock,
        calls: exchangeRateCalls,
      });
      const after_exchangeRateResults = await this.services.blockchain.evm.multicall({
        chain: chainConfig.chain,
        blockNumber: endBlock,
        calls: exchangeRateCalls,
      });

      for (let i = 0; i < syTokens.length; i++) {
        const assetInfo = getSyTokenInfoResults[i * 4];
        const syTotalSupply = getSyTokenInfoResults[i * 4 + 1];
        const syTokenDecimals = getSyTokenInfoResults[i * 4 + 2];
        const syExchangeRate = getSyTokenInfoResults[i * 4 + 3];

        // failed to get market asset, just ignore the market
        if (!assetInfo) {
          continue;
        }

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: chainConfig.chain,
          address: assetInfo[1],
        });
        if (token) {
          const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: token.chain,
            address: token.address,
            timestamp: options.timestamp,
          });

          // using 18 decimals for exchange rate for normal token
          // using 26 for vBNB on bnbchain
          // because old compound exchangeRate story: https://docs.compound.finance/v2/#protocol-math
          const exchangeRateDecimals = compareAddress(syTokens[i], '0x7b5a43070bd97c2814f0d8b3b31ed53450375c19')
            ? 28
            : 18;

          // user deposit assetInfo.assetAddress token into syToken
          // syToken deposit assetInfo.assetAddress into yield-staking system
          // and receive back interest yield bearing token and hold it
          // for example, users deposit BNB into sy-ankrBNB, sy-ankrBNB deposit BNB into ankrBNB
          // receive in hold ankrBNB tokens
          // we calculate tvl by total BNB deposited amount, not by total amount of ankrBNB is being hold
          // so, to calculate the total deposited value of BNB, we need to multiply with the
          // exchange rate of ankrBNB to BNB
          const exchangeRate = formatBigNumberToNumber(
            syExchangeRate ? syExchangeRate.toString() : SolidityUnits.OneWad,
            exchangeRateDecimals,
          );
          const totalSupply = formatBigNumberToNumber(
            syTotalSupply ? syTotalSupply.toString() : '0',
            Number(syTokenDecimals),
          );
          const totalDepositedUsd = totalSupply * exchangeRate * tokenPriceUsd;

          // to calculate the yield earned by syToken
          // we calcuate the increasement of syToken exchangeRate
          const exchangeRateBefore = formatBigNumberToNumber(
            before_exchangeRateResults[i] ? before_exchangeRateResults[i].toString() : SolidityUnits.OneWad,
            exchangeRateDecimals,
          );
          const exchangeRateAfter = formatBigNumberToNumber(
            after_exchangeRateResults[i] ? after_exchangeRateResults[i].toString() : SolidityUnits.OneWad,
            exchangeRateDecimals,
          );
          const exchangeRateDiff = exchangeRateAfter > exchangeRateBefore ? exchangeRateAfter - exchangeRateBefore : 0;

          // Pendle get 3% yeild from all syTokens
          // https://docs.pendle.finance/ProtocolMechanics/Mechanisms/Fees
          const totalYieldDistributed = totalDepositedUsd * exchangeRateDiff;
          const totalFees = totalYieldDistributed / 0.97;
          const protocolRevenue = totalFees * 0.03;
          const supplySideRevenue = totalFees - protocolRevenue;

          if (totalDepositedUsd > 0) {
            protocolData.totalAssetDeposited += totalDepositedUsd;
            protocolData.totalValueLocked += totalDepositedUsd;
            (protocolData.totalSupplied as number) += totalDepositedUsd;
            protocolData.totalFees += totalFees;
            protocolData.protocolRevenue += protocolRevenue;
            protocolData.supplySideRevenue += supplySideRevenue;
            if (!protocolData.breakdown[token.chain][token.address]) {
              protocolData.breakdown[token.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                totalSupplied: 0,
              };
            }
            protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
            protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositedUsd;
            (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
            protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
            protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
            protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
