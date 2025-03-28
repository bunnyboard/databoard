import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import BoardAdapter from '../board';
import { StablecoinData } from '../../../types/domains/stablecoin';
import { StablecoinProtocolConfig } from '../../../configs/protocols/stablecoin';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
// import { AddressZero, Erc20TransferEventSignature } from '../../../configs/constants';
// import { decodeEventLog } from 'viem';
import CurvePoolHelper from './curve';

export default class StablecoinAdapter extends BoardAdapter {
  public readonly name: string = 'adapter.stablecoin';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<StablecoinData | null> {
    if (this.protocolConfig.birthday > options.timestamp) {
      return null;
    }

    const stablecoinConfig = this.protocolConfig as StablecoinProtocolConfig;
    const stablecoinData: StablecoinData = {
      timestamp: options.timestamp,
      coins: {},
      curvePools: {},
    };

    for (const curvePoolConfig of Object.values(stablecoinConfig.curvePools)) {
      if (curvePoolConfig.birthday > options.timestamp) {
        continue;
      }
      stablecoinData.curvePools[curvePoolConfig.name] = await CurvePoolHelper.getPoolData({
        ...options,
        curvePool: curvePoolConfig,
      });
    }

    for (const coinConfig of Object.values(stablecoinConfig.coins)) {
      if (coinConfig.birthday > options.timestamp) {
        continue;
      }

      const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
        chain: coinConfig.tokens[0].chain,
        address: coinConfig.tokens[0].address,
        timestamp: options.timestamp,
      });

      stablecoinData.coins[coinConfig.coin] = {
        coin: coinConfig.coin,
        priceUsd: tokenPriceUsd,
        totalSupply: 0,
        transferVolume: 0,
        mintVolume: 0,
        burnVolume: 0,
        chains: {},
      };

      for (const token of coinConfig.tokens) {
        if (!stablecoinData.coins[coinConfig.coin].chains[token.chain]) {
          stablecoinData.coins[coinConfig.coin].chains[token.chain] = {
            totalSupply: 0,
            transferVolume: 0,
            mintVolume: 0,
            burnVolume: 0,
          };
        }

        const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
          token.chain,
          options.timestamp,
        );
        // const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        //   token.chain,
        //   options.beginTime,
        // );
        // const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(token.chain, options.endTime);

        const totalSupply = await this.services.blockchain.evm.readContract({
          chain: token.chain,
          abi: Erc20Abi,
          target: token.address,
          method: 'totalSupply',
          params: [],
          blockNumber: blockNumber,
        });

        const tokenTotalSupply = formatBigNumberToNumber(totalSupply ? totalSupply.toString() : '0', token.decimals);
        stablecoinData.coins[coinConfig.coin].totalSupply += tokenTotalSupply;
        stablecoinData.coins[coinConfig.coin].chains[token.chain].totalSupply += tokenTotalSupply;

        // const logs = await this.services.blockchain.evm.getContractLogs({
        //   chain: token.chain,
        //   address: token.address,
        //   fromBlock: beginBlock,
        //   toBlock: endBlock,
        // });
        // const events: Array<any> = logs
        //   .filter((log) => log.topics[0] === Erc20TransferEventSignature)
        //   .map((log) =>
        //     decodeEventLog({
        //       abi: Erc20Abi,
        //       topics: log.topics,
        //       data: log.data,
        //     }),
        //   );

        // for (const event of events) {
        //   const volume = formatBigNumberToNumber(
        //     event.args.value.toString(),
        //     token.decimals,
        //   );
        //   stablecoinData.coins[coinConfig.coin].transferVolume += volume;
        //   stablecoinData.coins[coinConfig.coin].chains[token.chain].transferVolume += volume;

        //   if (compareAddress(event.args.from, AddressZero)) {
        //     stablecoinData.coins[coinConfig.coin].mintVolume += volume;
        //     stablecoinData.coins[coinConfig.coin].chains[token.chain].mintVolume += volume;
        //   } else if (compareAddress(event.args.to, AddressZero)) {
        //     stablecoinData.coins[coinConfig.coin].burnVolume += volume;
        //     stablecoinData.coins[coinConfig.coin].chains[token.chain].burnVolume += volume;
        //   }
        // }
      }
    }

    return stablecoinData;
  }
}
