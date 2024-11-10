import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import swETHAbi from '../../../configs/abi/swell/swETH.json';
import Erc4626Abi from '../../../configs/abi/ERC4626.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { SwellProtocolConfig } from '../../../configs/protocols/swell';

export default class SwellAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.swell';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const swellConfig = this.protocolConfig as SwellProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        ethereum: {},
      },

      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    let totalStakingApr = 0;
    let totalStakingAprCount = 0;
    for (const liquidStakingConfig of swellConfig.liquidStakingconfigs) {
      if (liquidStakingConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[liquidStakingConfig.chain]) {
        protocolData.breakdown[liquidStakingConfig.chain] = {};
      }

      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: liquidStakingConfig.chain,
        address: liquidStakingConfig.token,
      });

      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.chain,
          options.timestamp,
        );
        const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.chain,
          options.beginTime,
        );
        const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          liquidStakingConfig.chain,
          options.endTime,
        );

        let stakingApr = 0;
        let totalDepositedUsd = 0;
        let totalFees = 0;
        let supplySideRevenue = 0;
        let protocolRevenue = 0;

        if (liquidStakingConfig.version === 'eth') {
          const [getRate, totalSupply] = await this.services.blockchain.evm.multicall({
            chain: liquidStakingConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                target: liquidStakingConfig.address,
                abi: swETHAbi,
                method: 'getRate',
                params: [],
              },
              {
                target: liquidStakingConfig.address,
                abi: swETHAbi,
                method: 'totalSupply',
                params: [],
              },
            ],
          });

          // estimate staking APR beased last 7 day rewards
          const last7DaysTime =
            options.timestamp - TimeUnits.SecondsPerDay * 7 < liquidStakingConfig.birthday
              ? liquidStakingConfig.birthday
              : options.timestamp - TimeUnits.SecondsPerDay * 7;
          const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
            liquidStakingConfig.chain,
            last7DaysTime,
          );
          const getPreExchangeRate = await this.services.blockchain.evm.readContract({
            chain: liquidStakingConfig.chain,
            target: liquidStakingConfig.address,
            abi: swETHAbi,
            method: 'getRate',
            params: [],
            blockNumber: last7DaysBlock,
          });
          const getPostExchangeRate = await this.services.blockchain.evm.readContract({
            chain: liquidStakingConfig.chain,
            target: liquidStakingConfig.address,
            abi: swETHAbi,
            method: 'getRate',
            params: [],
            blockNumber: endBlock,
          });

          const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
          const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

          stakingApr =
            (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
            (options.endTime - last7DaysTime);

          totalStakingApr += stakingApr * 100;
          if (stakingApr > 0) {
            totalStakingAprCount += 1;
          }

          const totalDeposited =
            formatBigNumberToNumber(getRate.toString(), 18) * formatBigNumberToNumber(totalSupply.toString(), 18);
          totalDepositedUsd = totalDeposited * tokenPriceUsd;

          // rewards were distribute on-chain to swETH/rswETH holders
          supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
          protocolRevenue =
            (supplySideRevenue / (1 - liquidStakingConfig.protocolFeeRate)) * liquidStakingConfig.protocolFeeRate;
          totalFees = supplySideRevenue + protocolRevenue;
        } else if (liquidStakingConfig.version === 'yearnVault') {
          const [getRate, totalSupply] = await this.services.blockchain.evm.multicall({
            chain: liquidStakingConfig.chain,
            blockNumber: blockNumber,
            calls: [
              {
                target: liquidStakingConfig.address,
                abi: Erc4626Abi,
                method: 'pricePerShare',
                params: [],
              },
              {
                target: liquidStakingConfig.address,
                abi: Erc20Abi,
                method: 'totalSupply',
                params: [],
              },
            ],
          });

          const totalDeposited =
            formatBigNumberToNumber(getRate.toString(), token.decimals) *
            formatBigNumberToNumber(totalSupply.toString(), token.decimals);
          totalDepositedUsd = totalDeposited * tokenPriceUsd;
        }

        protocolData.totalAssetDeposited += totalDepositedUsd;
        protocolData.totalValueLocked += totalDepositedUsd;
        (protocolData.totalSupplied as number) += totalDepositedUsd;
        protocolData.totalFees += totalFees;
        protocolData.protocolRevenue += protocolRevenue;
        protocolData.supplySideRevenue += supplySideRevenue;
        protocolData.liquidStakingApr = stakingApr * 100;

        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          };
        }
        protocolData.breakdown[token.chain][token.address].totalAssetDeposited += totalDepositedUsd;
        protocolData.breakdown[token.chain][token.address].totalValueLocked += totalDepositedUsd;
        (protocolData.breakdown[token.chain][token.address].totalSupplied as number) += totalDepositedUsd;
        protocolData.breakdown[token.chain][token.address].totalFees += totalFees;
        protocolData.breakdown[token.chain][token.address].protocolRevenue += protocolRevenue;
        protocolData.breakdown[token.chain][token.address].supplySideRevenue += supplySideRevenue;
        protocolData.breakdown[token.chain][token.address].liquidStakingApr = stakingApr * 100;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: liquidStakingConfig.chain,
          address: liquidStakingConfig.address,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });
        for (const log of logs) {
          if (log.topics[0] === Erc20TransferEventSignature) {
            const event: any = decodeEventLog({
              abi: Erc20Abi,
              topics: log.topics,
              data: log.data,
            });

            if (!compareAddress(event.args.from, AddressZero) && !compareAddress(event.args.to, AddressZero)) {
              continue;
            }

            // deposit.withdraw transactions
            const exchangeRate =
              liquidStakingConfig.version === 'eth'
                ? await this.services.blockchain.evm.readContract({
                    chain: liquidStakingConfig.chain,
                    abi: swETHAbi,
                    target: liquidStakingConfig.address,
                    method: 'getRate',
                    params: [],
                    blockNumber: Number(log.blockNumber) - 1,
                  })
                : await this.services.blockchain.evm.readContract({
                    chain: liquidStakingConfig.chain,
                    abi: Erc4626Abi,
                    target: liquidStakingConfig.address,
                    method: 'pricePerShare',
                    params: [],
                    blockNumber: Number(log.blockNumber) - 1,
                  });

            const amountUsd =
              formatBigNumberToNumber(exchangeRate.toString(), token.decimals) *
              formatBigNumberToNumber(event.args.value.toString(), token.decimals) *
              tokenPriceUsd;

            if (compareAddress(event.args.from, AddressZero)) {
              (protocolData.volumes.deposit as number) += amountUsd;
              (protocolData.breakdown[liquidStakingConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
            }
            if (compareAddress(event.args.to, AddressZero)) {
              (protocolData.volumes.withdraw as number) += amountUsd;
              (protocolData.breakdown[liquidStakingConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
            }
          }
        }
      }
    }

    protocolData.liquidStakingApr = totalStakingApr / totalStakingAprCount;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
