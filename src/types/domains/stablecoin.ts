export interface StablecoinMetrics {
  totalSupply: number;
  transferVolume: number;
}

export interface StablecoinCoinData extends StablecoinMetrics {
  coin: string;
  priceUsd: number;
  chains: {
    [key: string]: StablecoinMetrics;
  };
}

export interface StablecoinData {
  timestamp: number;
  coins: {
    [key: string]: StablecoinCoinData;
  };
}
