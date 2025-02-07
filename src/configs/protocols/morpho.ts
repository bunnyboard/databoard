import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MorphoBlueConfig {
  chain: string;
  morphoBlue: string;
  morphoFactory: string;
  birthday: number;

  // block number where MorphoBlue contract was deployed
  birthblock: number;

  // whitelist markets
  whitelistedMarketIds: Array<string>;
}

export interface MorphoOptimizerConfig {
  chain: string;
  birthday: number;
  address: string;
  version: 'aavev3' | 'aavev2' | 'compound';
  marketAssets: { [key: string]: string };
}

export interface MorphoProtocolConfig extends ProtocolConfig {
  morphoBlues: Array<MorphoBlueConfig>;
  optimizers: Array<MorphoOptimizerConfig>;
}

export const MorphoConfigs: MorphoProtocolConfig = {
  protocol: ProtocolNames.morpho,
  birthday: 1653782400, // compound optimizer deployed
  optimizers: [
    {
      chain: ChainNames.ethereum,
      version: 'aavev2',
      address: '0x777777c9898d384f785ee44acfe945efdff5f3e0',
      birthday: 1661126400, // Mon Aug 22 2022 00:00:00 GMT+0000
      marketAssets: {
        // aToken => token
        '0x028171bca77440897b824ca71d1c56cac55b68a3': '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x030ba81f1c18d280636f32af80b9aad02cf0854e': '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        '0xbcca60bb61934080951369a648fb03df4f96263c': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0x3ed3b47dd13ec9a98b44e6204a523e766b225811': '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0x9ff58f4ffb29fa2266ab25e75e2a8b3503311656': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        '0x1982b2f5814301d4e9a8b0201555376e62f82428': '0xae7ab96520de3a18e5e111b5eaab095312d7fe84',
        '0x8dae6cb04688c62d939ed9b68d32bc62e49970b1': '0xd533a949740bb3306d119cc777fa900ba034cd52',
      },
    },
    {
      chain: ChainNames.ethereum,
      version: 'compound',
      address: '0x8888882f8f843896699869179fb6e4f7e3b58888',
      birthday: 1653782400, // Sun May 29 2022 00:00:00 GMT+0000
      marketAssets: {
        // cToken => token
        '0x5d3a536e4d6dbd6114cc1ead35777bab948e3643': '0x6b175474e89094c44da98b954eedeac495271d0f',
        '0x70e36f6bf80a52b3b46b3af8e106cc0ed743e8e4': '0xc00e94cb662c3520282e6f5717214004a7f26888',
        '0x4ddc2d193948926d02f9b1fe9e1daa0718270ed5': '0x0000000000000000000000000000000000000000',
        '0x7713dd9ca933848f6819f38b8352d9a15ea73f67': '0x956f47f50a910163d8bf957cf5846d573e7f87ca',
        '0x35a18000230da775cac24873d00ff85bccded550': '0x1f9840a85d5af5bf1d1762f925bdaddc4201f984',
        '0x39aa39c021dfbae8fac545936693ac917d5e7563': '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        '0xf650c3d88d12db855b8bf7d11be6c55a4e07dcc9': '0xdac17f958d2ee523a2206206994597c13d831ec7',
        '0xccf4429db6322d5c611ee964527d42e5d685dd6a': '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
      },
    },
    {
      chain: ChainNames.ethereum,
      version: 'aavev3',
      address: '0x33333aea097c193e66081e930c33020272b33333',
      birthday: 1682899200, // Mon May 01 2023 00:00:00 GMT+0000
      marketAssets: {},
    },
  ],
  morphoBlues: [
    {
      chain: ChainNames.ethereum,
      birthday: 1704067200, // Mon Jan 01 2024 00:00:00 GMT+0000
      birthblock: 18883124,
      morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      morphoFactory: '0xa9c3d3a366466fa809d1ae982fb2c46e5fc41101',
      whitelistedMarketIds: [
        '0x19ab5f7fa9a014d6e5c07384ac34f56e517f449c75f3c9cdc1e0ccd06313419b',
        '0x407d8c123443d362ffdfe73208068ef158a21d1a44a988c9acc23a51bade7905',
        '0x20c488469064c8e2f892dab33e8c7a631260817f0db57f7425d4ef1d126efccb',
        '0x5c8a6157f109ab2af0d3be0b82134e67ee19dbd0c35f96ba8b89bb173faefb10',
        '0xa59b6c3c6d1df322195bfb48ddcdcca1a4c0890540e8ee75815765096c1e8971',
        '0x5e3e6b1e01c5708055548d82d01db741e37d03b948a7ef9f3d4b962648bcbfa7', // PT-sUSDE-24OCT2024 / DAI
        '0xe37784e5ff9c2795395c5a41a0cb7ae1da4a93d67bfdd8654b9ff86b3065941c', // PT-sUSDE-24OCT2024 / DAI
        '0x8f46cd82c4c44a090c3d72bd7a84baf4e69ee50331d5deae514f86fe062b0748', // PT-sUSDE-24OCT2024 / DAI
        '0x39d11026eae1c6ec02aa4c0910778664089cdd97c3fd23f68f7cd05e2e95af48', // sUSDe / DAI
        '0xc581c5f70bd1afa283eed57d1418c6432cbff1d862f94eaf58fdd4e46afbb67f', // USDe / DAI
        '0x3a85e619751152991742810df6ec69ce473daef99e28a64ab2340d7b7ccfee49', // WBTC / USDC
        '0xb48bb53f0f2690c71e8813f2dc7ed6fca9ac4b0ace3faa37b4a8e5ece38fa1a2', // USD0++ / USDC
        '0xd0e50cdac92fe2172043f5e0c36532c6369d24947e40968f34a5e8819ca9ec5d', // wstETH / WETH
        '0x8e6aeb10c401de3279ac79b4b2ea15fc94b7d9cfc098d6c2a1ff7b2b26d9d02c', // USDe / DAI
        '0x1247f1c237eceae0602eab1470a5061a6dd8f734ba88c7cdc5d6109fb0026b28', // sUSDe / DAI
        '0x864c9b82eb066ae2c038ba763dfc0221001e62fc40925530056349633eb0a259', // USD0USD0++ / USDC
        '0xb323495f7e4148be5643a4ea4a8221eef163e4bccfdedc2a6f4696baacbc86cc', // wstETH / USDC
        '0xa921ef34e2fc7a27ccc50ae7e4b154e16c9799d3387076c421423ef52ac4df99',
        '0x97bb820669a19ba5fa6de964a466292edd67957849f9631eb8b830c382f58b7f',
        '0x5125fcd427c196c8796f1a7573109ad9884e6ece3208c25a9583b5999b4e03e4',
        '0x698fe98247a40c5771537b5786b2f3f9d78eb487b4ce4d75533cd0e94d88a115',
        '0xb8fc70e82bc5bb53e773626fcc6a23f7eefa036918d7ef216ecfb1950a94a85e',
        '0x0eed5a89c7d397d02fd0b9b8e42811ca67e50ed5aeaa4f22e506516c716cfbbf',
        '0x138eec0e4a1937eb92ebc70043ed539661dd7ed5a89fb92a720b341650288a40',
        '0xc54d7acf14de29e0e5527cabd7a576506870346a78a11a6762e2cca66322ec41',
        '0xe4cfbee9af4ad713b41bf79f009ca02b17c001a0c0e7bd2e6a89b1111b3d3f08',
        '0x6029eea874791e01e2f3ce361f2e08839cd18b1e26eea6243fa3e43fe8f6fa23',
        '0x7e9c708876fa3816c46aeb08937b51aa0461c2af3865ecb306433db8a80b1d1b',
        '0xf6a056627a51e511ec7f48332421432ea6971fc148d8f3c451e14ea108026549',
        '0x423cb007534ac88febb8ce39f544ab303e8b757f8415ed891fc76550f8f4c965',
        '0xe7e9694b754c4d4f7e21faf7223f6fa71abaeb10296a4c43a54a7977149687d2',
        '0xd925961ad5df1d12f677ff14cf20bac37ea5ef3b325d64d5a9f4c0cc013a1d47',
        '0x64d65c9a2d91c36d56fbc42d69e979335320169b3df63bf92789e2c8883fcc64',
        '0x8bbd1763671eb82a75d5f7ca33a0023ffabdd9d1a3d4316f34753685ae988e80',
        '0x2287407f0f42ad5ad224f70e4d9da37f02770f79959df703d6cfee8afc548e0d',
        '0x1ca7ff6b26581fe3155f391f3960d32a033b5f7d537b1f1932b2021a6cf4f706',
        '0xd5211d0e3f4a30d5c98653d988585792bb7812221f04801be73a44ceecb11e89',
        '0x9337a95dcb09d10abb33fdb955dd27b46e345f5510d54d9403f570f8f37b5983',
        '0x718af3af39b183758849486340b69466e3e89b84b7884188323416621ee91cb7',
        '0xdc5333039bcf15f1237133f74d5806675d83d9cf19cfd4cfdd9be674842651bf',
        '0xeeabdcb98e9f7ec216d259a2c026bbb701971efae0b44eec79a86053f9b128b6',
        '0xfd8493f09eb6203615221378d89f53fcd92ff4f7d62cca87eece9a2fff59e86f',
        '0xcacd4c39af872ddecd48b650557ff5bcc7d3338194c0f5b2038e0d4dec5dc022',
        '0x46981f15ab56d2fdff819d9c2b9c33ed9ce8086e0cce70939175ac7e55377c7f',
        '0xbd1ad3b968f5f0552dbd8cf1989a62881407c5cccf9e49fb3657c8731caf0c1f',
        '0x6c65bb7104ae6fc1dc2cdc97fcb7df2a4747363e76135b32d9170b2520bb65eb',
        '0x124ddf1fa02a94085d1fcc35c46c7e180ddb8a0d3ec1181cf67a75341501c9e6',
        '0x514efda728a646dcafe4fdc9afe4ea214709e110ac1b2b78185ae00c1782cc82',
        '0x60fce64eeeaec462a3fdf674f786ad71e4eef6e717d848d992a8631a5cb0b4b2',
        '0x3c83f77bde9541f8d3d82533b19bbc1f97eb2f1098bb991728acbfbede09cc5d',
        '0x42e157d3739f9ae3f418f5dd0977b7d51c3a677502afd9f3f594f46cc07dec6a',
        '0x0cd36e6ecd9d846cffd921d011d2507bc4c2c421929cec65205b3cd72925367c',
        '0xf6422731a8f84d9ab7e8b6da15ab9ecc243e12a78200dfb7fd1cdf2391e38068',
        '0x3bb29b62affbedc60b8446b235aaa349d5e3bad96c09bca1d7a2d693c06669aa',
        '0xe475337d11be1db07f7c5a156e511f05d1844308e66e17d2ba5da0839d3b34d9',
        '0x3f4d007982a480dd99052c05d811cf6838ce61b2a2be8dc52fca107f783d1f15',
        '0xd8909210afccc90a67730342d4a4695d437cd898164c59e2f54dfa40b53db2c0',
        '0x540266e1879fff261908dcd4f4c623ce99dcd4c9ae7004e9c97ed80bfcb9ea21',
        '0xc4e18eb6d0e9b0fa90a15bc0a98190cbf3d5ba763af410346f5174b014cefd8d',
        '0xa72f4af2570dca1b356aa6c1e6a804d0d3df5b23bb092189776d0dc652feabb4',
        '0x5ffa710641fbb144618f351fbb57f74aed75ecd2ea3fced21d1c2fdb58763f50',
        '0x5109cda72b0603e1bac4631ddebd3104bea6414e686c3f7aa2cb3c65795602f0',
        '0x461da96754b33fec844fc5e5718bf24298a2c832d8216c5ffd17a5230548f01f',
        '0x49bb2d114be9041a787432952927f6f144f05ad3e83196a7d062f374ee11d0ee',
        '0x6d5ceaf737f6ed7f5972c46e87d359a77d36fffa484eeddf2f8188e1605fa9d4',
        '0xea023e57814fb9a814a5a9ee9f3e7ece5b771dd8cc703e50b911e9cde064a12d',
        '0xdb760246f6859780f6c1b272d47a8f64710777121118e56e0cdb4b8b744a3094',
        '0x1929f8139224cb7d5db8c270addc9ce366d37ad279e1135f73c0adce74b0f936',
        '0x19b2dc518e70f0b562a69d1a29edba38638970c9bc3c2f84a8a87548f6c6f53c',
        '0x459687783a68f4cf4e230618f88ce135d1cd459a850f6496751c2a9c1c6e852e',
        '0xb1eac1c0f3ad13fb45b01beac8458c055c903b1bff8cb882346635996a774f77',
        '0x6a6c8e41a6a7ccbea68e1e6a19ece1fdd863b2b6c9e0f71bbcd4dcbe8b1062e8',
        '0x42dcfb38bb98767afb6e38ccf90d59d0d3f0aa216beb3a234f12850323d17536',
        '0x74ef8d7022b0ef0c0e6dc001fbda3c8bd9a3e706f03bb559c833e1dce7302d3a',
        '0xab5423d55497b642df74011621b4c72a3c9b446e8800cf988644bcdbd747d58f',
        '0xa44f90f459658de554346679e449b6166e76d03d9a97bc8573c7dec91c1dbf3a',
        '0x2b1800a3b96cc786e4ae6d8f0c8047c0000fc2587939a3fbf14301a170d76537',
        '0xbd2a27358bdaf3fb902a0ad17f86d4633f9ac5377941298720b37a4d90deab96',
        '0xc576cddfd1ee8332d683417548801d6835fa15fb2332a647452248987a8eded3',
        '0x9c765f69d8a8e40d2174824bc5107d05d7f0d0f81181048c9403262aeb1ab457',
        '0x3197babfc8c9f0fd05fbd5b48e2c5b3d3eeec8277586c02f933a17f5e83e067a',
        '0x1c4b9ce834604969d33dc277bd8473d8aee856e5a577c08427b6deeb97cc72d6',
        '0xdbffac82c2dc7e8aa781bd05746530b0068d80929f23ac1628580e27810bc0c5',
        '0x608929d6de2a10bacf1046ff157ae38df5b9f466fb89413211efb8f63c63833a',
        '0xcec858380cba2d9ca710fce3ce864d74c3f620d53826f69d08508902e09be86f',
        '0x9ec52d7195bafeba7137fa4d707a0f674a04a6d658c9066bcdbebc6d81eb0011',
        '0x093d5b432aace8bf6c4d67494f4ac2542a499571ff7a1bcc9f8778f3200d457d',
        '0xa42ba90e4d3013dee8eb0d7bb7ae0817297337eeecd525dbdd48c7b5c5e6988d',
        '0x5d09770b08517329e25b7dff8f32ad7098c8b6fd075660cdabec3e717ca8068f',
        '0xb8cbb001b00106604cff07b01d3868d65cd47b3030bbdfcf6e279a2fa09c6b28',
        '0x84d0c5c07b5dc83710d3922a7eba2b03f3a3e78cea72556633433bd1b4304e36',
        '0xdffc48c16cca3880240220ab8791e5a7e5a41233ca11a5999f0dd4294d221aed',
        '0x37e7484d642d90f14451f1910ba4b7b8e4c3ccdd0ec28f8b2bdb35479e472ba7',
        '0xed9e817ac29464b3cc520bf124fb333c330021a8ae768889f414d21df35686e0',
        '0xa0534c78620867b7c8706e3b6df9e69a2bc67c783281b7a77e034ed75cee012e',
        '0x5f8a138ba332398a9116910f4d5e5dcd9b207024c5290ce5bc87bc2dbd8e4a86',
        '0x7dde86a1e94561d9690ec678db673c1a6396365f7d1d65e129c5fff0990ff758',
        '0xa84573d73bcd78cd295b3a35b4419877584a4cc3208161128addf15d9a90e5fb',
        '0x2cbfb38723a8d9a2ad1607015591a78cfe3a5949561b39bde42c242b22874ec0',
        '0x3c81a7e3cbcdeeecc7d9f7c45ed28ef62d63357cfcc7295e9d2b3368f0386b46',
        '0x3e6cea6ad0e3c8fd5bb51f9bd9b9af30946f1d245543f409b6add8b754c03d8b',
        '0x8a8650a5ed923712ca86a9b83bd12ea520131c646c4da5de3a443416e1bb8c98',
        '0x3df62177d8dd48708addac57caad778286f104c98a6866817b105795be0605e8',
        '0x08cfaaa2e7797b4e1326d1d174dd364c9fb3a2a718623a3b7f97ea1debba47b8',
        '0x7e72f1671f1fd2c0900b6ef8bb6b55299d6a58fd398e3b8e05c12e3c429c401b',
        '0x6dd2c4f44111a54f4de7919ac33b3038dd03df491e8c6e77a4363ae0d6e8a872',
        '0x70014ba4411257948ddbe73fc1d65056721c31a583fc1ead7fba4c57b5e9790d',
        '0xbe4c211adca4400078db69af91ea0df98401adb5959510ae99edd06fee5146f7',
        '0x06cb6aaee2279b46185dc2c8c107b4a56ff6550ea86063ec011fa4a52920841b',
        '0xd95c5285ed6009b272a25a94539bd1ae5af0e9020ad482123e01539ae43844e1',
        '0x61765602144e91e5ac9f9e98b8584eae308f9951596fd7f5e0f59f21cd2bf664',
        '0x7559acbcb98c2e10bc157ffb52c71687981cde4bed78861bfd1199da9eff9cd8',
        '0xf9acc677910cc17f650416a22e2a14d5da7ccb9626db18f1bf94efe64f92b372',
        '0x6cd5fd13ae90d2e4ecc70032e64ca48b263d94763168a7e7e11ecbf9dbe56c19',
        '0x231bca4be855554a2dcd22b56e4e1828b1038b19b4f7632333baf9fc1204155d',
        '0x935faae97f5784dc97fba3c6ec072186ad9dbbf16368431c38f6a8b7fc3ec9a3',
        '0x82076a47f01513bb21a227c64f6c358c6748fe007155dac9f56d5524b2f1f512',
        '0x987118ea266c483fe0602f727b897f94a0dd3ff8032dd6cd36b4701d9bee8e6b',
        '0xdbd8f3e55e5005a3922e3df4b1ba636ff9998b94588597420281e3641a05bf59',
        '0x2b8019e6b9bd3a6cb615c5ff73c21bb514cdbc30d1f7a797c082e5975500ef4b',
        '0x25bcb1c0b3dc48c6c24a5aaa2375c50a20287335d56a626fcefce8ff414d8c58',
        '0xc84cdb5a63207d8c2e7251f758a435c6bd10b4eaefdaf36d7650159bf035962e',
        '0x198132864e7974fb451dfebeb098b3b7e7e65566667fb1cf1116db4fb2ad23f9',
        '0x3170feb9e3c0172beb9901f6035e4e005f42177c5c14e8c0538c27078864654e',
        '0x85c7f4374f3a403b36d54cc284983b2b02bbd8581ee0f3c36494447b87d9fcab',
        '0xba761af4134efb0855adfba638945f454f0a704af11fc93439e20c7c5ebab942',
        '0x8411eeb07c8e32de0b3784b6b967346a45593bfd8baeb291cc209dc195c7b3ad',
        '0x346afa2b6d528222a2f9721ded6e7e2c40ac94877a598f5dae5013c651d2a462',
        '0x18b52e40c13af881209b78e14bdd5f094a6c7fa39ce411e0d119e9201f71dc20',
        '0x444bbce85350aae535b037d090c8bdf6cc4cfc6d79e17725413b4cb0f6183ad4',
        '0x87a3e5dbcd822f2a543bea1365b7dd99ad9a1cb460061278319732e63207c792',
        '0x0bdde77fdaeaea9bd6e2a91021bf26c2b97a1c25d2070caaa10504698ab9159e',
        '0xb7ad412532006bf876534ccae59900ddd9d1d1e394959065cb39b12b22f94ff5',
        '0x7bf57130cf88dcfe052a4cfd6c7cce28ec7d0be7264f2a6b8a3b3f1b2fb02494',
        '0xcfd9f683c6ab4b3c95e450e3faaf582c2b5fe938ef7405c4d60f2e9fd77415cc',
        '0x0d55c325847ed87d53506c2aca7de046cb59d8c22928fd55fb2790c4811d20db',
        '0x9f4d8ba585b21520f23072010bcc8f861dff2856059d785eb5b7fb00bc7c575c',
        '0xdcfd3558f75a13a3c430ee71df056b5570cbd628da91e33c27eec7c42603247b',
        '0x1eda1b67414336cab3914316cb58339ddaef9e43f939af1fed162a989c98bc20',
        '0x147977320f168afc651b7e5a1849cc1b1e64e329e1bf0212fa49dcb2856074a4',
        '0x92e5fe774a581e52428b4f8d6a775f35619a2e0a184363ae123fae478056d1cd',
        '0x27852bb453d4fe6ec918dd27b7136bb233d210aab1758a59ed8daaeec24f7b3d',
        '0xab0dcab71e65c05b7f241ea79a33452c87e62db387129e4abe15e458d433e4d8',
        '0x8e7cc042d739a365c43d0a52d5f24160fa7ae9b7e7c9a479bd02a56041d4cf77',
        '0x3274643db77a064abd3bc851de77556a4ad2e2f502f4f0c80845fa8f909ecf0b',
        '0xfad6df5845f5e298fd64f574ffc4024e487856663c535a31bb9c366473aa18b6',
        '0xa39263bf7275f772863c464ef4e9e972aaa0f1a6a1bf2a47f92bf57a542d2458',
        '0xf78b7d3a62437f78097745a5e3117a50c56a02ec5f072cba8d988a129c6d4fb6',
        '0xcc63ab57cdcd6dd24cd42db3ebe829fb1b56da89fcd17cea6202cf6b69d02393',
        '0xfd3e5c20340aeba93f78f7dc4657dc1e11b553c68c545acc836321a14b47e457',
        '0x8d177cc2597296e8ff4816be51fe2482add89de82bdfaba3118c7948a6b2bc02',
        '0xd9e34b1eed46d123ac1b69b224de1881dbc88798bc7b70f504920f62f58f28cc',
        '0x351c12a2747b369ee31eb3b4f8814e34ce4909c8a361810c31d51f5ed2ab4239',
        '0x8d18658cd2688b702222c11467133c1c2237bd058ba2467e47bc360067ebe038',
        '0x7ad683900a4017394d76a43cd695a2756cfe96387cb0aa3f8cf3ef73135f85b3',
        '0xe1b65304edd8ceaea9b629df4c3c926a37d1216e27900505c04f14b2ed279f33',
        '0x50e26162f35945381884ea34bf5c1d5d9f15c9305febbc1f890c916963ba0f2b',
        '0xa9b14ece2cac9895eafbd3c7bce566bd502b4376cccb928479a04bc474519025',
        '0xe95187ba4e7668ab4434bbb17d1dfd7b87e878242eee3e73dac9fdb79a4d0d99',
        '0xc9098061d437a9dd53b0070cb33df6fca1a0a5ead288588c88699b0420c1c078',
        '0x17af0be1f59e3eb8e3de2ed7655ed544c9465d089f21b89c465874a6447f2590',
        '0xab4e2a2b60871cbbe808841b1debc1eea1a8a72a9a7bb03f9143a4fee87749fd',
        '0x5f5bfaa51137098abc90b249c93b6051987877ada76135bb3dd7502b10d184a3',
        '0x9c7cda0f3bb23579bbeed7186b4de76239d68eca71d905b1e06fd10867b9dcfc',
        '0x0188775134d3541a13801c090658734743bcfe54662b045644f8e19d31958dfa',
        '0x1e6e9014fc7b882490a0cd420475069563f80c319b5bf3ab2e4162b0549dd4dc',
        '0xb5b0ff0fccf16dff5bef6d2d001d60f5c4ab49df1020a01073d3ad635c80e8d5',
        '0x65d5c83561b2ef3084732e26408332ec10ff2fffa1a31fc19a5fdffd009684e7',
        '0x1a9ccaca2dba9469cd9cba3d077466761b05f465c412d2bf2c71614c4963dd84',
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1714780800, // Sat May 04 2024 00:00:00 GMT+0000
      birthblock: 13977148,
      morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      morphoFactory: '0xa9c3d3a366466fa809d1ae982fb2c46e5fc41101',
      whitelistedMarketIds: [
        '0x4944a1169bc07b441473b830308ffe5bb535c10a9f824e33988b60738120c48e',
        '0x3a4048c64ba1b375330d376b1ce40e4047d03b47ab4d48af484edec9fec801ba',
        '0x1c21c59df9db44bf6f645d854ee710a8ca17b479451447e9f56758aee10a2fad',
        '0x8793cf302b8ffd655ab97bd1c695dbd967807e8367a65cb2f4edaf1380ba1bda',
        '0x104ff0b7c0d67301cb24e3a10b928b0fb0026ee26338e28553b7064fa8b659a9',
        '0x83262d91702f90d9edf6c737ceb46e59a2bcfc7ba856e1e8448b7824f83a07e3',
        '0x84662b4f95b85d6b082b68d32cf71bb565b3f22f216a65509cc2ede7dccdfe8c',
        '0xdba352d93a64b17c71104cbddc6aef85cd432322a1446b5b65163cbbc615cd0c',
        '0x144bf18d6bf4c59602548a825034f73bf1d20177fc5f975fc69d5a5eba929b45',
        '0xdb0bc9f10a174f29a345c5f30a719933f71ccea7a2a75a632a281929bba1b535',
        '0x78d11c03944e0dc298398f0545dc8195ad201a18b0388cb8058b1bcb89440971',
        '0xce89aeb081d719cd35cb1aafb31239c4dfd9c017b2fec26fc2e9a443461e9aea',
        '0xf9ed1dba3b6ba1ede10e2115a9554e9c52091c9f1b1af21f9e0fecc855ee74bf',
        '0xb5d424e4af49244b074790f1f2dc9c20df948ce291fc6bcc6b59149ecf91196d',
        '0x7fc498ddcb7707d6f85f6dc81f61edb6dc8d7f1b47a83b55808904790564929a',
        '0xa9b5142fa687a24c275faf731f13b52faa9873252bb4e1cb6077aa1f412edb0b',
        '0xa066f3893b780833699043f824e5bb88b8df039886f524f62b9a1ac83cb7f1f0',
        '0xf7e40290f8ca1d5848b3c129502599aa0f0602eb5f5235218797a34242719561',
        '0x3b3769cfca57be2eaed03fcc5299c25691b77781a1e124e7a8d520eb9a7eabb5',
        '0x67ebd84b2fb39e3bc5a13d97e4c07abe1ea617e40654826e9abce252e95f049e',
        '0x6600aae6c56d242fa6ba68bd527aff1a146e77813074413186828fd3f1cdca91',
        '0x3a5bdf0be8d820c1303654b078b14f8fc6d715efaeca56cec150b934bdcbff31',
        '0x00f00245cf0061f5a75b0ed737dce5a90e67e69f7a4649e7c2badd4e641958e4',
        '0x86021ffe2f778ed8aacecdf3dae2cdef77dbfa5e133b018cca16c52ceab58996',
        '0xf24417ee06adc0b0836cf0dbec3ba56c1059f62f53a55990a38356d42fa75fa2',
        '0xc338cc2dc3f6a25bace40a920eea39ff27f184899def6bda478e27e591e5cef2',
        '0x9103c3b4e834476c9a62ea009ba2c884ee42e94e6e314a26f04d312434191836',
        '0xdf6aa0df4eb647966018f324db97aea09d2a7dde0d3c0a72115e8b20d58ea81f',
        '0xa4e2843486610e6851f4e0a8fcdee819958598c71c7e99b0315904ccf162ddc3',
        '0x6a331b22b56c9c0ee32a1a7d6f852d2c682ea8b27a1b0f99a9c484a37a951eb7',
        '0x0b3bdf8627442f43607716b9e20475500fd62cb91bbb2c16c711e7c31038beb8',
        '0x13c42741a359ac4a8aa8287d2be109dcf28344484f91185f9a79bd5a805a55ae',
        '0x3fa37d9cc9922c120972c89ae0da86843e7e51c0dd04668e6fac3e7cd1ada1d3',
        '0xdc69cf2caae7b7d1783fb5a9576dc875888afad17ab3d1a3fc102f741441c165',
        '0x026ecee9b3a8d0ce979837333349cfc2075a2af6cd9b41c1c1d9fa16c44e54c5',
        '0xdaa04f6819210b11fe4e3b65300c725c32e55755e3598671559b9ae3bac453d7',
        '0x6aa81f51dfc955df598e18006deae56ce907ac02b0b5358705f1a28fcea23cc0',
        '0x5dffffc7d75dc5abfa8dbe6fad9cbdadf6680cbe1428bafe661497520c84a94c',
        '0xb95dd880d553f5d874534d66eb337a4811608331768c2b208440dfe0e6d901fa',
        '0x96d3ac6b4cf992e8bc3dd0855e0c84c18c34a6880f7e005e74c40096a82e0072',
        '0x536e3e39fd6c07148b38555e5e312e3874e1d08027e007d12822375524ccaa8c',
        '0x87ff0aad672898c24411f98555f958e232c048f41e6d3f2059d26c13fad07563',
        '0xade6749e981ae94420956cc22c299054e05ac3564cc196bf62f4c0924c03bfdf',
        '0x8e1a07763061c6b9fe883ec888833674819614f5cab86af7558660e49c1942d7',
        '0xd75387f30c983be0aec58b03b51cca52337b496e38cf4effbe995531bf34901c',
        '0xe73d71cacb1a11ce1033966787e21b85573b8b8a3936bbd7d83b2546a1077c26',
        '0x738a72906ee7a6034458409dc185d4e40a5c64e93731eca818c386ba5e7d474d',
        '0xabba004839c8ed6bd6f9b7ba61c7e6c4ae970530a6c4852d8f1f3aeed50888cb',
        '0x1791920d6bab15c5f529d278b72aecb79c52ceed412ded44526d7198227e652e',
        '0x592517a07d8bad6e0467661583d3c15a1fee06b7b7506ac14dba250568f67b4c',
        '0x7fbf113321c898cbcff456160fe8f32b5507df1eaa611ab0b3330fc90d7f18ce',
        '0x395ec7a4fbbc91bb94c313d50cc95ee7e572ba5b85065a7168022cd4de464e1b',
        '0x6bac0f6c8b598a04e839a3fc048212291909c40181ee7a0da942ca5c5203a4b1',
        '0xefb576606581c5ac9f731d80cb453519d06776fdc1de51d6230d180d74890c3b',
        '0x4021eef32a72cd1c2bbf9203526bf17d10785de636b00cb1aaa6ca22ce1d1575',
        '0xaf9d03bf28fdf54be154e4f307e2e6ab8a6c182e97d6fc227c2fdf26f89dbc22',
        '0xdfd701f0e53c7281432a11743408cc52a6cf27761e7c70829318a0213a61b1b2',
        '0x0103cbcd14c690f68a91ec7c84607153311e9954c94ac6eac06c9462db3fabb6',
        '0xde1979b67c815863afd1105cae097ecb71b05b0978bc1605d0a58a25231d924f',
        '0xe3c4d4d0e214fdc52635d7f9b2f7b3b0081771ae2efeb3cb5aae26009f34f7a7',
        '0xdf13c46bf7bd41597f27e32ae9c306eb63859c134073cb81c796ff20b520c7cf',
        '0x4ef78b768698d176833bb61682e01a0752a8b0b8da6718dc4b7059e80ddab13d',
        '0xa15c6f1884276e208199ea5392bf8cce7ed02dceaef21a9bad35fbecc4de99e9',
        '0xf761e909ee2f87f118e36b7efb42c5915752a6d39263eec0c000c15d0ab7f489',
        '0x30767836635facec1282e6ef4a5981406ed4e72727b3a63a3a72c74e8279a8d7',
        '0x7f90d72667171d72d10d62b5828d6a5ef7254b1e33718fe0c1f7dcf56dd1edc7',
        '0x214c2bf3c899c913efda9c4a49adff23f77bbc2dc525af7c05be7ec93f32d561',
        '0x5fda67e2274d50fb63955db09382daf24270ae32f2924d31039fec3c50cbfbe4',
        '0x718930c5327b0bece97a293c1f8e91c1505bea97e483a7a9dbc9bca4d559a848',
        '0x9a697eb760dd12aaea23699c96ea2ebbfe48b7af64138d92c4d232b9ed380024',
        '0x52a2a376586d0775e3e80621facc464f6e96d81c8cb70fd461527dde195a079f',
        '0x45f3b5688e7ba25071f78d1ce51d1b893faa3c86897b12204cdff3af6b3611f8',
        '0xca2e6f878e273f6587276b44470467f94175e92840ad0d7231e9deb64c190591',
        '0x58bf7ed35b5d213336a68a5a42dff58f03ceaf417edaad0fc53e046f1742e20e',
      ],
    },
  ],
};
