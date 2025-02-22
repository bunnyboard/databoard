import { ProtocolConfig } from '../../../types/base';
import { getInitialProtocolCoreMetrics, ProtocolData } from '../../../types/domains/protocol';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import { compareAddress, formatBigNumberToNumber, normalizeAddress } from '../../../lib/utils';
import AdapterDataHelper from '../helpers';
import Erc20Abi from '../../../configs/abi/ERC20.json';
import { AddressZero, Erc20TransferEventSignature, MockBitcoinAddress } from '../../../configs/constants';
import { decodeEventLog } from 'viem';
import { ThresholdBtcProtocolConfig } from '../../../configs/protocols/threshold';
import { ChainNames } from '../../../configs/names';
import ProtocolAdapter from '../protocol';

export default class ThresholdbtcAdapter extends ProtocolAdapter {
  public readonly name: string = 'adapter.thresholdbtc';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<ProtocolData | null> {
    const tbtcConfig = this.protocolConfig as ThresholdBtcProtocolConfig;

    if (tbtcConfig.birthday > options.timestamp) {
      return null;
    }

    const tokenTBTC = normalizeAddress(tbtcConfig.tbtc);

    const protocolData: ProtocolData = {
      protocol: this.protocolConfig.protocol,
      birthday: this.protocolConfig.birthday,
      timestamp: options.timestamp,
      breakdown: {
        [tbtcConfig.chain]: {
          [tokenTBTC]: {
            ...getInitialProtocolCoreMetrics(),
            totalBorrowed: 0,
            volumes: {
              // mint/redeem tBTC
              borrow: 0,
              repay: 0,
            },
          },
        },
        [ChainNames.bitcoin]: {
          [MockBitcoinAddress]: {
            ...getInitialProtocolCoreMetrics(),
            volumes: {
              // deposit/withdraw BTC
              deposit: 0,
              withdraw: 0,
            },
          },
        },
      },
      ...getInitialProtocolCoreMetrics(),

      // total tBTC supply
      totalBorrowed: 0,

      volumes: {
        // mint/redeem tBTC
        borrow: 0,
        repay: 0,

        // deposit/withdraw BTC
        deposit: 0,
        withdraw: 0,
      },
    };

    const blockNumber = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      tbtcConfig.chain,
      options.timestamp,
    );
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      tbtcConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(tbtcConfig.chain, options.endTime);

    const totalSupply = await this.services.blockchain.evm.readContract({
      chain: tbtcConfig.chain,
      blockNumber: blockNumber,
      abi: Erc20Abi,
      target: tbtcConfig.tbtc,
      method: 'totalSupply',
      params: [],
    });

    const tbtcPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: tbtcConfig.chain,
      address: tbtcConfig.tbtc,
      timestamp: options.timestamp,
    });

    const totalSupplyUsd = formatBigNumberToNumber(totalSupply.toString(), 18) * tbtcPriceUsd;

    protocolData.totalAssetDeposited += totalSupplyUsd;
    protocolData.totalValueLocked += totalSupplyUsd;
    (protocolData.totalBorrowed as number) += totalSupplyUsd;

    (protocolData.breakdown[tbtcConfig.chain][tokenTBTC].totalBorrowed as number) += totalSupplyUsd;
    protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalAssetDeposited += totalSupplyUsd;
    protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalValueLocked += totalSupplyUsd;

    const logs = await this.services.blockchain.evm.getContractLogs({
      chain: tbtcConfig.chain,
      address: tbtcConfig.tbtc,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const events: Array<any> = logs
      .filter((log) => log.topics[0] === Erc20TransferEventSignature)
      .map((log) =>
        decodeEventLog({
          abi: Erc20Abi,
          topics: log.topics,
          data: log.data,
        }),
      );

    for (const event of events) {
      const valueUsd = formatBigNumberToNumber(event.args.value.toString(), 18) * tbtcPriceUsd;

      if (compareAddress(event.args.from, AddressZero)) {
        (protocolData.volumes.borrow as number) += valueUsd;
        (protocolData.volumes.deposit as number) += valueUsd;
        (protocolData.breakdown[tbtcConfig.chain][tokenTBTC].volumes.borrow as number) += valueUsd;
        (protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].volumes.deposit as number) += valueUsd;
      } else if (compareAddress(event.args.to, AddressZero)) {
        (protocolData.volumes.repay as number) += valueUsd;
        (protocolData.volumes.withdraw as number) += valueUsd;
        (protocolData.breakdown[tbtcConfig.chain][tokenTBTC].volumes.repay as number) += valueUsd;
        (protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].volumes.withdraw as number) += valueUsd;
      }
    }

    // https://docs.threshold.network/applications/tbtc-v2/fees
    const fees = (protocolData.volumes.withdraw as number) * 0.002;
    protocolData.totalFees += fees;
    protocolData.protocolRevenue += fees;
    protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].totalFees += fees;
    protocolData.breakdown[ChainNames.bitcoin][MockBitcoinAddress].protocolRevenue += fees;

    return AdapterDataHelper.fillupAndFormatProtocolData(protocolData, { uncountBorrowRepayAsMoneyFlow: true });
  }
}
