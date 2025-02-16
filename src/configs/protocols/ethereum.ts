import { ProtocolConfig } from '../../types/base';
import { EthereumBeaconDepositContract } from '../constants';
import { ChainNames } from '../names';

export interface EvmChainProtocolConfig extends ProtocolConfig {
  // these rpcs must support eth_getBlockReceipts method
  publicRpcs: Array<string>;
}

export interface EthereumProtocolConfig extends EvmChainProtocolConfig {
  beaconDepositContract: string;
  beaconDepositContractBirthhday: number;
}

export const EthereumConfigs: EthereumProtocolConfig = {
  protocol: ChainNames.ethereum,
  birthday: 1735689600, // Wed Jan 01 2025 00:00:00 GMT+0000
  beaconDepositContract: EthereumBeaconDepositContract,
  beaconDepositContractBirthhday: 1602633600, // Wed Oct 14 2020 00:00:00 GMT+0000
  publicRpcs: [
    'https://eth.llamarpc.com',
    'https://rpc.ankr.com/eth',
    'https://eth-pokt.nodies.app',
    'https://eth.meowrpc.com',
    'https://rpc.flashbots.net',
    'https://eth.drpc.org',
    'https://mainnet.gateway.tenderly.co',
  ],
};
