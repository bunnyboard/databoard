import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import Erc4626Abi from '../../../configs/abi/ERC4626.json';
import { AddressZero, Erc20TransferEventSignature, SolidityUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import { AnzenProtocolConfig } from '../../../configs/protocols/anzen';
import ProtocolAdapter from '../protocol';
import { ChainNames } from '../../../configs/names';

export default class AnzenAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.anzen';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const anzenConfig = this.protocolConfig as AnzenProtocolConfig;

    if (anzenConfig.birthday > options.timestamp) {
      return null;
    }

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),

      // total USDz are being staked in sUSDz
      totalSupplied: 0,

      // total USDz supply
      totalBorrowed: 0,

      volumes: {
        // mint/redeem USDz
        borrow: 0,
        repay: 0,
      },
    };

    for (const poolConfig of anzenConfig.pools) {
      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        poolConfig.chain,
        options.endTime,
      );

      const tokenUSDz = normalizeAddress(poolConfig.USDz);
      if (!protocolData.breakdown[poolConfig.chain]) {
        protocolData.breakdown[poolConfig.chain] = {};
      }
      if (!protocolData.breakdown[poolConfig.chain][tokenUSDz]) {
        protocolData.breakdown[poolConfig.chain][tokenUSDz] = {
          ...getInitialProtocolCoreMetrics(),
          totalSupplied: 0,
          totalBorrowed: 0,
          volumes: {
            borrow: 0,
            repay: 0,
          },
        };
      }

      const USDzPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: poolConfig.chain,
        address: poolConfig.USDz,
        timestamp: options.timestamp,
      });

      const [totalSupply, totalAssets] = await this.services.blockchain.evm.multicall({
        chain: poolConfig.chain,
        blockNumber: blockNumber,
        calls: [
          {
            abi: Erc20Abi,
            target: poolConfig.USDz,
            method: 'totalSupply',
            params: [],
          },
          {
            abi: Erc4626Abi,
            target: poolConfig.sUSDz,
            method: 'totalAssets',
            params: [],
          },
        ],
      });

      const totalUSDzSupply = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', 18) * USDzPriceUsd;
      const totalUSDzStaked = formatBigNumberToNumber(totalAssets ? totalAssets.toString() : '0', 18) * USDzPriceUsd;

      // we can not track on-chain collaterals
      // we asume there are 100% collaterals backing for USDz supply
      protocolData.totalAssetDeposited += totalUSDzSupply;
      protocolData.totalValueLocked += totalUSDzSupply;

      (protocolData.totalBorrowed as number) += totalUSDzSupply;
      (protocolData.totalSupplied as number) += totalUSDzStaked;
      (protocolData.breakdown[poolConfig.chain][tokenUSDz].totalBorrowed as number) += totalUSDzSupply;
      (protocolData.breakdown[poolConfig.chain][tokenUSDz].totalSupplied as number) += totalUSDzStaked;

      if (poolConfig.chain === ChainNames.ethereum) {
        // we count total fees on Anzen by counting USDz are distributed to sUSDz
        // sUSDz -> supplySideRevenue
        let [pre_sUSDz_priceShare, pre_sUSDz_totalAssets] = await this.services.blockchain.evm.multicall({
          chain: poolConfig.chain,
          blockNumber: beginBlock,
          calls: [
            {
              abi: Erc4626Abi,
              target: poolConfig.sUSDz,
              method: 'convertToAssets',
              params: [SolidityUnits.OneWad],
            },
            {
              abi: Erc4626Abi,
              target: poolConfig.sUSDz,
              method: 'totalAssets',
              params: [],
            },
          ],
        });
        let [post_sUSDz_priceShare] = await this.services.blockchain.evm.multicall({
          chain: poolConfig.chain,
          blockNumber: endBlock,
          calls: [
            {
              abi: Erc4626Abi,
              target: poolConfig.sUSDz,
              method: 'convertToAssets',
              params: [SolidityUnits.OneWad],
            },
          ],
        });

        let supplySideRevenue = 0;
        if (pre_sUSDz_priceShare && post_sUSDz_priceShare) {
          pre_sUSDz_priceShare = formatBigNumberToNumber(pre_sUSDz_priceShare.toString(), 18);
          pre_sUSDz_totalAssets = formatBigNumberToNumber(pre_sUSDz_totalAssets.toString(), 18);
          post_sUSDz_priceShare = formatBigNumberToNumber(post_sUSDz_priceShare.toString(), 18);
          const rewards_USDz =
            ((post_sUSDz_priceShare - pre_sUSDz_priceShare) / pre_sUSDz_priceShare) * pre_sUSDz_totalAssets;
          supplySideRevenue = rewards_USDz * USDzPriceUsd;
        }

        protocolData.supplySideRevenue += supplySideRevenue;
        protocolData.totalFees += supplySideRevenue;

        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: poolConfig.chain,
          address: poolConfig.USDz,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        for (const log of logs
          .filter((item) => item.topics[0] === Erc20TransferEventSignature)
          .map((item) =>
            decodeEventLog({
              abi: Erc20Abi,
              topics: item.topics,
              data: item.data,
            }),
          )) {
          const event: any = log;
          const amountUsd = formatBigNumberToNumber(event.args.value.toString(), 18) * USDzPriceUsd;
          if (compareAddress(event.args.from, AddressZero)) {
            // mint USDz
            (protocolData.volumes.borrow as number) += amountUsd;
            (protocolData.breakdown[poolConfig.chain][tokenUSDz].volumes.borrow as number) += amountUsd;
          } else if (compareAddress(event.args.to, AddressZero)) {
            // burn USDz
            (protocolData.volumes.repay as number) += amountUsd;
            (protocolData.breakdown[poolConfig.chain][tokenUSDz].volumes.repay as number) += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
