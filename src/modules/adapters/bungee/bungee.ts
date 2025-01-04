import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import { decodeEventLog } from 'viem';
import AdapterDataHelper from '../helpers';
import { ProtocolNames } from '../../../configs/names';
import { BungeeProtocolConfig } from '../../../configs/protocols/bungee';
import BungeeSocketGatewayAbi from '../../../configs/abi/bungee/SocketGateway.json';
import envConfig from '../../../configs/envConfig';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { StargateChainIds } from '../../../configs/protocols/stargate';
import { BungeeDataExtended, BungeeProtocolData } from '../../../types/domains/ecosystems/bungee';
import logger from '../../../lib/logger';

export const BungeeSocketEvents = {
  SocketBridge: '0x74594da9e31ee4068e17809037db37db496702bf7d8d63afe6f97949277d1609',
  SocketFeesDeducted: '0x6ea2964966a13d361befaca87edb26595ca75a30f3b77887d67d5a7d0e4805c0',
  SocketSwapTokens: '0xb346a959ba6c0f1c7ba5426b10fd84fe4064e392a0dfcf6609e9640a0dd260d3',
};

export const BungeeKnownBridgeNames: { [key: string]: string } = {
  // third parties
  '0x837ed841e30438f54fb6b0097c30a5c4f64b47545c3df655bcd6e44bb8991e37': ProtocolNames.hop,
  '0xc77ff9af68efffed7454e77fb54f8ff0ce78a7d153d8b300824b82b55aad654f': ProtocolNames.cbridge,
  '0xd36025cd509d584ab5657a1932f5097aa97e23f66deca532635f79998b4f0bce': ProtocolNames.hyphen,
  '0x709f58818bedd58450336213e1f2f6ff7405a2b1e594f64270a17b7e2249419c': ProtocolNames.across,
  '0x6debe1c49ff1a7d2012a7d55f3935c306a5eb673882f4edde41dbcaa58467fd1': ProtocolNames.stargate,
  '0xfb124487a9ad253606517a08816473db34d3f4319cda7e548f718d1bd7aec4f3': ProtocolNames.anyswap,
  '0x520b7e0fa71292fc3580658e9fcf097987149f9bab7aa0a213933370b9f02218': ProtocolNames.rainbow,
  '0xf8455f3379434a3ef6559858314c8f61d36412da9937cd3f1de59562deb078e6': ProtocolNames.circlecctp,
  '0x47443678ca5bb8034d5e764a6f20d6e5cfcbb4a3912e12f8bae660cd0face530': ProtocolNames.synapse,
  '0x6e6ef0d56d65c2193ef8da79bb1e0bac59c8ac17fdd0b3cc6122f82f7d42cc9d': ProtocolNames.connext,
  '0xea698b477c99ea804835b684c4c3009f282df52a6bf660d4006c72a3b60fd670': ProtocolNames.symbiosis,
  '0x0d2fea28d1562e741fbdf63c210c9b730d85f6504e95650096acf21f93afe549': ProtocolNames.bungeerefuel,
  '0x2ab0b866d21ac9b7200cb612980a6bede5fc41279d81375c7fe2efd9fa4d9073': ProtocolNames.oneinch,
  '0x861b086cbd3ddee2b0b12c8ce3b43e1c111ac87dcabda086e02f18095da12f20': ProtocolNames.zerox,

  // native bridges
  '0xf1c09a354cd800a13f6f260a3a96a0e33db28b0b53528072473336977bba34f4': ProtocolNames.polygonNativeBridge,
  '0x2e27c951e4ed3f2f1e7771dd262432f093b6ddeabfca0688443958d00b9bcf56': ProtocolNames.optimismNativeBridge,
  '0x2e760812e6696b561a918e71ad2845639638959ed846b188488dd0d8c0b953ef': ProtocolNames.zksyncNativeBridge,
  '0x7c4e564b66172ccd4006719b3b9e6d8e4eabbc54c5cf017495bf6a3b3f4dd06f': ProtocolNames.gnosisNativeBridge,
  '0x7da5d3610317b9820c1f9de12c4c257f3f0e2ea5b63c99f27ed8e0592ac8fb4c': ProtocolNames.arbitrumNativeBridge,
  '0x86c029f16460117b4488dbcebd1ea3d4f22aee8859770297bc010a8caaa1b116': ProtocolNames.baseNativeBridge,
  '0xcc231b7032e768dd0a97e8b21d355ca609fe31ebcb2a827b8759fc5dd1d9c95f': ProtocolNames.scrollNativeBridge,
  '0xddc44bae4cec4168e76c8f60940ee0abbae677cacb55590a890235614317ef6b': ProtocolNames.zoraNativeBridge,
  '0xc3bc0f52caacc5a87db3ce955e12a8538950098a0012cbacd0e6ff87c0606d33': ProtocolNames.mantleNativeBridge,
  '0x52d0275a020a4c7ae62ec6f7d7fa9498ef80508501ba5033139ff2cf4d0f631a': ProtocolNames.modeNativeBridge,
  '0x3b654adad78ea2ded387f2c5bed3f31dcb9c3e6ab79a28e9dab60dbacbf7c72a': ProtocolNames.mantleNativeBridge,
  '0x8381ed10ba5922afc2e18270f9785c89117d41af9b60c4950b6f1b84e197e702': ProtocolNames.inkNativeBridge,
};

export default class BungeeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.bungee 🐝';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<BungeeProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
        trade: 0,
      },
      volumeBridgePaths: {},
    };

    const bungeeExtendedData: BungeeDataExtended = {
      volumeBridges: {},
      feeRecipients: {},
    };

    const bungeeConfig = this.protocolConfig as BungeeProtocolConfig;
    for (const gatewayConfig of bungeeConfig.socketGateways) {
      if (gatewayConfig.birthday > options.timestamp) {
        // market was not deployed yet
        continue;
      }

      if (!protocolData.breakdown[gatewayConfig.chain]) {
        protocolData.breakdown[gatewayConfig.chain] = {};
      }
      if (!(protocolData.volumeBridgePaths as any)[gatewayConfig.chain]) {
        (protocolData.volumeBridgePaths as any)[gatewayConfig.chain] = {};
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        gatewayConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        gatewayConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: gatewayConfig.chain,
        address: gatewayConfig.gateway,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of logs) {
        if (Object.values(BungeeSocketEvents).includes(log.topics[0])) {
          const event: any = decodeEventLog({
            abi: BungeeSocketGatewayAbi,
            topics: log.topics,
            data: log.data,
          });

          if (log.topics[0] === BungeeSocketEvents.SocketBridge) {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: gatewayConfig.chain,
              address: event.args.token,
            });
            if (token) {
              // bungee identity bridge name by unique bytes32 hash
              // to know which bytes32 mapped to which bridge
              // check the Bungee bridge implementation contract
              let bridgeName = BungeeKnownBridgeNames[event.args.bridgeName];
              if (!bridgeName) {
                bridgeName = event.args.bridgeName;
                logger.warn('failed to get bridge name from bridge txn', {
                  service: this.name,
                  protocol: this.protocolConfig.protocol,
                  chain: gatewayConfig.chain,
                  txn: log.transactionHash,
                  logIndex: log.logIndex,
                });
              }

              const toChainId = Number(event.args.toChainId);
              let toChainName: string | null = null;
              if (bridgeName === 'stargate' && StargateChainIds[toChainId]) {
                // https://stargateprotocol.gitbook.io/stargate/developers/chain-ids
                toChainName = StargateChainIds[toChainId];
              } else {
                for (const blockchain of Object.values(envConfig.blockchains)) {
                  if (blockchain.chainId === toChainId) {
                    toChainName = blockchain.name;
                  }
                }
              }

              if (toChainName === null) {
                logger.error('failed to get chain name from bridge txn', {
                  service: this.name,
                  protocol: this.protocolConfig.protocol,
                  chain: gatewayConfig.chain,
                  txn: log.transactionHash,
                  logIndex: log.logIndex,
                });
                continue;
              }

              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: gatewayConfig.chain,
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
                    trade: 0,
                  },
                };
              }
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

              if (!bungeeExtendedData.volumeBridges[bridgeName]) {
                bungeeExtendedData.volumeBridges[bridgeName] = 0;
              }
              bungeeExtendedData.volumeBridges[bridgeName] += amountUsd;

              if (!(protocolData.volumeBridgePaths as any)[gatewayConfig.chain][toChainName]) {
                (protocolData.volumeBridgePaths as any)[gatewayConfig.chain][toChainName] = 0;
              }
              (protocolData.volumeBridgePaths as any)[gatewayConfig.chain][toChainName] += amountUsd;
            }
          } else if (log.topics[0] === BungeeSocketEvents.SocketFeesDeducted) {
            const token = await this.services.blockchain.evm.getTokenInfo({
              chain: gatewayConfig.chain,
              address: event.args.feesToken,
            });
            if (token) {
              const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: gatewayConfig.chain,
                address: token.address,
                timestamp: options.timestamp,
              });
              const amountUsd = formatBigNumberToNumber(event.args.fees.toString(), token.decimals) * tokenPriceUsd;

              protocolData.totalFees += amountUsd;
              protocolData.protocolRevenue += amountUsd;

              if (!protocolData.breakdown[token.chain][token.address]) {
                protocolData.breakdown[token.chain][token.address] = {
                  ...getInitialProtocolCoreMetrics(),
                  volumes: {
                    bridge: 0,
                    trade: 0,
                  },
                };
              }
              protocolData.breakdown[token.chain][token.address].totalFees += amountUsd;
              protocolData.breakdown[token.chain][token.address].protocolRevenue += amountUsd;

              const feeTaker = normalizeAddress(event.args.feesTaker);
              if (!bungeeExtendedData.feeRecipients[feeTaker]) {
                bungeeExtendedData.feeRecipients[feeTaker] = 0;
              }
              bungeeExtendedData.feeRecipients[feeTaker] += amountUsd;
            }
          } else if (log.topics[0] === BungeeSocketEvents.SocketSwapTokens) {
            const fromToken = await this.services.blockchain.evm.getTokenInfo({
              chain: gatewayConfig.chain,
              address: event.args.fromToken,
            });
            const toToken = await this.services.blockchain.evm.getTokenInfo({
              chain: gatewayConfig.chain,
              address: event.args.toToken,
            });

            if (fromToken && toToken) {
              let swapAmountUsd = 0;

              const fromTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                chain: fromToken.chain,
                address: fromToken.address,
                timestamp: options.timestamp,
                disableWarning: true,
              });
              if (fromTokenPriceUsd > 0) {
                swapAmountUsd =
                  formatBigNumberToNumber(event.args.sellAmount.toString(), fromToken.decimals) * fromTokenPriceUsd;
              } else {
                const toTokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
                  chain: toToken.chain,
                  address: toToken.address,
                  timestamp: options.timestamp,
                });
                swapAmountUsd =
                  formatBigNumberToNumber(event.args.buyAmount.toString(), toToken.decimals) * toTokenPriceUsd;

                if (toTokenPriceUsd <= 0) {
                  logger.warn('failed to get token prices for trade', {
                    service: this.name,
                    protocol: this.protocolConfig.protocol,
                    chain: gatewayConfig.chain,
                    token: `${fromToken.symbol}-${toToken.symbol}`,
                    txn: log.transactionHash,
                    logIndex: log.logIndex,
                  });
                }
              }

              if (swapAmountUsd > 0) {
                (protocolData.volumes.trade as number) += swapAmountUsd;

                if (!protocolData.breakdown[fromToken.chain][fromToken.address]) {
                  protocolData.breakdown[fromToken.chain][fromToken.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                      trade: 0,
                    },
                  };
                }
                if (!protocolData.breakdown[toToken.chain][toToken.address]) {
                  protocolData.breakdown[toToken.chain][toToken.address] = {
                    ...getInitialProtocolCoreMetrics(),
                    volumes: {
                      bridge: 0,
                      trade: 0,
                    },
                  };
                }
                (protocolData.breakdown[fromToken.chain][fromToken.address].volumes.trade as number) += swapAmountUsd;
                (protocolData.breakdown[toToken.chain][toToken.address].volumes.trade as number) += swapAmountUsd;
              }
            }
          }
        }
      }
    }

    return {
      ...AdapterDataHelper.fillupAndFormatProtocolData(protocolData),
      ...bungeeExtendedData,
    };
  }
}
