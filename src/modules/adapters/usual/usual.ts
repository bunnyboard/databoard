import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { UsualProtocolConfig } from '../../../configs/protocols/usual';
import { decodeEventLog } from 'viem';
import UsualDistributionAbi from '../../../configs/abi/usual/DistributionModule.json';
import { AddressZero, Erc20TransferEventSignature } from '../../../configs/constants';
import ProtocolAdapter from '../protocol';

const Events = {
  OffChainDistributionClaimed: '0xade91347622244e95f2d575f1011c6c0d78757d5ed8b7b5ff9e5c35d4d834ab0',
};

export default class UsualAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.usual';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const usualConfig = this.protocolConfig as UsualProtocolConfig;

    if (usualConfig.birthday > options.timestamp) {
      return null;
    }

    const tokenUSD0 = normalizeAddress(usualConfig.usd0);

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [usualConfig.chain]: {
          [tokenUSD0]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            totalBorrowed: 0,
            volumes: {
              // mint/redeem USD0
              borrow: 0,
              repay: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      // total USD0 are being staked in USD0++
      totalSupplied: 0,

      // total USD0 supply
      totalBorrowed: 0,
      volumes: {
        // mint/redeem USD0
        borrow: 0,
        repay: 0,

        // deposit/withdraw collaterals
        deposit: 0,
        withdraw: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      usualConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      usualConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      usualConfig.chain,
      options.endTime,
    );

    const [totalSupply, totalStaked] = await this.services.blockchain.evm.multicall({
      chain: usualConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: Erc20Abi,
          target: usualConfig.usd0,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: Erc20Abi,
          target: usualConfig.usd0,
          method: 'balanceOf',
          params: [usualConfig.usd0Staking],
        },
      ],
    });

    const USD0PriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: usualConfig.chain,
      address: usualConfig.usd0,
      timestamp: options.timestamp,
    });
    const USUALPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: usualConfig.chain,
      address: usualConfig.usual,
      timestamp: options.timestamp,
    });

    const totalUSD0Supply = formatBigNumberToNumber(totalSupply.toString(), 18) * USD0PriceUsd;
    const totalUSD0Staked = formatBigNumberToNumber(totalStaked.toString(), 18) * USD0PriceUsd;

    (protocolData.totalBorrowed as number) += totalUSD0Supply;
    (protocolData.totalSupplied as number) += totalUSD0Staked;
    (protocolData.breakdown[usualConfig.chain][tokenUSD0].totalBorrowed as number) += totalUSD0Supply;
    (protocolData.breakdown[usualConfig.chain][tokenUSD0].totalSupplied as number) += totalUSD0Staked;

    // count total collateral locked in treasury
    for (const collateral of usualConfig.collaterals) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: usualConfig.chain,
        address: collateral,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const tokenBalance = await this.services.blockchain.evm.readContract({
          chain: usualConfig.chain,
          abi: Erc20Abi,
          target: token.address,
          method: 'balanceOf',
          params: [usualConfig.treasury],
          blockNumber: blockNumber,
        });

        if (tokenBalance) {
          const collateralUsd = formatBigNumberToNumber(tokenBalance.toString(), token.decimals) * tokenPriceUsd;

          protocolData.totalAssetDeposited += collateralUsd;
          protocolData.totalValueLocked += collateralUsd;

          if (!protocolData.breakdown[token.chain][token.address]) {
            protocolData.breakdown[token.chain][token.address] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                // deposit/withdraw
                deposit: 0,
                withdraw: 0,
              },
            };
          }
          protocolData.breakdown[token.chain][token.address].totalAssetDeposited += collateralUsd;
          protocolData.breakdown[token.chain][token.address].totalValueLocked += collateralUsd;

          // count deposit/withdraw volumes by collateral transfer to/from treasury address
          const transferLogs = await this.services.blockchain.evm.getContractLogs({
            chain: usualConfig.chain,
            address: token.address,
            fromBlock: beginBlock,
            toBlock: endBlock,
          });
          for (const log of transferLogs) {
            if (log.topics[0] === Erc20TransferEventSignature) {
              const event: any = decodeEventLog({
                abi: Erc20Abi,
                topics: log.topics,
                data: log.data,
              });

              if (
                compareAddress(event.args.from, usualConfig.treasury) ||
                compareAddress(event.args.to, usualConfig.treasury)
              ) {
                const amountUsd = formatBigNumberToNumber(event.args.value.toString(), token.decimals) * tokenPriceUsd;

                if (compareAddress(event.args.to, usualConfig.treasury)) {
                  (protocolData.volumes.deposit as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
                } else if (compareAddress(event.args.from, usualConfig.treasury)) {
                  (protocolData.volumes.withdraw as number) += amountUsd;
                  (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
                }
              }
            }
          }
        }
      }
    }

    // fees on usual from USUAL distributions
    const usualDistributionLogs = await this.services.blockchain.evm.getContractLogs({
      chain: usualConfig.chain,
      address: usualConfig.usualDistribution,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of usualDistributionLogs) {
      if (log.topics[0] === Events.OffChainDistributionClaimed) {
        const event: any = decodeEventLog({
          abi: UsualDistributionAbi,
          topics: log.topics,
          data: log.data,
        });

        const claimAmountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * USUALPriceUsd;

        protocolData.totalFees += claimAmountUsd;
        protocolData.protocolRevenue += claimAmountUsd;
      }
    }

    // count borrow/repay volumes by mint/burn events from USDO contract
    const usd0TransferLogs = await this.services.blockchain.evm.getContractLogs({
      chain: usualConfig.chain,
      address: usualConfig.usd0,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of usd0TransferLogs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: Erc20Abi,
          topics: log.topics,
          data: log.data,
        });

        if (compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero)) {
          const amountUsd = formatBigNumberToNumber(event.args.value.toString(), 18) * USD0PriceUsd;

          if (
            compareAddress(event.args.from, AddressZero) &&
            compareAddress(event.args.to, usualConfig.daoCollateral)
          ) {
            (protocolData.volumes.borrow as number) += amountUsd;
            (protocolData.breakdown[usualConfig.chain][tokenUSD0].volumes.borrow as number) += amountUsd;
          } else if (
            compareAddress(event.args.to, AddressZero) &&
            compareAddress(event.args.from, usualConfig.daoCollateral)
          ) {
            (protocolData.volumes.repay as number) += amountUsd;
            (protocolData.breakdown[usualConfig.chain][tokenUSD0].volumes.repay as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
