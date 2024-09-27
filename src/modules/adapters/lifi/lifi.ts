import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { LifiProtocolConfig } from '../../../configs/protocols/lifi';
import { LifiDataExtended, LifiProtocolData } from '../../../types/domains/ecosystems/lifi';
import LifiInterfaceAbi from '../../../configs/abi/lifi/ILifi.json';
import FeesCollectedAbi from '../../../configs/abi/lifi/FeeCollector.json';
import { decodeEventLog } from 'viem';
import { ChainNames, ProtocolNames } from '../../../configs/names';
import { formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import envConfig from '../../../configs/envConfig';

export const LifiDiamondEvents = {
  LiFiTransferStarted: '0xcba69f43792f9f399347222505213b55af8e0b0b54b893085c2e27ecbe1644f1',
  FeesCollected: '0x28a87b6059180e46de5fb9ab35eb043e8fe00ab45afcc7789e3934ecbbcde3ea',
};

export const LifiBridgeKeys: any = {
  stargate: ProtocolNames.stargate,
  stargateV2: ProtocolNames.stargate,
  stargateV2Bus: ProtocolNames.stargate,
  across: ProtocolNames.across,
  squid: ProtocolNames.squid,
  thorswap: ProtocolNames.thorswap,
  symbiosis: ProtocolNames.symbiosis,
  mayan: ProtocolNames.mayan,
  allbridge: ProtocolNames.allbridge,
  hop: ProtocolNames.hop,
  amarok: ProtocolNames.amarok,
  cbridge: ProtocolNames.cbridge,
  optimism: ProtocolNames.optimismNativeBridge,
  polygon: ProtocolNames.polygonNativeBridge,
  arbitrum: ProtocolNames.arbitrumNativeBridge,
  omni: ProtocolNames.omni,
  gnosis: ProtocolNames.gnosisNativeBridge,
  hyphen: ProtocolNames.hyphen,
};

export const LifiChainIds: any = {
  '20000000000001': ChainNames.bitcoin,
  '1151111081099710': ChainNames.solana,
  '30': ChainNames.rootstock,
  '1625': ChainNames.gravity,
  '13371': ChainNames.immutablezkevm,
  '122': ChainNames.fuse,
  '288': ChainNames.boba,
};

export default class LifiAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.lifi 🦎';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<LifiProtocolData | null> {
    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {},
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridgeIn: 0,
        bridgeOut: 0,
      },
    };

    const lifiExtendedData: LifiDataExtended = {
      volumeBridgeChainRoutes: {},
      volumeBridges: {},
      volumeIntegrators: {},
      feeRecipients: {},
    };

    const bungeeConfig = this.protocolConfig as LifiProtocolConfig;
    for (const diamondConfig of bungeeConfig.diamonds) {
      if (diamondConfig.birthday > options.timestamp) {
        // diamond was not deployed yet
        continue;
      }

      if (!protocolData.breakdown[diamondConfig.chain]) {
        protocolData.breakdown[diamondConfig.chain] = {};
      }
      if (!lifiExtendedData.volumeBridgeChainRoutes[diamondConfig.chain]) {
        lifiExtendedData.volumeBridgeChainRoutes[diamondConfig.chain] = {};
      }

      const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        diamondConfig.chain,
        options.beginTime,
      );
      const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
        diamondConfig.chain,
        options.endTime,
      );

      const logs = await this.services.blockchain.evm.getContractLogs({
        chain: diamondConfig.chain,
        address: diamondConfig.diamond,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });

      for (const log of logs) {
        if (log.topics[0] === LifiDiamondEvents.LiFiTransferStarted) {
          const event: any = decodeEventLog({
            abi: LifiInterfaceAbi,
            topics: log.topics,
            data: log.data,
          });

          const bridgeName = LifiBridgeKeys[event.args.bridgeData.bridge]
            ? LifiBridgeKeys[event.args.bridgeData.bridge]
            : event.args.bridgeData.bridge;
          const integrator = event.args.bridgeData.integrator;
          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: diamondConfig.chain,
            address: event.args.bridgeData.sendingAssetId,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });
            const amountUsd =
              formatBigNumberToNumber(event.args.bridgeData.minAmount.toString(), token.decimals) * tokenPriceUsd;

            const chainId = Number(event.args.bridgeData.destinationChainId);
            let toChainName = LifiChainIds[chainId] ? LifiChainIds[chainId] : `unknown:${chainId}`;
            for (const blockchain of Object.values(envConfig.blockchains)) {
              if (blockchain.chainId === chainId) {
                toChainName = blockchain.name;
              }
            }

            (protocolData.volumes.bridgeOut as number) += amountUsd;

            if (!protocolData.breakdown[diamondConfig.chain][token.address]) {
              protocolData.breakdown[diamondConfig.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridgeIn: 0,
                  bridgeOut: 0,
                },
              };
            }
            (protocolData.breakdown[diamondConfig.chain][token.address].volumes.bridgeOut as number) += amountUsd;

            if (!lifiExtendedData.volumeBridgeChainRoutes[diamondConfig.chain][toChainName]) {
              lifiExtendedData.volumeBridgeChainRoutes[diamondConfig.chain][toChainName] = 0;
            }
            lifiExtendedData.volumeBridgeChainRoutes[diamondConfig.chain][toChainName] += amountUsd;

            if (!lifiExtendedData.volumeBridges[bridgeName]) {
              lifiExtendedData.volumeBridges[bridgeName] = 0;
            }
            lifiExtendedData.volumeBridges[bridgeName] += amountUsd;

            if (!lifiExtendedData.volumeIntegrators[integrator]) {
              lifiExtendedData.volumeIntegrators[integrator] = 0;
            }
            lifiExtendedData.volumeIntegrators[integrator] += amountUsd;
          }
        }
      }

      const feeLogs = await this.services.blockchain.evm.getContractLogs({
        chain: diamondConfig.chain,
        address: diamondConfig.feeCollector,
        fromBlock: beginBlock,
        toBlock: endBlock,
      });
      for (const log of feeLogs) {
        if (log.topics[0] === LifiDiamondEvents.FeesCollected) {
          const event: any = decodeEventLog({
            abi: FeesCollectedAbi,
            topics: log.topics,
            data: log.data,
          });

          const token = await this.services.blockchain.evm.getTokenInfo({
            chain: diamondConfig.chain,
            address: event.args._token,
          });
          if (token) {
            const tokenPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
              chain: token.chain,
              address: token.address,
              timestamp: options.timestamp,
            });

            const integratorFee =
              formatBigNumberToNumber(event.args._integratorFee.toString(), token.decimals) * tokenPriceUsd;
            const lifiFee = formatBigNumberToNumber(event.args._lifiFee.toString(), token.decimals) * tokenPriceUsd;

            protocolData.totalFees += integratorFee + lifiFee;
            protocolData.protocolRevenue += integratorFee + lifiFee;
            if (!protocolData.breakdown[diamondConfig.chain][token.address]) {
              protocolData.breakdown[diamondConfig.chain][token.address] = {
                ...getInitialProtocolCoreMetrics(),
                volumes: {
                  bridgeIn: 0,
                  bridgeOut: 0,
                },
              };
            }
            protocolData.breakdown[diamondConfig.chain][token.address].totalFees += integratorFee + lifiFee;

            const integrator = normalizeAddress(event.args._integrator);
            if (!lifiExtendedData.feeRecipients[integrator]) {
              lifiExtendedData.feeRecipients[integrator] = 0;
            }
            lifiExtendedData.feeRecipients[integrator] += integratorFee;
          }
        }
      }
    }
    return {
      ...AdapterDataHelper.fillupAndFormatProtocolData(protocolData),
      ...lifiExtendedData,
    };
  }
}
