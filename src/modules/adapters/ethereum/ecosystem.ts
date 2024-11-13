import axios from 'axios';
import { AddressZero } from '../../../configs/constants';
import envConfig from '../../../configs/envConfig';
import { EthereumProtocolConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import {
  formatBigNumberToNumber,
  formatLittleEndian64ToString,
  getTimestamp,
  normalizeAddress,
} from '../../../lib/utils';
import { ProtocolConfig } from '../../../types/base';
import { EthereumProtocolData } from '../../../types/domains/ecosystems/ethereum';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import { GetProtocolDataOptions, TestAdapterOptions } from '../../../types/options';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';
import BaeconDepositAbi from '../../../configs/abi/BeaconDeposit.json';
import EvmIndexer, { GetRawBlockDataResult } from './indexer';

export default class EthereumEcosystemAdapter extends EvmIndexer {
  public readonly name: string = 'adapter.ethereum';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getProtocolData(options: GetProtocolDataOptions): Promise<EthereumProtocolData | null> {
    const ethereumConfig = this.protocolConfig as EthereumProtocolConfig;

    const ethereumProtocolData: EthereumProtocolData = {
      protocol: this.protocolConfig.protocol,
      category: this.protocolConfig.category,
      timestamp: options.timestamp,
      ethPriceUsd: 0,
      blockCount: 0,
      transactionCount: 0,
      senderAddressCount: 0,
      deployedContractCount: 0,
      ethDepositToBeaconchain: 0,
      ethWithdrawFromBeaconchain: 0,
      ethTransferValue: 0,
      ethFeePaid: 0,
      ethBurnt: 0,
      totalGasLimited: '0',
      totalGasUsed: '0',
      avgBaseFeePerGas: 0,
      ethSupply: null,
      beaconDepositors: {},
      feeRecipients: {},
    };

    // get eth supply if etherescan api key config found
    if (envConfig.etherscan.etherscanApiKey !== '') {
      // https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=YourApiKeyToken
      const response = await axios.get(
        `https://api.etherscan.io/api?module=stats&action=ethsupply2&apikey=${envConfig.etherscan.etherscanApiKey}`,
      );
      if (response && response.data && Number(response.data.status) === 1 && response.data.message === 'OK') {
        const EthSupply = formatBigNumberToNumber(response.data.result.EthSupply, 18);
        const Eth2Staking = formatBigNumberToNumber(response.data.result.Eth2Staking, 18);
        const BurntFees = formatBigNumberToNumber(response.data.result.BurntFees, 18);

        ethereumProtocolData.ethSupply = {
          ethTotalSupply: EthSupply,
          ethTotalRerwards: Eth2Staking,
          ethTotalBurnt: BurntFees,
          ethCirculatingSupply: EthSupply + Eth2Staking - BurntFees,
        };
      }
    }

    // get block boundaries
    const beginBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      ethereumConfig.chain,
      options.beginTime,
    );
    const endBlock = await this.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
      ethereumConfig.chain,
      options.endTime,
    );

    ethereumProtocolData.ethPriceUsd = await this.services.oracle.getTokenPriceUsdRounded({
      chain: ethereumConfig.chain,
      address: AddressZero,
      timestamp: options.timestamp,
    });

    await this.getRawBlocks({
      rpcs: ethereumConfig.publicRpcs,
      fromBlock: beginBlock,
      toBlock: endBlock,
    });

    logger.info('processing blocks data from localdb', {
      service: this.name,
      chain: this.protocolConfig.protocol,
      blocks: `${beginBlock}->${endBlock}`,
    });

    let totalBaseFee = new BigNumber(0);
    const senderAddress: { [key: string]: boolean } = {};
    for (let indexBlock = beginBlock; indexBlock <= endBlock; indexBlock++) {
      const blockData: GetRawBlockDataResult = await this.storages.localdb.read({
        database: this.getLocaldbDatabaseName(),
        key: indexBlock.toString(),
      });

      if (blockData && blockData.block && blockData.receipts) {
        ethereumProtocolData.blockCount += 1;
        ethereumProtocolData.transactionCount += blockData.block.transactions.length;
        ethereumProtocolData.totalGasLimited = new BigNumber(ethereumProtocolData.totalGasLimited)
          .plus(new BigNumber(blockData.block.gasLimit, 16))
          .toString(10);
        ethereumProtocolData.totalGasUsed = new BigNumber(ethereumProtocolData.totalGasUsed)
          .plus(new BigNumber(blockData.block.gasUsed, 16))
          .toString(10);

        const ethBurnt = new BigNumber(blockData.block.baseFeePerGas, 16)
          .multipliedBy(new BigNumber(blockData.block.gasUsed, 16))
          .dividedBy(1e18)
          .toNumber();
        ethereumProtocolData.ethBurnt += ethBurnt;

        totalBaseFee = totalBaseFee.plus(new BigNumber(blockData.block.baseFeePerGas, 16));

        for (const transaction of blockData.block.transactions) {
          senderAddress[normalizeAddress(transaction.from)] = true;

          // https://ethereum.stackexchange.com/a/129744
          if (!transaction.to && transaction.input !== '' && transaction.input !== '0x') {
            ethereumProtocolData.deployedContractCount += 1;
          }

          ethereumProtocolData.ethTransferValue += formatBigNumberToNumber(
            new BigNumber(transaction.value, 16).toString(10),
            18,
          );
        }

        for (const withdrawal of blockData.block.withdrawals) {
          // value has 9 decimals place
          const amount = new BigNumber(withdrawal.amount, 16).dividedBy(1e9).toNumber();
          ethereumProtocolData.ethWithdrawFromBeaconchain += amount;
        }

        let totalFeePaid = 0;
        for (const receipt of blockData.receipts) {
          const fee = new BigNumber(receipt.gasUsed, 16)
            .multipliedBy(new BigNumber(receipt.effectiveGasPrice, 16))
            .dividedBy(1e18)
            .toNumber();
          totalFeePaid += fee;

          for (const log of receipt.logs) {
            // DepositEvent
            if (log.topics[0] === '0x649bbc62d0e31342afea4e5cd82d4049e7e1ee912fc0889aa790803be39038c5') {
              const event: any = decodeEventLog({
                abi: BaeconDepositAbi,
                topics: log.topics,
                data: log.data,
              });

              const depositor = normalizeAddress(receipt.from);
              const amount = Number(formatLittleEndian64ToString(event.args.amount.toString()));

              ethereumProtocolData.ethDepositToBeaconchain += amount;

              if (!ethereumProtocolData.beaconDepositors[depositor]) {
                ethereumProtocolData.beaconDepositors[depositor] = 0;
              }
              ethereumProtocolData.beaconDepositors[depositor] += amount;
            }
          }
        }

        const feeRecipient = normalizeAddress(blockData.block.miner);
        const blockReward = totalFeePaid > ethBurnt ? totalFeePaid - ethBurnt : 0;
        if (!ethereumProtocolData.feeRecipients[feeRecipient]) {
          ethereumProtocolData.feeRecipients[feeRecipient] = 0;
        }
        ethereumProtocolData.feeRecipients[feeRecipient] += blockReward;
        ethereumProtocolData.ethFeePaid += totalFeePaid;
      } else {
        logger.warn('failed to get block data from localdb', {
          service: this.name,
          chain: this.protocolConfig.protocol,
          number: indexBlock,
        });
        process.exit(1);
      }
    }

    ethereumProtocolData.senderAddressCount = Object.keys(senderAddress).length;
    ethereumProtocolData.avgBaseFeePerGas = totalBaseFee
      .dividedBy(endBlock - beginBlock + 1)
      .dividedBy(1e9) // gwei
      .toNumber();

    return ethereumProtocolData;
  }

  public async runTest(options: TestAdapterOptions): Promise<void> {
    const current = getTimestamp();
    const fromTime = current - 600;
    const toTime = current;

    if (options.output === 'json') {
      console.log(
        JSON.stringify(
          await this.getProtocolData({
            timestamp: fromTime,
            beginTime: fromTime,
            endTime: toTime,
          }),
        ),
      );
    } else {
      console.log(
        await this.getProtocolData({
          timestamp: fromTime,
          beginTime: fromTime,
          endTime: toTime,
        }),
      );
    }
  }
}
