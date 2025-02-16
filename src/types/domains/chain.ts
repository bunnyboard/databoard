export interface Erc20Metrics {
  totalTransferEvents: number;
  totalTransferValue: string;
}

export interface SenderAddressMetrics {
  totalTxns: number;
  gasSpent: string;
}

export interface RecipientAddressMetrics {
  totalTxns: number;
  gasconsumed: string;
}

export interface ContractMetrics {
  totalEmittedEvents: number;
}

export interface EvmChainBlockMetrics {
  chain: string;

  // block number decimal
  number: number;

  // block time
  timestamp: number;

  // transaction count
  totalTxns: number;

  // block gas limit
  gasLimit: string;

  // total gas used
  gasUsed: string;

  // new contracts were dployed
  totalDeployedContracts: number;

  // total transaction fees paid
  // in native coin
  totalFee: string;

  // total fees were burnt if any
  totalFeeBurn?: string;

  // list of sender addresses
  senderAddresses: {
    // sender => SenderAddressMetrics
    [key: string]: SenderAddressMetrics;
  };

  // list of recipient address
  recipientAddresses: {
    // recipient => RecipientAddressMetrics
    [key: string]: RecipientAddressMetrics;
  };

  // list of ERC20 token transfers
  erc20Transfers: {
    // address => Erc20Metrics
    [key: string]: Erc20Metrics;
  };

  // list of contracts
  contractAddresses: {
    // contract => ContractMetrics
    [key: string]: ContractMetrics;
  };
}

export interface EvmChainData {
  chain: string;

  timestamp: number;

  // total block count
  totalBlocks: number;

  // total transaction count
  totalTxns: number;

  // total block gas limit
  gasLimit: string;

  // total gas used
  gasUsed: string;

  // new contracts were dployed
  totalDeployedContracts: number;

  // total transaction fees paid
  // in native coin
  totalFee: string;

  // total fees were burnt if any
  totalFeeBurn?: string;
}
