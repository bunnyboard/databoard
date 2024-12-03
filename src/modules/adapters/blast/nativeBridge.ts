import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import { AddressZero } from '../../../configs/constants';
import { ContractCall } from '../../../services/blockchains/domains';
import L1StandardBridgeAbi from '../../../configs/abi/optimism/L1StandardBridge.json';
import { BlastBridgeProtocolConfig } from '../../../configs/protocols/blast';
import YieldManagerAbi from '../../../configs/abi/blast/YieldManager.json';
import { PublicAddresses } from '../../../configs/constants/addresses';

const Events = {
  // for ETH
  ETHDepositInitiated: '0x35d79ab81f2b2017e19afb5c5571778877782d7a8786f5907f93b0f4702f4f23',
  ETHWithdrawalFinalized: '0x2ac69ee804d9a7a0984249f508dfab7cb2534b465b6ce1580f99a38ba9c5e631',

  // for ERC20
  ERC20DepositInitiated: '0x718594027abd4eaed59f95162563e0cc6d0e8d5b86b1c7be8b1b0ac3343d0396',
  ERC20WithdrawalFinalized: '0x3ceee06c1e37648fcbb6ed52e17b3e1f275a1f8c7b22a84b2b84732431e046b3',

  // legacy
  // for ETH
  ETHBridgeInitiated: '0x2849b43074093a05396b6f2a937dee8565b15a48a7b3d4bffb732a5017380af5',
  ETHBridgeFinalized: '0x31b2166ff604fc5672ea5df08a78081d2bc6d746cadce880747f3643d819e83d',

  // for ERC20
  ERC20BridgeInitiated: '0x7ff126db8024424bbfd9826e8ab82ff59136289ea440b04b39a0df1b03b9cabf',
  ERC20BridgeFinalized: '0xd59c65b35445225835c83f50b6ede06a7be047d22e357073e250d9af537518cd',
};

export default class BlastNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.blast';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const blastConfig = this.protocolConfig as BlastBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [blastConfig.chain]: {
          [AddressZero]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [blastConfig.chain]: {
          [blastConfig.layer2Chain]: 0,
        },
        [blastConfig.layer2Chain]: {
          [blastConfig.chain]: 0,
        },
      },
    };

    if (blastConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      blastConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      blastConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      blastConfig.chain,
      options.endTime,
    );

    let logs = await this.services.blockchain.evm.getContractLogs({
      chain: blastConfig.chain,
      address: blastConfig.optimismGateway,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    logs = logs.concat(
      await this.services.blockchain.evm.getContractLogs({
        chain: blastConfig.chain,
        address: blastConfig.blastBridge,
        fromBlock: beginBlock,
        toBlock: endBlock,
      }),
    );

    // count ETH lock yield manager
    const ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: blastConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const [ethTotalValue, usdTotalValue] = await this.services.blockchain.evm.multicall({
      chain: blastConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: YieldManagerAbi,
          target: blastConfig.ethYieldManager,
          method: 'totalValue',
          params: [],
        },
        {
          abi: YieldManagerAbi,
          target: blastConfig.usdYieldManager,
          method: 'totalValue',
          params: [],
        },
      ],
    });

    const totalEthUsd = formatBigNumberToNumber(ethTotalValue.toString(), 18) * ethPriceUsd;
    const totalDaiUsd = formatBigNumberToNumber(usdTotalValue.toString(), 18);

    protocolData.totalAssetDeposited += totalEthUsd + totalDaiUsd;
    protocolData.totalValueLocked += totalEthUsd + totalDaiUsd;
    protocolData.breakdown[blastConfig.chain][AddressZero] = {
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      totalAssetDeposited: totalEthUsd,
      totalValueLocked: totalEthUsd,
    };
    protocolData.breakdown[blastConfig.chain][PublicAddresses.ethereum.dai] = {
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      totalAssetDeposited: totalDaiUsd,
      totalValueLocked: totalDaiUsd,
    };

    // count ETH deposit/withdraw
    for (const log of logs.filter(
      (item) =>
        item.topics[0] === Events.ETHDepositInitiated ||
        item.topics[0] === Events.ETHBridgeInitiated ||
        item.topics[0] === Events.ETHWithdrawalFinalized ||
        item.topics[0] === Events.ETHBridgeFinalized,
    )) {
      const event: any = decodeEventLog({
        abi: L1StandardBridgeAbi,
        topics: log.topics,
        data: log.data,
      });
      const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * ethPriceUsd;

      if (log.topics[0] === Events.ETHDepositInitiated || log.topics[0] === Events.ETHBridgeInitiated) {
        (protocolData.volumes.bridge as number) += amountUsd;
        (protocolData.volumeBridgePaths as any)[blastConfig.chain][blastConfig.layer2Chain] += amountUsd;
        (protocolData.breakdown[blastConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;
      } else {
        (protocolData.volumes.bridge as number) += amountUsd;
        (protocolData.volumeBridgePaths as any)[blastConfig.layer2Chain][blastConfig.chain] += amountUsd;
        (protocolData.breakdown[blastConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;
      }
    }

    // count ERC20 tokens locked in layer 1 gateway contract
    const calls: Array<ContractCall> = blastConfig.supportedTokens.map((tokenAddress) => {
      return {
        abi: Erc20Abi,
        target: tokenAddress,
        method: 'balanceOf',
        params: [blastConfig.optimismGateway],
      };
    });
    const results = await this.services.blockchain.evm.multicall({
      chain: blastConfig.chain,
      blockNumber: blockNumber,
      calls: calls,
    });
    for (let i = 0; i < blastConfig.supportedTokens.length; i++) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: blastConfig.chain,
        address: blastConfig.supportedTokens[i],
      });
      if (token && results[i] && results[i].toString() !== '0') {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });
        const balanceUsd = formatBigNumberToNumber(results[i].toString(), token.decimals) * tokenPriceUsd;

        protocolData.totalAssetDeposited += balanceUsd;
        protocolData.totalValueLocked += balanceUsd;
        protocolData.breakdown[blastConfig.chain][token.address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
          totalAssetDeposited: balanceUsd,
          totalValueLocked: balanceUsd,
        };
      }
    }

    // count bridge deposit/withdraw volumes
    for (const log of logs.filter(
      (item) =>
        item.topics[0] === Events.ERC20DepositInitiated ||
        item.topics[0] === Events.ERC20BridgeInitiated ||
        item.topics[0] === Events.ERC20WithdrawalFinalized ||
        item.topics[0] === Events.ERC20BridgeFinalized,
    )) {
      const event: any = decodeEventLog({
        abi: L1StandardBridgeAbi,
        topics: log.topics,
        data: log.data,
      });

      if (!blastConfig.supportedTokens.filter((item) => compareAddress(item, event.args.l1Token))[0]) {
        continue;
      }

      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: blastConfig.chain,
        address: event.args.l1Token,
      });
      if (token) {
        const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

        (protocolData.volumes.bridge as number) += amountUsd;

        if (!protocolData.breakdown[token.chain][token.address]) {
          protocolData.breakdown[token.chain][token.address] = {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          };
        }
        (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

        if (log.topics[0] === Events.ERC20DepositInitiated || log.topics[0] === Events.ERC20BridgeInitiated) {
          (protocolData.volumeBridgePaths as any)[blastConfig.chain][blastConfig.layer2Chain] += amountUsd;
        } else {
          (protocolData.volumeBridgePaths as any)[blastConfig.layer2Chain][blastConfig.chain] += amountUsd;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
