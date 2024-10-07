export const UniswapTestingData = [
  {
    dexConfig: {
      version: 2,
      chain: 'ethereum',
      factory: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      birthday: 1588636800,
      birthblock: 10000836,
    },
    pool: {
      chain: 'ethereum',
      protocol: 'uniswap',
      factoryAddress: '0x5c69bee701ef814a2b6a3edd4b1652cb9cc5aa6f',
      poolAddress: '0xb4e16d0168e52d35cacd2c6185b44281ec28c9dc',
      token0: {
        chain: 'ethereum',
        symbol: 'USDC',
        decimals: 6,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      token1: {
        chain: 'ethereum',
        symbol: 'WETH',
        decimals: 18,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      birthblock: 10008355,
      feeRate: 0.003,
    },
  },
  {
    dexConfig: {
      version: 3,
      chain: 'ethereum',
      factory: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      birthday: 1588636800,
      birthblock: 10000836,
    },
    pool: {
      chain: 'ethereum',
      protocol: 'uniswap',
      factoryAddress: '0x1F98431c8aD98523631AE4a59f267346ea31F984',
      poolAddress: '0x88e6A0c2dDD26FEEb64F039a2c41296FcB3f5640',
      token0: {
        chain: 'ethereum',
        symbol: 'USDC',
        decimals: 6,
        address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      },
      token1: {
        chain: 'ethereum',
        symbol: 'WETH',
        decimals: 18,
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      },
      birthblock: 10008355,
      feeRate: 0.0005,
    },
  },
];
