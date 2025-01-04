import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { AxelarProtocolConfig } from '../../../configs/protocols/axelar';
import axios from 'axios';
import ProtocolExtendedAdapter from '../extended';
import GatewayAbi from '../../../configs/abi/axelar/AxelarGateway.json';
import { decodeEventLog } from 'viem';
import { formatBigNumberToNumber } from '../../../lib/utils';

const Events = {
  ContractCallWithToken: '0x7e50569d26be643bda7757722291ec66b1be66d8283474ae3fab5a98f878a7a2',
};

export default class AxelarAdapter extends ProtocolExtendedAdapter {
  public readonly name: string = 'adapter.axelar';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  private utilGetChainNameFromAxelarChainId(axelarChainId: string): string | null {
    const axelarConfig = this.protocolConfig as AxelarProtocolConfig;
    for (const gateway of axelarConfig.gateways) {
      if (gateway.axelarChainId === axelarChainId) {
        return gateway.chain;
      }
    }

    return null;
  }

  // parse response from axelar api
  private utilGetTokens(response: any): {
    [key: string]: {
      [key: string]: string;
    };
  } {
    // chain => symbol => address
    const allTokens: {
      [key: string]: {
        [key: string]: string;
      };
    } = {};

    for (const item of Object.values(response.assets)) {
      const config = item as any;
      for (const [chain, token] of Object.entries(config.chains)) {
        const chainName = this.utilGetChainNameFromAxelarChainId(chain);

        if (chainName) {
          if (!allTokens[chainName]) {
            allTokens[chainName] = {};
          }

          allTokens[chainName][(token as any).symbol] = (token as any).tokenAddress;
        }
      }
    }

    return allTokens;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {},
    };

    const axelarConfig = this.protocolConfig as AxelarProtocolConfig;

    // get configs from axelar api
    // we depend on this api to update new configs from Axelar
    // we can simply remove dependencies to this API by hard-code configs and remove this call
    const response = (await axios.get(axelarConfig.dataApiEndpoint)).data;

    const axelarTokens = this.utilGetTokens(response);

    for (const gatewayConfig of axelarConfig.gateways) {
      if (gatewayConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[gatewayConfig.chain]) {
        protocolData.breakdown[gatewayConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[gatewayConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[gatewayConfig.chain] = {};
      }

      const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        gatewayConfig.chain,
        options.timestamp,
      );
      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        gatewayConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        gatewayConfig.chain,
        options.endTime,
      );

      const tokenAddresses = Object.values(axelarTokens[gatewayConfig.chain] ? axelarTokens[gatewayConfig.chain] : {});
      const tokens: Array<Token> = [];
      for (const address of tokenAddresses) {
        const token = await this.services.blockchain.evm.getTokenInfo({
          chain: gatewayConfig.chain,
          address: address,
        });
        if (token) {
          tokens.push(token);
        }
      }

      const getTokenBalances = await this.getAddressBalanceUsd({
        chain: gatewayConfig.chain,
        tokens: tokens,
        ownerAddress: gatewayConfig.gateway,
        blockNumber: blockNumber,
        timestamp: options.timestamp,
      });

      protocolData.totalAssetDeposited += getTokenBalances.totalBalanceUsd;
      protocolData.totalValueLocked += getTokenBalances.totalBalanceUsd;

      for (const [tokenAddress, balance] of Object.entries(getTokenBalances.tokenBalanceUsds)) {
        if (balance.balanceUsd > 0) {
          if (!protocolData.breakdown[gatewayConfig.chain][tokenAddress]) {
            protocolData.breakdown[gatewayConfig.chain][tokenAddress] = {
              ...getInitialProtocolCoreMetrics(),
              volumes: {
                bridge: 0,
              },
            };
          }
          protocolData.breakdown[gatewayConfig.chain][tokenAddress].totalAssetDeposited += balance.balanceUsd;
          protocolData.breakdown[gatewayConfig.chain][tokenAddress].totalValueLocked += balance.balanceUsd;
        }
      }

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: gatewayConfig.chain,
        address: gatewayConfig.gateway,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (log.topics[0] === Events.ContractCallWithToken) {
          const event: any = decodeEventLog({
            abi: GatewayAbi,
            topics: log.topics,
            data: log.data,
          });

          const destinationChain = String(event.args.destinationChain).toLowerCase();
          const chainName = this.utilGetChainNameFromAxelarChainId(destinationChain);

          if (chainName && axelarTokens[chainName]) {
            const tokenAddress = axelarTokens[gatewayConfig.chain][event.args.symbol];

            if (tokenAddress) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: gatewayConfig.chain,
                address: tokenAddress,
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });

                const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

                if (amountUsd) {
                  (protocolData.volumes.bridge as number) += amountUsd;

                  if (!(protocolData.volumeBridgePaths as any)[gatewayConfig.chain][chainName]) {
                    (protocolData.volumeBridgePaths as any)[gatewayConfig.chain][chainName] = 0;
                  }
                  (protocolData.volumeBridgePaths as any)[gatewayConfig.chain][chainName] += amountUsd;

                  if (!protocolData.breakdown[token.chain][token.address]) {
                    protocolData.breakdown[token.chain][token.address] = {
                      ...getInitialProtocolCoreMetrics(),
                      volumes: {
                        bridge: 0,
                      },
                    };
                  }
                  (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
                }
              }
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
