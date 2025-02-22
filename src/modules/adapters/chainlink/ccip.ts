import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { decodeEventLog } from 'viem';
import { ChainlinkCcipProtocolConfig } from '../../../configs/protocols/chainlink';
import EVM2EVMOnRampAbi from '../../../configs/abi/chainlink/EVM2EVMOnRamp.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import ProtocolAdapter from '../protocol';

// on Outbound lanes contracts
const CCIPSendRequested = '0xd0c3c799bf9e2639de44391e7f524d229b2b55f5b1ea94b2bf7da42f7243dddd';

export default class ChainlinkCcipAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.chainlink';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
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

    const ccipConfig = this.protocolConfig as ChainlinkCcipProtocolConfig;
    for (const bridgeConfig of ccipConfig.configs) {
      if (bridgeConfig.birthday > options.timestamp) {
        continue;
      }

      if (!protocolData.breakdown[bridgeConfig.chain]) {
        protocolData.breakdown[bridgeConfig.chain] = {};
      }

      if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[bridgeConfig.chain] = {};
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bridgeConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        bridgeConfig.chain,
        options.endTime,
      );

      for (const [destChain, outboundContract] of Object.entries(bridgeConfig.outbound)) {
        const logs = await this.services.blockchain.evm.getContractLogs({
          chain: bridgeConfig.chain,
          address: outboundContract,
          fromBlock: beginBlock,
          toBlock: endBlock,
        });

        for (const log of logs) {
          if (log.topics[0] === CCIPSendRequested) {
            const event: any = decodeEventLog({
              abi: EVM2EVMOnRampAbi,
              topics: log.topics,
              data: log.data,
            });

            let feeAmountUsd = 0;
            const feeToken = await this.services.blockchain.evm.getTokenInfo({
              chain: bridgeConfig.chain,
              address: event.args.message.feeToken,
            });
            if (feeToken) {
              const feeTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: feeToken.chain,
                address: feeToken.address,
                timestamp: options.timestamp,
              });
              feeAmountUsd =
                formatBigNumberToNumber(event.args.message.feeTokenAmount.toString(), feeToken.decimals) *
                feeTokenPriceUsd;

              if (!protocolData.breakdown[feeToken.chain][feeToken.address]) {
                protocolData.breakdown[feeToken.chain][feeToken.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    bridge: 0,
                  },
                };
              }
              protocolData.breakdown[feeToken.chain][feeToken.address].totalFees += feeAmountUsd;
              protocolData.breakdown[feeToken.chain][feeToken.address].protocolRevenue += feeAmountUsd;
            }

            protocolData.totalFees += feeAmountUsd;
            protocolData.protocolRevenue += feeAmountUsd;

            let bridgeAmountUsd = 0;
            for (const tokenData of event.args.message.tokenAmounts) {
              const token = await this.services.blockchain.evm.getTokenInfo({
                chain: bridgeConfig.chain,
                address: tokenData.token,
              });
              if (token) {
                const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: token.chain,
                  address: token.address,
                  timestamp: options.timestamp,
                });
                bridgeAmountUsd += formatBigNumberToNumber(tokenData.amount.toString(), token.decimals) * tokenPriceUsd;

                if (!protocolData.breakdown[token.chain][token.address]) {
                  protocolData.breakdown[token.chain][token.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                    },
                  };
                }
                (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += bridgeAmountUsd;
              }
            }

            (protocolData.volumes.bridge as number) += bridgeAmountUsd;

            if (bridgeAmountUsd > 0) {
              if (!(protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChain]) {
                (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChain] = 0;
              }
              (protocolData.volumeBridgePaths as any)[bridgeConfig.chain][destChain] += bridgeAmountUsd;
            }
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
