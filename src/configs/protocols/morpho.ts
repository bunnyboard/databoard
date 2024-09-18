import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MorphoBlueConfig {
  chain: string;
  morphoBlue: string;
  morphoFactory: string;
  birthday: number;

  // block number where MorphoBlue contract was deployed
  birthblock: number;

  blacklistPoolIds: {
    [key: string]: boolean;
  };
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
  category: ProtocolCategories.lending,
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
      blacklistPoolIds: {
        '0x1500bf50feba561f004d35c7695d96d685fa117c4985b91a75885c4aa24b6ceb': true,
        '0xbd33e0ae076c82cfd0fa8d759ea83a296190f9f98d9f79b74a0eb4a294d8bf42': true,
        '0x7725318760d6d193e11f889f0be58eba134f64a8c22ed9050cac7bd4a70a64f0': true,
        '0x779c536c70b70a70734d1882c8496695d4da583c49d4ed9bda99d1ec963522b7': true,
        '0x50e1cfa489db54c5e33c03cd5e30c45558bea125520fcc7e3a84e505061e2829': true,
        '0x576acd27f398d0076250ee1fe7c5655d36e915dd4c4b2e2bed2ac112250fa35f': true,
        '0xcc6fbc7f375c5d8206667dd9b1beac424983b2a5c850f1d429499fcc574ddb6c': true,
        '0xdf99a1e09b2a05d0f54a5fc4cc3de7ba9372eb0b7793cee58a18c385394bc05a': true,
        '0xe6eda5cbaf4a85736271d94bbf2ef93eb11ef7b3555370ab36e591abd443b1ab': true,
        '0x35b9438b7d90d478694dfbdba841571850902c1cc619c53c53eeee6e0a5804b0': true,
        '0x5c8a6157f109ab2af0d3be0b82134e67ee19dbd0c35f96ba8b89bb173faefb10': true,
        '0xee1e6a6fc07ddf120c22fa8c076b5f2a3f538afebada0a5eff514c00dc99f6a7': true,
        '0x02e723fdfc0c26779c2c06bbf783e2f4d6aebd03cedc1806981b742f1a644105': true,
        '0xb1963517b52c4315a4ed5f6811aee279ab7adc90d9dfbd8f187e05f2758f4d1a': true,
        '0xdd1ceb18c244fc443908249b853af63b9d35516816634b2e7fb3c43533e75614': true,
        '0x8868527fb91cd74fe89dd3167a9261b0e507b7a03863a225596d5fff65d9f71d': true,
        '0xbcb70d62f8ccdf9e798fe18571f9691b33e26e5ccba63a375f305bb310a6c1ef': true,
        '0x90f336c58b38a736508e12102b09b58edbb8fb3b149b380e441d45992d3c7b58': true,
        '0x074973eb292ffcb3cb22c71138eed4b2ad7030f5620918d41617609f8270aa4f': true,
        '0xeb809769a0ea3fe0a405b94dbcaf1940c9d2cb1546d175cbc6898bfde817801a': true,
        '0xb8cbb001b00106604cff07b01d3868d65cd47b3030bbdfcf6e279a2fa09c6b28': true,
        '0x26e7fcd32471786bb15ee4586cb3ccd36d6062f1fa294eee7b64b2df0b9f82cf': true,
        '0x8431ee2659113aa76739b507fdfaa0bd07b450ea4dfd78919bb22d67f5f34d95': true,
        '0x8eaf7b29f02ba8d8c1d7aeb587403dcb16e2e943e4e2f5f94b0963c2386406c9': true,
        '0x7cf74de9cfcb48b680515f9137fae9fcd7071be92988e3e35089b29e715b6c07': true,
        '0x28c028a1af0fa01da5b9c46bb8d999e3e8e65b8304edc09fd8cbaef03a64cb35': true,
        '0x38e0e4e9271b14c03fc982d337c4651dd611e32aeba4d2530cc2d7edabbe7d68': true,
        '0x94bb71145cb48e1ef140744b3387504d21d8dfb4a5afa7a86a6642fb1de03541': true,
        '0xf6968c7556ab96561faf472ea9fd7bb27c5c4b8d29834c4a09654493f5742dea': true,
        '0xff8f88210d07997346e18c58f07ad4c4859a66f4a0185595122a7f81f561e234': true,
        '0x397f43e433aac18a72478d695d8ffa9713e9da2addb778726b5b4d352eb92cfc': true,
        '0x15ecb004887e8d2c55ceb542d329f411a410268e77aca53337513f0330a26185': true,
        '0x7f393a1095a134e75c0beedb880ecaa505f91a9384927e4040d894020d38c926': true,
        '0x42644ceb5bf95a2c22c85ce5766942c6caeea73db07573e0048b3e340ea9e542': true,
        '0x75514afcce6d681f80c5029f9d581e00841618c16d585bd04f8688e983dba61e': true,
        '0xaf3461ee177e8774148b0607b8644a2d5ea2abe3d17ff08c6d68cd7a8b983e59': true,
        '0xd1e844defc605ad0582899c6456b2f4d0aaded83b82bd60be576414d925e3034': true,
        '0x9a525ea0f1c21880bb34bf4eb7724524e089d1bd6583699437dbe4a92ba3509d': true,
        '0x162492d45b6fc0e8d66f20746317b8e93554b8c5dcdd196454e98a0fcde027f9': true,
        '0x80d68c092bbfd55ff1d20443b5c3366d67413bba8d98ea89f9c24fbf6942c2f2': true,
        '0xc118d50277e7334ef78fed7dc33183a5b0dd5612dc936ac8f3444371d64ffbe2': true,
        '0xc124e76fe8373c4ab7be3b53342b701cdc9b05b432ea5bba792696097df4211c': true,
        '0x000c918917765555eade0947e9f5ad0dac5782214436ed159ef36a4c164ff306': true,
      },
    },
    {
      chain: ChainNames.base,
      birthday: 1714780800, // Sat May 04 2024 00:00:00 GMT+0000
      birthblock: 13977148,
      morphoBlue: '0xbbbbbbbbbb9cc5e90e3b3af64bdaf62c37eeffcb',
      morphoFactory: '0xa9c3d3a366466fa809d1ae982fb2c46e5fc41101',
      blacklistPoolIds: {
        '0x81b51a1809ca106af13e5723e1eacd6426bf0aec6667b59f6a0cb0f54e9207aa': true,
        '0x0af29fe95ebc9c17dc82df69953f2d1be0dd5c5353db755bf5e24195b33c68e2': true,
        '0xebea88584043c222681008ba90ee8f0caebc79f11bd52067aa2ac203d49fc99c': true,
        '0xbbec7f20fcf009c0008ea3ec3975b0600165f95305f57c8befb8132b1663728f': true,
        '0xcd9b0058147cd163e99df67d67bd7298a99cd70e157e6a5e48d86db27f04c3bd': true,
      },
    },
  ],
};
