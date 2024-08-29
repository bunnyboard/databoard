import { ProtocolConfig } from '../../../types/base';
import { ContextServices, ContextStorages } from '../../../types/namespaces';
import CompoundAdapter from '../compound/compound';
import cErc20Abi from '../../../configs/abi/compound/cErc20.json';
import vTokenAbi from '../../../configs/abi/venus/vToken.json';
import vTokenV2Abi from '../../../configs/abi/venus/vTokenV2.json';
import { decodeEventLog } from 'viem';
import { ComptrollerConfig } from '../../../configs/protocols/compound';
import logger from '../../../lib/logger';

export default class VenusAdapter extends CompoundAdapter {
  public readonly name: string = 'adapter.venus';

  constructor(services: ContextServices, storages: ContextStorages, protocolConfig: ProtocolConfig) {
    super(services, storages, protocolConfig);
  }

  // there are multiple ABI versions on Venus contracts
  // we try to decode with all of them
  protected decodeEventLog(config: ComptrollerConfig, log: any): any {
    const abis: Array<any> = [cErc20Abi, vTokenAbi, vTokenV2Abi];

    for (const abi of abis) {
      try {
        const event: any = decodeEventLog({
          abi: abi,
          topics: log.topics,
          data: log.data,
        });
        if (event) {
          return event;
        }
      } catch (e: any) {}
    }

    logger.warn('failed to decode event log', {
      service: this.name,
      chain: config.chain,
      comptroller: config.comptroller,
      signature: log.topics[0],
      txn: log.transactionHash,
    });

    return null;
  }
}
