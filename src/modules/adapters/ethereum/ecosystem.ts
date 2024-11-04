import axios from 'axios';
import { AddressZero, TimeUnits } from '../../../configs/constants';
import envConfig from '../../../configs/envConfig';
import { EthereumProtocolConfig } from '../../../configs/protocols/ethereum';
import logger from '../../../lib/logger';
import {
  formatBigNumberToNumber,
  formatLittleEndian64ToString,
  getDateString,
  getStartDayTimestamp,
  getTimestamp,
  getTodayUTCTimestamp,
  normalizeAddress,
  sleep,
} from '../../../lib/utils';
import ExecuteSession from '../../../services/executeSession';
import { ProtocolConfig } from '../../../types/base';
import { EthereumProtocolData } from '../../../types/domains/ecosystems/ethereum';
import { ContextServices, ContextStorages, IProtocolAdapter } from '../../../types/namespaces';
import { GetProtocolDataOptions, RunAdapterOptions, TestAdapterOptions } from '../../../types/options';
import BigNumber from 'bignumber.js';
import { decodeEventLog } from 'viem';
import BaeconDepositAbi from '../../../configs/abi/BeaconDeposit.json';

interface GetBlockDataResult {
  block: any;
  receipts: Array<any>;
}

export default class EthereumEcosystemAdapter implements IProtocolAdapter {
  public readonly name: string = 'adapter.ethereum';
  public readonly services: ContextServices;
  public readonly storages: ContextStorages;

  public protocolConfig: ProtocolConfig;

  public executeSession: ExecuteSession;

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    this.services = services;
    this.storages = storages;
    this.protocolConfig = protocolConfig;
    this.executeSession = new ExecuteSession();
  }

  private async getBlockData(rpc: string, blockNumber: number): Promise<GetBlockDataResult> {
    const result: GetBlockDataResult = {
      block: null,
      receipts: [],
    };

    let response = await axios.post(rpc, {
      method: 'eth_getBlockByNumber',
      params: [`0x${blockNumber.toString(16)}`, true],
    });
    if (response.data && response.data.result) {
      result.block = response.data.result;
    }

    await sleep(0.5);

    response = await axios.post(rpc, {
      method: 'eth_getBlockReceipts',
      params: [`0x${blockNumber.toString(16)}`],
    });
    if (response.data && response.data.result) {
      result.receipts = response.data.result;
    }

    return result;
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

    // caching for logging
    let indexBlock = beginBlock;
    let lastProgressPercentage = 0;

    logger.info('getting ethereum blocks data', {
      service: this.name,
      chain: this.protocolConfig.protocol,
      blocks: `${beginBlock}->${endBlock}`,
    });

    let totalBaseFee = new BigNumber(0);
    const senderAddress: { [key: string]: boolean } = {};
    while (indexBlock <= endBlock) {
      const blockData = await this.getBlockData(envConfig.blockchains[ethereumConfig.chain].nodeRpc, indexBlock);

      if (blockData.block) {
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
      }

      const processBlocks = indexBlock - beginBlock + 1;
      const progress = (processBlocks / (endBlock - beginBlock + 1)) * 100;

      // less logs
      if (progress - lastProgressPercentage >= 5) {
        logger.debug('processed ethereum blocks data', {
          service: this.name,
          chain: this.protocolConfig.protocol,
          blocks: `${indexBlock}->${endBlock}`,
          progress: `${progress.toFixed(2)}%`,
        });
        lastProgressPercentage = progress;
      }

      indexBlock += 1;
    }

    ethereumProtocolData.senderAddressCount = Object.keys(senderAddress).length;
    ethereumProtocolData.avgBaseFeePerGas = totalBaseFee
      .dividedBy(endBlock - beginBlock + 1)
      .dividedBy(1e9) // gwei
      .toNumber();

    return ethereumProtocolData;
  }

  public async run(options: RunAdapterOptions): Promise<void> {
    //
    // collect current state data
    //
    if (!options.service || options.service === 'state') {
      this.executeSession.startSession('start to update protocol current data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        category: this.protocolConfig.category,
      });

      const currentTimestamp = getTimestamp();
      const last24HoursTimestamp = currentTimestamp - TimeUnits.SecondsPerDay;
      const last48HoursTimestamp = last24HoursTimestamp - TimeUnits.SecondsPerDay;

      const last24HoursData = await this.getProtocolData({
        timestamp: currentTimestamp,
        beginTime: last24HoursTimestamp,
        endTime: currentTimestamp,
      });
      const last48HoursData = await this.getProtocolData({
        timestamp: last24HoursTimestamp,
        beginTime: last48HoursTimestamp,
        endTime: last24HoursTimestamp,
      });
      if (last24HoursData) {
        if (last48HoursData) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.ecosystemDataStates.name,
            keys: {
              protocol: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
              last24HoursData: last48HoursData,
            },
            upsert: true,
          });
        } else {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.ecosystemDataStates.name,
            keys: {
              protocol: last24HoursData.protocol,
            },
            updates: {
              ...last24HoursData,
            },
            upsert: true,
          });
        }
      }

      this.executeSession.endSession('updated current data for protocol', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        category: this.protocolConfig.category,
      });
    }

    //
    // collect snapshots
    //
    if (!options.service || options.service === 'snapshot') {
      const currentTimestamp = getTimestamp();
      let startTime = options.fromTime ? options.fromTime : this.protocolConfig.birthday;

      // we make sure startTime is start day (00:00 UTC+0) timestamp
      startTime = getStartDayTimestamp(startTime);

      if (!options.force) {
        // we find the latest snapshot timestamp
        const latestSnapshot = (
          await this.storages.database.query({
            collection: envConfig.mongodb.collections.ecosystemDataSnapshots.name,
            query: {
              protocol: this.protocolConfig.protocol,
            },
            options: {
              limit: 1,
              skip: 0,
              order: { timestamp: -1 },
            },
          })
        )[0];
        if (latestSnapshot) {
          startTime = latestSnapshot.timestamp;
        }
      }

      const todayTimestamp = getTodayUTCTimestamp();
      logger.info('start to update protocol snapshots data', {
        service: this.name,
        protocol: this.protocolConfig.protocol,
        category: this.protocolConfig.category,
        fromDate: getDateString(startTime),
        toDate: getDateString(todayTimestamp),
      });

      while (startTime <= todayTimestamp) {
        this.executeSession.startSession('start to update protocol snapshot', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          category: this.protocolConfig.category,
          date: getDateString(startTime),
        });

        let endTime = startTime + TimeUnits.SecondsPerDay - 1;
        if (endTime > currentTimestamp) {
          endTime = currentTimestamp;
        }

        const dataTimeframe24Hours = await this.getProtocolData({
          timestamp: startTime,
          beginTime: startTime,
          endTime: endTime,
        });
        if (dataTimeframe24Hours) {
          await this.storages.database.update({
            collection: envConfig.mongodb.collections.ecosystemDataSnapshots.name,
            keys: {
              protocol: dataTimeframe24Hours.protocol,
              timestamp: dataTimeframe24Hours.timestamp,
            },
            updates: {
              ...dataTimeframe24Hours,
            },
            upsert: true,
          });
        }

        this.executeSession.endSession('updated snapshot data for protocol', {
          service: this.name,
          protocol: this.protocolConfig.protocol,
          category: this.protocolConfig.category,
          date: getDateString(startTime),
        });

        startTime += TimeUnits.SecondsPerDay;
      }
    }
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
