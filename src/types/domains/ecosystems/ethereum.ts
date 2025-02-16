import { EvmChainBlockMetrics, EvmChainData } from '../chain';

export interface BeaconDepositor {
  amount: string;
}

export interface EthereumBlockMetrics extends EvmChainBlockMetrics {
  // total ETH deposited to beacon chain
  totaBeaconlDeposited: string;

  // total ETH withdrawn from beacon chain
  totaBeaconlWithdrawn: string;

  // depositor (txn sender)
  beaconDepositors: {
    // address => BeaconDepositor
    [key: string]: BeaconDepositor;
  };
}

export interface EthereumData extends EvmChainData {
  // total ETH deposited to beacon chain
  totaBeaconlDeposited: string;

  // total ETH withdrawn from beacon chain
  totaBeaconlWithdrawn: string;
}
