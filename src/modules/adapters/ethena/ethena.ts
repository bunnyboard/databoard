import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { EthenaProtocolConfig } from '../../../configs/protocols/ethena';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import Erc4626Abi from '../../../configs/abi/ERC4626.json';
import { SolidityUnits } from '../../../configs/constants';
import MintingV1Abi from '../../../configs/abi/ethena/EthenaMinting.json';
import MintingV2Abi from '../../../configs/abi/ethena/EthenaMintingV2.json';
import { decodeEventLog } from 'viem';
import envConfig from '../../../configs/envConfig';
import ProtocolAdapter from '../protocol';

const MintingV1Events = {
  Mint: '0xf114ca9eb82947af39f957fa726280fd3d5d81c3d7635a4aeb5c302962856eba',
  Redeem: '0x18fd144d7dbcbaa6f00fd47a84adc7dc3cc64a326ffa2dc7691a25e3837dba03',
};

const MintingV2Events = {
  Mint: '0x29ee92e51cda311463f5c9ef98c54824a4bebe45e689c37da35edc774585d437',
  Redeem: '0x0ea36c5b7b274f8fe58654fe884bb9307dec1899e0312f40ae10d9b3d100cc0c',
};

export default class EthenaAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.ethena';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // to calculate total collaterals deposited (on USDe minting)
  // we need to index historical minting event logs
  // and count collateral deposit/withdraw
  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const ethenaConfig = this.protocolConfig as EthenaProtocolConfig;

    if (ethenaConfig.birthday > options.timestamp) {
      return null;
    }

    const tokenUSDE = normalizeAddress(ethenaConfig.USDeToken);

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [ethenaConfig.chain]: {
          [tokenUSDE]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            totalBorrowed: 0,
            volumes: {
              // mint/redeem USDe
              borrow: 0,
              repay: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      // total USDe are being staked in sUSDe
      totalSupplied: 0,

      // total USDe supply
      totalBorrowed: 0,
      volumes: {
        // mint/redeem USDe
        borrow: 0,
        repay: 0,

        // deposit/withdraw collaterals
        deposit: 0,
        withdraw: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      ethenaConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      ethenaConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      ethenaConfig.chain,
      options.endTime,
    );

    // index historical minting logs
    // to count total collaterals are deposited
    await this.indexContractLogs({
      chain: ethenaConfig.chain,
      address: ethenaConfig.mintingV1,
      fromBlock: ethenaConfig.mintingV1Birthblock,
      toBlock: ethenaConfig.mintingV1Endblock,
    });
    await this.indexContractLogs({
      chain: ethenaConfig.chain,
      address: ethenaConfig.mintingV2,
      fromBlock: ethenaConfig.mintingV2Birthblock,
      toBlock: endBlock,
    });

    const [totalSupply, totalAssets] = await this.services.blockchain.evm.multicall({
      chain: ethenaConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: Erc20Abi,
          target: ethenaConfig.USDeToken,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: Erc4626Abi,
          target: ethenaConfig.USDeStaking,
          method: 'totalAssets',
          params: [],
        },
      ],
    });

    const USDePriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: ethenaConfig.chain,
      address: ethenaConfig.USDeToken,
      timestamp: options.timestamp,
    });
    const ENAPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: ethenaConfig.chain,
      address: ethenaConfig.ENAToken,
      timestamp: options.timestamp,
    });

    const totalUSDeSupply = formatBigNumberToNumber(totalSupply.toString(), 18) * USDePriceUsd;
    const totalUSDeStaked = formatBigNumberToNumber(totalAssets.toString(), 18) * USDePriceUsd;

    (protocolData.totalBorrowed as number) += totalUSDeSupply;
    (protocolData.totalSupplied as number) += totalUSDeStaked;
    (protocolData.breakdown[ethenaConfig.chain][tokenUSDE].totalBorrowed as number) += totalUSDeSupply;
    (protocolData.breakdown[ethenaConfig.chain][tokenUSDE].totalSupplied as number) += totalUSDeStaked;

    // count total collaterals locked
    // from minting v1
    const historicalMintingV1Logs = await this.storages.database.query({
      collection: envConfig.mongodb.collections.contractLogs.name,
      query: {
        address: normalizeAddress(ethenaConfig.mintingV1),
        blockNumber: {
          $gte: ethenaConfig.mintingV1Birthblock,
          $lte: blockNumber,
        },
      },
    });
    // from minting v2
    const historicalMintingV2Logs = await this.storages.database.query({
      collection: envConfig.mongodb.collections.contractLogs.name,
      query: {
        address: normalizeAddress(ethenaConfig.mintingV2),
        blockNumber: {
          $gte: ethenaConfig.mintingV1Birthblock,
          $lte: blockNumber,
        },
      },
    });

    // tokenAddress => balance
    const totalCollaterals: { [key: string]: number } = {};
    for (const log of historicalMintingV1Logs.concat(historicalMintingV2Logs)) {
      const signature = log.topics[0];

      let event: any = null;

      if (Object.values(MintingV1Events).includes(signature)) {
        event = decodeEventLog({
          abi: MintingV1Abi,
          topics: log.topics,
          data: log.data,
        });
      } else if (Object.values(MintingV2Events).includes(signature)) {
        event = decodeEventLog({
          abi: MintingV2Abi,
          topics: log.topics,
          data: log.data,
        });
      }

      if (event) {
        const collateralToken = await this.services.blockchain.evm.getTokenInfo({
          chain: ethenaConfig.chain,
          address: event.args.collateral_asset,
        });
        if (collateralToken) {
          if (!totalCollaterals[collateralToken.address]) {
            totalCollaterals[collateralToken.address] = 0;
          }

          const collateralAmount = formatBigNumberToNumber(
            event.args.collateral_amount.toString(),
            collateralToken.decimals,
          );

          if (signature === MintingV1Events.Mint || signature === MintingV2Events.Mint) {
            totalCollaterals[collateralToken.address] += collateralAmount;
          } else if (signature === MintingV1Events.Redeem || signature === MintingV2Events.Redeem) {
            totalCollaterals[collateralToken.address] -= collateralAmount;
          }
        }
      }
    }

    for (const [address, balance] of Object.entries(totalCollaterals)) {
      const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: ethenaConfig.chain,
        address: address,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += balance * tokenPriceUsd;
      protocolData.totalValueLocked += balance * tokenPriceUsd;

      if (!protocolData.breakdown[ethenaConfig.chain][address]) {
        protocolData.breakdown[ethenaConfig.chain][address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            // deposit/withdraw collaterals
            deposit: 0,
            withdraw: 0,
          },
        };
      }
      protocolData.breakdown[ethenaConfig.chain][address].totalAssetDeposited += balance * tokenPriceUsd;
      protocolData.breakdown[ethenaConfig.chain][address].totalValueLocked += balance * tokenPriceUsd;
    }

    // we count total fees on Ethena by counting rewards are distributed to sUSDe and sETH holders
    // sUSDe -> supplySideRevenue
    // sENA -> protocolRevenue
    let [pre_sUSDe_priceShare, pre_sUSDe_totalAssets, pre_sENA_priceShare, pre_sENA_totalAssets] =
      await this.services.blockchain.evm.multicall({
        chain: ethenaConfig.chain,
        blockNumber: beginBlock,
        calls: [
          {
            abi: Erc4626Abi,
            target: ethenaConfig.USDeStaking,
            method: 'convertToAssets',
            params: [SolidityUnits.OneWad],
          },
          {
            abi: Erc4626Abi,
            target: ethenaConfig.USDeStaking,
            method: 'totalAssets',
            params: [],
          },
          {
            abi: Erc4626Abi,
            target: ethenaConfig.ENAStaking,
            method: 'convertToAssets',
            params: [SolidityUnits.OneWad],
          },
          {
            abi: Erc4626Abi,
            target: ethenaConfig.ENAStaking,
            method: 'totalAssets',
            params: [],
          },
        ],
      });
    let [post_sUSDe_priceShare, post_sENA_priceShare] = await this.services.blockchain.evm.multicall({
      chain: ethenaConfig.chain,
      blockNumber: endBlock,
      calls: [
        {
          abi: Erc4626Abi,
          target: ethenaConfig.USDeStaking,
          method: 'convertToAssets',
          params: [SolidityUnits.OneWad],
        },
        {
          abi: Erc4626Abi,
          target: ethenaConfig.ENAStaking,
          method: 'convertToAssets',
          params: [SolidityUnits.OneWad],
        },
      ],
    });

    let supplySideRevenue = 0;
    let protocolRevenue = 0;
    if (pre_sUSDe_priceShare && post_sUSDe_priceShare) {
      pre_sUSDe_priceShare = formatBigNumberToNumber(pre_sUSDe_priceShare.toString(), 18);
      pre_sUSDe_totalAssets = formatBigNumberToNumber(pre_sUSDe_totalAssets.toString(), 18);
      post_sUSDe_priceShare = formatBigNumberToNumber(post_sUSDe_priceShare.toString(), 18);
      const rewards_USDe =
        ((post_sUSDe_priceShare - pre_sUSDe_priceShare) / pre_sUSDe_priceShare) * pre_sUSDe_totalAssets;
      supplySideRevenue = rewards_USDe * USDePriceUsd;
    }

    if (pre_sENA_priceShare && post_sENA_priceShare) {
      pre_sENA_priceShare = formatBigNumberToNumber(pre_sENA_priceShare.toString(), 18);
      pre_sENA_totalAssets = formatBigNumberToNumber(pre_sENA_totalAssets.toString(), 18);
      post_sENA_priceShare = formatBigNumberToNumber(post_sENA_priceShare.toString(), 18);
      const rewards_ENA = ((post_sENA_priceShare - pre_sENA_priceShare) / pre_sENA_priceShare) * pre_sENA_totalAssets;
      protocolRevenue = rewards_ENA * ENAPriceUsd;
    }

    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.totalFees += supplySideRevenue + protocolRevenue;

    const mintingV1Logs = await this.services.blockchain.evm.getContractLogs({
      chain: ethenaConfig.chain,
      address: ethenaConfig.mintingV1,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const mintingV2Logs = await this.services.blockchain.evm.getContractLogs({
      chain: ethenaConfig.chain,
      address: ethenaConfig.mintingV2,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of mintingV1Logs.concat(mintingV2Logs)) {
      const signature = log.topics[0];

      let event: any = null;

      if (Object.values(MintingV1Events).includes(signature)) {
        event = decodeEventLog({
          abi: MintingV1Abi,
          topics: log.topics,
          data: log.data,
        });
      } else if (Object.values(MintingV2Events).includes(signature)) {
        event = decodeEventLog({
          abi: MintingV2Abi,
          topics: log.topics,
          data: log.data,
        });
      }

      if (event) {
        const collateralToken = await this.services.blockchain.evm.getTokenInfo({
          chain: ethenaConfig.chain,
          address: event.args.collateral_asset,
        });
        if (collateralToken) {
          if (!protocolData.breakdown[collateralToken.chain][collateralToken.address]) {
            protocolData.breakdown[collateralToken.chain][collateralToken.address] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                // deposit/withdraw collaterals
                deposit: 0,
                withdraw: 0,
              },
            };
          }
          const collateralTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
            chain: collateralToken.chain,
            address: collateralToken.address,
            timestamp: options.timestamp,
          });

          const collateralAmountUsd =
            formatBigNumberToNumber(event.args.collateral_amount.toString(), collateralToken.decimals) *
            collateralTokenPriceUsd;
          const usdeAmountUsd = formatBigNumberToNumber(event.args.usde_amount.toString(), 18) * USDePriceUsd;

          if (signature === MintingV1Events.Mint || signature === MintingV2Events.Mint) {
            (protocolData.volumes.deposit as number) += collateralAmountUsd;
            (protocolData.volumes.borrow as number) += usdeAmountUsd;
            (protocolData.breakdown[ethenaConfig.chain][tokenUSDE].volumes.borrow as number) += usdeAmountUsd;
            (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.deposit as number) +=
              collateralAmountUsd;
          } else if (signature === MintingV1Events.Redeem || signature === MintingV2Events.Redeem) {
            (protocolData.volumes.withdraw as number) += collateralAmountUsd;
            (protocolData.volumes.repay as number) += usdeAmountUsd;
            (protocolData.breakdown[ethenaConfig.chain][tokenUSDE].volumes.repay as number) += usdeAmountUsd;
            (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.withdraw as number) +=
              collateralAmountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
