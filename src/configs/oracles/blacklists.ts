// always return 0 when get price on these token addresses

export const OracleTokenBlacklists: { [key: string]: Array<string> } = {
  ethereum: [
    '0x8aa9381b2544b48c26f3b850f6e07e2c5161eb3e',
    '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
    '0xce682c89c63d2850cb2ca898e44d6c7c30d897a6',
    '0x78a0a62fba6fb21a83fe8a3433d44c73a4017a6f',
    '0xb5b29320d2dde5ba5bafa1ebcd270052070483ec',
    '0x97e6e0a40a3d02f12d1cec30ebfbae04e37c119e',
    '0xcbfb9b444d9735c345df3a0f66cd89bd741692e9',
    '0x5f7827fdeb7c20b443265fc2f40845b715385ff2',
    '0x05770332d4410b6d7f07fd497e4c00f8f7bfb74a',
  ],
  arbitrum: ['0x2f27118e3d2332afb7d165140cf1bb127ea6975d'],
  base: [
    '0xc982b228c7b1c49a7187216ce885f396904024f0',
    '0x59aaf835d34b1e3df2170e4872b785f11e2a964b',
    '0xbc77067f829979812d795d516e523c4033b66409',
    '0x9660af3b1955648a72f5c958e80449032d645755',
  ],
  linea: ['0x0b1a02a7309dfbfad1cd4adc096582c87e8a3ac1'],
  bnbchain: ['0x94c6b279b5df54b335ae51866d6e2a56bf5ef9b7'],
  fraxtal: ['0x5860a0bf37133f8461b2dede7c80e55d6bff3721'],
  fantom: ['0x66eed5ff1701e6ed8470dc391f05e27b1d0657eb'],
};
