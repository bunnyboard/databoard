import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { EthereumBeaconDepositContract } from '../constants';
import { ChainNames, ProtocolNames } from '../names';

export interface EthereumProtocolConfig extends ProtocolConfig {
  chain: string;
  beaconDepositContract: string;
  beaconDepositContractBirthhday: number;
  publicRpcs: Array<string>;
}

export const EthereumConfigs: EthereumProtocolConfig = {
  protocol: ProtocolNames.ethereum,
  category: ProtocolCategories.blockchain,
  chain: ChainNames.ethereum,
  birthday: 1438387200, // Sat Aug 01 2015 00:00:00 GMT+0000
  beaconDepositContract: EthereumBeaconDepositContract,
  beaconDepositContractBirthhday: 1602633600, // Wed Oct 14 2020 00:00:00 GMT+0000
  publicRpcs: [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://eth-pokt.nodies.app',
    'https://1rpc.io/eth',
    'https://eth.meowrpc.com',
    'https://rpc.mevblocker.io/fast',
  ],
};