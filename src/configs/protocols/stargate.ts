import { ProtocolConfig } from '../../types/base';
import { AddressZero } from '../constants';
import { ChainNames, ProtocolNames } from '../names';

// https://stargateprotocol.gitbook.io/stargate/developers/chain-ids
// https://docs.layerzero.network/v2/developers/evm/technical-reference/deployed-contracts
export const StargateChainIds: { [key: number]: string } = {
  101: ChainNames.ethereum,
  30101: ChainNames.ethereum,
  102: ChainNames.bnbchain,
  30102: ChainNames.bnbchain,
  106: ChainNames.avalanche,
  30106: ChainNames.avalanche,
  109: ChainNames.polygon,
  30109: ChainNames.polygon,
  110: ChainNames.arbitrum,
  30110: ChainNames.arbitrum,
  111: ChainNames.optimism,
  30111: ChainNames.optimism,
  112: ChainNames.fantom,
  30112: ChainNames.fantom,
  151: ChainNames.metis,
  30151: ChainNames.metis,
  177: ChainNames.kava,
  30177: ChainNames.kava,
  181: ChainNames.mantle,
  30181: ChainNames.mantle,
  183: ChainNames.linea,
  30183: ChainNames.linea,
  184: ChainNames.base,
  30184: ChainNames.base,
  30214: ChainNames.scroll,
  30211: ChainNames.aurora,
  30150: ChainNames.kaia,
  30290: ChainNames.taiko,
  30235: ChainNames.rari,
  30284: ChainNames.iotaevm,
  30280: ChainNames.seievm,
  30295: ChainNames.flare,
  30294: ChainNames.gravity,
  30339: ChainNames.ink,
  30324: ChainNames.abstract,
  30340: ChainNames.soneium,
  30362: ChainNames.berachain,
  30325: ChainNames.movement,
};

export interface StargateBridgeConfig {
  chain: string;
  birthday: number;
  version: 1 | 2;
  pools: Array<{
    address: string;
    token: string;
    nativeVault?: string;
  }>;
}

export interface StargateProtocolConfig extends ProtocolConfig {
  bridgeConfigs: Array<StargateBridgeConfig>;
}

export const StargateConfigs: StargateProtocolConfig = {
  protocol: ProtocolNames.stargate,
  birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
  bridgeConfigs: [
    // version 1
    {
      chain: ChainNames.ethereum,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0x101816545F6bd2b1076434B54383a1E633390A2E',
          token: AddressZero, // ETH
          nativeVault: '0x72E2F4830b9E45d52F80aC08CB2bEC0FeF72eD9c',
        },
        {
          address: '0xdf0770dF86a8034b3EFEf0A1Bb3c889B8332FF56',
          token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        {
          address: '0x38ea452219524bb87e18de1c24d3bb59510bd783',
          token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        {
          address: '0x692953e758c3669290cb1677180c64183cEe374e',
          token: '0x0C10bF8FcB7Bf5412187A595ab97a3609160b5c6',
        },
        {
          address: '0x0Faf1d2d3CED330824de3B8200fc8dc6E397850d',
          token: '0x6b175474e89094c44da98b954eedeac495271d0f',
        },
        {
          address: '0xfA0F307783AC21C39E939ACFF795e27b650F6e68',
          token: '0x853d955acef822db058eb8505911ed77f175b99e',
        },
        {
          address: '0x590d4f8A68583639f215f675F3a259Ed84790580',
          token: '0x57ab1ec28d129707052df4df418d58a2d46d5f51',
        },
        {
          address: '0xE8F55368C82D38bbbbDb5533e7F56AfC2E978CC2',
          token: '0x5f98805A4E8be255a32880FDeC7F6728C6568bA0',
        },
        {
          address: '0x9cef9a0b1be0d289ac9f4a98ff317c33eaa84eb8',
          token: '0x8D6CeBD76f18E1558D4DB88138e2DeFB3909fAD6',
        },
        {
          address: '0xd8772edBF88bBa2667ed011542343b0eDDaCDa47',
          token: '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e',
        },
        {
          address: '0x430Ebff5E3E80A6C58E7e6ADA1d90F5c28AA116d',
          token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        {
          address: '0xa572d137666dcbadfa47c3fc41f15e90134c618c',
          token: '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0x9aA83081AA06AF7208Dcc7A4cB72C94d057D2cda',
          token: '0x55d398326f99059ff775485246999027b3197955',
        },
        {
          address: '0x98a5737749490856b401DB5Dc27F522fC314A4e1',
          token: '0xe9e7cea3dedca5984780bafc599bd69add087d56',
        },
        {
          address: '0x4e145a589e4c03cBe3d28520e4BF3089834289Df',
          token: '0xd17479997F34dd9156Deef8F95A52D81D265be9c',
        },
        {
          address: '0x7BfD7f2498C4796f10b6C611D9db393D3052510C',
          token: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
        },
        {
          address: '0x68C6c27fB0e02285829e69240BE16f32C5f8bEFe',
          token: '0x55d398326f99059ff775485246999027b3197955',
        },
      ],
    },
    {
      chain: ChainNames.avalanche,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
          token: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        },
        {
          address: '0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c',
          token: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        },
        {
          address: '0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea',
          token: '0xD24C2Ad096400B6FBcd2ad8B24E7acBc21A1da64',
        },
        {
          address: '0x8736f92646B2542B3e5F3c63590cA7Fe313e283B',
          token: '0x5c49b268c9841AFF1Cc3B0a418ff5c3442eE3F3b',
        },
        {
          address: '0xEAe5c2F6B25933deB62f754f239111413A0A25ef',
          token: '0x9702230A8Ea53601f5cD2dc00fDBc13d4dF4A8c7',
        },
      ],
    },
    {
      chain: ChainNames.polygon,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0x1205f31718499dBf1fCa446663B532Ef87481fe1',
          token: '0x2791bca1f2de4661ed88a30c99a7a9449aa84174',
        },
        {
          address: '0x29e38769f23701A2e4A8Ef0492e19dA4604Be62c',
          token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        },
        {
          address: '0x1c272232Df0bb6225dA87f4dEcD9d37c32f63Eea',
          token: '0x8f3cf7ad23cd3cadbd9735aff958023239c6a063',
        },
        {
          address: '0x8736f92646B2542B3e5F3c63590cA7Fe313e283B',
          token: '0xa3fa99a148fa48d14ed51d610c367c61876997f1',
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0x915A55e36A01285A14f05dE6e81ED9cE89772f8e',
          token: AddressZero,
          nativeVault: '0x82cbecf39bee528b5476fe6d1550af59a9db6fc0',
        },
        {
          address: '0x892785f33CdeE22A30AEF750F285E18c18040c3e',
          token: '0xff970a61a04b1ca14834a43f5de4533ebddb5cc8',
        },
        {
          address: '0xB6CfcF89a7B22988bfC96632aC2A9D6daB60d641',
          token: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        },
        {
          address: '0xaa4BF442F024820B2C28Cd0FD72b82c63e66F56C',
          token: '0x17fc002b466eec40dae837fc4be5c67993ddbd6f',
        },
        {
          address: '0xF39B7Be294cB36dE8c510e267B82bb588705d977',
          token: '0x3F56e0c36d275367b8C502090EDF38289b3dEa0d',
        },
        {
          address: '0x600E576F9d853c95d58029093A16EE49646F3ca5',
          token: '0x93b346b6bc2548da6a1e7d98e9a421b42541425b',
        },
      ],
    },
    {
      chain: ChainNames.optimism,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0xd22363e3762cA7339569F3d33EADe20127D5F98C',
          token: AddressZero,
          nativeVault: '0xb69c8cbcd90a39d8d3d3ccf0a3e968511c3856a0',
        },
        {
          address: '0xDecC0c09c3B5f6e92EF4184125D5648a66E35298',
          token: '0x7f5c764cbc14f9669b88837ca1490cca17c31607',
        },
        {
          address: '0x165137624F1f692e69659f944BF69DE02874ee27',
          token: '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        },
        {
          address: '0x368605D9C6243A80903b9e326f1Cddde088B8924',
          token: '0x2e3d870790dc77a83dd1d18184acc7439a53f475',
        },
        {
          address: '0x2F8bC9081c7FCFeC25b9f41a50d97EaA592058ae',
          token: '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
        },
        {
          address: '0x3533F5e279bDBf550272a199a223dA798D9eff78',
          token: '0xc40f949f8a4e094d1b49a23ea9241d289b7b2819',
        },
        {
          address: '0x5421FA1A48f9FF81e4580557E86C7C0D24C18036',
          token: '0xdfa46478f9e5ea86d57387849598dbfb2e964b02',
        },
      ],
    },
    {
      chain: ChainNames.fantom,
      version: 1,
      birthday: 1647561600, // Fri Mar 18 2022 00:00:00 GMT+0000
      pools: [
        {
          address: '0xc647ce76ec30033aa319d472ae9f4462068f2ad7',
          token: '0x28a92dde19D9989F39A49905d7C9C2FAc7799bDf',
        },
      ],
    },
    {
      chain: ChainNames.base,
      version: 1,
      birthday: 1690243200, // Tue Jul 25 2023 00:00:00 GMT+0000
      pools: [
        {
          address: '0x28fc411f9e1c480AD312b3d9C60c22b965015c6B',
          token: AddressZero,
          nativeVault: '0x224D8Fd7aB6AD4c6eb4611Ce56EF35Dec2277F03',
        },
        {
          address: '0x4c80e24119cfb836cdf0a6b53dc23f04f7e652ca',
          token: '0xd9aaec86b65d86f6a7b5b1b0c42ffa531710b6ca',
        },
      ],
    },
    {
      chain: ChainNames.linea,
      version: 1,
      birthday: 1690243200, // Tue Jul 25 2023 00:00:00 GMT+0000
      pools: [
        {
          address: '0xAad094F6A75A14417d39f04E690fC216f080A41a',
          token: AddressZero,
          nativeVault: '0x224d8fd7ab6ad4c6eb4611ce56ef35dec2277f03',
        },
      ],
    },
    {
      chain: ChainNames.kava,
      version: 1,
      birthday: 1692144000, // Wed Aug 16 2023 00:00:00 GMT+0000
      pools: [
        {
          address: '0xAad094F6A75A14417d39f04E690fC216f080A41a',
          token: '0x919C1c267BC06a7039e03fcc2eF738525769109c',
        },
      ],
    },
    {
      chain: ChainNames.mantle,
      version: 1,
      birthday: 1700006400, // Wed Nov 15 2023 00:00:00 GMT+0000
      pools: [
        {
          address: '0xAad094F6A75A14417d39f04E690fC216f080A41a',
          token: '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9',
        },
        {
          address: '0xf52b354FFDB323E0667E87a0136040e3e4D9dF33',
          token: '0xcda86a272531e8640cd7f1a92c01839911b90bb0',
        },
        {
          address: '0x2b60473a7C41Deb80EDdaafD5560e963440eb632',
          token: '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae',
        },
      ],
    },

    // version 2
    {
      chain: ChainNames.ethereum,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x77b2043768d28E9C9aB44E1aBfC95944bcE57931',
          token: AddressZero,
        },
        {
          address: '0xc026395860Db2d07ee33e05fE50ed7bD583189C7',
          token: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
        },
        {
          address: '0x933597a323Eb81cAe705C5bC29985172fd5A3973',
          token: '0xdac17f958d2ee523a2206206994597c13d831ec7',
        },
        {
          address: '0xcDafB1b2dB43f366E48e6F614b8DCCBFeeFEEcD3',
          token: '0x9e32b13ce7f2e80a01932b42553652e053d6ed8e',
        },
        {
          address: '0x268Ca24DAefF1FaC2ed883c598200CcbB79E931D',
          token: '0xd5f7838f5c461feff7fe49ea5ebaf7728bb0adfa',
        },
      ],
    },
    {
      chain: ChainNames.bnbchain,
      version: 2,
      birthday: 1722556800, // Fri Aug 02 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x962Bd449E630b0d928f308Ce63f1A21F02576057',
          token: '0x8ac76a51cc950d9822d68b83fe1ad97b32cd580d',
        },
        {
          address: '0x138EB30f73BC423c6455C53df6D89CB01d9eBc63',
          token: '0x55d398326f99059ff775485246999027b3197955',
        },
      ],
    },
    {
      chain: ChainNames.avalanche,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x5634c4a5FEd09819E3c46D86A965Dd9447d86e47',
          token: '0xb97ef9ef8734c71904d8002f8b6bc66dd9c48a6e',
        },
        {
          address: '0x12dC9256Acc9895B076f6638D628382881e62CeE',
          token: '0x9702230a8ea53601f5cd2dc00fdbc13d4df4a8c7',
        },
      ],
    },
    {
      chain: ChainNames.polygon,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x9Aa02D4Fae7F58b8E8f34c66E756cC734DAc7fe4',
          token: '0x3c499c542cEF5E3811e1192ce70d8cC03d5c3359',
        },
        {
          address: '0xd47b03ee6d86Cf251ee7860FB2ACf9f91B9fD4d7',
          token: '0xc2132d05d31c914a87c6611c10748aeb04b58e8f',
        },
      ],
    },
    {
      chain: ChainNames.arbitrum,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0xA45B5130f36CDcA45667738e2a258AB09f4A5f7F',
          token: AddressZero,
        },
        {
          address: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
          token: '0xaf88d065e77c8cc2239327c5edb3a432268e5831',
        },
        {
          address: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
          token: '0xfd086bc7cd5c481dcc9c85ebe478a1c0b69fcbb9',
        },
      ],
    },
    {
      chain: ChainNames.optimism,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0xe8CDF27AcD73a434D661C84887215F7598e7d0d3',
          token: AddressZero,
        },
        {
          address: '0xcE8CcA271Ebc0533920C83d39F417ED6A0abB7D0',
          token: '0x0b2c639c533813f4aa9d7837caf62653d097ff85',
        },
        {
          address: '0x19cFCE47eD54a88614648DC3f19A5980097007dD',
          token: '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        },
      ],
    },
    {
      chain: ChainNames.base,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0xdc181Bd607330aeeBEF6ea62e03e5e1Fb4B6F7C7',
          token: AddressZero,
        },
        {
          address: '0x27a16dc786820B16E5c9028b75B99F6f604b5d26',
          token: '0x833589fcd6edb6e08f4c7c32d4f71b54bda02913',
        },
      ],
    },
    {
      chain: ChainNames.linea,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x81F6138153d473E8c5EcebD3DC8Cd4903506B075',
          token: AddressZero,
        },
      ],
    },
    {
      chain: ChainNames.metis,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0xD9050e7043102a0391F81462a3916326F86331F0',
          token: '0xDeadDeAddeAddEAddeadDEaDDEAdDeaDDeAD0000',
        },
        {
          address: '0x36ed193dc7160D3858EC250e69D12B03Ca087D08',
          token: '0x420000000000000000000000000000000000000A',
        },
        {
          address: '0x4dCBFC0249e8d5032F89D6461218a9D2eFff5125',
          token: '0xbB06DCA3AE6887fAbF931640f67cab3e3a16F4dC',
        },
      ],
    },
    {
      chain: ChainNames.mantle,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x4c1d3Fc3fC3c177c3b633427c2F769276c547463',
          token: '0xdeaddeaddeaddeaddeaddeaddeaddeaddead1111',
        },
        {
          address: '0xAc290Ad4e0c891FDc295ca4F0a6214cf6dC6acDC',
          token: '0x09bc4e0d864854c6afb6eb9a9cdf58ac190d0df9',
        },
        {
          address: '0xB715B85682B731dB9D5063187C450095c91C57FC',
          token: '0x201eba5cc46d216ce6dc03f6a759e8e766e956ae',
        },
        {
          address: '0xF7628d84a2BbD9bb9c8E686AC95BB5d55169F3F1',
          token: '0xcda86a272531e8640cd7f1a92c01839911b90bb0',
        },
      ],
    },
    {
      chain: ChainNames.kava,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0x41A5b0470D96656Fb3e8f68A218b39AdBca3420b',
          token: '0x919C1c267BC06a7039e03fcc2eF738525769109c',
        },
      ],
    },
    {
      chain: ChainNames.scroll,
      version: 2,
      birthday: 1716854400, // Tue May 28 2024 00:00:00 GMT+0000
      pools: [
        {
          address: '0xC2b638Cb5042c1B3c5d5C969361fB50569840583',
          token: AddressZero,
        },
        {
          address: '0x3Fc69CC4A842838bCDC9499178740226062b14E4',
          token: '0x06efdbff2a14a7c8e15944d1f4a48f9f95f663a4',
        },
      ],
    },
    {
      chain: ChainNames.abstract,
      version: 2,
      birthday: 1736899200, // Wed Jan 15 2025 00:00:00 GMT+0000
      pools: [
        {
          address: '0x221F0E1280Ec657503ca55c708105F1e1529527D',
          token: AddressZero,
        },
        {
          address: '0x91a5Fe991ccB876d22847967CEd24dCd7A426e0E',
          token: '0x84a71ccd554cc1b02749b35d22f684cc8ec987e1',
        },
        {
          address: '0x943C484278b8bE05D119DfC73CfAa4c9D8f11A76',
          token: '0x0709f39376deee2a2dfc94a58edeb2eb9df012bd',
        },
      ],
    },
    {
      chain: ChainNames.soneium,
      version: 2,
      birthday: 1737676800, // Fri Jan 24 2025 00:00:00 GMT+0000
      pools: [
        {
          address: '0x2F6F07CDcf3588944Bf4C42aC74ff24bF56e7590',
          token: AddressZero,
        },
        {
          address: '0x45f1A95A4D3f3836523F5c83673c797f4d4d263B',
          token: '0xba9986d2381edf1da03b0b9c1f8b00dc4aacc369',
        },
      ],
    },
    // {
    //   chain: ChainNames.taiko,
    //   version: 2,
    //   birthday: 1718409600, // Sat Jun 15 2024 00:00:00 GMT+0000
    //   pools: [
    //     {
    //       address: '0x77C71633C34C3784ede189d74223122422492a0f',
    //       token: '0x19e26B0638bf63aa9fa4d14c6baF8D52eBE86C5C',
    //     },
    //     {
    //       address: '0x1C10CC06DC6D35970d1D53B2A23c76ef370d4135',
    //       token: '0x9c2dc7377717603eB92b2655c5f2E7997a4945BD',
    //     },
    //   ]
    // },
  ],
};
