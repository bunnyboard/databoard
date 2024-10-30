import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';
import jTokenAbi from '../../../configs/abi/lfj/jToken.json';
import BigNumber from 'bignumber.js';
import { TimeUnits } from '../../../configs/constants';
import { formatBigNumberToNumber } from '../../../lib/utils';

export default class LfjlendAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.lfjlend';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  public async getBorrowRate(chain: string, cTokenContract: string, blockNumber: number): Promise<number> {
    const borrowRatePerSecond = await this.services.blockchain.evm.readContract({
      chain: chain,
      abi: jTokenAbi,
      target: cTokenContract,
      method: 'borrowRatePerSecond',
      params: [],
      blockNumber: blockNumber,
    });

    const borrowRate = new BigNumber(borrowRatePerSecond ? borrowRatePerSecond : '0')
      .multipliedBy(TimeUnits.SecondsPerYear)
      .toString(10);

    return formatBigNumberToNumber(borrowRate, 18);
  }
}
