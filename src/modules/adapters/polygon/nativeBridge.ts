import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { PolygonBridgeProtocolConfig } from '../../../configs/protocols/polygon';

// const Events = {

// };

export default class PolygonNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.polygon';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const polygonConfig = this.protocolConfig as PolygonBridgeProtocolConfig;

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
    // const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
    //   polygonConfig.chain,
    //   options.beginTime,
    // );
    // const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
    //   polygonConfig.chain,
    //   options.endTime,
    // );

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

    for (const ownerAddress of [polygonConfig.bridgeERC20, polygonConfig.bridgePlasma]) {
      const getBalanceResults = await this.getAddressBalanceUsd({
        chain: polygonConfig.chain,
        ownerAddress: ownerAddress,
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
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
