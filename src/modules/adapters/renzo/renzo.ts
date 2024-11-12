import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';
import { RenzoProtocolConfig } from '../../../configs/protocols/renzo';
import RestakeManagerAbi from '../../../configs/abi/renzo/RestakeManager.json';
import WithdrawManagerAbi from '../../../configs/abi/renzo/WithdrawQueue.json';
import pzEthVaultAbi from '../../../configs/abi/renzo/pzEthVault.json';
import ezEigenVaultAbi from '../../../configs/abi/renzo/ezEigenVault.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';

const RenzoEvents = {
  // deposit ETH to ezETH
  Deposit: '0x4e2ca0515ed1aef1395f66b5303bb5d6f1bf9d61a353fa53f73f8ac9973fa9f6',

  // withdraw ETH from ezETH
  WithdrawRequestClaimed: '0x59557aa2024e953d94077c5e8323a7be3cfc4c508f3c6120136d03017096ed39',
};

export default class RenzoAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.renzo';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const renzoConfig = this.protocolConfig as RenzoProtocolConfig;

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
          [renzoConfig.wstETH]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
          [renzoConfig.EIGEN]: {
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

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      renzoConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      renzoConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      renzoConfig.chain,
      options.endTime,
    );

    const [[, , tvl], ezTotalSupply, [, amounts], getRate, totalSupply] = await this.services.blockchain.evm.multicall({
      chain: renzoConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: RestakeManagerAbi,
          target: renzoConfig.restakeManager,
          method: 'calculateTVLs',
          params: [],
        },
        {
          abi: Erc20Abi,
          target: renzoConfig.ezETH,
          method: 'totalSupply',
          params: [],
        },
        {
          abi: pzEthVaultAbi,
          target: renzoConfig.pzETH,
          method: 'underlyingTvl',
          params: [],
        },
        {
          abi: ezEigenVaultAbi,
          target: renzoConfig.ezEIGEN,
          method: 'getRate',
          params: [],
        },
        {
          abi: ezEigenVaultAbi,
          target: renzoConfig.ezEIGEN,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < renzoConfig.birthday
        ? renzoConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      renzoConfig.chain,
      last7DaysTime,
    );
    const [[, , preTvl], preEzTotalSupply] = await this.services.blockchain.evm.multicall({
      chain: renzoConfig.chain,
      blockNumber: last7DaysBlock,
      calls: [
        {
          abi: RestakeManagerAbi,
          target: renzoConfig.restakeManager,
          method: 'calculateTVLs',
          params: [],
        },
        {
          abi: Erc20Abi,
          target: renzoConfig.ezETH,
          method: 'totalSupply',
          params: [],
        },
      ],
    });

    const preSupply = formatBigNumberToNumber(preEzTotalSupply.toString(), 18);
    const preExchangeRate = preSupply ? formatBigNumberToNumber(preTvl.toString(), 18) / preSupply : 0;

    const postSupply = formatBigNumberToNumber(ezTotalSupply.toString(), 18);
    const postExchangeRate = postSupply ? formatBigNumberToNumber(tvl.toString(), 18) / postSupply : 0;

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const [ethPriceUsd, wstETHPriceUsd, eigenPriceUsd] = await Promise.all([
      this.services.oracle.getTokenPriceUsdRounded({
        chain: renzoConfig.chain,
        address: AddressZero,
        timestamp: options.timestamp,
      }),
      this.services.oracle.getTokenPriceUsdRounded({
        chain: renzoConfig.chain,
        address: renzoConfig.wstETH,
        timestamp: options.timestamp,
      }),
      this.services.oracle.getTokenPriceUsdRounded({
        chain: renzoConfig.chain,
        address: renzoConfig.EIGEN,
        timestamp: options.timestamp,
      }),
    ]);

    const totalEthDepositedUsd = formatBigNumberToNumber(tvl.toString(), 18) * ethPriceUsd;
    const totalwstETHDepositedUsd = formatBigNumberToNumber(amounts[0].toString(), 18) * wstETHPriceUsd;
    const totalEigenDepositedUsd =
      formatBigNumberToNumber(getRate.toString(), 18) *
      formatBigNumberToNumber(totalSupply.toString(), 18) *
      eigenPriceUsd;

    protocolData.totalAssetDeposited += totalEthDepositedUsd + totalwstETHDepositedUsd + totalEigenDepositedUsd;
    protocolData.totalValueLocked += totalEthDepositedUsd + totalwstETHDepositedUsd + totalEigenDepositedUsd;
    (protocolData.totalSupplied as number) += totalEthDepositedUsd + totalwstETHDepositedUsd + totalEigenDepositedUsd;

    // ETH
    protocolData.breakdown[renzoConfig.chain][AddressZero].totalAssetDeposited += totalEthDepositedUsd;
    protocolData.breakdown[renzoConfig.chain][AddressZero].totalValueLocked += totalEthDepositedUsd;
    (protocolData.breakdown[renzoConfig.chain][AddressZero].totalSupplied as number) += totalEthDepositedUsd;

    // wstETH
    protocolData.breakdown[renzoConfig.chain][renzoConfig.wstETH].totalAssetDeposited += totalwstETHDepositedUsd;
    protocolData.breakdown[renzoConfig.chain][renzoConfig.wstETH].totalValueLocked += totalwstETHDepositedUsd;
    (protocolData.breakdown[renzoConfig.chain][renzoConfig.wstETH].totalSupplied as number) += totalwstETHDepositedUsd;

    // EIGEN
    protocolData.breakdown[renzoConfig.chain][renzoConfig.EIGEN].totalAssetDeposited += totalEigenDepositedUsd;
    protocolData.breakdown[renzoConfig.chain][renzoConfig.EIGEN].totalValueLocked += totalEigenDepositedUsd;
    (protocolData.breakdown[renzoConfig.chain][renzoConfig.EIGEN].totalSupplied as number) += totalEigenDepositedUsd;

    // rewards were distribute on-chain to ezETH holders
    const totalFees = (stakingApr * totalEthDepositedUsd) / TimeUnits.DaysPerYear;
    protocolData.totalFees = totalFees;
    protocolData.protocolRevenue = totalFees * 0.1; // 10%
    protocolData.supplySideRevenue = totalFees * 0.9; // 90%

    const restakeManagerLogs = await this.services.blockchain.evm.getContractLogs({
      chain: renzoConfig.chain,
      address: renzoConfig.restakeManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const withdrawManagerLogs = await this.services.blockchain.evm.getContractLogs({
      chain: renzoConfig.chain,
      address: renzoConfig.withdrawManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of restakeManagerLogs.concat(withdrawManagerLogs)) {
      const signature = log.topics[0];
      if (signature === RenzoEvents.Deposit && compareAddress(log.address, renzoConfig.restakeManager)) {
        const event: any = decodeEventLog({
          abi: RestakeManagerAbi,
          topics: log.topics,
          data: log.data,
        });
        const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;
        (protocolData.volumes.deposit as number) += amountUsd;
        (protocolData.breakdown[renzoConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
      } else if (
        signature === RenzoEvents.WithdrawRequestClaimed &&
        compareAddress(log.address, renzoConfig.withdrawManager)
      ) {
        const event: any = decodeEventLog({
          abi: WithdrawManagerAbi,
          topics: log.topics,
          data: log.data,
        });
        const amountUsd =
          formatBigNumberToNumber(event.args.withdrawRequest.amountToRedeem.toString(), 18) * ethPriceUsd;
        (protocolData.volumes.withdraw as number) += amountUsd;
        (protocolData.breakdown[renzoConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
      }
    }

    protocolData.liquidStakingApr = stakingApr * 100;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
