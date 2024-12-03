import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import MLRTAbi from '../../../configs/abi/eigenpie/MLRT.json';
import StakingAbi from '../../../configs/abi/eigenpie/EigenpieStaking.json';
import WithdrawAbi from '../../../configs/abi/eigenpie/EigenpieWithdrawManager.json';
import { EigenpieProtocolConfig } from '../../../configs/protocols/eigenpie';
import { AddressZero } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';

const Events = {
  AssetDeposit: '0x993597fdd4cbd87389cb9843bad4e114afb2fafa9811ac902e20896c4d1f8831',
  AssetWithdrawn: '0x6f9cbac839b826cc524f53d10416c053fce34ec15fd1001720e777cc49720e76',
};

export default class EigenpieAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.eigenpie';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const eigenpieConfig = this.protocolConfig as EigenpieProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
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

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eigenpieConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eigenpieConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      eigenpieConfig.chain,
      options.endTime,
    );

    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: eigenpieConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    const addresses: Array<any> = await this.services.blockchain.evm.multicall({
      chain: eigenpieConfig.chain,
      blockNumber: blockNumber,
      calls: eigenpieConfig.tokens.map((token) => {
        return {
          abi: MLRTAbi,
          target: token,
          method: 'underlyingAsset',
          params: [],
        };
      }),
    });
    const exchangeRateToNative: Array<any> = await this.services.blockchain.evm.multicall({
      chain: eigenpieConfig.chain,
      blockNumber: blockNumber,
      calls: eigenpieConfig.tokens.map((token) => {
        return {
          abi: MLRTAbi,
          target: token,
          method: 'exchangeRateToNative',
          params: [],
        };
      }),
    });
    const totalSupplies: Array<any> = await this.services.blockchain.evm.multicall({
      chain: eigenpieConfig.chain,
      blockNumber: blockNumber,
      calls: eigenpieConfig.tokens.map((token) => {
        return {
          abi: MLRTAbi,
          target: token,
          method: 'totalSupply',
          params: [],
        };
      }),
    });

    const tokens = await Promise.all(
      addresses.map((address) =>
        this.services.blockchain.evm.getTokenInfo({
          chain: eigenpieConfig.chain,
          address: address,
        }),
      ),
    );
    const tokenPrices: { [key: string]: number } = {};
    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token) {
        const exchangeRate = formatBigNumberToNumber(exchangeRateToNative[i] ? exchangeRateToNative[i] : '0', 18);
        const totalSupply = formatBigNumberToNumber(totalSupplies[i] ? totalSupplies[i] : '0', 18);
        const amountUsd = exchangeRate * totalSupply * ethPriceUsd;

        protocolData.totalAssetDeposited += amountUsd;
        protocolData.totalValueLocked += amountUsd;
        (protocolData.totalSupplied as number) += amountUsd;

        protocolData.breakdown[token.chain][token.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            deposit: 0,
            withdraw: 0,
          },

          totalAssetDeposited: amountUsd,
          totalValueLocked: amountUsd,
          totalSupplied: amountUsd,
        };

        tokenPrices[token.address] = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });
      }
    }

    const stakingLogs = await this.services.blockchain.evm.getContractLogs({
      chain: eigenpieConfig.chain,
      address: eigenpieConfig.staking,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of stakingLogs.filter((item) => item.topics[0] === Events.AssetDeposit)) {
      const event: any = decodeEventLog({
        abi: StakingAbi,
        topics: log.topics,
        data: log.data,
      });
      const token = tokens.filter((token) => token && compareAddress(token.address, event.args.asset))[0];
      if (token) {
        const tokenPriceusd = tokenPrices[token.address] ? tokenPrices[token.address] : 0;
        const amountUsd = formatBigNumberToNumber(event.args.depositAmount.toString(), token.decimals) * tokenPriceusd;

        (protocolData.volumes.deposit as number) += amountUsd;
        (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += amountUsd;
      }
    }

    const withdrawLogs = await this.services.blockchain.evm.getContractLogs({
      chain: eigenpieConfig.chain,
      address: eigenpieConfig.withdraManager,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of withdrawLogs.filter((item) => item.topics[0] === Events.AssetWithdrawn)) {
      const event: any = decodeEventLog({
        abi: WithdrawAbi,
        topics: log.topics,
        data: log.data,
      });
      const token = tokens.filter((token) => token && compareAddress(token.address, event.args.asset))[0];
      if (token) {
        const tokenPriceusd = tokenPrices[token.address] ? tokenPrices[token.address] : 0;
        const amountUsd = formatBigNumberToNumber(event.args.LSTAmt.toString(), token.decimals) * tokenPriceusd;

        (protocolData.volumes.withdraw as number) += amountUsd;
        (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += amountUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
