import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';
import qiTokenAbi from '../../../configs/abi/benqi/qiToken.json';
import BigNumber from 'bignumber.js';
import { TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber } from '../../../lib/utils';

export default class MoonwellAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.moonwell 🌕';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getBorrowRate(chain: string, cTokenContract: string, blockNumber: number): Promise<number> {
    const borrowRatePerSecond = await this.services.blockchain.evm.readContract({
      chain: chain,
      abi: qiTokenAbi,
      target: cTokenContract,
      method: 'borrowRatePerTimestamp',
      params: [],
      blockNumber: blockNumber,
    });

    const borrowRate = new BigNumber(borrowRatePerSecond ? borrowRatePerSecond : '0')
      .multipliedBy(TimeUnits.SecondsPerYear)
      .toString(10);

    return formatBigNumberToNumber(borrowRate, 18);
  }
}
