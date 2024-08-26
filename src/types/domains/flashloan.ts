export interface FlashloanDataMetrics {
  // total volumes were flashloan from borrowers
  volumeFlashloan: number;

  // total fees were collected from flashloan
  flashloanFees: number;
}

export interface FlashloanData extends FlashloanDataMetrics {
  breakdown: {
    blockchains: {
      [key: string]: FlashloanDataMetrics;
    };
  };
}

export function getInitialFlashloanDataMetrics(): FlashloanDataMetrics {
  return {
    volumeFlashloan: 0,
    flashloanFees: 0,
  };
}

export function getInitialFlashloanData(): FlashloanData {
  return {
    ...getInitialFlashloanDataMetrics(),
    breakdown: {
      blockchains: {},
    },
  };
}
