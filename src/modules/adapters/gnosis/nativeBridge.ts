import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { GnosisBridgeProtocolConfig } from '../../../configs/protocols/gnosis';
import xdaiBridgeAbi from '../../../configs/abi/gnosis/XDaiForeignBridge.json';
import omniBridgeAbi from '../../../configs/abi/gnosis/ForeignOmnibridge.json';
import { decodeEventLog } from 'viem';
import ProtocolAdapter from '../protocol';

const Events = {
  // DAI deposit from ethereum -> gnosis
  UserRequestForAffirmation: '0x1d491a427d1f8cc0d447496f300fac39f7306122481d8e663451eb268274146b',

  // withdraw DAI from gnosis -> ethereum
  RelayedMessage: '0x4ab7d581336d92edbea22636a613e8e76c99ac7f91137c1523db38dbfb3bf329',

  // deposit ERC20 from ethereum -> gnosis
  TokensBridgingInitiated: '0x59a9a8027b9c87b961e254899821c9a276b5efc35d1f7409ea4f291470f1629a',

  // withdraw ERC20 from gnosis -> ethereum
  TokensBridged: '0x9afd47907e25028cdaca89d193518c302bbb128617d5a992c5abd45815526593',
};

export default class GnosisNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.gnosis';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const gnosisConfig = this.protocolConfig as GnosisBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [gnosisConfig.chain]: {
          [normalizeAddress(gnosisConfig.daiToken)]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
          [normalizeAddress(gnosisConfig.sdaiToken)]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              bridge: 0,
            },
          },
        },
        [gnosisConfig.layer2Chain]: {},
      },
      ...getInitialProtocolCoreMetrics(),
      volumes: {
        bridge: 0,
      },
      volumeBridgePaths: {
        [gnosisConfig.chain]: {
          [gnosisConfig.layer2Chain]: 0,
        },
        [gnosisConfig.layer2Chain]: {
          [gnosisConfig.chain]: 0,
        },
      },
    };

    if (gnosisConfig.birthday > options.timestamp) {
      return null;
    }

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      gnosisConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      gnosisConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      gnosisConfig.chain,
      options.endTime,
    );

    const daiPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: gnosisConfig.chain,
      address: gnosisConfig.daiToken,
      timestamp: options.timestamp,
    });
    const sdaiPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: gnosisConfig.chain,
      address: gnosisConfig.sdaiToken,
      timestamp: options.timestamp,
    });

    const [daiBalance, sdaiBalance] = await Promise.all([
      this.services.blockchain.evm.getTokenBalance({
        chain: gnosisConfig.chain,
        address: gnosisConfig.daiToken,
        owner: gnosisConfig.xDaiBridge,
        blockNumber: blockNumber,
      }),
      this.services.blockchain.evm.getTokenBalance({
        chain: gnosisConfig.chain,
        address: gnosisConfig.sdaiToken,
        owner: gnosisConfig.xDaiBridge,
        blockNumber: blockNumber,
      }),
    ]);

    const daiBalanceUsd = formatBigNumberToNumber(daiBalance.toString(), 18) * daiPriceUsd;
    const sdaiBalanceUsd = formatBigNumberToNumber(sdaiBalance.toString(), 18) * sdaiPriceUsd;

    protocolData.totalAssetDeposited += daiBalanceUsd + sdaiBalanceUsd;
    protocolData.totalValueLocked += daiBalanceUsd + sdaiBalanceUsd;
    protocolData.breakdown[gnosisConfig.chain][normalizeAddress(gnosisConfig.daiToken)].totalAssetDeposited +=
      daiBalanceUsd;
    protocolData.breakdown[gnosisConfig.chain][normalizeAddress(gnosisConfig.sdaiToken)].totalValueLocked +=
      sdaiBalanceUsd;

    const tokens: Array<Token> = [];
    for (const tokenAddress of gnosisConfig.supportedTokens) {
      const token = await this.services.blockchain.evm.getTokenInfo({
        chain: gnosisConfig.chain,
        address: tokenAddress,
      });
      if (token) {
        tokens.push(token);
      }
    }

    const getBalanceResult = await this.getAddressBalanceUsd({
      chain: gnosisConfig.chain,
      ownerAddress: gnosisConfig.omniBridge,
      tokens: tokens,
      timestamp: options.timestamp,
      blockNumber: blockNumber,
    });

    protocolData.totalAssetDeposited += getBalanceResult.totalBalanceUsd;
    protocolData.totalValueLocked += getBalanceResult.totalBalanceUsd;

    for (const [tokenAddress, tokenBalance] of Object.entries(getBalanceResult.tokenBalanceUsds)) {
      if (!protocolData.breakdown[gnosisConfig.chain][tokenAddress]) {
        protocolData.breakdown[gnosisConfig.chain][tokenAddress] = {
          ...getInitialProtocolCoreMetrics(),
          volumes: {
            bridge: 0,
          },
        };
      }
      protocolData.breakdown[gnosisConfig.chain][tokenAddress].totalAssetDeposited += tokenBalance.balanceUsd;
      protocolData.breakdown[gnosisConfig.chain][tokenAddress].totalValueLocked += tokenBalance.balanceUsd;
    }

    const xDaiBridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: gnosisConfig.chain,
      address: gnosisConfig.xDaiBridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const omniBridgeLogs = await this.services.blockchain.evm.getContractLogs({
      chain: gnosisConfig.chain,
      address: gnosisConfig.omniBridge,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    for (const log of xDaiBridgeLogs) {
      if (log.topics[0] === Events.UserRequestForAffirmation || log.topics[0] === Events.RelayedMessage) {
        const event: any = decodeEventLog({
          abi: xdaiBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        // DAI token
        const amountUsd = formatBigNumberToNumber(event.args.value.toString(), 18) * daiPriceUsd;

        (protocolData.volumes.bridge as number) += amountUsd;
        (protocolData.breakdown[gnosisConfig.chain][normalizeAddress(gnosisConfig.daiToken)].volumes
          .bridge as number) += amountUsd;

        if (log.topics[0] === Events.UserRequestForAffirmation) {
          (protocolData.volumeBridgePaths as any)[gnosisConfig.chain][gnosisConfig.layer2Chain] += amountUsd;
        } else {
          (protocolData.volumeBridgePaths as any)[gnosisConfig.layer2Chain][gnosisConfig.chain] += amountUsd;
        }
      }
    }

    for (const log of omniBridgeLogs) {
      if (log.topics[0] === Events.TokensBridgingInitiated || log.topics[0] === Events.TokensBridged) {
        const event: any = decodeEventLog({
          abi: omniBridgeAbi,
          topics: log.topics,
          data: log.data,
        });

        const token = tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
        if (token) {
          const tokenPriceUsd = getBalanceResult.tokenBalanceUsds[token.address]
            ? getBalanceResult.tokenBalanceUsds[token.address].priceUsd
            : 0;
          const amountUsd = formatBigNumberToNumber(event.args.value.toString(), token.decimals) * tokenPriceUsd;

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

          if (log.topics[0] === Events.TokensBridgingInitiated) {
            (protocolData.volumeBridgePaths as any)[gnosisConfig.chain][gnosisConfig.layer2Chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[gnosisConfig.layer2Chain][gnosisConfig.chain] += amountUsd;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
