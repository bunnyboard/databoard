import BlockchainService from '../../services/blockchains/blockchain';
import { Token } from '../../types/base';
import MetaMorphoAbi from '../../configs/abi/morpho/MetaMorpho.json';
import OracleService from '../../services/oracle/oracle';
import { formatBigNumberToNumber } from '../../lib/utils';
import { SolidityUnits } from '../../configs/constants';
import { ContractCall } from '../../services/blockchains/domains';

export interface GetMprphoVaultsDataOptions {
  chain: string;
  vaults: Array<string>;
  timestamp: number;
  fromTime: number;
  toTime: number;
}

export interface GetMorphoVaultDataResult {
  type: 'morphoVault';
  token: Token;
  tokenPriceUsd: number;
  totalDepositedUsd: number;
  totalFeesUsd: number;
  protocolRevenueUsd: number;
}

// NOTE: MorphoVaults use 18 decimals for shares, and token decimals for converting
export default class MorphoLibs {
  public static async getMorphoVaultsData(
    options: GetMprphoVaultsDataOptions,
  ): Promise<Array<GetMorphoVaultDataResult>> {
    const blockchain = new BlockchainService();
    const oracle = new OracleService(blockchain);

    const blockNumber = await blockchain.tryGetBlockNumberAtTimestamp(options.chain, options.timestamp);
    const beginBlock = await blockchain.tryGetBlockNumberAtTimestamp(options.chain, options.fromTime);
    const endBlock = await blockchain.tryGetBlockNumberAtTimestamp(options.chain, options.toTime);

    const vaults: Array<GetMorphoVaultDataResult> = [];

    // get list of assets
    const getAssetsCalls: Array<ContractCall> = options.vaults.map((vaultAddress) => {
      return {
        abi: MetaMorphoAbi,
        target: vaultAddress,
        method: 'asset',
        params: [],
      };
    });
    const getAssetsResults = await blockchain.multicall({
      chain: options.chain,
      calls: getAssetsCalls,
    });

    // get vaults data
    const getVaultDataCalls: Array<ContractCall> = [];
    for (const vaultAddress of options.vaults) {
      getVaultDataCalls.push({
        abi: MetaMorphoAbi,
        target: vaultAddress,
        method: 'totalAssets',
        params: [],
      });
      getVaultDataCalls.push({
        abi: MetaMorphoAbi,
        target: vaultAddress,
        method: 'fee',
        params: [],
      });
    }
    const getVaultDataResults = await blockchain.multicall({
      chain: options.chain,
      blockNumber: blockNumber,
      calls: getVaultDataCalls,
    });

    // get share before/after
    const getPriceShareBeforeCalls: Array<ContractCall> = options.vaults.map((vaultAddress) => {
      return {
        abi: MetaMorphoAbi,
        target: vaultAddress,
        method: 'convertToAssets',
        params: [SolidityUnits.OneWad],
      };
    });
    const getPriceShareBeforeResults = await blockchain.multicall({
      chain: options.chain,
      blockNumber: beginBlock,
      calls: getPriceShareBeforeCalls,
    });
    const getPriceShareAfterResults = await blockchain.multicall({
      chain: options.chain,
      blockNumber: endBlock,
      calls: getPriceShareBeforeCalls,
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

        const totalAssets = getVaultDataResults[i * 2];
        const fee = getVaultDataResults[i * 2 + 1];
        const before_convertToAssets = getPriceShareBeforeResults[i];
        const after_convertToAssets = getPriceShareAfterResults[i];

        const totalAssetDepositedUsd =
          formatBigNumberToNumber(totalAssets ? totalAssets.toString() : '0', token.decimals) * tokenPriceUsd;

        const beforePriceShares = formatBigNumberToNumber(
          before_convertToAssets ? before_convertToAssets.toString() : '0',
          token.decimals,
        );
        const afterPriceShares = formatBigNumberToNumber(
          after_convertToAssets ? after_convertToAssets.toString() : '0',
          token.decimals,
        );
        const diffShares = afterPriceShares > beforePriceShares ? afterPriceShares - beforePriceShares : 0;

        const totalFees = totalAssetDepositedUsd * diffShares;
        const protocolFee = formatBigNumberToNumber(fee ? fee.toString() : '0', 18);
        const protocolRevenueUsd = totalFees * protocolFee;

        vaults.push({
          type: 'morphoVault',
          token: token,
          tokenPriceUsd: tokenPriceUsd,
          totalDepositedUsd: totalAssetDepositedUsd,
          totalFeesUsd: totalFees,
          protocolRevenueUsd: protocolRevenueUsd,
        });
      }
    }

    return vaults;
  }
}
