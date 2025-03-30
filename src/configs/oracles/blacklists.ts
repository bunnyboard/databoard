// always return 0 when get price on these token addresses

export const OracleTokenBlacklists: { [key: string]: Array<string> } = {
  ethereum: [
    '0x0bb9ab78aaf7179b7515e6753d89822b91e670c4',
    '0xf02c96dbbb92dc0325ad52b3f9f2b951f972bf00',
    '0x513d27c94c0d81eed9dc2a88b4531a69993187cf',
    '0xa8258dee2a677874a48f5320670a869d74f0cbc1',
    '0x9cb8c5136ad079d3311f5b766d6fc370bf29e76b',
    '0x64dc55d76d1541e0853cbd7cf6586615e9e6f4c7',
    '0x29ee8c3fb7ea0b52261b18782f1a060c2e210afa',
    '0x87588d3fbcdff1bf84555f0a22056d94534a74a6',
    '0x81d40243c649f7d6092295f50f4b1d3a8e53da99',
    '0x6568921f9059b6b8a3902651783a7a0e74ca83ff',
    '0xfe08fc631be2da2b47aa6adba275adab2197c0cd',
    '0x18f365ecce58fa865ec9fb027e9175125db93b91',
    '0x120b128cf1a5117fe8e9e12b79b3437e7396bd14',
    '0x552868611d2641144454140dded98e6160b3bfc9',
    '0x28da6de3e804bddf0ad237cfa6048f2930d0b4dc',
    '0x29059568bb40344487d62f7450e78b8e6c74e0e5',
    '0x7fd8af959b54a677a1d8f92265bd0714274c56a3',
    '0xe8449f1495012ee18db7aa18cd5706b47e69627c',
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
  optimism: [
    '0x7ae97042a4a0eb4d1eb370c34bfec71042a056b7',
    '0xa50b23cdfb2ec7c590e84f403256f67ce6dffb84',
    '0x3417e54a51924c225330f8770514ad5560b9098d',
    '0x64831f82e3543006413897c03f59518cecae02b4',
    '0x7eccbbd05830edf593d30005b8f69e965af4d59f',
    '0x2a5139cd86c041aa3467e649f5ee0880a5de2f2f',
    '0x67cde7af920682a29fcfea1a179ef0f30f48df3e',
  ],
  arbitrum: [
    '0x7cbaf5a14d953ff896e5b3312031515c858737c8',
    '0x2f27118e3d2332afb7d165140cf1bb127ea6975d',
    '0xb829b68f57cc546da7e5806a929e53be32a4625d',
  ],
  base: [
    '0x48320a6345713f82df4d4c3a440736d5ac7c9331',
    '0xaebd26ed0c9f9715076d16315f0430e6597f95ea',
    '0x5b5dee44552546ecea05edea01dcd7be7aa6144a',
    '0xc982b228c7b1c49a7187216ce885f396904024f0',
    '0x59aaf835d34b1e3df2170e4872b785f11e2a964b',
    '0xbc77067f829979812d795d516e523c4033b66409',
    '0x9660af3b1955648a72f5c958e80449032d645755',
  ],
  linea: ['0x0b1a02a7309dfbfad1cd4adc096582c87e8a3ac1'],
  bnbchain: ['0x94c6b279b5df54b335ae51866d6e2a56bf5ef9b7', '0xb2ea51baa12c461327d12a2069d47b30e680b69d'],
  fraxtal: ['0x5860a0bf37133f8461b2dede7c80e55d6bff3721'],
  polygon: [
    '0xfa7940b63f9d5ad2540d7f8bae5267a747b8590a',
    '0x3cc20a6795c4b57d9817399f68e83e71c8626580',
    '0x4b9e26a02121a1c541403a611b542965bd4b68ce',
    '0x513cdee00251f39de280d9e5f771a6eafebcc88e',
    '0x57685ddbc1498f7873963cee5c186c7d95d91688',
    '0x6ae96cc93331c19148541d4d2f31363684917092',
    '0x2c1fcb4074d143880cf9469babebdbea0da08d6c',
    '0x2566ad62bc8e4a59c991d4cf20d59999a5e4ded1',
    '0x7c6c69bafbe40b2c76a25dcdf9854c77f086e2c6',
    '0xd92256ae3916a2febbeb828c26452e16fd0b27ae',
    '0x88a838e792931e303a986508d072c14ffa9e4f8c',
  ],
  fantom: ['0x66eed5ff1701e6ed8470dc391f05e27b1d0657eb'],
  sonic: ['0xb5b781b61814bd32d1b2bf8864e8992a8037f8bc'],
  berachain: ['0xb6168f597cd37a232cb7cb94cd1786be20ead156'],
};
