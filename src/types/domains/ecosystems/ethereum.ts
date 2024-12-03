// ethereum ecosystem data metrics

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

  // number of new contracts were depoloyed
  deployedContractCount: number;

  // total ETH transferred - count by transactions value
  ethTransferValue: number;

  // total ETH were burnt by EIP-1559
  // https://consensys.io/blog/what-is-eip-1559-how-will-it-change-ethereum
  ethBurnt: number;

  // total eth fees paid by transactions senders
  ethFeePaid: number;

  // total new eth were deposited into beacon chain
  ethDepositToBeaconchain: number;

  // total eth were withdrawn from beacon chain
  ethWithdrawFromBeaconchain: number;

  // total gas limited
  totalGasLimited: string;

  // total gas used
  totalGasUsed: string;

  // avg. base fee per gas, value in gwei
  avgBaseFeePerGas: number;
}

export interface EthSupplyMetrics {
  // total ETH were ever minted and existed
  ethTotalSupply: number;

  // total ETH were burnt
  ethTotalBurnt: number;

  // total ETH were rewards from staking
  ethTotalRerwards: number;

  // ethTotalSupply + ethTotalRerwards - ethTotalBurnt
  ethCirculatingSupply: number;
}

export interface EthereumProtocolData extends EthereumChainMetrics {
  // should be ethereum
  protocol: string;

  // timestamp
  timestamp: number;

  // price of ETH token
  ethPriceUsd: number;

  // eth supply metrics
  ethSupply: EthSupplyMetrics | null;

  // depositor (txn sender)
  beaconDepositors: {
    // address => ETH amount
    [key: string]: number;
  };

  // validator - block fee recipient and rewards
  feeRecipients: {
    // address => ETH amount
    [key: string]: number;
  };
}
