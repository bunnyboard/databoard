import { Token } from '../../../types/base';
import { ContextServices } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import SiloRepositoryV1Abi from '../../../configs/abi/silofinance/SiloRepositoryV1.json';
import SiloLensV1Abi from '../../../configs/abi/silofinance/SiloLensV1.json';
import SiloV1Abi from '../../../configs/abi/silofinance/SiloV1.json';
import { ContractCall } from '../../../services/blockchains/domains';
import { compareAddress, formatBigNumberToNumber } from '../../../lib/utils';
import { TimeUnits } from '../../../configs/constants';
import { decodeEventLog } from 'viem';

interface GetSiloInfoV1Options extends GetProtocolDataOptions {
  services: ContextServices;
  params: {
    chain: string;
    lens: string;
    repository: string;
    siloAddress: string;
  };
}

export interface GetSiloInfoResult {
  tokens: Array<{
    token: Token;
    tokenPriceUsd: number;
    totalDepositUsd: number;
    totalBorrowUsd: number;
    totalFeeUsd: number;
    protocolFeeUsd: number;
    volumes: {
      deposit: number;
      withdraw: number;
      borrow: number;
      repay: number;
      liquidate: number;
      flashloan?: number;
    };
  }>;
}

export const SiloV1Events = {
  Deposit: '0xdd160bb401ec5b5e5ca443d41e8e7182f3fe72d70a04b9c0ba844483d212bcb5',
  Withdraw: '0x3b5f15635b488fe265654176726b3222080f3d6500a562f4664233b3ea2f0283',
  Borrow: '0x312a5e5e1079f5dda4e95dbbd0b908b291fd5b992ef22073643ab691572c5b52',
  Repay: '0x05f2eeda0e08e4b437f487c8d7d29b14537d15e3488170dc3de5dbdf8dac4684',
  Liquidate: '0xf3fa0eaee8f258c23b013654df25d1527f98a5c7ccd5e951dd77caca400ef972',
};

export async function getSiloInfoV1(options: GetSiloInfoV1Options): Promise<any> {
  const result: GetSiloInfoResult = {
    tokens: [],
  };

  const blockNumber = await options.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
    options.params.chain,
    options.timestamp,
  );
  // const beginBlock = await options.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
  //   options.params.chain,
  //   options.beginTime,
  // );
  // const endBlock = await options.services.blockchain.evm.tryGetBlockNumberAtTimestamp(
  //   options.params.chain,
  //   options.endTime,
  // );

  // get assets
  const siloAssets: Array<string> = await options.services.blockchain.evm.readContract({
    chain: options.params.chain,
    abi: SiloV1Abi,
    target: options.params.siloAddress,
    method: 'getAssets',
    params: [],
    blockNumber: blockNumber,
  });

  // total deposit
  const totalDepositsCalls: Array<ContractCall> = siloAssets.map((address: string) => {
    return {
      abi: SiloLensV1Abi,
      target: options.params.lens,
      method: 'totalDeposits',
      params: [options.params.siloAddress, address],
    };
  });
  const totalDepositsResults: Array<any> = await options.services.blockchain.evm.multicall({
    chain: options.params.chain,
    blockNumber: blockNumber,
    calls: totalDepositsCalls,
  });

  // total borrow
  const totalBorrowsCalls: Array<ContractCall> = siloAssets.map((address: string) => {
    return {
      abi: SiloLensV1Abi,
      target: options.params.lens,
      method: 'totalBorrowAmount',
      params: [options.params.siloAddress, address],
    };
  });
  const totalBorrowsResults: Array<any> = await options.services.blockchain.evm.multicall({
    chain: options.params.chain,
    blockNumber: blockNumber,
    calls: totalBorrowsCalls,
  });

  // borrow rate
  const borrowAPYCalls: Array<ContractCall> = siloAssets.map((address: string) => {
    return {
      abi: SiloLensV1Abi,
      target: options.params.lens,
      method: 'borrowAPY',
      params: [options.params.siloAddress, address],
    };
  });
  const borrowAPYResults: Array<any> = await options.services.blockchain.evm.multicall({
    chain: options.params.chain,
    blockNumber: blockNumber,
    calls: borrowAPYCalls,
  });

  const [, protocolShareFee] = await options.services.blockchain.evm.readContract({
    chain: options.params.chain,
    abi: SiloRepositoryV1Abi,
    target: options.params.repository,
    method: 'fees',
    params: [],
    blockNumber: blockNumber,
  });
  const protocolShareFeePercent = formatBigNumberToNumber(protocolShareFee ? protocolShareFee.toString() : '0', 18);

  if (totalDepositsResults && totalBorrowsResults) {
    for (let assetIndex = 0; assetIndex <= siloAssets.length; assetIndex++) {
      const token = await options.services.blockchain.evm.getTokenInfo({
        chain: options.params.chain,
        address: siloAssets[assetIndex],
      });
      if (token) {
        const tokenPriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
          chain: token.chain,
          address: token.address,
          timestamp: options.timestamp,
        });

        const totalDepositUsd =
          formatBigNumberToNumber(
            totalDepositsResults[assetIndex] ? totalDepositsResults[assetIndex].toString() : '0',
            token.decimals,
          ) * tokenPriceUsd;
        const totalBorrowUsd =
          formatBigNumberToNumber(
            totalBorrowsResults[assetIndex] ? totalBorrowsResults[assetIndex].toString() : '0',
            token.decimals,
          ) * tokenPriceUsd;

        const borrowRate = formatBigNumberToNumber(
          borrowAPYResults[assetIndex] ? borrowAPYResults[assetIndex].toString() : '0',
          18,
        );
        const totalFeesUsd = (totalBorrowUsd * borrowRate) / TimeUnits.DaysPerYear;
        const protocolFeesUsd = totalFeesUsd * protocolShareFeePercent;

        result.tokens.push({
          token: token,
          tokenPriceUsd: tokenPriceUsd,
          totalDepositUsd: totalDepositUsd,
          totalBorrowUsd: totalBorrowUsd,
          totalFeeUsd: totalFeesUsd,
          protocolFeeUsd: protocolFeesUsd,
          volumes: {
            deposit: 0,
            withdraw: 0,
            borrow: 0,
            repay: 0,
            liquidate: 0,
          },
        });
      }
    }
  }

  // const logs = await options.services.blockchain.evm.getContractLogs({
  //   chain: options.params.chain,
  //   address: options.params.siloAddress,
  //   fromBlock: beginBlock,
  //   toBlock: endBlock,
  // });

  // disable query volumes
  const logs: Array<any> = [];

  const events: Array<any> = logs
    .filter((log) => Object.values(SiloV1Events).includes(log.topics[0]))
    .map((log) =>
      decodeEventLog({
        abi: SiloV1Abi,
        topics: log.topics,
        data: log.data,
      }),
    );
  for (const event of events) {
    for (let i = 0; i < result.tokens.length; i++) {
      if (compareAddress(result.tokens[i].token.address, event.args.asset)) {
        if (event.eventName === 'Liquidate') {
          const amountUsd =
            formatBigNumberToNumber(event.args.seizedCollateral.toString(), result.tokens[i].token.decimals) *
            result.tokens[i].tokenPriceUsd;
          result.tokens[i].volumes.liquidate += amountUsd;
        } else {
          const amountUsd =
            formatBigNumberToNumber(event.args.amount.toString(), result.tokens[i].token.decimals) *
            result.tokens[i].tokenPriceUsd;

          switch (event.eventName) {
            case 'Deposit': {
              result.tokens[i].volumes.deposit += amountUsd;
              break;
            }
            case 'Withdraw': {
              result.tokens[i].volumes.withdraw += amountUsd;
              break;
            }
            case 'Borrow': {
              result.tokens[i].volumes.borrow += amountUsd;
              break;
            }
            case 'Repay': {
              result.tokens[i].volumes.repay += amountUsd;
              break;
            }
          }
        }
      }
    }
  }

  return result;
}
