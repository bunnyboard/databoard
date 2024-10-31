// get karak.network restaking vaults and assets

import fs from 'fs';
import CoreV2Abi from '../configs/abi/karak/CoreV2.json';
import BlockchainService from '../services/blockchains/blockchain';
import { decodeEventLog } from 'viem';
import { KarakVault } from '../configs/protocols/karak';
import { normalizeAddress } from '../lib/utils';

const coreContracts: Array<any> = [
  {
    chain: 'arbitrum',
    fromBlock: 261874072,
    address: '0xc4B3D494c166eBbFF9C716Da4cec39B579795A0d',
  },
];

interface KarakVaultExtended extends KarakVault {
  chain: string;
  factory: string;
  version: 1 | 2;
}

const dataFilePath = './src/configs/data/constants/KarakVaults.json';

(async function () {
  const blockchain = new BlockchainService();

  const vaults: { [key: string]: { [key: string]: KarakVaultExtended } } = {};

  const blockSize = 50000;
  for (const contract of coreContracts) {
    if (!vaults[contract.chain]) {
      vaults[contract.chain] = {};
    }

    let startBlock = contract.fromBlock;
    const latestBlockNumber = await blockchain.getLastestBlockNumber(contract.chain);

    while (startBlock <= latestBlockNumber) {
      const toBlock = startBlock + blockSize;

      const logs = await blockchain.getContractLogs({
        chain: contract.chain,
        address: contract.address,
        fromBlock: contract.fromBlock,
        toBlock: toBlock,
        blockRange: blockSize,
      });

      for (const log of logs) {
        // DeployedVault
        if (log.topics[0] === '0x754c0ba87ea068d6b27ef93ca2981913e3a5d0d09ac8fa485b7691e0dd55f180') {
          const event: any = decodeEventLog({
            abi: CoreV2Abi,
            topics: log.topics,
            data: log.data,
          });

          vaults[contract.chain][normalizeAddress(event.args.vault)] = {
            chain: contract.chain,
            version: 2,
            factory: normalizeAddress(contract.address),
            address: event.args.vault,
            token: event.args.asset,
          };
        }
      }

      fs.writeFileSync(dataFilePath, JSON.stringify(vaults));

      startBlock += blockSize;
    }
  }
})();
