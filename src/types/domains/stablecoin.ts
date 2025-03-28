export interface StablecoinMetrics {
  totalSupply: number;
  transferVolume: number;
  mintVolume: number;
  burnVolume: number;
}

export interface StablecoinCoinData extends StablecoinMetrics {
  coin: string;
  priceUsd: number;
  chains: {
    [key: string]: StablecoinMetrics;
  };
}

export interface StablecoinCurvePoolCoin {
  balance: number;

  // rate with other coin in the pool
  // how many coin per other coin?
  rates: {
    [key: string]: number;
  };
}

export interface StablecoinCurvePoolData {
  name: string; // pool name
  coins: {
    [key: string]: StablecoinCurvePoolCoin;
  };
}

export interface StablecoinData {
  timestamp: number;
  coins: {
    [key: string]: StablecoinCoinData;
  };

  // important core curve pools
  curvePools: {
    [key: string]: StablecoinCurvePoolData;
  };
}
