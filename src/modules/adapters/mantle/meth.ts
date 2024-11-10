import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, Erc20TransferEventSignature, TimeUnits } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import mEthAbi from '../../../configs/abi/mantle/mETH.json';
import ethStakingAbi from '../../../configs/abi/mantle/EthStaking.json';
import erc20Abi from '../../../configs/abi/ERC20.json';
import cmEthVaultAbi from '../../../configs/abi/mantle/cmETHVault.json';
import { MethProtocolConfig } from '../../../configs/protocols/mantle';
import BigNumber from 'bignumber.js';

const EventEnter = '0xea00f88768a86184a6e515238a549c171769fe7460a011d6fd0bcd48ca078ea4';
const EventExit = '0xe0c82280a1164680e0cf43be7db4c4c9f985423623ad7a544fb76c772bdc6043';

export default class MethAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.meth';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const methConfig = this.protocolConfig as MethProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        ethereum: {
          // stake ETH -> mETH
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            totalSupplied: 0,
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },

          // stake mETH -> cmETH
          [methConfig.mETH]: {
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
    const methPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: 'ethereum',
      address: methConfig.mETH,
      timestamp: options.timestamp,
    });

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      methConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      methConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(methConfig.chain, options.endTime);

    const stakingContract = await this.services.blockchain.evm.readContract({
      chain: methConfig.chain,
      target: methConfig.mETH,
      abi: mEthAbi,
      method: 'stakingContract',
      params: [],
      blockNumber: blockNumber,
    });
    const totalControlled = await this.services.blockchain.evm.readContract({
      chain: methConfig.chain,
      target: stakingContract,
      abi: ethStakingAbi,
      method: 'totalControlled',
      params: [],
      blockNumber: blockNumber,
    });

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < methConfig.birthday
        ? methConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      methConfig.chain,
      last7DaysTime,
    );
    const getPreExchangeRate = await this.services.blockchain.evm.readContract({
      chain: methConfig.chain,
      target: stakingContract,
      abi: ethStakingAbi,
      method: 'mETHToETH',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: last7DaysBlock,
    });
    const getPostExchangeRate = await this.services.blockchain.evm.readContract({
      chain: methConfig.chain,
      target: stakingContract,
      abi: ethStakingAbi,
      method: 'mETHToETH',
      params: [new BigNumber(1e18).toString(10)],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(getPreExchangeRate.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(getPostExchangeRate.toString(), 18);

    const stakingApr =
      (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
      (options.endTime - last7DaysTime);

    const totalDepositedUsd = formatBigNumberToNumber(totalControlled.toString(), 18) * ethPriceUsd;

    // 10% protocol fees
    // https://etherscan.io/address/0x1766be66fBb0a1883d41B4cfB0a533c5249D3b82#readProxyContract#F5
    const methFeeRate = 0.25;

    // rewards were distribute on-chain to mETH holders
    const supplySideRevenue = (stakingApr * totalDepositedUsd) / TimeUnits.DaysPerYear;
    const protocolRevenue = (supplySideRevenue / (1 - methFeeRate)) * methFeeRate;
    const totalFees = supplySideRevenue + protocolRevenue;

    let totalmETHDepositedUsd = 0;
    if (methConfig.cmETHBirthday <= options.timestamp) {
      const mETHBalanceOfcmETH = await this.services.blockchain.evm.readContract({
        chain: methConfig.chain,
        target: methConfig.mETH,
        abi: erc20Abi,
        method: 'balanceOf',
        params: [methConfig.cmETHVault],
        blockNumber: blockNumber,
      });
      totalmETHDepositedUsd = formatBigNumberToNumber(mETHBalanceOfcmETH.toString(), 18) * methPriceUsd;

      const vaultLogs = await this.services.blockchain.evm.getContractLogs({
        chain: methConfig.chain,
        address: methConfig.cmETHVault,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of vaultLogs) {
        if (log.topics[0] === EventEnter || log.topics[0] === EventExit) {
          const event: any = decodeEventLog({
            abi: cmEthVaultAbi,
            topics: log.topics,
            data: log.data,
          });

          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * methPriceUsd;

          if (log.topics[0] === EventEnter) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[methConfig.chain][methConfig.mETH].volumes.deposit as number) += amountUsd;
          } else {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[methConfig.chain][methConfig.mETH].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    protocolData.totalAssetDeposited += totalDepositedUsd + totalmETHDepositedUsd;
    protocolData.totalValueLocked += totalDepositedUsd + totalmETHDepositedUsd;
    (protocolData.totalSupplied as number) += totalDepositedUsd + totalmETHDepositedUsd;
    protocolData.totalFees += totalFees;
    protocolData.protocolRevenue += protocolRevenue;
    protocolData.supplySideRevenue += supplySideRevenue;
    protocolData.liquidStakingApr = stakingApr * 100;

    protocolData.breakdown[methConfig.chain][AddressZero].totalAssetDeposited += totalDepositedUsd;
    protocolData.breakdown[methConfig.chain][AddressZero].totalValueLocked += totalDepositedUsd;
    (protocolData.breakdown[methConfig.chain][AddressZero].totalSupplied as number) += totalDepositedUsd;
    protocolData.breakdown[methConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[methConfig.chain][AddressZero].protocolRevenue += protocolRevenue;
    protocolData.breakdown[methConfig.chain][AddressZero].supplySideRevenue += supplySideRevenue;
    protocolData.breakdown[methConfig.chain][AddressZero].liquidStakingApr = stakingApr * 100;

    protocolData.breakdown[methConfig.chain][methConfig.mETH].totalAssetDeposited += totalmETHDepositedUsd;
    protocolData.breakdown[methConfig.chain][methConfig.mETH].totalValueLocked += totalmETHDepositedUsd;
    (protocolData.breakdown[methConfig.chain][methConfig.mETH].totalSupplied as number) += totalmETHDepositedUsd;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: methConfig.chain,
      address: methConfig.mETH,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of logs) {
      if (log.topics[0] === Erc20TransferEventSignature) {
        const event: any = decodeEventLog({
          abi: mEthAbi,
          topics: log.topics,
          data: log.data,
        });
        if (compareAddress(event.args.from, AddressZero) || compareAddress(event.args.to, AddressZero)) {
          // deposit
          const exchangeRate = await this.services.blockchain.evm.readContract({
            chain: methConfig.chain,
            abi: ethStakingAbi,
            target: stakingContract,
            method: 'mETHToETH',
            params: [new BigNumber(1e18).toString(10)],
            blockNumber: Number(log.blockNumber) - 1,
          });
          const amountUsd =
            formatBigNumberToNumber(exchangeRate.toString(), 18) *
            formatBigNumberToNumber(event.args.value.toString(), 18) *
            ethPriceUsd;

          if (compareAddress(event.args.from, AddressZero)) {
            (protocolData.volumes.deposit as number) += amountUsd;
            (protocolData.breakdown[methConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
          }
          if (compareAddress(event.args.to, AddressZero)) {
            (protocolData.volumes.withdraw as number) += amountUsd;
            (protocolData.breakdown[methConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
