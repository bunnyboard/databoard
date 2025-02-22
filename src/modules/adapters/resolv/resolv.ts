import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { SolidityUnits } from '../../../configs/constants';
import RequestManagerAbi from '../../../configs/abi/resolv/ExternalRequestsManager.json';
import stUSRAbi from '../../../configs/abi/resolv/StUSR.json';
import { decodeEventLog } from 'viem';
import envConfig from '../../../configs/envConfig';
import { ResolvProtocolConfig } from '../../../configs/protocols/resolv';
import ProtocolAdapter from '../protocol';

const Events = {
  MintRequestCreated: '0x7f382249e1e2d2be5b5e769bbd3abd8e092fc5932a37d3819055e2c88c8540f8',
  MintRequestCompleted: '0x2f78b4436cbdcae9d74f9f2699396a3d28cd2ab069518d23be6b25cd29e49963',
  BurnRequestCreated: '0x09fdc4f6581c246c961bfa60d4a4d0d0f26a4bc0d47082a0f628bc8c92ea98f4',
  BurnRequestCompleted: '0xbf79ce6ffda2b262d7c1d31cde3fbde100c49885be80ba25764dc18e0256b54f',
};

export default class ResolvAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.resolv';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // to calculate total collaterals deposited (on USR and RLP minting)
  // we need to index historical minting event logs
  // and count collateral deposit/withdraw
  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const resolvConfig = this.protocolConfig as ResolvProtocolConfig;

    if (resolvConfig.birthday > options.timestamp) {
      return null;
    }

    const tokenUSR = normalizeAddress(resolvConfig.usr);
    const tokenRLP = normalizeAddress(resolvConfig.rlp);

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [resolvConfig.chain]: {
          [tokenUSR]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            totalBorrowed: 0,
            volumes: {
              // mint/redeem USR
              borrow: 0,
              repay: 0,
            },
          },
          [tokenRLP]: {
            ...getInitialProtocolCoreMetrics(),
            totalBorrowed: 0,
            volumes: {
              // mint/redeem RLP
              borrow: 0,
              repay: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      // total USR are being staked in stUSR
      totalSupplied: 0,

      // total USR + RLP supply
      totalBorrowed: 0,
      volumes: {
        // mint/redeem USR + RLP
        borrow: 0,
        repay: 0,

        // deposit/withdraw collaterals
        deposit: 0,
        withdraw: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      resolvConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      resolvConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      resolvConfig.chain,
      options.endTime,
    );

    // index historical minting logs
    // to count total collaterals are deposited
    await this.indexContractLogs({
      chain: resolvConfig.chain,
      address: resolvConfig.usrRequestManager,
      fromBlock: resolvConfig.birthblock,
      toBlock: endBlock,
    });
    await this.indexContractLogs({
      chain: resolvConfig.chain,
      address: resolvConfig.rlpRequestManager,
      fromBlock: resolvConfig.birthblock,
      toBlock: endBlock,
    });

    const [usr_totalSupply, stusr_totalSupply, rlp_totalSupply] = await this.services.blockchain.evm.multicall({
      chain: resolvConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: Erc20Abi,
          target: resolvConfig.usr,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: Erc20Abi,
          target: resolvConfig.stUsr,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: Erc20Abi,
          target: resolvConfig.rlp,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    const usrPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: resolvConfig.chain,
      address: resolvConfig.usr,
      timestamp: options.timestamp,
    });
    const rlpPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: resolvConfig.chain,
      address: resolvConfig.rlp,
      timestamp: options.timestamp,
    });

    const totalUsrSupply = formatBigNumberToNumber(usr_totalSupply.toString(), 18) * usrPriceUsd;
    const totalUsrStaked = formatBigNumberToNumber(stusr_totalSupply.toString(), 18) * usrPriceUsd;
    const totalRlpSupply = formatBigNumberToNumber(rlp_totalSupply.toString(), 18) * rlpPriceUsd;

    (protocolData.totalBorrowed as number) += totalUsrSupply + totalRlpSupply;
    (protocolData.totalSupplied as number) += totalUsrStaked;
    (protocolData.breakdown[resolvConfig.chain][tokenUSR].totalBorrowed as number) += totalUsrSupply;
    (protocolData.breakdown[resolvConfig.chain][tokenUSR].totalSupplied as number) += totalUsrStaked;
    (protocolData.breakdown[resolvConfig.chain][tokenRLP].totalBorrowed as number) += totalRlpSupply;

    // count total collaterals locked
    // from minting USR
    const historicalMintingUsrLogs = await this.storages.database.query({
      collection: envConfig.mongodb.collections.contractLogs.name,
      query: {
        address: normalizeAddress(resolvConfig.usrRequestManager),
        blockNumber: {
          $gte: resolvConfig.birthblock,
          $lte: blockNumber,
        },
      },
    });
    // from minting RLP
    const historicalMintingRlpLogs = await this.storages.database.query({
      collection: envConfig.mongodb.collections.contractLogs.name,
      query: {
        address: normalizeAddress(resolvConfig.rlpRequestManager),
        blockNumber: {
          $gte: resolvConfig.birthblock,
          $lte: blockNumber,
        },
      },
    });

    // tokenAddress => balance
    const totalCollaterals: { [key: string]: number } = {};
    for (const log of historicalMintingUsrLogs.concat(historicalMintingRlpLogs)) {
      const signature = log.topics[0];

      if (Object.values([Events.MintRequestCreated, Events.BurnRequestCompleted]).includes(signature)) {
        const event: any = decodeEventLog({
          abi: RequestManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        let collateralToken: Token | null = null;

        if (signature === Events.MintRequestCreated) {
          collateralToken = await this.services.blockchain.evm.getTokenInfo({
            chain: resolvConfig.chain,
            address: event.args.depositToken,
          });
        } else if (signature === Events.BurnRequestCompleted) {
          // query depositToken
          const requestId = Number(event.args.id);
          const request = await this.services.blockchain.evm.readContract({
            chain: resolvConfig.chain,
            abi: RequestManagerAbi,
            target: log.address,
            method: 'burnRequests',
            params: [requestId],
          });
          if (request) {
            collateralToken = await this.services.blockchain.evm.getTokenInfo({
              chain: resolvConfig.chain,
              address: request[4],
            });
          }
        }

        if (collateralToken) {
          if (!totalCollaterals[collateralToken.address]) {
            totalCollaterals[collateralToken.address] = 0;
          }

          const collateralAmount = formatBigNumberToNumber(
            event.args.collateralAmount.toString(),
            collateralToken.decimals,
          );

          if (signature === Events.MintRequestCreated) {
            totalCollaterals[collateralToken.address] += collateralAmount;
          } else if (signature === Events.BurnRequestCompleted) {
            totalCollaterals[collateralToken.address] -= collateralAmount;
          }
        }
      }
    }

    for (const [address, balance] of Object.entries(totalCollaterals)) {
      const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: resolvConfig.chain,
        address: address,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += balance * tokenPriceUsd;
      protocolData.totalValueLocked += balance * tokenPriceUsd;

      if (!protocolData.breakdown[resolvConfig.chain][address]) {
        protocolData.breakdown[resolvConfig.chain][address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            // deposit/withdraw collaterals
            deposit: 0,
            withdraw: 0,
          },
        };
      }
      protocolData.breakdown[resolvConfig.chain][address].totalAssetDeposited += balance * tokenPriceUsd;
      protocolData.breakdown[resolvConfig.chain][address].totalValueLocked += balance * tokenPriceUsd;
    }

    // we count total fees on resolv by counting rewards are distributed to stUSR
    // stUSR -> supplySideRevenue
    let [pre_stUSR_priceShare, pre_stUSR_totalSupply] = await this.services.blockchain.evm.multicall({
      chain: resolvConfig.chain,
      blockNumber: beginBlock,
      calls: [
        {
          abi: stUSRAbi,
          target: resolvConfig.stUsr,
          method: 'convertToUnderlyingToken',
          params: [SolidityUnits.OneWad],
        },
        {
          abi: stUSRAbi,
          target: resolvConfig.stUsr,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    let [post_stUSR_priceShare] = await this.services.blockchain.evm.multicall({
      chain: resolvConfig.chain,
      blockNumber: endBlock,
      calls: [
        {
          abi: stUSRAbi,
          target: resolvConfig.stUsr,
          method: 'convertToUnderlyingToken',
          params: [SolidityUnits.OneWad],
        },
      ],
    });

    let supplySideRevenue = 0;
    if (pre_stUSR_priceShare && post_stUSR_priceShare) {
      pre_stUSR_priceShare = formatBigNumberToNumber(pre_stUSR_priceShare.toString(), 18);
      pre_stUSR_totalSupply = formatBigNumberToNumber(pre_stUSR_totalSupply.toString(), 18);
      post_stUSR_priceShare = formatBigNumberToNumber(post_stUSR_priceShare.toString(), 18);
      const rewards_USR =
        ((post_stUSR_priceShare - pre_stUSR_priceShare) / pre_stUSR_priceShare) * pre_stUSR_totalSupply;
      supplySideRevenue = rewards_USR * usrPriceUsd;
    }

    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.totalFees += supplySideRevenue;

    const mintingUsrLogs = await this.services.blockchain.evm.getContractLogs({
      chain: resolvConfig.chain,
      address: resolvConfig.usrRequestManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const mintingRlpLogs = await this.services.blockchain.evm.getContractLogs({
      chain: resolvConfig.chain,
      address: resolvConfig.rlpRequestManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of mintingUsrLogs.concat(mintingRlpLogs)) {
      const signature = log.topics[0];

      if (Object.values(Events).includes(signature)) {
        const event: any = decodeEventLog({
          abi: RequestManagerAbi,
          topics: log.topics,
          data: log.data,
        });

        // count collateral deposit/withdraw
        if (signature === Events.MintRequestCreated || signature === Events.BurnRequestCompleted) {
          let collateralToken: Token | null = null;

          if (signature === Events.MintRequestCreated) {
            collateralToken = await this.services.blockchain.evm.getTokenInfo({
              chain: resolvConfig.chain,
              address: event.args.depositToken,
            });
          } else if (signature === Events.BurnRequestCompleted) {
            // query depositToken
            const requestId = Number(event.args.id);
            const request = await this.services.blockchain.evm.readContract({
              chain: resolvConfig.chain,
              abi: RequestManagerAbi,
              target: log.address,
              method: 'burnRequests',
              params: [requestId],
            });
            if (request) {
              collateralToken = await this.services.blockchain.evm.getTokenInfo({
                chain: resolvConfig.chain,
                address: request[4],
              });
            }
          }

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
              formatBigNumberToNumber(event.args.collateralAmount.toString(), collateralToken.decimals) *
              collateralTokenPriceUsd;

            if (signature === Events.MintRequestCreated) {
              (protocolData.volumes.deposit as number) += collateralAmountUsd;
              (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.deposit as number) +=
                collateralAmountUsd;
            } else if (signature === Events.BurnRequestCompleted) {
              (protocolData.volumes.withdraw as number) += collateralAmountUsd;
              (protocolData.breakdown[collateralToken.chain][collateralToken.address].volumes.withdraw as number) +=
                collateralAmountUsd;
            }
          }
        } else if (signature === Events.MintRequestCompleted || signature === Events.BurnRequestCreated) {
          // count borrow/repay
          const tokenAmount = formatBigNumberToNumber(event.args.mintTokenAmount.toString(), 18);

          if (compareAddress(log.address, resolvConfig.usrRequestManager)) {
            const amountUsd = tokenAmount * usrPriceUsd;

            if (signature === Events.MintRequestCompleted) {
              (protocolData.volumes.borrow as number) += amountUsd;
              (protocolData.breakdown[resolvConfig.chain][tokenUSR].volumes.borrow as number) += amountUsd;
            } else if (signature === Events.BurnRequestCreated) {
              (protocolData.volumes.repay as number) += amountUsd;
              (protocolData.breakdown[resolvConfig.chain][tokenUSR].volumes.repay as number) += amountUsd;
            }
          } else if (compareAddress(log.address, resolvConfig.rlpRequestManager)) {
            const amountUsd = tokenAmount * rlpPriceUsd;

            if (signature === Events.MintRequestCompleted) {
              (protocolData.volumes.borrow as number) += amountUsd;
              (protocolData.breakdown[resolvConfig.chain][tokenRLP].volumes.borrow as number) += amountUsd;
            } else if (signature === Events.BurnRequestCreated) {
              (protocolData.volumes.repay as number) += amountUsd;
              (protocolData.breakdown[resolvConfig.chain][tokenRLP].volumes.repay as number) += amountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
