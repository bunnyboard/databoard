import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface PellNetworkStrategyConfig {
  strategy: string;
  token: string;
}

export interface PellRestakingConfig {
  chain: string;
  birthday: number;
  strategyManager: string;
  delegation: string;
  strategies: Array<PellNetworkStrategyConfig>;
}

export interface PellNetworkProtocolConfig extends ProtocolConfig {
  configs: Array<PellRestakingConfig>;
}

export const PellNetworkConfigs: PellNetworkProtocolConfig = {
  protocol: ProtocolNames.pellnetwork,
  category: ProtocolCategories.restaking,
  birthday: 1715472000, // Sun May 12 2024 00:00:00 GMT+0000
  configs: [
    {
      chain: ChainNames.ethereum,
      birthday: 1723593600, // Wed Aug 14 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0xc96de26018a54d51c097160568752c4e3bd6c364',
        },
        {
          strategy: '0x2DFc08F4FAd29761adf4cD9F1918296dC6F305C4',
          token: '0x8236a87084f8b84306f72007f36f2618a5634494',
        },
        {
          strategy: '0x8f083EaFcbba2e126AD9757639c3A1E25a061A08',
          token: '0x18084fba666a33d37592fa2633fd49a74dd93a88',
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1724198400, // Wed Aug 21 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x0a5e1Fe85BE84430c6eb482512046A04b25D2484',
          token: '0x3647c54c4c2c65bc7a2d63c0da2809b399dbbdc0',
        },
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0x2f2a2543b76a4166549f7aab2e75bef0aefc5b0f',
        },
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1728691200, // Sat Oct 12 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0xc26c9099bd3789107888c35bb41178079b282561',
        },
      ],
    },
    {
      chain: ChainNames.bitlayer,
      birthday: 1715472000, // Sun May 12 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0xff204e2681a6fa0e2c3fade68a1b28fb90e4fc5f',
        },
        {
          strategy: '0xBcF40bf27188d4d981a6063196E875245628463f',
          token: '0x93919784c523f39cacaa98ee0a9d96c3f32b593e',
        },
        {
          strategy: '0x6b5a0afeda7710dc9821855e7efd3d435ce21487',
          token: '0xf6718b2701d4a6498ef77d7c152b2137ab28b8a3',
        },
        {
          strategy: '0x57bF5B3492Fef24A4f883135CB2AAD27Ce227183',
          token: '0x9a6ae5622990ba5ec1691648c3a2872469d161f9',
        },
        {
          strategy: '0x1F6b05eb565cb596952E991Db4614A29F80e7d71',
          token: '0xc39e757dcb2b17b79a411ea1c2810735dc9032f8',
        },
        {
          strategy: '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
          token: '0xa984b70f7b41ee736b487d5f3d9c1e1026476ea3',
        },
      ],
    },
    {
      chain: ChainNames.bob,
      birthday: 1721174400, // Wed Jul 17 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0xf05a5AfC180DBB10A3E1dd29235A6151e6088cC8',
          token: '0x541FD749419CA806a8bc7da8ac23D346f2dF8B77',
        },
        {
          strategy: '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
          token: '0xCC0966D8418d412c599A6421b760a847eB169A8c',
        },
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0x03C7054BCB39f7b2e5B2c7AcB37583e32D70Cfa3',
        },
        {
          strategy: '0x0a5e1Fe85BE84430c6eb482512046A04b25D2484',
          token: '0xBBa2eF945D523C4e2608C9E1214C2Cc64D4fc2e2',
        },
        {
          strategy: '0x631ae97e24f9F30150d31d958d37915975F12ed8',
          token: '0x236f8c0a61dA474dB21B693fB2ea7AAB0c803894',
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1716940800, // Wed May 29 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x2DFc08F4FAd29761adf4cD9F1918296dC6F305C4',
          token: '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3',
        },
        {
          strategy: '0x8f083EaFcbba2e126AD9757639c3A1E25a061A08',
          token: '0x1346b618dc92810ec74163e4c27004c921d446a5',
        },
        {
          strategy: '0x4282868539C7E22B9Bc9248fd7c8196cDaeeEF13',
          token: '0x4aae823a6a0b376de6a78e74ecc5b079d38cbcf7',
        },
      ],
    },
    {
      chain: ChainNames.bsquared,
      birthday: 1718409600, // Sat Jun 15 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
          token: '0xBFb4B5F54Ef69692Bb36963fA846e8855D73DBC0',
        },
        {
          strategy: '0x4282868539C7E22B9Bc9248fd7c8196cDaeeEF13',
          token: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
        },
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0x796e4D53067FF374B89b2Ac101ce0c1f72ccaAc2',
        },
        {
          strategy: '0xf05a5AfC180DBB10A3E1dd29235A6151e6088cC8',
          token: '0xe85411C030fB32A9D8b14Bbbc6CB19417391F711',
        },
        {
          strategy: '0x631ae97e24f9F30150d31d958d37915975F12ed8',
          token: '0xf6718b2701D4a6498eF77D7c152b2137Ab28b8A3',
        },
      ],
    },
    {
      chain: ChainNames.core,
      birthday: 1719792000, // Mon Jul 01 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x6FF890b47ebaA297D1aa2AcE17f1e989462eB5fa',
          token: '0x5b1fb849f1f76217246b8aaac053b5c7b15b7dc3',
        },
        {
          strategy: '0x5F42E359cC166D79e0468F3439F952c115984286',
          token: '0xe04d21d999faedf1e72ade6629e20a11a1ed14fa',
        },
        {
          strategy: '0x93c76cc2b322E66C99ac482a6BAE9B34bF49F67e',
          token: '0xbb4a26a053b217bb28766a4ed4b062c3b4de58ce',
        },
        {
          strategy: '0x25B737513fD2588f2b0Ffc8Dee06d2B999f7E595',
          token: '0x782e2b85fda9a8224c17b191fc5de1e085a962b2',
        },
        {
          strategy: '0x4642De2853A9F9dB3080F51CdA267f1e9C900971',
          token: '0x000734cf9e469bad78c8ec1b0deed83d0a03c1f8',
        },
        {
          strategy: '0xe049552410c7a533dD1eaeDaE20b527a51d343E6',
          token: '0x70727228db8c7491bf0ad42c180dbf8d95b257e2',
        },
      ],
    },
    {
      chain: ChainNames.mantle,
      birthday: 1720828800, // Sat Jul 13 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x0a5e1Fe85BE84430c6eb482512046A04b25D2484',
          token: '0xc96de26018a54d51c097160568752c4e3bd6c364',
        },
        {
          strategy: '0xCf464Ecc9a295eDd53C1C3832fC41c2Bc394A474',
          token: '0xC75D7767F2EdFbc6a5b18Fc1fA5d51ffB57c2B37',
        },
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0xcabae6f6ea1ecab08ad02fe02ce9a44f09aebfa2',
        },
        {
          strategy: '0x8f083EaFcbba2e126AD9757639c3A1E25a061A08',
          token: '0x93919784c523f39cacaa98ee0a9d96c3f32b593e',
        },
      ],
    },
    {
      chain: ChainNames.merlin,
      birthday: 1724889600, // Thu Aug 29 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x0a5e1Fe85BE84430c6eb482512046A04b25D2484',
          token: '0x41D9036454BE47d3745A823C4aaCD0e29cFB0f71',
        },
        {
          strategy: '0xC5346e7cDF1DCBBe06aA93BD0415c7Ba337B6Bc0',
          token: '0x1760900aCA15B90Fa2ECa70CE4b4EC441c2CF6c5',
        },
        {
          strategy: '0x2F3560fD19D2693Cb340C07f4f8aF6B036210816',
          token: '0x88c618B2396C1A11A6Aabd1bf89228a08462f2d2',
        },
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0xB880fd278198bd590252621d4CD071b1842E9Bcd',
        },
        {
          strategy: '0xA68ac746490049Fb7484bFa759c6aEec1dcE0870',
          token: '0x93919784C523f39CACaa98Ee0a9d96c3F32b593e',
        },
        {
          strategy: '0xf05a5AfC180DBB10A3E1dd29235A6151e6088cC8',
          token: '0xF5b689D772e4Bd839AD9247A326A21a0A74a07f0',
        },
        {
          strategy: '0x6f0AfADE16BFD2E7f5515634f2D0E3cd03C845Ef',
          token: '0xC39E757dCb2b17B79A411eA1C2810735dc9032F8',
        },
        {
          strategy: '0x631ae97e24f9F30150d31d958d37915975F12ed8',
          token: '0xA984b70f7B41EE736B487D5F3D9C1e1026476Ea3',
        },
      ],
    },
    {
      chain: ChainNames.scroll,
      birthday: 1721174400, // Wed Jul 17 2024 00:00:00 GMT+0000
      strategyManager: '0x00B67E4805138325ce871D5E27DC15f994681bC1',
      delegation: '0x230B442c0802fE83DAf3d2656aaDFD16ca1E1F66',
      strategies: [
        {
          strategy: '0x92D374dd17F8416c8129f5Efa81f28E0926a60B7',
          token: '0x3Ba89d490AB1C0c9CC2313385b30710e838370a4',
        },
      ],
    },
    {
      chain: ChainNames.zksync,
      birthday: 1727481600, // Sat Sep 28 2024 00:00:00 GMT+0000
      strategyManager: '0xD05f8d7e1CD77115BbCD17887c9cE37f60Da2CBc',
      delegation: '0x81a0B0b4E4f0cd7A6959729100a8C0bacCDD5286',
      strategies: [
        {
          strategy: '0xbcBB92fD6E154E6F553c2DCcF0729Ec57E0433Cf',
          token: '0xbbeb516fb02a01611cbbe0453fe3c580d7281011',
        },
        {
          strategy: '0xCed08f1557B431Be617601BEaEd5A4b632D50CF4',
          token: '0xED0c95EBe5a3E687cB2224687024FeC6518E683e',
        },
      ],
    },
  ],
};
