import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { AddressZero, EventSignatures, SolidityUnits, TimeUnits } from '../../../configs/constants';
import AdapterDataHelper from '../helpers';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import { PufferProtocolConfig } from '../../../configs/protocols/puffer';
import Erc4624Abi from '../../../configs/abi/ERC4626.json';

export default class PufferAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.puffer 🐡';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const pufferConfig = this.protocolConfig as PufferProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
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
      },
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      pufferConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      pufferConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      pufferConfig.chain,
      options.endTime,
    );

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: pufferConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const totalAssets = await this.services.blockchain.evm.readContract({
      chain: pufferConfig.chain,
      abi: Erc4624Abi,
      target: pufferConfig.pufETH,
      method: 'totalAssets',
      params: [],
      blockNumber: blockNumber,
    });

    // estimate staking APR beased last 7 day rewards
    const last7DaysTime =
      options.timestamp - TimeUnits.SecondsPerDay * 7 < pufferConfig.birthday
        ? pufferConfig.birthday
        : options.timestamp - TimeUnits.SecondsPerDay * 7;
    const last7DaysBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      pufferConfig.chain,
      last7DaysTime,
    );
    const preConvertToAssets = await this.services.blockchain.evm.readContract({
      chain: pufferConfig.chain,
      abi: Erc4624Abi,
      target: pufferConfig.pufETH,
      method: 'convertToAssets',
      params: [SolidityUnits.OneWad],
      blockNumber: last7DaysBlock,
    });
    const postConvertToAssets = await this.services.blockchain.evm.readContract({
      chain: pufferConfig.chain,
      abi: Erc4624Abi,
      target: pufferConfig.pufETH,
      method: 'convertToAssets',
      params: [SolidityUnits.OneWad],
      blockNumber: endBlock,
    });

    const preExchangeRate = formatBigNumberToNumber(preConvertToAssets.toString(), 18);
    const postExchangeRate = formatBigNumberToNumber(postConvertToAssets.toString(), 18);

    const stakingApr = preExchangeRate
      ? (TimeUnits.SecondsPerYear * ((postExchangeRate - preExchangeRate) / preExchangeRate)) /
        (options.endTime - last7DaysTime)
      : 0;

    const totalEthDepositedUsd = formatBigNumberToNumber(totalAssets.toString(), 18) * ethPriceUsd;

    const totalFees = (totalEthDepositedUsd * stakingApr) / TimeUnits.DaysPerYear;

    protocolData.totalAssetDeposited += totalEthDepositedUsd;
    protocolData.totalValueLocked += totalEthDepositedUsd;
    (protocolData.totalSupplied as number) += totalEthDepositedUsd;
    protocolData.totalFees += totalFees;
    protocolData.supplySideRevenue += totalFees;

    // ETH
    protocolData.breakdown[pufferConfig.chain][AddressZero].totalAssetDeposited += totalEthDepositedUsd;
    protocolData.breakdown[pufferConfig.chain][AddressZero].totalValueLocked += totalEthDepositedUsd;
    (protocolData.breakdown[pufferConfig.chain][AddressZero].totalSupplied as number) += totalEthDepositedUsd;
    protocolData.breakdown[pufferConfig.chain][AddressZero].totalFees += totalFees;
    protocolData.breakdown[pufferConfig.chain][AddressZero].supplySideRevenue += totalFees;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: pufferConfig.chain,
      address: pufferConfig.pufETH,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of logs) {
      const signature = log.topics[0];
      if (signature === EventSignatures.ERC4626_Deposit || signature === EventSignatures.ERC4626_Withdraw) {
        const event: any = decodeEventLog({
          abi: Erc4624Abi,
          topics: log.topics,
          data: log.data,
        });

        const amountUsd = formatBigNumberToNumber(event.args.assets.toString(), 18) * ethPriceUsd;

        if (signature === EventSignatures.ERC4626_Deposit) {
          (protocolData.volumes.deposit as number) += amountUsd;
          (protocolData.breakdown[pufferConfig.chain][AddressZero].volumes.deposit as number) += amountUsd;
        } else {
          (protocolData.volumes.withdraw as number) += amountUsd;
          (protocolData.breakdown[pufferConfig.chain][AddressZero].volumes.withdraw as number) += amountUsd;
        }
      }
    }

    protocolData.liquidStakingApr = stakingApr * 100;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
