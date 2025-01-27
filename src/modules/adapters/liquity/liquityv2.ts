import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { Liquityv2ProtocolConfig } from '../../../configs/protocols/liquity';
import CollateralRegistryAbi from '../../../configs/abi/liquity/CollateralRegistry.json';
import TroveManagerAbi from '../../../configs/abi/liquity/TroveManagerV2.json';
import StabilityPoolAbi from '../../../configs/abi/liquity/StabilityPoolV2.json';
import { decodeEventLog } from 'viem';
import { ContractCall } from '../../../services/blockchains/domains';
import { TimeUnits } from '../../../configs/constants';

export const Events = {
  TroveOperation: '0x962110f281c1213763cd97a546b337b3cbfd25a31ea9723e9d8b7376ba45da1a',
};

export default class Liquityv2Adapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.liquityv2';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const liquityConfig = this.protocolConfig as Liquityv2ProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [liquityConfig.chain]: {
          [normalizeAddress(liquityConfig.stablecoin.address)]: {
            ...getInitialProtocolCoreMetrics(),
            totalBorrowed: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
              borrow: 0,
              repay: 0,
              liquidation: 0,
              redeemtion: 0,
            },
          },
        },
      },

      ...getInitialProtocolCoreMetrics(),
      // total BOLD staking in stability pool
      totalSupplied: 0,

      // total BOLD borrowed
      totalBorrowed: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
        liquidation: 0,
        redeemtion: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      liquityConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      liquityConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      liquityConfig.chain,
      options.endTime,
    );

    const boldPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: liquityConfig.stablecoin.chain,
      address: liquityConfig.stablecoin.address,
      timestamp: options.timestamp,
    });

    const totalCollaterals = await this.services.blockchain.evm.readContract({
      chain: liquityConfig.chain,
      abi: CollateralRegistryAbi,
      target: liquityConfig.collateralRegistry,
      method: 'totalCollaterals',
      params: [],
      blockNumber: blockNumber,
    });
    for (let i = 0; i < Number(totalCollaterals); i++) {
      const [tokenAddress, troveManager] = await this.services.blockchain.evm.multicall({
        chain: liquityConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: CollateralRegistryAbi,
            target: liquityConfig.collateralRegistry,
            method: 'getToken',
            params: [i],
          },
          {
            abi: CollateralRegistryAbi,
            target: liquityConfig.collateralRegistry,
            method: 'getTroveManager',
            params: [i],
          },
        ],
      });
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: liquityConfig.chain,
        address: tokenAddress,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const [getEntireSystemDebt, getEntireSystemColl, stabilityPool, getTroveIdsCount] =
          await this.services.blockchain.evm.multicall({
            chain: liquityConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'getEntireSystemDebt',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'getEntireSystemColl',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'stabilityPool',
                params: [],
              },
              {
                abi: TroveManagerAbi,
                target: troveManager,
                method: 'getTroveIdsCount',
                params: [],
              },
            ],
          });

        const getTotalBoldDeposits = await this.services.blockchain.evm.readContract({
          chain: liquityConfig.chain,
          abi: StabilityPoolAbi,
          target: stabilityPool,
          method: 'getTotalBoldDeposits',
          params: [],
          blockNumber: blockNumber,
        });

        const totalDebtUsd =
          formatBigNumberToNumber(
            getEntireSystemDebt ? getEntireSystemDebt.toString() : '0',
            liquityConfig.stablecoin.decimals,
          ) * boldPriceUsd;
        const totalCollUsd =
          formatBigNumberToNumber(getEntireSystemColl ? getEntireSystemColl.toString() : '0', token.decimals) *
          tokenPriceUsd;
        const totalBoldStakedUsd =
          formatBigNumberToNumber(
            getTotalBoldDeposits ? getTotalBoldDeposits.toString() : '0',
            liquityConfig.stablecoin.decimals,
          ) * boldPriceUsd;

        const getTroveIdCalls: Array<ContractCall> = [];
        for (let i = 0; i < Number(getTroveIdsCount); i++) {
          getTroveIdCalls.push({
            abi: TroveManagerAbi,
            target: troveManager,
            method: 'getTroveFromTroveIdsArray',
            params: [i],
          });
        }
        const troveIds = await this.services.blockchain.evm.multicall({
          chain: liquityConfig.chain,
          blockNumber: blockNumber,
          calls: getTroveIdCalls,
        });

        if (troveIds) {
          const getTroveCalls: Array<ContractCall> = troveIds.map((troveId: any) => {
            return {
              abi: TroveManagerAbi,
              target: troveManager,
              method: 'getLatestTroveData',
              params: [troveId.toString()],
            };
          });
          const troves = await this.services.blockchain.evm.multicall({
            chain: liquityConfig.chain,
            blockNumber: blockNumber,
            calls: getTroveCalls,
          });
          if (troves) {
            for (const trove of troves) {
              const recordedDebt = formatBigNumberToNumber(trove.recordedDebt.toString(), 18);
              const annualInterestRate = formatBigNumberToNumber(trove.annualInterestRate.toString(), 18);
              const borrowFees = ((recordedDebt * annualInterestRate) / TimeUnits.DaysPerYear) * boldPriceUsd;

              // https://docs.liquity.org/v2-faq/bold-and-earn#where-does-the-yield-for-earn-come-from
              const suppySideRevenue = borrowFees * 0.75;
              const protocolRevenue = borrowFees - suppySideRevenue;

              protocolData.totalFees += borrowFees;
              protocolData.supplySideRevenue += suppySideRevenue;
              protocolData.protocolRevenue += protocolRevenue;
              protocolData.breakdown[liquityConfig.stablecoin.chain][liquityConfig.stablecoin.address].totalFees +=
                borrowFees;
              protocolData.breakdown[liquityConfig.stablecoin.chain][
                liquityConfig.stablecoin.address
              ].supplySideRevenue += suppySideRevenue;
              protocolData.breakdown[liquityConfig.stablecoin.chain][
                liquityConfig.stablecoin.address
              ].protocolRevenue += protocolRevenue;
            }
          }
        }

        protocolData.totalAssetDeposited += totalCollUsd;
        protocolData.totalValueLocked += totalCollUsd;
        (protocolData.totalSupplied as number) += totalBoldStakedUsd;
        (protocolData.totalBorrowed as number) += totalDebtUsd;
        (protocolData.breakdown[liquityConfig.stablecoin.chain][liquityConfig.stablecoin.address]
          .totalSupplied as number) += totalBoldStakedUsd;
        (protocolData.breakdown[liquityConfig.stablecoin.chain][liquityConfig.stablecoin.address]
          .totalBorrowed as number) += totalDebtUsd;

        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              deposit: 0,
              withdraw: 0,
              liquidation: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalCollUsd;
        protocolData.breakdown[token.chain][token.address].totalValueLocked += totalCollUsd;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: liquityConfig.chain,
          address: troveManager,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs.filter((log) => log.topics[0] === Events.TroveOperation)) {
          const event: any = decodeEventLog({
            abi: TroveManagerAbi,
            topics: log.topics,
            data: log.data,
          });

          const debtChangeFromOperation =
            formatBigNumberToNumber(event.args._debtChangeFromOperation.toString(), liquityConfig.stablecoin.decimals) *
            boldPriceUsd;
          const collChangeFromOperation =
            formatBigNumberToNumber(event.args._collChangeFromOperation.toString(), token.decimals) * tokenPriceUsd;

          if (debtChangeFromOperation < 0) {
            (protocolData.volumes.repay as number) += Math.abs(debtChangeFromOperation);
            (protocolData.breakdown[liquityConfig.stablecoin.chain][liquityConfig.stablecoin.address].volumes
              .repay as number) += Math.abs(debtChangeFromOperation);
          } else {
            (protocolData.volumes.borrow as number) += Math.abs(debtChangeFromOperation);
            (protocolData.breakdown[liquityConfig.stablecoin.chain][liquityConfig.stablecoin.address].volumes
              .borrow as number) += Math.abs(debtChangeFromOperation);
          }

          if (collChangeFromOperation < 0) {
            (protocolData.volumes.withdraw as number) += Math.abs(collChangeFromOperation);
            (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) +=
              Math.abs(collChangeFromOperation);
          } else {
            (protocolData.volumes.deposit as number) += Math.abs(collChangeFromOperation);
            (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) +=
              Math.abs(collChangeFromOperation);
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
