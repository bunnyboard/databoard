import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import ProtocolAdapter from '../protocol';
import AdapterDataHelper from '../helpers';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import { TokensBook } from '../../../configs/data';
import { LevelusdProtocolConfig } from '../../../configs/protocols/levelusd';
import ReserveLensAbi from '../../../configs/abi/levelusd/ReserveLens.json';
import MintingAbi from '../../../configs/abi/levelusd/LevelMinting.json';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import Erc4626Abi from '../../../configs/abi/ERC4626.json';
import { SolidityUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';

const USDT = TokensBook.ethereum['0xdac17f958d2ee523a2206206994597c13d831ec7'];
const USDC = TokensBook.ethereum['0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'];

const Events = {
  Mint: '0xf114ca9eb82947af39f957fa726280fd3d5d81c3d7635a4aeb5c302962856eba',
  Redeem: '0x18fd144d7dbcbaa6f00fd47a84adc7dc3cc64a326ffa2dc7691a25e3837dba03',
};

export default class LevelusdAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.levelusd';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    if (this.protocolConfig.birthday > options.timestamp) {
      return null;
    }

    const levelusdConfig = this.protocolConfig as LevelusdProtocolConfig;

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [levelusdConfig.chain]: {
          [normalizeAddress(levelusdConfig.lvlUSD)]: {
            ...getInitialProtocolCoreMetrics(),

            // total lvlUSD staked in slvlUSD
            totalSupplied: 0,

            // total lvlUSD supply
            totalBorrowed: 0,

            volumes: {
              borrow: 0,
              repay: 0,
            },
          },
          [USDT.address]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
          [USDC.address]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              deposit: 0,
              withdraw: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),

      // total lvlUSD staked in slvlUSD
      totalSupplied: 0,

      // total lvlUSD supply
      totalBorrowed: 0,

      volumes: {
        deposit: 0,
        withdraw: 0,
        borrow: 0,
        repay: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      levelusdConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      levelusdConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      levelusdConfig.chain,
      options.endTime,
    );

    const results: Array<any> = await this.services.blockchain.evm.multicall({
      chain: levelusdConfig.chain,
      blockNumber: blockNumber,
      calls: [
        {
          abi: ReserveLensAbi,
          target: levelusdConfig.lens,
          method: 'getReserveValue',
          params: [USDC.address],
        },
        {
          abi: ReserveLensAbi,
          target: levelusdConfig.lens,
          method: 'getReserveValue',
          params: [USDT.address],
        },

        {
          abi: Erc20Abi,
          target: levelusdConfig.lvlUSD,
          method: 'totalSupply',
          params: [],
        },

        {
          abi: Erc4626Abi,
          target: levelusdConfig.slvlUSD,
          method: 'totalAssets',
          params: [],
        },
      ],
    });

    const before_convertToAssets = await this.services.blockchain.evm.readContract({
      chain: levelusdConfig.chain,
      abi: Erc4626Abi,
      target: levelusdConfig.slvlUSD,
      method: 'convertToAssets',
      params: [SolidityUnits.OneWad],
      blockNumber: beginBlock,
    });
    const after_convertToAssets = await this.services.blockchain.evm.readContract({
      chain: levelusdConfig.chain,
      abi: Erc4626Abi,
      target: levelusdConfig.slvlUSD,
      method: 'convertToAssets',
      params: [SolidityUnits.OneWad],
      blockNumber: endBlock,
    });

    const priceShareBefore = formatBigNumberToNumber(
      before_convertToAssets ? before_convertToAssets.toString() : SolidityUnits.OneWad,
      18,
    );
    const priceShareAfter = formatBigNumberToNumber(
      after_convertToAssets ? after_convertToAssets.toString() : SolidityUnits.OneWad,
      18,
    );
    const priceShareDiff = priceShareAfter > priceShareBefore ? priceShareAfter - priceShareBefore : 0;

    const usdcDepositedUsd = formatBigNumberToNumber(results[0] ? results[0].toString() : '0', 18);
    const usdtDepositedUsd = formatBigNumberToNumber(results[1] ? results[1].toString() : '0', 18);
    const totalSupply = formatBigNumberToNumber(results[2] ? results[2].toString() : '0', 18);
    const totalSupplyStaked = formatBigNumberToNumber(results[3] ? results[3].toString() : '0', 18);
    const totalFees = totalSupplyStaked * priceShareDiff;

    protocolData.totalAssetDeposited += usdcDepositedUsd + usdtDepositedUsd;
    protocolData.totalValueLocked += usdcDepositedUsd + usdtDepositedUsd;
    protocolData.totalFees += totalFees;
    protocolData.supplySideRevenue += totalFees;
    (protocolData.totalSupplied as number) += totalSupplyStaked;
    (protocolData.totalBorrowed as number) += totalSupply;
    protocolData.breakdown[levelusdConfig.chain][normalizeAddress(levelusdConfig.lvlUSD)].totalFees += totalFees;
    protocolData.breakdown[levelusdConfig.chain][normalizeAddress(levelusdConfig.lvlUSD)].supplySideRevenue +=
      totalFees;
    (protocolData.breakdown[levelusdConfig.chain][normalizeAddress(levelusdConfig.lvlUSD)].totalSupplied as number) +=
      totalSupplyStaked;
    (protocolData.breakdown[levelusdConfig.chain][normalizeAddress(levelusdConfig.lvlUSD)].totalBorrowed as number) +=
      totalSupply;
    protocolData.breakdown[USDC.chain][USDC.address].totalAssetDeposited += usdcDepositedUsd;
    protocolData.breakdown[USDC.chain][USDC.address].totalValueLocked += usdcDepositedUsd;
    protocolData.breakdown[USDT.chain][USDT.address].totalAssetDeposited += usdtDepositedUsd;
    protocolData.breakdown[USDT.chain][USDT.address].totalValueLocked += usdtDepositedUsd;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: levelusdConfig.chain,
      address: levelusdConfig.minting,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });
    const events: Array<any> = logs
      .filter((log) => Object.values(Events).includes(log.topics[0]))
      .map((log) =>
        decodeEventLog({
          abi: MintingAbi,
          topics: log.topics,
          data: log.data,
        }),
      );
    for (const event of events) {
      let token = null;
      if (compareAddress(event.args.collateral_asset, USDC.address)) {
        token = USDC;
      } else if (compareAddress(event.args.collateral_asset, USDT.address)) {
        token = USDT;
      }

      if (token) {
        const collateralAmount = formatBigNumberToNumber(event.args.collateral_amount.toString(), token.decimals);
        const lvlUSDAmount = formatBigNumberToNumber(event.args.lvlusd_amount.toString(), 18);

        if (event.eventName === 'Mint') {
          (protocolData.volumes.borrow as number) += lvlUSDAmount;
          (protocolData.volumes.deposit as number) += collateralAmount;
          (protocolData.breakdown[levelusdConfig.chain][normalizeAddress(levelusdConfig.lvlUSD)].volumes
            .borrow as number) += lvlUSDAmount;
          (protocolData.breakdown[token.chain][token.address].volumes.deposit as number) += collateralAmount;
        } else {
          (protocolData.volumes.repay as number) += lvlUSDAmount;
          (protocolData.volumes.withdraw as number) += collateralAmount;
          (protocolData.breakdown[levelusdConfig.chain][normalizeAddress(levelusdConfig.lvlUSD)].volumes
            .repay as number) += lvlUSDAmount;
          (protocolData.breakdown[token.chain][token.address].volumes.withdraw as number) += collateralAmount;
        }
      }
    }

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData);
  }
}
