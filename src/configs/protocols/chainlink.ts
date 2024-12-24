import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ChainlinkCcipConfig {
  chain: string;
  birthday: number;
  outbound: {
    // chain => contract address
    [key: string]: string;
  };
}

export interface ChainlinkCcipProtocolConfig extends ProtocolConfig {
  configs: Array<ChainlinkCcipConfig>;
}

export const ChainlinkCcipConfigs: ChainlinkCcipProtocolConfig = {
  protocol: ProtocolNames.chainlinkccip,
  birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
  configs: [
    {
      chain: ChainNames.ethereum,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x69eCC4E2D8ea56E2d0a05bF57f4Fd6aEE7f2c284',
        [ChainNames.avalanche]: '0xaFd31C0C78785aDF53E4c185670bfd5376249d8A',
        [ChainNames.bsquared]: '0xddF4b4aF7A9603869C90189EFa8826683D0D234b',
        [ChainNames.base]: '0xb8a882f3B88bd52D1Ff56A873bfDB84b70431937',
        [ChainNames.blast]: '0x6751cA96b769129dFE6eB8E349c310deCEDb4e36',
        [ChainNames.bnbchain]: '0x948306C220Ac325fa9392A6E601042A3CD0b480d',
        [ChainNames.celo]: '0x741599d9a5a1bfC40A22f530fbCd85E2718e9F90',
        [ChainNames.gnosis]: '0xf50B9A46C394bD98491ce163d420222d8030F6F0',
        [ChainNames.linea]: '0x626189C882A80fF0D036d8D9f6447555e81F78E9',
        [ChainNames.mantle]: '0x70B2b3430c41bA19E20F57Cae23c3C619CbCA65D',
        [ChainNames.metis]: '0x75d536eED32f4c8Bb39F4B0c992163f5BA49B84e',
        [ChainNames.mode]: '0xeA6d4a24B262aB3e61a8A62f018A30beCD086f82',
        [ChainNames.optimism]: '0x3455D8E039736944e66e19eAc77a42e8077B07bf',
        [ChainNames.polygon]: '0x15a9D79d6b3485F70bF82bC49dDD1fcB37A7149c',
        [ChainNames.ronin]: '0xdC5b578ff3AFcC4A4a6E149892b9472390b50844',
        [ChainNames.scroll]: '0x362A221C3cfd7F992DFE221687323F0BA9BA8187',
        [ChainNames.zksync]: '0x362A221C3cfd7F992DFE221687323F0BA9BA8187',
      },
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.avalanche]: '0xe80cC83B895ada027b722b78949b296Bd1fC5639',
        [ChainNames.base]: '0xc1b6287A3292d6469F2D8545877E40A2f75CA9a6',
        [ChainNames.blast]: '0xc5490997680a39A1b4684ce2b668AE8A2eBEC7ee',
        [ChainNames.bnbchain]: '0x14bF7b1Ca6b843f386bfDfa76BFd439919b9378D',
        [ChainNames.ethereum]: '0x67761742ac8A21Ec4D76CA18cbd701e5A6F3Bef3',
        [ChainNames.gnosis]: '0xc7d6B885d8A4286E6311F79227430b7862311cd3',
        [ChainNames.linea]: '0xCeAB512ed28727EeAB94698281F38A2c04b0ce78',
        [ChainNames.metis]: '0xF1e73c37CDa8E47768De2246AEf5eFD4d76330ae',
        [ChainNames.mode]: '0xd236ea4DDE7de1e594021764E2f6Cd8e8cD7F047',
        [ChainNames.optimism]: '0xAFECc7b67c6a8e606e94ce4e2F70D83C2206C2cb',
        [ChainNames.polygon]: '0x6087d6C33946670232DF09Fe93eECbaEa3D6864d',
        [ChainNames.zksync]: '0xd67F6713Fa4448548c984a9a7DCFBD13B0fB78D6',
      },
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x4e910c8Bbe88DaDF90baa6c1B7850DbeA32c5B29',
        [ChainNames.base]: '0x139D4108C23e66745Eda4ab47c25C83494b7C14d',
        [ChainNames.bnbchain]: '0xe6e161d55019AA5960DcF0Af9bB6e4d574C69F99',
        [ChainNames.ethereum]: '0xe8784c29c583C52FA89144b9e5DD91Df2a1C2587',
        [ChainNames.gnosis]: '0x38fd0DF16F6fD0a2C3Ec6615c73e50F5d027b8bA',
        [ChainNames.linea]: '0xc432b86153Eb64D46ecea00591EE7CBc27538c4b',
        [ChainNames.optimism]: '0x3e3b4Fba004E7824219e79aE9f676d9D41A216Fa',
        [ChainNames.polygon]: '0x5570a4E979d7460F13b84075ACEF69FAc73914b1',
      },
    },
    {
      chain: ChainNames.bsquared,
      birthday: 1731542400, // Thu Nov 14 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.ethereum]: '0xB1C908A7CF6f5FB1ed18a73aD60ffF9CC8276eC1',
      },
    },
    {
      chain: ChainNames.base,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x9D0ffA76C7F82C34Be313b5bFc6d42A72dA8CA69',
        [ChainNames.avalanche]: '0x4be6E0F97EA849FF80773af7a317356E6c646FD7',
        [ChainNames.blast]: '0x9A59832b85217C20b17a990A45BD5d0F3de36266',
        [ChainNames.bnbchain]: '0xE5FD5A0ec3657Ad58E875518e73F6264E00Eb754',
        [ChainNames.ethereum]: '0x56b30A0Dcd8dc87Ec08b80FA09502bAB801fa78e',
        [ChainNames.gnosis]: '0xDcFB24AEbcB9Edfb6746a045DDcae402381F984B',
        [ChainNames.linea]: '0xB1ddDDe9C1e88DF7751f8f2cf18569B13C8AF670',
        [ChainNames.mode]: '0xEB50Fc6F57AAc6bf060A2Dfc6479fED592e6e184',
        [ChainNames.optimism]: '0x362E6bE957c18e268ad91046CA6b47EB09AD98C1',
        [ChainNames.polygon]: '0xd3Bde678BB706Cf727A512515C254BcF021dD203',
        [ChainNames.ronin]: '0x5dE068a87f081Ea01932769807CA569265E4f622',
      },
    },
    {
      chain: ChainNames.blast,
      birthday: 1717200000, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x28f7E57cEE31241B4B8B72e6b710c4dC2e9bEb28',
        [ChainNames.base]: '0xAbBC1fC0C919ecFb0220e90749111e0619abf79A',
        [ChainNames.bnbchain]: '0x01D1A2Ed2053e410177f8E762aF635ee78b7a581',
        [ChainNames.ethereum]: '0xEa8112530cA10945C2aA976f8F615582Af9B70fa',
      },
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x5577c19bD183e39a007ce4CE236f1D91e9132D5c',
        [ChainNames.avalanche]: '0x43F00dBf0Aa61A099c674A74FBdCb93786564950',
        [ChainNames.base]: '0xdABb6De5eC48dd2fcF28ac85CbEFe3F19E03F1BD',
        [ChainNames.blast]: '0x0b7Bfe549F26AF4B6aA5246CB3FD96C8a5c23a68',
        [ChainNames.ethereum]: '0x35C724666ba31632A56Bad4390eb69f206ab60C7',
        [ChainNames.gnosis]: '0x83AC865c2E18f2CDc1d10126987FfC465e11c0DF',
        [ChainNames.linea]: '0x86768B77C971524D5042631749A59527E8a9604d',
        [ChainNames.mode]: '0x9d4d125788A548C2f69fAC7f8C3A64FA21d18C9e',
        [ChainNames.optimism]: '0x3A3649852A518ab180f41f28288c6c9184563616',
        [ChainNames.polygon]: '0x1C88e3Fd2B0a8735D1b19A77AA6e2333555BB95c',
      },
    },
    {
      chain: ChainNames.celo,
      birthday: 1715040000, // Tue May 07 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.ethereum]: '0xc319484eF6cdA3a7f4D470e660b343FB569e9A1e',
      },
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1710460800, // Fri Mar 15 2024 00:00:00 GMT+00000
      outbound: {
        [ChainNames.arbitrum]: '0x140E6D5ba903F684944Dd27369d767DdEf958c9B',
        [ChainNames.avalanche]: '0xB707a6D1d32CE99D5c669DeE71D30d25a066D32c',
        [ChainNames.base]: '0xAAb6D9fc00aAc37373206e91789CcDE1E851b3E4',
        [ChainNames.bnbchain]: '0xb485634dd2E545091722b9d4843d3644addf97e3',
        [ChainNames.ethereum]: '0x014ABcfDbCe9F67d0Df34574664a6C0A241Ec03A',
        [ChainNames.optimism]: '0x9379b446fcA75CA57834a4dA33f64ae317Be05e4',
        [ChainNames.polygon]: '0xD7a49AfEA62E77Ad6BEB2ed64673026271aae188',
      },
    },
    {
      chain: ChainNames.linea,
      birthday: 1715040000, // Tue May 07 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x6d297Db3471057D7d014D7100A073de2e2656b8F',
        [ChainNames.avalanche]: '0x03dD4319019435D8FD5aE5920B96f37989EA410e',
        [ChainNames.base]: '0x39ee3A92a5E836eD5a3CceB6B6F00481B5093b3e',
        [ChainNames.bnbchain]: '0xd0F398854358f8846596C78f8363F3d182e77cC8',
        [ChainNames.ethereum]: '0x69AbB6043BBEA2467f41CCD0144d1b3b4ECd20f4',
        [ChainNames.scroll]: '0x30ebb71dAa827bEAE71EE325A77Ca47dAED7Ec9B',
      },
    },
    {
      chain: ChainNames.mantle,
      birthday: 1729036800, // Wed Oct 16 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.ethereum]: '0xa18BC8b64a863DB34199F7e59F3A3d051ABa413d',
      },
    },
    {
      chain: ChainNames.metis,
      birthday: 1718323200, // Fri Jun 14 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x8d3039fE2400151c06Ae84a18CAf38dD9b6Ce58b',
        [ChainNames.ethereum]: '0xdF5394c57A0570ECe45DE0c0fA2e722A672B9198',
      },
    },
    {
      chain: ChainNames.mode,
      birthday: 1716595200, // Sat May 25 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0xb2e694efcDa0aeB81700019c3047F92fC3bb520E',
        [ChainNames.base]: '0x347A070EA1B04bc2b4A8f14320688C277022C90e',
        [ChainNames.bnbchain]: '0xeb7E8c40E95Cd31666359AaeB1F2CccaAB935643',
        [ChainNames.ethereum]: '0x7d2aF78868993a5a86676BA639eC0412709707D9',
        [ChainNames.optimism]: '0x7AB4329D19A0255DA90Ee8dbAA60f8f0cB7950C1',
      },
    },
    {
      chain: ChainNames.optimism,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x6bA81b83091A23e8F2AA173B2b939fAf9E320DfB',
        [ChainNames.avalanche]: '0xB9D655Ad5ba80036725d6c753Fa6AF0454cBF630',
        [ChainNames.base]: '0xfE11cfC957cCa331192EAC60040b442303CcA0a9',
        [ChainNames.bnbchain]: '0xfC51a4CF925f202d86c6092cda879689d2C17201',
        [ChainNames.ethereum]: '0xE4C51Dc01A4E0aB14c7a7a2ed1655E9CF8A3E698',
        [ChainNames.gnosis]: '0x604a9dda2e27D56cfCe457E437a61f4ED0De9dE6',
        [ChainNames.mode]: '0xc6d9Cb39e34D83d21A021504024887A0e96D4e94',
        [ChainNames.polygon]: '0x9c725164b60E3f6d4d5b7A2841C63E9FD0988805',
      },
    },
    {
      chain: ChainNames.polygon,
      birthday: 1700611200, // Wed Nov 22 2023 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x13263aC754d1e29430930672E3C0019f2BC44Ba2',
        [ChainNames.avalanche]: '0x56cb9Cd82553Bd8157e6504020c38f6DA4971717',
        [ChainNames.base]: '0xD26A4E0c664E72e3c29E634867191cB1cb9AF570',
        [ChainNames.bnbchain]: '0x164507757F7d5Ab35C6af44EeEB099F5be29Da57',
        [ChainNames.ethereum]: '0x1DAcBae00c779913e6E9fc1A3323FbA4847ba53C',
        [ChainNames.gnosis]: '0xcc4A8CFd756895d91B476Dd5461286b300914aBf',
        [ChainNames.optimism]: '0x868B71490B36674B3B9006fa8711C6fA26A26631',
      },
    },
    {
      chain: ChainNames.ronin,
      birthday: 1730419200, // Fri Nov 01 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.base]: '0x261fE8A0C492a1Ede8cf966AED16619C772198F5',
        [ChainNames.ethereum]: '0x02b60267bceeaFDC45005e0Fa0dd783eFeBc9F1b',
      },
    },
    {
      chain: ChainNames.scroll,
      birthday: 1725667200, // Sat Sep 07 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.ethereum]: '0x28cCF73F7982c1786b84e243FFbD47F4fB8ae43d',
        [ChainNames.linea]: '0x05d472b114D57E6035089A58Fa997A7940D29a23',
      },
    },
    {
      chain: ChainNames.zksync,
      birthday: 1720569600, // Wed Jul 10 2024 00:00:00 GMT+0000
      outbound: {
        [ChainNames.arbitrum]: '0x66EcB7c8c122d74f19Fc28b275f213Ef8991B7AB',
        [ChainNames.ethereum]: '0xD1B33FAd3fF7a793EE39473f865630e3b6371086',
      },
    },
  ],
};
