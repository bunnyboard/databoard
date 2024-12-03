export interface ProtocolCoreMetrics {
  // total assets value are being deposited
  totalAssetDeposited: number;

  // total value locked
  totalValueLocked: number;

  // total assets are being supplied from supply-side
  totalSupplied?: number;

  // total assets are being borrowed if any
  totalBorrowed?: number;

  // total fees were generated
  totalFees: number;

  // fees goes to supply side users
  supplySideRevenue: number;

  // total revenue were collected by protocol
  protocolRevenue: number;

  // value of money flow - in
  moneyFlowIn: number;

  // value of money flow - out
  moneyFlowOut: number;

  // value of money flow - net
  moneyFlowNet: number;

  // total asset volume happen on pretocol
  totalVolume: number;

  // volume breakdown
  volumes: {
    deposit?: number;
    withdraw?: number;
    borrow?: number;
    repay?: number;
    liquidation?: number;
    flashloan?: number;
    redeemtion?: number;

    // swap token volumes
    // count every single token swap
    swap?: number;

    // the trade volume happend on protocol
    // this is diff from swap
    // for example, on dex aggregators platform
    // a token trade can produce multiple token swap
    // and we count trade volume only from input and output swap
    trade?: number;

    // volume of token was bridged from to other chains
    bridge?: number;
  };

  // for bridge protocols
  volumeBridgePaths?: {
    // source chain -> dest chain -> volume usd
    [key: string]: {
      [key: string]: number;
    };
  };

  // for liquid staking protocol, we can have staking APR
  liquidStakingApr?: number;
}

export interface ProtocolData extends ProtocolCoreMetrics {
  protocol: string;

  birthday: number;

  // timestamp where data were collected
  timestamp: number;

  // chain => tokenAddress => ProtocolCoreMetrics
  breakdown: {
    [key: string]: {
      [key: string]: ProtocolCoreMetrics;
    };
  };

  // chain => ProtocolCoreMetrics
  breakdownChains?: {
    [key: string]: ProtocolCoreMetrics;
  };
}

export function getInitialProtocolCoreMetrics(): ProtocolCoreMetrics {
  return {
    totalAssetDeposited: 0,
    totalValueLocked: 0,
    totalFees: 0,
    supplySideRevenue: 0,
    protocolRevenue: 0,
    moneyFlowIn: 0,
    moneyFlowOut: 0,
    moneyFlowNet: 0,
    totalVolume: 0,
    volumes: {},
  };
}
