import { ProtocolCategory } from '../base';

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

    // volume of swap/exchange this token to other tokens
    sellToken?: number;

    // volume of swap/exchange from other token to this token
    buyToken?: number;

    // volume of token was bridged out from chain to other chains/tokens
    bridgeOut?: number;

    //volume of token was bridged from other chains/tokens to this token
    bridgeIn?: number;
  };

  // for liquid staking protocol, we can have staking APR
  liquidStakingApr?: number;
}

export interface ProtocolData extends ProtocolCoreMetrics {
  protocol: string;

  category: ProtocolCategory;

  birthday: number;

  // timestamp where data were collected
  timestamp: number;

  // chain => tokenAddress => ProtocolCoreMetrics
  breakdown: {
    [key: string]: {
      [key: string]: ProtocolCoreMetrics;
    };
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
