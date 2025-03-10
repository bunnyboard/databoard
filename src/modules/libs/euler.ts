import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/base';
import EVaultAbi from '../../configs/abi/euler/EVault.json';
import OracleService from '../../services/oracle/oracle';
import { formatBigNumberToNumber } from '../../lib/utils';
import { SolidityUnits, TimeUnits } from '../../configs/constants';
import { ContractCall } from '../../services/blockchains/domains';

export interface GetEulerVaultsDataOptions {
  chain: string;
  vaults: Array<string>;
  timestamp: number;
  fromTime: number;
  toTime: number;
}

export interface GetEulerVaultDataResult {
  type: 'eulerVault';
  token: Token;
  tokenPriceUsd: number;
  totalDepositedUsd: number;
  totalFeesUsd: number;
  protocolRevenueUsd: number;
}

export default class EulerLibs {
  public static async getEulerVaultsData(options: GetEulerVaultsDataOptions): Promise<Array<GetEulerVaultDataResult>> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const vaults: Array<GetEulerVaultDataResult> = [];

    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(options.chain, options.timestamp);

    // get list of assets
    const getAssetsCalls: Array<ContractCall> = options.vaults.map((vaultAddress) => {
      return {
        abi: EVaultAbi,
        target: vaultAddress,
        method: 'asset',
        params: [],
      };
    });
    const getAssetsResults = await blockchain.multicall({
      chain: options.chain,
      blockNumber: blockNumber,
      calls: getAssetsCalls,
    });

    // get vaults data
    const getVaultDataCalls: Array<ContractCall> = [];
    for (const vaultAddress of options.vaults) {
      getVaultDataCalls.push({
        abi: EVaultAbi,
        target: vaultAddress,
        method: 'totalAssets',
        params: [],
      });
      getVaultDataCalls.push({
        abi: EVaultAbi,
        target: vaultAddress,
        method: 'totalBorrows',
        params: [],
      });
      getVaultDataCalls.push({
        abi: EVaultAbi,
        target: vaultAddress,
        method: 'interestRate',
        params: [],
      });
      getVaultDataCalls.push({
        abi: EVaultAbi,
        target: vaultAddress,
        method: 'protocolFeeShare',
        params: [],
      });
    }
    const getVaultDataResults = await blockchain.multicall({
      chain: options.chain,
      blockNumber: blockNumber,
      calls: getVaultDataCalls,
    });

    for (let i = 0; i < getAssetsResults.length; i++) {
      const token = await blockchain.getTokenInfo({
        chain: options.chain,
        address: getAssetsResults[i],
      });
      if (token) {
        const tokenPriceUsd = await oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const totalAssets = getVaultDataResults[i * 4];
        const totalBorrowed = getVaultDataResults[i * 4 + 1];
        const interestRate = getVaultDataResults[i * 4 + 2];
        const protocolFeeRate = getVaultDataResults[i * 4 + 3];

        if (totalAssets && totalBorrowed && interestRate && protocolFeeRate) {
          const totalAssetDepositedUsd =
            formatBigNumberToNumber(totalAssets ? totalAssets.toString() : '0', token.decimals) * tokenPriceUsd;
          const totalBorrowedUsd =
            formatBigNumberToNumber(totalBorrowed ? totalBorrowed.toString() : '0', token.decimals) * tokenPriceUsd;

          if (totalAssetDepositedUsd > 1000000000) {
            console.log(token.address, tokenPriceUsd, totalAssets);
          }

          const borrowRate =
            formatBigNumberToNumber(interestRate.toString(), SolidityUnits.RayDecimals) * TimeUnits.SecondsPerYear;

          const totalFees = (borrowRate * totalBorrowedUsd) / TimeUnits.DaysPerYear;
          const protocolFee = formatBigNumberToNumber(protocolFeeRate ? protocolFeeRate.toString() : '0', 4);

          const protocolRevenueUsd = totalFees * protocolFee;

          vaults.push({
            type: 'eulerVault',
            token: token,
            tokenPriceUsd: tokenPriceUsd,
            totalDepositedUsd: totalAssetDepositedUsd,
            totalFeesUsd: totalFees,
            protocolRevenueUsd: protocolRevenueUsd,
          });
        }
      }
    }

    return vaults;
  }
}
