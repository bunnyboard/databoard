import axios from 'axios';
import { CachingService } from '../caching/caching';
import { IBitcoreService } from './domains';
import { BlockchainConfigs } from '../../configs/blockchains';
import BigNumber from 'bignumber.js';
import { sleep } from '../../lib/utils';
import logger from '../../lib/logger';

export default class BitcoreService extends CachingService implements IBitcoreService {
  public readonly name: string = 'blockchain.bitcore';

  constructor() {
    super();
  }

  protected async requestRpc(url: string): Promise<any> {
    const retryTime = 10; // 10 secs

    do {
      try {
        return (await axios.get(url)).data;
      } catch (e: any) {
        logger.warn(`failed to query rpc, retrying after ${retryTime}s`, {
          service: this.name,
          url: url,
          error: e.message,
        });
      }

      await sleep(retryTime);
    } while (true);
  }

  public async getAddressBalance(chain: string, address: string, timestamp: number): Promise<string> {
    let transactions: Array<any> = [];
    do {
      let response: any;
      if (transactions.length === 0) {
        response = await this.requestRpc(`${BlockchainConfigs[chain].nodeRpc}/address/${address}/txs`);
      } else {
        const latestTxid = transactions[transactions.length - 1].txid;
        response = await this.requestRpc(
          `${BlockchainConfigs[chain].nodeRpc}/address/${address}/txs?after_txid=${latestTxid}`,
        );
      }
      if (!response || response.length === 0) {
        break;
      }

      transactions = transactions.concat(response);

      await sleep(1);
    } while (true);

    // remove dup tx if any
    transactions = transactions.filter((value, index, self) => index === self.findIndex((t) => t.txid === value.txid));

    let balance = new BigNumber(0);
    for (const transaction of transactions) {
      const blockTime = Number(transaction.status.block_time);
      if (blockTime <= timestamp) {
        // count vin - balance decrease
        for (const vin of transaction.vin) {
          if (vin.prevout) {
            // existing prevout
            const scriptpubkey_address = vin.prevout.scriptpubkey_address;
            if (scriptpubkey_address === address) {
              balance = balance.minus(new BigNumber(vin.prevout.value.toString()));
            }
          }
        }

        // count vout - balance increase
        for (const vout of transaction.vout) {
          const scriptpubkey_address = vout.scriptpubkey_address;
          if (scriptpubkey_address === address) {
            balance = balance.plus(new BigNumber(vout.value.toString()));
          }
        }
      }
    }

    return balance.toString(10);
  }
}
