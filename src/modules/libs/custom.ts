import BigNumber from 'bignumber.js';

import VatAbi from '../../configs/abi/maker/Vat.json';
import SavingDaiAbi from '../../configs/abi/spark/SavingDai.json';
import mETHAbi from '../../configs/abi/mantle/mETH.json';
import mETHStakingContractAbi from '../../configs/abi/mantle/EthStaking.json';
import { SolidityUnits } from '../../configs/constants';
import { formatBigNumberToString } from '../../lib/utils';
import BlockchainService from '../../services/blockchains/blockchain';
import { OracleSourceMakerRwaPip, OracleSourceSavingDai, OracleSourceStakingTokenWrapper } from '../../types/oracles';

export default class OracleLibs {
  public static async getTokenPrice(
    config: OracleSourceSavingDai | OracleSourceMakerRwaPip,
    blockNumber: number,
  ): Promise<string | null> {
    switch (config.type) {
      // return amount of DAI per sDAI
      case 'savingDai': {
        const blockchain = new BlockchainService();
        const daiAmount = await blockchain.readContract({
          chain: config.chain,
          abi: SavingDaiAbi,
          target: config.address,
          method: 'convertToAssets',
          params: [new BigNumber(1e18).toString(10)],
          blockNumber,
        });
        if (daiAmount) {
          return formatBigNumberToString(daiAmount.toString(), 18);
        }

        break;
      }
      case 'makerRwaPip': {
        config = config as OracleSourceMakerRwaPip;
        const blockchain = new BlockchainService();
        const vatInfo = await blockchain.readContract({
          chain: config.chain,
          abi: VatAbi,
          target: config.address,
          method: 'ilks',
          params: [config.ilk],
          blockNumber,
        });
        if (vatInfo) {
          const art = new BigNumber(vatInfo[0].toString());
          const rate = new BigNumber(vatInfo[1].toString());
          return formatBigNumberToString(
            art.multipliedBy(rate).toString(10),
            SolidityUnits.RayDecimals + SolidityUnits.WadDecimals,
          );
        }

        break;
      }
    }

    return null;
  }

  // get price of 0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa in ETH
  public static async getmETHPrice(
    config: OracleSourceStakingTokenWrapper,
    blockNumber: number,
  ): Promise<string | null> {
    const blockchain = new BlockchainService();
    const stakingContract = await blockchain.readContract({
      chain: config.chain,
      abi: mETHAbi,
      target: config.address,
      method: 'stakingContract',
      params: [],
      blockNumber: blockNumber,
    });

    if (stakingContract) {
      const mETHToETH = await blockchain.readContract({
        chain: config.chain,
        abi: mETHStakingContractAbi,
        target: stakingContract,
        method: 'mETHToETH',
        params: [SolidityUnits.OneWad],
        blockNumber: blockNumber,
      });

      if (mETHToETH) {
        return formatBigNumberToString(mETHToETH.toString(), 18);
      }
    }

    return null;
  }
}
