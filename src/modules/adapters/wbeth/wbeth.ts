import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import wEthAbi from '../../../configs/abi/binance/wBETH.json';
import { decodeEventLog } from 'viem';
import { WbethProtocolConfig } from '../../../configs/protocols/wbeth';

const EthOnBnbChain = '0x2170ed0880ac9a755fd29b2688956bd959f933f8';

export default class WbethAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.wbeth';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const wethConfig = this.protocolConfig as WbethProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        ethereum: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
        },
        bnbchain: {
          [EthOnBnbChain]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
        },
      },

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: 'ethereum',
      address: AddressZero,
      timestamp: options.timestamp,
    });

    let stakingApr = 0;
    for (const token of wethConfig.tokens) {
      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        token.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        token.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(token.chain, options.endTime);

      const [exchangeRate, totalSupply] = await this.services.blockchain.evm.multicall({
        chain: token.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: wEthAbi,
            target: token.address,
            method: 'exchangeRate',
            params: [],
          },
          {
            abi: wEthAbi,
            target: token.address,
            method: 'totalSupply',
            params: [],
          },
        ],
      });

      const totalDepositedUsd =
        formatBigNumberToNumber(exchangeRate.toString(), 18) *
        formatBigNumberToNumber(totalSupply.toString(), 18) *
        ethPriceUsd;

      protocolData.totalAssetDeposited += totalDepositedUsd;
      protocolData.totalValueLocked += totalDepositedUsd;
      (protocolData.totalSupplied as number) += totalDepositedUsd;

      if (token.chain === 'ethereum') {
        protocolData.breakdown.ethereum[AddressZero].totalAssetDeposited += totalDepositedUsd;
        protocolData.breakdown.ethereum[AddressZero].totalValueLocked += totalDepositedUsd;
        (protocolData.breakdown.ethereum[AddressZero].totalSupplied as number) += totalDepositedUsd;

        // estimate staking APR beased last 7 day rewards
        const last7DaysTime =
          options.timestamp - TimeUnits.SecondsPerDay * 7 < token.birthday
            ? token.birthday
            : options.timestamp - TimeUnits.SecondsPerDay * 7;
        const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          token.chain,
          last7DaysTime,
        );

        const getPreExchangeRate = await this.services.blockchain.evm.readContract({
          chain: token.chain,
          abi: wEthAbi,
          target: token.address,
          method: 'exchangeRate',
          params: [],
          blockNumber: last7DaysBlock,
        });
        const getPostExchangeRate = await this.services.blockchain.evm.readContract({
          chain: token.chain,
          abi: wEthAbi,
          target: token.address,
          method: 'exchangeRate',
          params: [],
          blockNumber: endBlock,
        });

        const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
        const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

        stakingApr =
          (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
          (options.endTime - last7DaysTime);
      } else {
        protocolData.breakdown.bnbchain[EthOnBnbChain].totalAssetDeposited += totalDepositedUsd;
        protocolData.breakdown.bnbchain[EthOnBnbChain].totalValueLocked += totalDepositedUsd;
        (protocolData.breakdown.bnbchain[EthOnBnbChain].totalSupplied as number) += totalDepositedUsd;
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: token.chain,
        address: token.address,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Erc20TransferEventSignature) {
          const event: any = decodeEventLog({
            abi: wEthAbi,
            topics: log.topics,
            data: log.data,
          });
          if (compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero)) {
            // deposit
            const exchangeRate = await this.services.blockchain.evm.readContract({
              chain: token.chain,
              blockNumber: Number(log.blockNumber) - 1,
              abi: wEthAbi,
              target: token.address,
              method: 'exchangeRate',
              params: [],
            });
            const amountUsd =
              formatBigNumberToNumber(exchangeRate.toString(), 18) *
              formatBigNumberToNumber(event.args.value.toString(), 18) *
              ethPriceUsd;

            if (compareAddress(event.args.from, AddressZero)) {
              (protocolData.volumes.deposit as number) += amountUsd;

              if (token.chain === 'ethereum') {
                (protocolData.breakdown.ethereum[AddressZero].volumes.deposit as number) += amountUsd;
              } else {
                (protocolData.breakdown.bnbchain[EthOnBnbChain].volumes.deposit as number) += amountUsd;
              }
            }
            if (compareAddress(event.args.to, AddressZero)) {
              (protocolData.volumes.withdraw as number) += amountUsd;
              if (token.chain === 'ethereum') {
                (protocolData.breakdown.ethereum[AddressZero].volumes.withdraw as number) += amountUsd;
              } else {
                (protocolData.breakdown.bnbchain[EthOnBnbChain].volumes.withdraw as number) += amountUsd;
              }
            }
          }
        }
      }
    }

    protocolData.liquidStakingApr = stakingApr * 100;
    protocolData.breakdown.ethereum[AddressZero].liquidStakingApr = stakingApr * 100;
    protocolData.breakdown.bnbchain[EthOnBnbChain].liquidStakingApr = stakingApr * 100;

    const totalFees = (protocolData.totalAssetDeposited * stakingApr) / TimeUnits.DaysPerYear;
    protocolData.totalFees += totalFees;
    protocolData.supplySideRevenue += totalFees;

    protocolData.breakdown.ethereum[AddressZero].totalFees =
      (protocolData.breakdown.ethereum[AddressZero].totalAssetDeposited * stakingApr) / TimeUnits.DaysPerYear;
    protocolData.breakdown.bnbchain[EthOnBnbChain].totalFees =
      (protocolData.breakdown.bnbchain[EthOnBnbChain].totalAssetDeposited * stakingApr) / TimeUnits.DaysPerYear;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
