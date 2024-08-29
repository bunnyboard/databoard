//
// Lending Data Metrics
//

export interface LendingDataMetrics {
  // total assets value are being deposited
  totalAssetDeposited: number;

  // total value locked
  totalValueLocked: number;

  // total assets are being supplied from suppliers/lenders
  totalSupplied: number;

  // total assets are being borrowed
  totalBorrowed: number;

  // borrow interest
  // totalBorrowFees = totalBorrowed * borrowAPY
  borrowFees: number;

  // revenue
  revenue: number;

  // value of money flow in
  moneyFlowIn: number;

  // value of money flow out
  moneyFlowOut: number;

  // volume of supply-side deposited
  volumeDeposited?: number;

  // volume of supply-side withdrawn
  volumeWithdrawn?: number;

  // volume of borrow-side borrowed
  volumeBorrowed: number;

  // volume of borrow-side repaid
  volumeRepaid: number;

  // volume of collateral deposited
  volumeCollateralDeposited?: number;

  // volume of collateral withdrawn
  volumeCollateralWithdrawn?: number;

  // volume of liquidation
  volumeLiquidation: number;
}

export interface LendingData extends LendingDataMetrics {
  breakdown: {
    blockchains: {
      [key: string]: LendingDataMetrics;
    };
  };
}

export function getInitialLendingDataMetrics(): LendingDataMetrics {
  return {
    totalAssetDeposited: 0,
    totalValueLocked: 0,
    totalSupplied: 0,
    totalBorrowed: 0,
    borrowFees: 0,
    revenue: 0,
    moneyFlowIn: 0,
    moneyFlowOut: 0,
    volumeBorrowed: 0,
    volumeRepaid: 0,
    volumeLiquidation: 0,
  };
}

export function getInitialLendingData(): LendingData {
  return {
    ...getInitialLendingDataMetrics(),
    breakdown: {
      blockchains: {},
    },
  };
}
