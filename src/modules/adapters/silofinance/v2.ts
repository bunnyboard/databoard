import { ContextServices } from '../../../types/namespaces';
import { GetProtocolDataOptions } from '../../../types/options';
import SiloV2Abi from '../../../configs/abi/silofinance/SiloV2.json';
import SiloLensV2Abi from '../../../configs/abi/silofinance/SiloLensV2.json';
import SiloConfigV2Abi from '../../../configs/abi/silofinance/SiloConfigV2.json';
import { formatBigNumberToNumber } from '../../../lib/utils';
import { GetSiloInfoResult } from './v1';
import { decodeEventLog } from 'viem';
import { TimeUnits } from '../../../configs/constants';

interface GetSiloInfoV2Options extends GetProtocolDataOptions {
  services: ContextServices;
  params: {
    chain: string;
    lens: string;
    repository: string;
    siloConfig: string;
  };
}

export const SiloV2Events = {
  Deposit: '0xdcbc1c05240f31ff3ad067ef1ee35ce4997762752e3a095284754544f4c709d7',
  DepositProtected: '0x1ad348f5de3e19e23d88e34248ceb6ab09804a35a3abc0e7758045b7b9036acd',
  Withdraw: '0xfbde797d201c681b91056529119e0b02407c7bb96a4a2c75c01fc9667232c8db',
  WithdrawProtected: '0x2dac01ea07cfa812db5881eaad96ba201c018c042b8f9ea7278cdf6f29e65f24',
  Borrow: '0x96558a334f4759f0e7c423d68c84721860bd8fbf94ddc4e55158ecb125ad04b5',
  Repay: '0xe4a1ae657f49cb1fb1c7d3a94ae6093565c4c8c0e03de488f79c377c3c3a24e0',
  FlashLoan: '0x97bf554031869ec4edcf72b0dcdc2234dd406afe091f3631be088f348e179574',
  AccruedInterest: '0xd1fe0093c54116fe147366ec7de3cfa98e1e02e91d7ccb124241f6beae255b4c',
};

export async function getSiloInfoV2(options: GetSiloInfoV2Options): Promise<any> {
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

  const siloAddresses: Array<string> = await await options.services.blockchain.evm.readContract({
    chain: options.params.chain,
    abi: SiloConfigV2Abi,
    target: options.params.siloConfig,
    method: 'getSilos',
    params: [],
  });

  // get silos
  for (const siloAddress of siloAddresses) {
    const tokenAddress = await options.services.blockchain.evm.readContract({
      chain: options.params.chain,
      abi: SiloV2Abi,
      target: siloAddress,
      method: 'asset',
      params: [],
    });
    const [daoFee, , ,] = await options.services.blockchain.evm.readContract({
      chain: options.params.chain,
      abi: SiloConfigV2Abi,
      target: options.params.siloConfig,
      method: 'getFeesWithAsset',
      params: [siloAddress],
    });
    const daoFeerate = formatBigNumberToNumber(daoFee ? daoFee.toString() : '0', 18);

    const getBorrowAPR = await options.services.blockchain.evm.readContract({
      chain: options.params.chain,
      abi: SiloLensV2Abi,
      target: options.params.lens,
      method: 'getBorrowAPR',
      params: [siloAddress],
    });
    const borrowRate = formatBigNumberToNumber(getBorrowAPR ? getBorrowAPR.toString() : '0', 18);

    const token = await options.services.blockchain.evm.getTokenInfo({
      chain: options.params.chain,
      address: tokenAddress,
    });
    if (token) {
      const tokenPriceUsd = await options.services.oracle.getTokenPriceUsdRounded({
        chain: token.chain,
        address: token.address,
        timestamp: options.timestamp,
      });

      const siloStorage = await options.services.blockchain.evm.readContract({
        chain: options.params.chain,
        abi: SiloV2Abi,
        target: siloAddress,
        method: 'getSiloStorage',
        params: [],
        blockNumber: blockNumber,
      });

      if (!siloStorage) {
        continue;
      }

      const [, , protectedAssets, collateralAssets, debtAssets] = siloStorage;
      const protectedAssetsValue = formatBigNumberToNumber(
        protectedAssets ? protectedAssets.toString() : '0',
        token.decimals,
      );
      const collateralAssetsValue = formatBigNumberToNumber(
        collateralAssets ? collateralAssets.toString() : '0',
        token.decimals,
      );

      const totalDepositUsd = (protectedAssetsValue + collateralAssetsValue) * tokenPriceUsd;
      const totalBorrowUsd =
        formatBigNumberToNumber(debtAssets ? debtAssets.toString() : '0', token.decimals) * tokenPriceUsd;

      const totalFeeUsd = (totalBorrowUsd * borrowRate) / TimeUnits.DaysPerYear;
      const protocolFeeUsd = totalFeeUsd * daoFeerate;

      const tokenInfo = {
        token: token,
        tokenPriceUsd: tokenPriceUsd,
        totalDepositUsd: totalDepositUsd,
        totalBorrowUsd: totalBorrowUsd,
        totalFeeUsd: totalFeeUsd,
        protocolFeeUsd: protocolFeeUsd,
        volumes: {
          deposit: 0,
          withdraw: 0,
          borrow: 0,
          repay: 0,
          liquidate: 0,
          flashloan: 0,
        },
      };

      // const logs = await options.services.blockchain.evm.getContractLogs({
      //   chain: options.params.chain,
      //   address: siloAddress,
      //   fromBlock: beginBlock,
      //   toBlock: endBlock,
      // });

      const logs: Array<any> = [];
      const events: Array<any> = logs
        .filter((log) => Object.values(SiloV2Events).includes(log.topics[0]))
        .map((log) =>
          decodeEventLog({
            abi: SiloV2Abi,
            topics: log.topics,
            data: log.data,
          }),
        );
      for (const event of events) {
        if (event.eventName === 'AccruedInterest') {
          const interestUsd =
            formatBigNumberToNumber(event.args.hooksBefore.toString(), token.decimals) * tokenPriceUsd;
          const totalFeeUsd = interestUsd / (1 - daoFeerate);

          tokenInfo.totalFeeUsd += totalFeeUsd;
          tokenInfo.protocolFeeUsd += totalFeeUsd - interestUsd;
        } else if (event.eventName === 'FlashLoan') {
          const amountUsd = formatBigNumberToNumber(event.args.amount.toString(), token.decimals) * tokenPriceUsd;
          tokenInfo.volumes.flashloan += amountUsd;
        } else {
          const assetAmountUsd = formatBigNumberToNumber(event.args.assets.toString(), token.decimals) * tokenPriceUsd;
          switch (event.eventName) {
            case 'Deposit':
            case 'DepositProtected': {
              tokenInfo.volumes.deposit += assetAmountUsd;
              break;
            }

            case 'Withdraw':
            case 'WithdrawProtected': {
              tokenInfo.volumes.withdraw += assetAmountUsd;
              break;
            }

            case 'Borrow': {
              tokenInfo.volumes.borrow += assetAmountUsd;
              break;
            }

            case 'Repay': {
              tokenInfo.volumes.repay += assetAmountUsd;
              break;
            }
          }
        }
      }

      result.tokens.push(tokenInfo);
    }
  }

  return result;
}
