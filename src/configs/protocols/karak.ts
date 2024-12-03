import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';
import { OptimismBridgeProtocolConfig, OptimismSuperchainTokens } from './optimism';

export interface KarakVault {
  address: string;
  token: string;
}

export interface KarakChainConfig {
  chain: string;
  birthday: number;

  version: 1 | 2;

  vaults: Array<KarakVault>;
}

export interface KarakProtocolConfig extends ProtocolConfig {
  chainConfigs: Array<KarakChainConfig>;
}

export const KarakConfigs: KarakProtocolConfig = {
  protocol: ProtocolNames.karak,
  birthday: 1712361600, // Sat Apr 06 2024 00:00:00 GMT+0000
  chainConfigs: [
    {
      chain: ChainNames.ethereum,
      version: 1,
      birthday: 1712361600, // Sat Apr 06 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0x2DABcea55a12d73191AeCe59F508b191Fb68AdaC',
          token: '0xCd5fE23C85820F7B72D0926FC9b05b43E359b7ee',
        },
        {
          address: '0x1B4d88f5f38988BEA334C79f48aa69BEEeFE2e1e',
          token: '0xFAe103DC9cf190eD75350761e95403b7b8aFa6c0',
        },
        {
          address: '0xe4a8B89ba73517C83c4E3e6B3E2e8c5C536D2085',
          token: '0xbf5495Efe5DB9ce00f80364C8B423567e58d2110',
        },
        {
          address: '0x68754d29f2e97B837Cb622ccfF325adAC27E9977',
          token: '0xD9A442856C234a39a81a089C06451EBAa4306a72',
        },
        {
          address: '0x9a23e79a8E6D77F940F2C30eb3d9282Af2E4036c',
          token: '0xA1290d69c65A6Fe4DF752f95823fae25cB99e5A7',
        },
        {
          address: '0xa3726beDFD1a8AA696b9B4581277240028c4314b',
          token: '0x7f39C581F595B53c5cb19bD0b3f8dA6c935E2Ca0',
        },
        {
          address: '0x8E475A4F7820A4b6c0FF229f74fB4762f0813C47',
          token: '0xae78736Cd615f374D3085123A210448E74Fc6393',
        },
        {
          address: '0x7C22725d1E0871f0043397c9761AD99A86ffD498',
          token: '0xd5F7838F5C461fefF7FE49ea5ebaF7728bB0ADfa',
        },
        {
          address: '0xbD32b8aA6ff34BEDc447e503195Fb2524c72658f',
          token: '0xBe9895146f7AF43049ca1c1AE358B0541Ea49704',
        },
        {
          address: '0x04BB50329A1B7D943E7fD2368288b674c8180d5E',
          token: '0xa2E3356610840701BDf5611a53974510Ae27E2e1',
        },
        {
          address: '0xc585DF3a8C9ca0c614D023A812624bE36161502B',
          token: '0xf951E335afb289353dc249e82926178EaC7DEd78',
        },
        {
          address: '0x989Ab830C6e2BdF3f28214fF54C9B7415C349a3F',
          token: '0xA35b1B31Ce002FBF2058D22F30f95D405200A15b',
        },
        {
          address: '0x528190E5169dDD5FF72c40Cea6D8bA37613143AC',
          token: '0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48',
        },
        {
          address: '0xA92b60b8eFE9ac06ED65980A6d43e3f488a7f7bb',
          token: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        },
        {
          address: '0x8CE6936845b85412b4Bd7eC9458EBCB8703a326b',
          token: '0x83F20F44975D03b1b09e64809B757c47f942BEeA',
        },
        {
          address: '0x1751e1e4d2c9Fa99479C0c5574136F0dbD8f3EB8',
          token: '0xac3E018457B222d93114458476f3E3416Abbe38F',
        },
        {
          address: '0x866d8a151D978FE7f05662cE19Ae17Ff79b55874',
          token: '0xA663B02CF0a4b149d2aD41910CB81e23e1c41c32',
        },
        {
          address: '0x3d9eBe3161778C4831f6F7A6d9263F031285F976',
          token: '0x49446A0874197839D15395B908328a74ccc96Bc0',
        },
        {
          address: '0x6928e5947E5a9E8E57Da66121037c7E8dA3a5b30',
          token: '0x32bd822d615A3658A68b6fDD30c2fcb2C996D678',
        },
        {
          address: '0x51e0f3DA45eF8388FcD5F69A185DA4AEc931A538',
          token: '0xE46a5E19B19711332e33F33c2DB3eA143e86Bc10',
        },
        {
          address: '0x38Ca226e5ac5C96fd9B1f1abCad65613e2108D3E',
          token: '0xf1376bcef0f78459c0ed0ba5ddce976f1ddf51f4',
        },
        {
          address: '0xDe5Bff0755F192C333B126A449FF944Ee2B69681',
          token: '0x9d39a5de30e57443bff2a8307a4256c8797a3497',
        },
        {
          address: '0xBE3cA34D0E877A1Fc889BD5231D65477779AFf4e',
          token: '0x4c9edd5852cd905f086c759e8383e09bff1e68b3',
        },
        {
          address: '0x126d4dBf752AaF61f3eAaDa24Ab0dB84FEcf6891',
          token: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599',
        },
        {
          address: '0xB26bD8D1FD5415eED4C99f9fB6A278A42E7d1BA8',
          token: '0xfe0c30065b384f05761f15d0cc899d4f9f9cc0eb',
        },
        {
          address: '0xfa6a482BA9e4a10e6Bf4c1B13488ca5A29Cc8b2B',
          token: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
        },
        {
          address: '0x45E279fEA0aCd002EDe8e368f7278EBd89E483d0',
          token: '0xdcee70654261af21c44c093c300ed3bb97b78192',
        },
        {
          address: '0x40328669Bc9e3780dFa0141dBC87450a4af6EA11',
          token: '0xc96de26018a54d51c097160568752c4e3bd6c364',
        },
        {
          address: '0xb755b2967B6bD1f78739F7A7580D9896F19a31CA',
          token: '0x5c5b196abe0d54485975d1ec29617d42d9198326',
        },
        {
          address: '0xe4E5792E97Be983DCDc5C5876fcB754bC527EE31',
          token: '0x35d8949372d46b7a3d5a56006ae77b215fc69bc0',
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      version: 1,
      birthday: 1712361600, // Sat Apr 06 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0xD27c24Fb9c8ee7CD9de1415b8086A4072016fC9D',
          token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        },
        {
          address: '0x62A3Cb39D4D000B283A51Ed6D334d767FFbc6875',
          token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        },
        {
          address: '0xBD3a9E154c24529578412859f057247697E43Bc1',
          token: '0x5979D7b546E38E414F7E9822514be443A4800529',
        },
        {
          address: '0x39f9f640060a82C3fC2d80cbd7d90ADa3A72052a',
          token: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
        },
        {
          address: '0xC190924A68B570F943a2974d46F0D8c5E742BBcB',
          token: '0x2416092f143378750bb29b79eD961ab195CcEea5',
        },
        {
          address: '0x82718c470B640C4F7fC151206370b717EB785d98',
          token: '0x912ce59144191c1204e64559fe8253a0e49e6548',
        },
        {
          address: '0xc9A908402C7f0e343691cFB8c8Fc637449333ce0',
          token: '0x7189fb5b6504bbff6a852b13b7b82a3c118fdc27',
        },
        {
          address: '0x0A0931E73596bFfA044f332cEfC5D2a4050EB271',
          token: '0x4186bfc76e2e237523cbc30fd220fe055156b41f',
        },
      ],
    },
    {
      chain: ChainNames.karakk2,
      version: 1,
      birthday: 1712361600, // Sat Apr 06 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0x7AFAa2428c379862984A3fdF517BbeaA1487A32c',
          token: '0xa415021bC5c4C3b5B989116DC35Ae95D9C962c8D',
        },
        {
          address: '0xaeFB3Bdd7103f1F4Ce9e1F5Ead09a25cAB104342',
          token: '0x4200000000000000000000000000000000000006',
        },
        {
          address: '0xA172429884C08F4f314D19AbA38bDA944FA77000',
          token: '0xf948aACec00289Fc33D8226391f7e04bb457aD49',
        },
      ],
    },
    {
      chain: ChainNames.mantle,
      version: 1,
      birthday: 1713571200, // Sat Apr 20 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0x8529019503c5BD707d8Eb98C5C87bF5237F89135',
          token: '0xcda86a272531e8640cd7f1a92c01839911b90bb0',
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      version: 1,
      birthday: 1718064000, // Tue Jun 11 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0x6a86E52Fc7D605E0A78C467F660e3327E713784d',
          token: '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5',
        },
        {
          address: '0x8529019503c5BD707d8Eb98C5C87bF5237F89135',
          token: '0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b',
        },
        {
          address: '0x61c3d8Ca81c815F7AeB8ac058f9F1511f8d664F2',
          token: '0x4aae823a6a0b376de6a78e74ecc5b079d38cbcf7',
        },
      ],
    },
    {
      chain: ChainNames.blast,
      version: 1,
      birthday: 1719446400, // Thu Jun 27 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0x76a7B512341F1e913e903635b2dCC6c8e6af0F77',
          token: '0xb1a5700fa2358173fe465e6ea4ff52e36e88e2ad',
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      version: 2,
      birthday: 1728950400, // Tue Oct 15 2024 00:00:00 GMT+0000
      vaults: [
        {
          address: '0x1499c94A4FFe5b7e426c5347FA3542843ea9f069',
          token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        },
        {
          address: '0xd65A6DC1F91B3C579D36c97D6d7856C629e64d4e',
          token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        {
          address: '0x555B98C198281B957bA8b4AF0b56782Bd815992f',
          token: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
        },
        {
          address: '0x32535df1c079DbDDC9ba17EF4337Dd67530a41f5',
          token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        },
        {
          address: '0xC60aCE38b9Ddbd150545C753aa8D98F5DC855f4C',
          token: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
        },
        {
          address: '0xEb2E4aA269Dc5Ba5a98dA22D424947b3612205d0',
          token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        },
        {
          address: '0x0A35Ae5aB8fD3f7bA96F37A9476FDee8aB5E1268',
          token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        },
        {
          address: '0x0d1147f9877de3567Eea4f6859E0158720AB8a10',
          token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        {
          address: '0x0d1147f9877de3567Eea4f6859E0158720AB8a10',
          token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        {
          address: '0x1163D7b2eEE84241de699AF1d0832Ee89BE39013',
          token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        },
        {
          address: '0xAb6e0DC474b9934A40b0d3036Ab60068De49F3c5',
          token: '0x82aF49447D8a07e3bd95BD0d56f35241523fBab1',
        },
        {
          address: '0x4C14A8d716cc4a66c72FEC5EBF03c35Fb688a860',
          token: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
        },
        {
          address: '0x771592Dc99B2011941A7226a930D0F361F336C12',
          token: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
        },
        {
          address: '0x2b11badDE8265F09d3680b3ef8D450aD9850F409',
          token: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
        },
        {
          address: '0xb86842EE581339f5B8aC5061b5D5F6881cEC6df9',
          token: '0x35751007a407ca6FEFfE80b3cB397736D2cf4dbe',
        },
        {
          address: '0x71B7aA618D39FdAd29FE7cF65aCE2a2899F91f5d',
          token: '0x912CE59144191C1204E64559FE8253a0e49E6548',
        },
        {
          address: '0x8D3BE554c20AF629bc9C8152673Ba277E4328f0E',
          token: '0x2416092f143378750bb29b79eD961ab195CcEea5',
        },
      ],
    },
    // {
    //   chain: ChainNames.bnbchain,
    //   version: 2,
    //   birthday: 1731110400, // Sat Nov 09 2024 00:00:00 GMT+0000
    //   vaults: [
    //     {
    //       address: '0x0de272b56f360289c3eece0208921d58d293ce7f',
    //       token: '0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b',
    //     },
    //     {
    //       address: '0x362f0b792efad36d5d170c9fa8cc3463d9c1adce',
    //       token: '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5',
    //     },
    //     {
    //       address: '0x923fe0a286ba547186ed1e1b1a966c4557b65f96',
    //       token: '0x4aae823a6a0b376de6a78e74ecc5b079d38cbcf7',
    //     },
    //     {
    //       address: '0x3889b0b4ba464c07e595aa9b98b838817de39f4d',
    //       token: '0xb0b84d294e0c75a6abe60171b70edeb2efd14a1b',
    //     },
    //     {
    //       address: '0x3fb7cf13b88fd734a4dffd142bd746e734ee8cba',
    //       token: '0x0782b6d8c4551b9760e74c0545a9bcd90bdc41e5',
    //     },
    //     {
    //       address: '0xafa9dd1b693a2a899d79856b808446d859fb660f',
    //       token: '0x4aae823a6a0b376de6a78e74ecc5b079d38cbcf7',
    //     },
    //   ],
    // },
    // {
    //   chain: ChainNames.fraxtal,
    //   version: 2,
    //   birthday: 1731110400, // Sat Nov 09 2024 00:00:00 GMT+0000
    //   vaults: [
    //     {
    //       address: '0x40FbFe0b0A862323F06f5cD1EF6565Abd3F90BFe',
    //       token: '0xFc00000000000000000000000000000000000002',
    //     },
    //     {
    //       address: '0x665ab558Ef160ACa89b5D1aCDd1ab6b03d853b80',
    //       token: '0xfc00000000000000000000000000000000000008',
    //     },
    //     {
    //       address: '0x7B5Bac4F8cFd391146742fFBcD61f52fD2D338d6',
    //       token: '0xFc00000000000000000000000000000000000002',
    //     },
    //     {
    //       address: '0x22005c5C7d6Be8f2132EBA61Bb715bA8183373D9',
    //       token: '0xFc00000000000000000000000000000000000002',
    //     },
    //     {
    //       address: '0x1d6dE4f8F0e83A26f7653f746cB8653c4b1c5729',
    //       token: '0xfc00000000000000000000000000000000000008',
    //     },
    //     {
    //       address: '0x694Be44B2DdD90f7a00C242b217Da5499749B778',
    //       token: '0xFc00000000000000000000000000000000000002',
    //     },
    //     {
    //       address: '0xd4D5bCaAa476eB243116bBa3548168d964C35A08',
    //       token: '0xfc00000000000000000000000000000000000008',
    //     },
    //     {
    //       address: '0x5D30BbB074bA31fdb9c9e0D6dB665d5FE45c3479',
    //       token: '0xFc00000000000000000000000000000000000002',
    //     },
    //     {
    //       address: '0x9EE4E3E1e7CB003EF218f8283C33AF783b6dFc6B',
    //       token: '0xfc00000000000000000000000000000000000008',
    //     },
    //   ],
    // },
  ],
};

export const Karakk2NativeBridgeConfigs: OptimismBridgeProtocolConfig = {
  protocol: ProtocolNames.karakk2NativeBridge,
  birthday: 1703116800, // Thu Dec 21 2023 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  layer2Chain: ChainNames.karakk2,
  optimismPortal: '0xeeCE9CD7Abd1CC84d9dfc7493e7e68079E47eA73',
  optimismGateway: '0xBA61F25dd9f2d5f02D01B1C2c1c5F0B14c4B48A3',
  supportedTokens: OptimismSuperchainTokens,
};
