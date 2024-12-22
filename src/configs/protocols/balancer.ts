import { ProtocolConfig } from '../../types/base';
import { PoolBalancerType } from '../../types/domains/pool2';
import { ChainNames, ProtocolNames } from '../names';

export interface BalancerDexConfig {
  chain: string;
  vault: string;
  version: PoolBalancerType;
  birthday: number;
  protocolFeeRate: number;
  tokens: Array<string>;
}

export interface BalancerProtocolConfig extends ProtocolConfig {
  dexes: Array<BalancerDexConfig>;
}

export const BalancerConfigs: BalancerProtocolConfig = {
  protocol: ProtocolNames.balancer,
  birthday: 1618876800, // Tue Apr 20 2021 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.ethereum,
      version: 'balv2',
      birthday: 1618876800, // Tue Apr 20 2021 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x594daad7d77592a2b97b725a7ad59d7e188b5bfa',
        '0xae7ab96520DE3A18E5e111B5EaAb095312D7fE84',
        '0x68037790A0229e9Ce6EaA8A99ea92964106C4703',
        '0xd084944d3c05CD115C09d072B9F44bA3E0E45921',
        '0x24Ae2dA0f361AA4BE46b48EB19C91e02c5e4f27E',
        '0xF629cBd94d3791C9250152BD8dfBDF380E2a3B9c',
        '0x3845badAde8e6dFF049820680d1F14bD3903a5d0',
        '0x64aa3364f17a4d01c6f1751fd97c2bd3d7e7f1d5',
        '0x72e4f9f808c49a2a61de9c5896298920dc4eeea9',
        '0x15700b564ca08d9439c58ca5053166e8317aa138',
        '0xae78736cd615f374d3085123a210448e74fc6393',
        '0x5c5b196abe0d54485975d1ec29617d42d9198326',
        '0xac3e018457b222d93114458476f3e3416abbe38f',
        '0xeb4c2781e4eba804ce9a9803c67d0893436bb27d',
        '0x7f39c581f595b53c5cb19bd0b3f8da6c935e2ca0',
        '0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xba100000625a3754423978a60c9317c58a424e3d',
        '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6',
        '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
        '0x04c154b66cb340f3ae24111cc767e0184ed00cc6',
        '0xe07f9d810a48ab5c3c914ba3ca53af14e4491e8a',
        '0x40d16fc0246ad3160ccc09b8d0d3a2cd28ae6c2f',
        '0x6810e776880c02933d47db1b9fc05908e5386b96',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xdbdb4d16eda451d0503b854cf79d55697f90c8df',
        '0xcafe001067cdef266afb7eb5a286dcfd277f3de5',
        '0xdef1ca1fb7fbcdc777520aa7f396b4e015f497ab',
        '0xaf5191b0de278c7286d6c7cc6ab6bb8a73ba2cd6',
        '0x44108f0223a3c3028f5fe7aec7f9bb2e66bef82f',
        '0xfe18be6b3bd88a2d2a7f928d00292e7a9963cfc6',
        '0xfd0205066521550d7d7ab19da8f72bb004b4c341',
        '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0xd33526068d116ce69f19a9ee46f0bd304f21a51f',
        '0x808507121b80c02388fad14726482e061b8da827',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xc0c293ce456ff0ed870add98a0828dd4d2903dbf',
        '0xcdf7028ceab81fa0c6971208e83fa7872994bee5',
        '0x559b7bfc48a5274754b08819f75c5f27af53d53b',
        '0x137ddb47ee24eaa998a535ab00378d6bfa84f893',
        '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
        '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
        '0xe1b4d34e8754600962cd944b535180bd758e6c2e',
        '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0',
        '0xd9a442856c234a39a81a089c06451ebaa4306a72',
        '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
        '0xE95A203B1a91a908F9B9CE46459d101078c2c3cb',
        '0xf469fbd2abcd6b9de8e169d128226c0fc90a012e',
        '0xE0f63A424a4439cBE457D80E4f4b51aD25b2c56C',
        '0xfe18ae03741a5b84e39c295ac9c856ed7991c38e',
        '0x5a98fcbea516cf06857215779fd812ca3bef1b32',
        '0x6982508145454ce325ddbe47a25d4ec3d2311933',
        '0x320623b8e4ff03373931769a31fc52a4e78b5d70',
        '0x865377367054516e17014ccded1e7d814edc9ce4',
        '0x470ebf5f030ed85fc1ed4c2d36b9dd02e77cf1b7',
        '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x9d39a5de30e57443bff2a8307a4256c8797a3497',
      ],
    },
    {
      chain: ChainNames.arbitrum,
      version: 'balv2',
      birthday: 1629849600, // Wed Aug 25 2021 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x3082cc23568ea640225c2467653db90e9250aaa0',
        '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
        '0x7dff72693f6a4149b17e7c6314655f6a9f7c8b33',
        '0x35751007a407ca6feffe80b3cb397736d2cf4dbe',
        '0x95ab45875cffdba1e5f451b950bc2e42c0053f39',
        '0x2416092f143378750bb29b79ed961ab195cceea5',
        '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        '0x6694340fc020c5e6b96567843da2df01b2ce1eb6',
        '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        '0x6a7661795c374c0bfc635934efaddff3a7ee23b6',
        '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        '0x577Fd586c9E6BA7f2E85E025D5824DBE19896656',
        '0xf0b5ceefc89684889e5f7e0a7775bd100fcd3709',
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '0x6c84a8f1c29108F47a79964b5Fe888D4f4D0dE40',
        '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        '0x040d1edc9569d4bab2d15287dc5a4f10f56a56b8',
        '0x965772e0e9c84b6f359c8597c891108dcf1c5b1a',
        '0x1509706a6c66CA549ff0cB464de88231DDBe213B',
        '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
        '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2',
        '0x912ce59144191c1204e64559fe8253a0e49e6548',
        '0xa684cd057951541187f288294a1e1c2646aa2d24',
        '0xfc5a1a6eb076a2c7ad06ed22c90d7e710e35ad0a',
        '0xf97f4df75117a78c1a5a0dbb814af92458539fb4',
        '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
        '0x0c880f6761f1af8d9aa9c466984b80dab9a8c9e8',
        '0x371c7ec6d8039ff7933a2aa28eb827ffe1f52f07',
        '0xd4d42f0b6def4ce0383636770ef773390d85c61a',
        '0xfa7f8980b0f1e64a2062791cc3b0871572f1f7f0',
        '0x13ad51ed4f1b7e9dc168d8a00cb3f4ddd85efa60',
      ],
    },
    {
      chain: ChainNames.avalanche,
      version: 'balv2',
      birthday: 1676678400, // Sat Feb 18 2023 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x2b2c81e08f1af8835a78bb2a90ae924ace0ea4be',
        '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7',
        '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        '0x5ac04b69bde6f67c0bd5d6ba6fd5d816548b066a',
        '0x420fca0121dc28039145009570975747295f2329',
        '0xacfb898cff266e53278cc0124fc2c7c94c8cb9a5',
        '0xe8385cecb013561b69beb63ff59f4d10734881f3',
        '0xc891eb4cbdeff6e073e859e987815ed1505c2acd',
        '0x50b7545627a5162f82a992c33b87adc75187b218',
        '0x49d5c2bdffac6ce2bfdb6640f4f80f226bc10bab',
        '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
        '0x6e84a6216ea6dacc71ee8e6b0a5b7322eebc0fdd',
        '0x60781c2586d68229fde47564546784ab3faca982',
        '0x152b9d0FdC40C096757F570A51E494bd4b943E50',
        '0x63a72806098bd3d9520cc43356dd78afe5d386d9',
        '0x8729438eb15e2c8b576fcc6aecda6a148776c0f5',
      ],
    },
    {
      chain: ChainNames.base,
      version: 'balv2',
      birthday: 1689206400, // Thu Jul 13 2023 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        '0x2C8C89C442436CC6C0a77943E09c8Daf49Da3161',
        '0xb6fe221fe9eef5aba221c348ba20a1bf5e73624c',
        '0x5a7a2bf9ffae199f088b25837dcd7e115cf8e1bb',
        '0x4200000000000000000000000000000000000006',
        '0x54330d28ca3357f294334bdc454a032e7f353416',
        '0x2ae3f1ec7f1f5012cfeab0185bfc7aa3cf0dec22',
        '0x4158734d47fc9692176b5085e0f52ee0da5d47f1',
        '0xc1cba3fcea344f92d9239c08c0568f6f2f0ee452',
        '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
        '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
        '0xeb466342c4d449bc9f53a865d5cb90586f405215',
        '0x50c5725949a6f0c72e6c4a641f24049a917db0cb',
        '0x60a3e35cc302bfa44cb288bc5a4f316fdb1adb42',
        '0x236aa50979d5f3de3bd1eeb40e81137f22ab794b',
        '0xd722E55C1d9D9fA0021A5215Cbb904b92B3dC5d4',
      ],
    },
    {
      chain: ChainNames.fraxtal,
      version: 'balv2',
      birthday: 1716249600, // Tue May 21 2024 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0xfc00000000000000000000000000000000000008',
        '0x09eadcbaa812a4c076c3a6cde765dc4a22e0d775',
        '0xfc00000000000000000000000000000000000005',
        '0x211cc4dd073734da055fbf44a2b4667d5e5fe5d2',
        '0xfc00000000000000000000000000000000000001 ',
        '0x5d3a1ff2b6bab83b63cd9ad0787074081a52ef34 ',
        '0xdcc0f2d8f90fde85b10ac1c8ab57dc0ae946a543 ',
        '0xfc00000000000000000000000000000000000006 ',
        '0x4d15ea9c2573addaed814e48c148b5262694646a ',
      ],
    },
    {
      chain: ChainNames.gnosis,
      version: 'balv2',
      birthday: 1667347200, // Wed Nov 02 2022 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6',
        '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
        '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
        '0xc791240d1f2def5938e2031364ff4ed887133c3d',
        '0xcB444e90D8198415266c6a2724b7900fb12FC56E',
        '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
        '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
        '0x8e5bbbb09ed1ebde8674cda39a0c169401db4252',
        '0x177127622c4a00f3d409b75571e12cb3c8973d3c',
        '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
        '0xce11e14225575945b8e6dc0d4f2dd4c570f79d9f',
        '0x4d18815d14fe5c3304e87b3fa18318baa5c23820',
        '0x7ef541e2a22058048904fe5744f9c7e4c57af717',
        '0x1509706a6c66ca549ff0cb464de88231ddbe213b',
        '0x4f4f9b8d5b4d0dc10506e5551b0513b61fd59e75',
        '0xddafbb505ad214d7b80b1f830fccc89b60fb7a83',
        '0x9fb1d52596c44603198fb0aee434fac3a679f702',
      ],
    },
    {
      chain: ChainNames.mode,
      version: 'balv2',
      birthday: 1716422400, // Thu May 23 2024 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0xDfc7C877a950e49D2610114102175A06C2e3167a',
        '0x59889b7021243dB5B1e065385F918316cD90D46c',
        '0x4200000000000000000000000000000000000006',
        '0x2416092f143378750bb29b79eD961ab195CcEea5',
        '0xd988097fb8612cc24eeC14542bC03424c656005f',
        '0xf0F161fDA2712DB8b566946122a5af183995e2eD',
      ],
    },
    {
      chain: ChainNames.polygon,
      version: 'balv2',
      birthday: 1623974400, // Fri Jun 18 2021 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x385eeac5cb85a38a9a07a70c73e0a3271cfb54a7',
        '0x1bfd67037b42cf73acf2047067bd4f2c47d9bfd6',
        '0x9a71012b13ca4d3d0cdc72a177df3ef03b0e76a3',
        '0xbD1463F02f61676d53fd183C2B19282BFF93D099',
        '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        '0x820802fa8a99901f52e39acd21177b0be6ee2974',
        '0x2C89bbc92BD86F8075d1DEcc58C7F4E0107f286b',
        '0x53e0bca35ec356bd5dddfebbd1fc0fd03fabad39',
        '0x1509706a6c66ca549ff0cb464de88231ddbe213b',
        '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        '0xB7b31a6BC18e48888545CE79e83E06003bE70930',
        '0xdb7cb471dd0b49b29cab4a1c14d070f27216a0ab',
        '0x5fe2b58c013d7601147dcdd68c143a77499f5531',
        '0xa1c57f48f0deb89f569dfbe6e2b7f46d33606fd4',
        '0xfbdd194376de19a88118e84e279b977f165d01b8',
        '0x172370d5cd63279efa6d502dab29171933a610af',
        '0x85955046df4668e1dd369d2de9f3aeb98dd2a369',
        '0xee327f889d5947c1dc1934bb208a1e792f953e96',
      ],
    },
    {
      chain: ChainNames.polygonzkevm,
      version: 'balv2',
      birthday: 1683331200, // Sat May 06 2023 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0xb23c20efce6e24acca0cef9b7b7aa196b84ec942',
        '0x4F9A0e7FD2Bf6067db6994CF12E4495Df938E6e9',
        '0x37eaa0ef3549a5bb7d431be78a3d99bd360d19e5',
        '0x1509706a6c66ca549ff0cb464de88231ddbe213b',
        '0x1e4a5963abfd975d8c9021ce480b42188849d41d',
        '0x12d8ce035c5de3ce39b1fdd4c1d5a745eaba3b8c',
        '0xa8ce8aee21bc2a48a5ef670afcc9274c7bbbc035',
        '0xa2036f0538221a77a3937f1379699f44945018d0',
        '0x120ef59b80774f02211563834d8e3b72cb1649d6',
        '0xc5015b9d9161dca7e18e32f6f25c4ad850731fd4',
        '0x744c5860ba161b5316f7e80d9ec415e2727e5bd5',
        '0x83b874c1e09d316059d929da402dcb1a98e92082',
        '0xea034fb02eb1808c2cc3adbc15f447b93cbe08e1',
      ],
    },
    {
      chain: ChainNames.optimism,
      version: 'balv2',
      birthday: 1651622400, // Wed May 04 2022 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://forum.balancer.fi/t/bip-371-adjust-protocol-fee-split/4978
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x484c2d6e3cdd945a8b2df735e079178c1036578c',
        '0xfc2e6e6bcbd49ccf3a5f029c79984372dcbfe527',
        '0x2e3d870790dc77a83dd1d18184acc7439a53f475',
        '0x6806411765af15bddd26f8f544a34cc40cb9838b',
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921',
        '0x1509706a6c66CA549ff0cB464de88231DDBe213B',
        '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        '0xfdb794692724153d1488ccdbe0c56c252596735f',
        '0x00a35fd824c717879bf370e70ac6868b95870dfb',
        '0x0c5b4c92c948691EEBf185C17eeB9c230DC019E9',
        '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6',
        '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
        '0x8ae125e8653821e851f12a49f7765db9a9ce7384',
        '0x8700daec35af8ff88c16bdf0418774cb3d7599b4',
        '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        '0x217d47011b23bb961eb6d93ca9945b7501a5bb11',
      ],
    },

    // v3
    {
      chain: ChainNames.ethereum,
      version: 'balv3',
      birthday: 1733356800, // Thu Dec 05 2024 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://etherscan.io/address/0xa731C23D7c95436Baaae9D52782f966E1ed07cc8#readContract
      vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9',
      tokens: [
        '0xa1290d69c65a6fe4df752f95823fae25cb99e5a7',
        '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
        '0xf1c9acdc66974dfb6decb12aa385b9cd01190e38',
        '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xdac17f958d2ee523a2206206994597c13d831ec7',
      ],
    },
    {
      chain: ChainNames.gnosis,
      version: 'balv3',
      birthday: 1733356800, // Thu Dec 05 2024 00:00:00 GMT+0000
      protocolFeeRate: 0.5, // 50% - https://etherscan.io/address/0xa731C23D7c95436Baaae9D52782f966E1ed07cc8#readContract
      vault: '0xbA1333333333a1BA1108E8412f11850A5C319bA9',
      tokens: [
        '0xaf204776c7245bf4147c2612bf6e5972ee483701',
        '0x6a023ccd1ff6f2045c3309768ead9e68f978f6e1',
        '0x6c76971f98945ae98dd7d4dfca8711ebea946ea6',
        '0x2a22f9c3b484c3629090feed35f17ff8f88f76f0',
        '0x9c58bacc331c9aa871afd802db6379a98e80cedb',
        '0xe91d153e0b41518a2ce8dd3d7944fa863463a97d',
        '0x1509706a6c66ca549ff0cb464de88231ddbe213b',
        '0xcB444e90D8198415266c6a2724b7900fb12FC56E',
        '0x4ecaba5870353805a9f068101a40e0f32ed605c6',
        '0x177127622c4a00f3d409b75571e12cb3c8973d3c',
        '0x4d18815d14fe5c3304e87b3fa18318baa5c23820',
      ],
    },
  ],
};
