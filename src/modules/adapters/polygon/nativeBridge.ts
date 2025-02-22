import { ProtocolConfig, Token } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import AdapterDataHelper from '../helpers';
import { PolygonBridgeProtocolConfig } from '../../../configs/protocols/polygon';
import BridgeERC20Abi from '../../../configs/abi/polygon/L1PoSBridgeERC20.json';
import BridgeEtherAbi from '../../../configs/abi/polygon/L1PosBridgeEther.json';
import BridgePlasmaDepositAbi from '../../../configs/abi/polygon/L1PoSBridgePlasma.json';
import BridgePlasmaWithdrawAbi from '../../../configs/abi/polygon/L1PosBridgePlasmaWithdraw.json';
import { AddressZero } from '../../../configs/constants';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { decodeEventLog } from 'viem';
import ProtocolAdapter from '../protocol';

const Events = {
  // deposit ERC20 from ethereum to polygon
  LockedERC20: '0x9b217a401a5ddf7c4d474074aff9958a18d48690d77cc2151c4706aa7348b401',

  // withdraw ERC20 from polygon to ethereum
  ExitedERC20: '0xbb61bd1b26b3684c7c028ff1a8f6dabcac2fac8ac57b66fa6b1efb6edeab03c4',

  // deposit ETH from ethereum to polygon
  LockedEther: '0x3e799b2d61372379e767ef8f04d65089179b7a6f63f9be3065806456c7309f1b',

  // withdraw ETH from polygon to ethereum
  ExitedEther: '0x0fc0eed41f72d3da77d0f53b9594fc7073acd15ee9d7c536819a70a67c57ef3c',

  NewDepositBlock: '0x1dadc8d0683c6f9824e885935c1bec6f76816730dcec148dda8cf25a7b9f797b',
  Withdraw: '0xfeb2000dca3e617cd6f3a8bbb63014bb54a124aac6ccbf73ee7229b4cd01f120',
};

export default class PolygonNativeBridgeAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.polygon';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const polygonConfig = this.protocolConfig as PolygonBridgeProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
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

    for (const ownerAddress of [polygonConfig.bridgeERC20, polygonConfig.bridgePlasmaDeposit]) {
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

    // get native ETH locked
    const etherBalance = await this.services.blockchain.evm.getTokenBalance({
      chain: polygonConfig.chain,
      address: AddressZero,
      owner: polygonConfig.bridgeEther,
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

    const bridgeEthereLogs = await this.services.blockchain.evm.getContractLogs({
      chain: polygonConfig.chain,
      address: polygonConfig.bridgeEther,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const bridgeERC20Logs = await this.services.blockchain.evm.getContractLogs({
      chain: polygonConfig.chain,
      address: polygonConfig.bridgeERC20,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const bridgePlasmaDepositLogs = await this.services.blockchain.evm.getContractLogs({
      chain: polygonConfig.chain,
      address: polygonConfig.bridgePlasmaDeposit,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const bridgePlasmaWithdrawLogs = await this.services.blockchain.evm.getContractLogs({
      chain: polygonConfig.chain,
      address: polygonConfig.bridgePlasmaWithdraw,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    for (const log of bridgeEthereLogs
      .concat(bridgeERC20Logs)
      .concat(bridgePlasmaDepositLogs)
      .concat(bridgePlasmaWithdrawLogs)) {
      const signature = log.topics[0];
      if (compareAddress(log.address, polygonConfig.bridgeEther)) {
        if (signature === Events.LockedEther || signature === Events.ExitedEther) {
          const event: any = decodeEventLog({
            abi: BridgeEtherAbi,
            topics: log.topics,
            data: log.data,
          });
          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), 18) * etherPriceUsd;

          (protocolData.volumes.bridge as number) += amountUsd;
          (protocolData.breakdown[polygonConfig.chain][AddressZero].volumes.bridge as number) += amountUsd;

          if (signature === Events.LockedEther) {
            (protocolData.volumeBridgePaths as any)[polygonConfig.chain][polygonConfig.layer2Chain] += amountUsd;
          } else {
            (protocolData.volumeBridgePaths as any)[polygonConfig.layer2Chain][polygonConfig.chain] += amountUsd;
          }
        }
      } else if (compareAddress(log.address, polygonConfig.bridgeERC20)) {
        if (signature === Events.LockedERC20 || signature === Events.ExitedERC20) {
          const event: any = decodeEventLog({
            abi: BridgeERC20Abi,
            topics: log.topics,
            data: log.data,
          });

          const token = tokens.filter((item) => compareAddress(item.address, event.args.rootToken))[0];
          if (token) {
            const tokenPriceUsd = tokenAndPriceUsd[token.address] ? tokenAndPriceUsd[token.address] : 0;
            const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;

            (protocolData.volumes.bridge as number) += amountUsd;
            (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;

            if (signature === Events.LockedERC20) {
              (protocolData.volumeBridgePaths as any)[polygonConfig.chain][polygonConfig.layer2Chain] += amountUsd;
            } else {
              (protocolData.volumeBridgePaths as any)[polygonConfig.layer2Chain][polygonConfig.chain] += amountUsd;
            }

            break;
          }
        }
      } else if (
        compareAddress(log.address, polygonConfig.bridgePlasmaDeposit) ||
        compareAddress(log.address, polygonConfig.bridgePlasmaWithdraw)
      ) {
        if (signature === Events.NewDepositBlock || signature === Events.Withdraw) {
          const event: any = decodeEventLog({
            abi: signature === Events.NewDepositBlock ? BridgePlasmaDepositAbi : BridgePlasmaWithdrawAbi,
            topics: log.topics,
            data: log.data,
          });

          const token = tokens.filter((item) => compareAddress(item.address, event.args.token))[0];
          if (token) {
            const tokenPriceUsd = tokenAndPriceUsd[token.address] ? tokenAndPriceUsd[token.address] : 0;
            if (signature === Events.NewDepositBlock) {
              const amountUsd =
                formatBigNumberToNumber(event.args.amountOrNFTId.toString(), token.decimals) * tokenPriceUsd;
              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[polygonConfig.chain][polygonConfig.layer2Chain] += amountUsd;
            } else {
              const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;
              (protocolData.volumes.bridge as number) += amountUsd;
              (protocolData.breakdown[token.chain][token.address].volumes.bridge as number) += amountUsd;
              (protocolData.volumeBridgePaths as any)[polygonConfig.layer2Chain][polygonConfig.chain] += amountUsd;
            }

            break;
          }
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
