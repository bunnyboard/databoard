import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { PolygonZkevmBridgeProtocolConfig } from '../../../configs/protocols/polygon';
import BridgeAbi from '../../../configs/abi/polygon/PolygonZkEVMBridgeV2.json';
import { AddressZero } from '../../../configs/constants';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';

const Events = {
  // withdraw
  ClaimEvent: '0x1df3f2a973a00d6635911755c260704e95e8a5876997546798770f76396fda4d',

  // deposit
  BridgeEvent: '0x501781209a1f8899323b96b4ef08b168df93e0a90c673d1e4cce39366cb62f9b',
};

export default class PolygonZzkevmNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.polygonzkevm';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const polygonConfig = this.protocolConfig as PolygonZkevmBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [polygonConfig.chain]: {},
        [polygonConfig.layer2Chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [polygonConfig.chain]: {
          [polygonConfig.layer2Chain]: 0,
        },
        [polygonConfig.layer2Chain]: {
          [polygonConfig.chain]: 0,
        },
      },
    };

    if (polygonConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      polygonConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      polygonConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      polygonConfig.chain,
      options.endTime,
    );

    const tokens: Array<Token> = [];
    for (const address of polygonConfig.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: polygonConfig.chain,
        address: address,
      });
      if (token) {
        tokens.push(token);
      }
    }

    // caching for process logs below
    const tokenAndPriceUsd: { [key: string]: number } = {};

    const getBalanceResults = await this.getAddressBalanceUsd({
      chain: polygonConfig.chain,
      ownerAddress: polygonConfig.bridge,
      timestamp: options.timestamp,
      blockNumber: blockNumber,
      tokens: tokens,
    });

    protocolData.totalAssetDeposited += getBalanceResults.totalBalanceUsd;
    protocolData.totalValueLocked += getBalanceResults.totalBalanceUsd;

    for (const [address, tokenBalance] of Object.entries(getBalanceResults.tokenBalanceUsds)) {
      tokenAndPriceUsd[address] = tokenBalance.priceUsd;

      if (!protocolData.breakdown[polygonConfig.chain][address]) {
        protocolData.breakdown[polygonConfig.chain][address] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
        };
      }

      protocolData.breakdown[polygonConfig.chain][address].totalAssetDeposited += tokenBalance.balanceUsd;
      protocolData.breakdown[polygonConfig.chain][address].totalValueLocked += tokenBalance.balanceUsd;
    }

    // get native ETH locked
    const etherBalance = await this.services.blockchain.evm.getTokenBalance({
      chain: polygonConfig.chain,
      address: AddressZero,
      owner: polygonConfig.bridge,
      blockNumber: blockNumber,
    });
    const etherPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: polygonConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });
    const etherBalanceUsd = formatBigNumberToNumber(etherBalance.toString(), 18) * etherPriceUsd;
    protocolData.totalAssetDeposited += etherBalanceUsd;
    protocolData.totalValueLocked += etherBalanceUsd;
    if (!protocolData.breakdown[polygonConfig.chain][AddressZero]) {
      protocolData.breakdown[polygonConfig.chain][AddressZero] = {
        ...getInitialProtocolCoreMetrics(),
        volumes: {
          bridge: 0,
        },
      };
    }
    protocolData.breakdown[polygonConfig.chain][AddressZero].totalAssetDeposited += etherBalanceUsd;
    protocolData.breakdown[polygonConfig.chain][AddressZero].totalValueLocked += etherBalanceUsd;

    const bridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: polygonConfig.chain,
      address: polygonConfig.bridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of bridgeLogs) {
      const signature = log.topics[0];
      if (signature === Events.ClaimEvent || signature === Events.BridgeEvent) {
        const event: any = decodeEventLog({
          abi: BridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: polygonConfig.chain,
          address: event.args.originAddress,
        });
        if (token) {
          const tokenPriceUsd = tokenAndPriceUsd[token.address] ? tokenAndPriceUsd[token.address] : 0;
          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * tokenPriceUsd;

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

          if (signature === Events.BridgeEvent) {
            (protocolData.volumeBridgePaths as any)[polygonConfig.chain][polygonConfig.layer2Chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[polygonConfig.layer2Chain][polygonConfig.chain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
