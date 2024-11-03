// ethereum ecosystem data metrics

import { ProtocolCategory } from '../../base';

export interface AddressAndValue {
  address: string;
  value: number;
}

export interface EthereumChainMetrics {
  // number of blocks were processed
  // in the period of time
  blockCount: number;

  // total transactions were processed
  // in the period of time
  transactionCount: number;

  // number of active addresses
  // count by transactions sender address
  senderAddressCount: number;

  // number of contracts were interacted in transactions
  calledContractCount: number;

  // number of new contracts were depoloyed
  deployedContractCount: number;

  // total ETH transferred - count by transactions value
  ethTransferValue: number;

  // total ETH were burnt by EIP-1559
  // https://consensys.io/blog/what-is-eip-1559-how-will-it-change-ethereum
  ethBurnt: number;

  // total eth fees paid by transactions senders
  ethFeePaid: number;

  // total eth rewards to validators
  ethRewards: number;

  // total new eth were deposited into beacon chain
  ethDepositedToBeaconchain: number;

  // total eth were withdrawn from beacon chain
  ethWithdrawnFromBeaconchain: number;

  // total gas limited
  totalGasLimited: string;

  // total gas used
  totalGasUsed: number;
}

export interface EthereumProtocolData extends EthereumChainMetrics {
  // should be ethereum
  protocol: string;

  // shoulde be blockchain
  category: ProtocolCategory;

  // timestamp
  timestamp: number;
}
