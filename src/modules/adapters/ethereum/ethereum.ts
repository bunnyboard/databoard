import { formatLittleEndian64ToString, normalizeAddress } from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import EvmChainAdapter from './evm';
import { BeaconDepositor, EthereumBlockMetrics, EthereumData } from '../../../types/domains/ecosystems/ethereum';
import { EthereumBeaconDepositEvent } from '../../../configs/constants';
import EthereumDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import { decodeEventLog } from 'viem';
import BigNumber from 'bignumber.js';
import { GetProtocolDataOptions } from '../../../types/options';
import { EvmChainProtocolConfig } from '../../../configs/protocols/ethereum';
import envConfig from '../../../configs/envConfig';

export default class EthereumAdapter extends EvmChainAdapter {
  public readonly name: string = 'adapter.ethereum';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public transformBlockData(block: any, receipts: Array<any>): any {
    const evmBlockMetrics = super.transformBlockData(block, receipts);

    let totalDeposited = '0';
    let totalWithdrawn = '0';

    const beaconDepositors: { [key: string]: BeaconDepositor } = {};
    for (const receipt of receipts) {
      const sender = normalizeAddress(receipt.from);

      for (const log of receipt.logs) {
        if (log.topics[0] === EthereumBeaconDepositEvent) {
          const event: any = decodeEventLog({
            abi: EthereumDepositAbi,
            topics: log.topics,
            data: log.data,
          });
          const amount = new BigNumber(formatLittleEndian64ToString(event.args.amount.toString()))
            .multipliedBy(1e18)
            .toString(10);

          if (!beaconDepositors[sender]) {
            beaconDepositors[sender] = {
              amount: '0',
            };
          }
          beaconDepositors[sender].amount = new BigNumber(beaconDepositors[sender].amount)
            .plus(new BigNumber(amount))
            .toString(10);

          totalDeposited = new BigNumber(totalDeposited).plus(new BigNumber(amount)).toString(10);
        }
      }
    }

    if (block.withdrawals) {
      for (const withdraw of block.withdrawals) {
        const amount = new BigNumber(withdraw.amount.toString(), 16).multipliedBy(1e9);
        totalWithdrawn = new BigNumber(totalWithdrawn).plus(amount).toString(10);
      }
    }

    return {
      ...evmBlockMetrics,
      totaBeaconlDeposited: totalDeposited,
      totaBeaconlWithdrawn: totalWithdrawn,
      beaconDepositors: beaconDepositors,
    } as EthereumBlockMetrics;
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<EthereumData | null> {
    const chainConfig = this.protocolConfig as EvmChainProtocolConfig;

    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      chainConfig.protocol,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      chainConfig.protocol,
      options.endTime,
    );

    await this.indexBlocks({
      rpcs: chainConfig.publicRpcs,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    const chainData: EthereumData = {
      chain: chainConfig.protocol,
      timestamp: options.timestamp,
      totalBlocks: 0,
      totalTxns: 0,
      totalFee: '0',
      totalFeeBurn: '0',
      gasLimit: '0',
      gasUsed: '0',
      totaBeaconlDeposited: '0',
      totaBeaconlWithdrawn: '0',
    };

    for (let blockNumber = beginBlock; blockNumber <= endBlock; blockNumber++) {
      const blockMetrics: EthereumBlockMetrics | null | undefined = await this.storages.database.find({
        collection: envConfig.mongodb.collections.datasyncChainBlocks.name,
        query: {
          chain: chainConfig.protocol,
          number: blockNumber,
        },
      });
      if (blockMetrics) {
        chainData.totalBlocks += 1;
        chainData.totalTxns += blockMetrics.totalTxns;
        chainData.totalFee = new BigNumber(chainData.totalFee).plus(new BigNumber(blockMetrics.totalFee)).toString(10);
        chainData.gasLimit = new BigNumber(chainData.gasLimit).plus(new BigNumber(blockMetrics.gasLimit)).toString(10);
        chainData.gasUsed = new BigNumber(chainData.gasUsed).plus(new BigNumber(blockMetrics.gasUsed)).toString(10);
        chainData.totaBeaconlDeposited = new BigNumber(chainData.totaBeaconlDeposited)
          .plus(new BigNumber(blockMetrics.totaBeaconlDeposited))
          .toString(10);
        chainData.totaBeaconlWithdrawn = new BigNumber(chainData.totaBeaconlWithdrawn)
          .plus(new BigNumber(blockMetrics.totaBeaconlWithdrawn))
          .toString(10);

        if (chainData.totalFeeBurn && blockMetrics.totalFeeBurn) {
          chainData.totalFeeBurn = new BigNumber(chainData.totalFeeBurn)
            .plus(new BigNumber(blockMetrics.totalFeeBurn))
            .toString(10);
        }
      }
    }

    return chainData;
  }
}
