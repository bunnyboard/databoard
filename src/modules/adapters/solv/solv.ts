import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { formatBigNumberToNumber } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import { SolvProtocolConfig } from '../../../configs/protocols/solv';
import Erc20Abi from '../../../configs/abi/ERC20.json';

// const Events = {
//   // BTC deposit/withdraw
//   CreateSubscription: '0x4a29c2a0a0125871fb9cb0dcda775193070a8dd3a98e792b07eca515745de3bf',
//   CreateRedemption: '0x78f28b46ef784512c5644a2069be0c54b5504a85022f6944b8fe318e80288117',
// };

export default class SolvAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.solv';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const solvConfig = this.protocolConfig as SolvProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      totalSupplied: 0,
      volumes: {
        deposit: 0,
        withdraw: 0,
      },
    };

    for (const pool of solvConfig.pools) {
      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        pool.chain,
        options.timestamp,
      );
      // const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      //   pool.chain,
      //   options.beginTime,
      // );
      // const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      //   pool.chain,
      //   options.endTime,
      // );

      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: pool.chain,
        address: pool.solvBTC,
      });
      if (token) {
        const totalSupply = await this.services.blockchain.evm.readContract({
          chain: pool.chain,
          abi: Erc20Abi,
          target: pool.solvBTC,
          method: 'totalSupply',
          params: [],
          blockNumber: blockNumber,
        });

        const solvBtcPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
          chain: pool.chain,
          address: pool.solvBTC,
          timestamp: options.timestamp,
        });

        const balanceUsd =
          formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', token.decimals) * solvBtcPriceUsd;

        protocolData.totalAssetDeposited += balanceUsd;
        protocolData.totalValueLocked += balanceUsd;
        (protocolData.totalSupplied as number) += balanceUsd;
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
