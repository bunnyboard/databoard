import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface EulerFactoryConfig {
  chain: string;
  birthday: number;
  factory: string;
  vaults: Array<string>;
}

export interface EulerProtocolConfig extends ProtocolConfig {
  factories: Array<EulerFactoryConfig>;
}

export const EulerConfigs: EulerProtocolConfig = {
  protocol: ProtocolNames.euler,
  birthday: 1724025600, // Mon Aug 19 2024 00:00:00 GMT+0000
  factories: [
    {
      chain: ChainNames.ethereum,
      birthday: 1724025600, // Mon Aug 19 2024 00:00:00 GMT+0000
      factory: '0x29a56a1b8214D9Cf7c5561811750D5cBDb45CC8e',
      vaults: [
        '0x797DD80692c3b2dAdabCe8e30C07fDE5307D48a9',
        '0xD8b27CF359b7D15710a5BE299AF6e7Bf904984C2',
        '0xF6E2EfDF175e7a91c8847dade42f2d39A9aE57D4',
        '0xa992d3777282c44ee980E9B0ca9Bd0c0E4f737aF',
        '0xbC4B4AC47582c3E38Ce5940B80Da65401F4628f1',
        '0x82c710B9B225B43C0c90f097DB31f5f10a7F86FA',
        '0x315F93a074D0948E4D068e98a34092750ea8A38C',
        '0xf9a23b059858CdD0e3ED0DDE89864BB82B88aa19',
        '0x631D8E808f2c4177a8147Eaa39a4F57C47634dE8',
        '0xb3b36220fA7d12f7055dab5c9FD18E860e9a6bF8',
        '0x313603FA690301b0CaeEf8069c065862f9162162',
        '0x67e4e4e73947257Ca62D118E0FBC56D06f11d96F',
        '0xB93d4928f39fBcd6C89a7DFbF0A867E6344561bE',
        '0xea0C048c728578b1510EBDF9b692E8936D6Fbc90',
        '0xce45EF0414dE3516cAF1BCf937bF7F2Cf67873De',
        '0x01d1a1cd5955B2feFb167e8bc200A00BfAda8977',
        '0x8dDE384022D4dE1D6C67891a8865f551c444dc4C',
        '0xe2D6A2a16ff6d3bbc4C90736A7e6F7Cc3C9B8fa9',
        '0x117576B8854a03aB7C3dF1Cf1cd8E04767BfA866',
        '0xcAd0be6e135C3d2859EA0c872cCD510C962765b7',
        '0xe00A44e1210BAe0EACEeeaF202c349d4B16480FE',
        '0x298966b32C968884F716F762f6759e8e5811aE14',
        '0x1e548CfcE5FCF17247E024eF06d32A01841fF404',
        '0xe3CA8369346A35b0633da9A4Eb48394478C8BEC2',
        '0xE3ea69f8661FFac04E269f99C14ba73e2Bb10633',
        '0x716bF454066a84F39A2F78b5707e79a9d64f1225',
        '0xf2f826c190D020A6D1EC422bF2269E63b8b315E0',
        '0x056f3a2E41d2778D3a0c0714439c53af2987718E',
        '0x9c6e67fA86138Ab49359F595BfE4Fb163D0f16cc',
        '0x998D761eC1BAdaCeb064624cc3A1d37A46C88bA4',
        '0xbC35161043EE2D74816d421EfD6a45fDa73B050A',
        '0xe846ca062aB869b66aE8DcD811973f628BA82eAf',
        '0x7338d86137052F0dF6e9048d6D23e09735a99585',
        '0x9e714434A1c94B842b75631a70E07d13f2575368',
        '0x07F9A54Dc5135B9878d6745E267625BF0E206840',
        '0x82D2CE1f71cbe391c05E21132811e5172d51A6EE',
        '0x3A8992754E2EF51D8F90620d2766278af5C59b90',
        '0xcf47fBe97aaE77B8ABEa5e1F59c9bcb808A8d47d',
        '0xcBC9B61177444A793B85442D3a953B90f6170b7D',
        '0x29A9E5A004002Ff9E960bb8BB536E076F53cbDF1',
        '0xAb254591B63138247eCcDF82170Eb64890d36b1B',
        '0x9f12d29c7CC72bb3d237E2D042A6D890421f9899',
        '0xe11a462235A39C90921C4a59D4E8B2707330BCf2',
        '0xA2038a5B7Ce1C195F0C52b77134c5369CCfe0148',
        '0x7E8Ba73e62dc430A4Fc76E7bb4EA8de62CDe5fDc',
        '0xb2A8bAba27B5D45Db0a4E58275cAf62DEBca7AA2',
        '0xc58Eac02905d34678f552c90De2D4c94bF987B12',
        '0x43C5c4E62F64b5Ea44871604727870ab93B5F663',
        '0xBc99605074737d36266f45E0d192dDe6CFDFd72a',
        '0xfaCaD9D934F17930d28b93F3C84a13BFAc73347C',
        '0xC605471aE09e0b7daA9e8813707d0DDbf9429Ad2',
        '0x1987c2DCf5674Cf90bEceBAd502714c357ce126a',
        '0xa2f045eC60C624c46F1075FC589Df0f936F822C2',
        '0xd6506dB835B465d5d823add8667362d7b86cFe5F',
        '0x7f1d29e70C644c387ded640B28E106e29E349074',
        '0xe0a80d35bB6618CBA260120b279d357978c42BCE',
        '0x498c014dE23f19700F51e85a384AB1B059F0672e',
        '0x6D671B9c618D5486814FEb777552BA723F1A235C',
        '0x34716B7026D9e6247D21e37Da1f1b157b62a16e0',
        '0x48Afe17cB6363fD1aaeA50a8CB652C5978972c96',
        '0x81fa50cBe6C7Ed61961fE601B7c5AC334c2c84bB',
        '0xE88e44C2C7dfc9bcb86e380d29375ccD6cd85406',
        '0xddd082d01852EFccEc0DB5477F41f530Ecb0C136',
        '0x1cA03621265D9092dC0587e1b50aB529f744aacB',
        '0x9Dfe12dBd94eb8294b047Fabe3142C5d7178071b',
        '0x7c280DBDEf569e96c7919251bD2B0edF0734C5A8',
        '0x83C266bdf990574a05EE62831a266a3891817B5B',
        '0x0D1B386187be8e96680bbddBf7Bc05FC737f81b8',
        '0x1924D7fab80d0623f0836Cbf5258a7fa734EE9D9',
        '0x2Ac5eB886859231280c08b3BD66ef80eD618fbc7',
        '0xCC3f4c0Aa2867be66551b1c01CdCA393A3B01d88',
        '0x8E4AF2F36ed6fb03E5E02Ab9f3C724B6E44C13b4',
        '0x8E35E3aa6eFBC8D11Eb4F3b743f180257C80e517',
        '0x2daCa71Cb58285212Dc05D65Cfd4f59A82BC4cF6',
        '0x6121591077Dc6898Ffd7216eA1b56cb890b3F84d',
        '0x33A1ff36274B603Dd3dA01E266dB6B3fD8e5733D',
        '0xB9E422Ef76a06f2b30361d821A5f4751073771c3',
        '0xffe871d5E03c318fE81E8f01b6E9C85047F8e87a',
        '0x519Ea32be221E2EBb066d4781359a1c96579840F',
        '0x1D09693608C440205fd53D7062862CBf5a6Ca69a',
        '0x37223B40d2CBf6b87Eed891ac02bc1670D03Fa8B',
        '0xD7B67cF0e7EDA8268b0f42de82dF87DfCC9a8537',
        '0xd005125E525664feC9394CEE5466Da15262fFe01',
        '0xdEd27A6da244a5f3Ff74525A2cfaD4ed9E5B0957',
        '0xd27159604ae512c056cf282933B838A4d38B1D17',
        '0xD1552d878FE4869539ba4D03D207B54913a5C273',
        '0xFc323C1727853872A85098EA89a6882853B708dd',
        '0x3b028b4b6c567eF5f8Ca1144Da4FbaA0D973F228',
        '0x6707Fe1A8a2F9B8a10441778ac6F6Be2Ed991aE7',
        '0x396fD980c0463Ccb285d3ec6830978D5D97976EC',
        '0x6d18F74AAD8494B789aE34b5455816F79664d209',
        '0x45c3B59d53e2e148Aaa6a857521059676D5c0489',
        '0xb7FC5ECF8E9F1DdBd8e039e189c7BBC575be23Ea',
      ],
    },
    {
      chain: ChainNames.base,
      birthday: 1732752000, // Thu Nov 28 2024 00:00:00 GMT+0000
      factory: '0x7f321498a801a191a93c840750ed637149ddf8d0',
      vaults: [
        '0x556d518FDFDCC4027A3A1388699c5E11AC201D8b',
        '0x0A1a3b5f2041F33522C4efc754a7D096f880eE16',
        '0x859160DB5841E5cfB8D3f144C6b3381A85A4b410',
        '0x882018411Bc4A020A879CEE183441fC9fa5D7f8B',
        '0x9ECD9fbbdA32b81dee51AdAed28c5C5039c87117',
        '0x7b181d6509DEabfbd1A23aF1E65fD46E89572609',
        '0xd4A805261B28f375fc9c3d89EcD2C952Cd130d14',
        '0x3f0d3Fd87A42BDaa3dfCC13ADA42eA922e638a7A',
        '0x5Fe2DE3E565a6a501a4Ec44AAB8664b1D674ac25',
        '0x358f25F82644eaBb441d0df4AF8746614fb9ea49',
        '0xa487f940D6f40D7304CD4e62751220f97124BeC9',
        '0x8b70a855B057cA85F38Ebb2a7399D9FE0BDC1046',
        '0x29Dbce367F5157B924Af5093617bb128477D7A5C',
        '0xEdCc195Ca09c9FCC1DD30b152C0b82045Ff2F91f',
        '0xC063C3b3625DF5F362F60f35B0bcd98e0fa650fb',
        '0x34ABB4501419b1E5f836567C58300c861164101A',
        '0x5ce15fC058E762A6F9722fC6521A0c0F5eECD9BA',
        '0x3F131Ac9D408926a8B36C1e03ce105f44DCD26Af',
        '0x1E2F1e8A97E96a2FDD6A8Da427603Ed1c8b3847F',
        '0x3F8236C62f84e3E3528e35bd039e0F912CedbB7F',
        '0xFa493E76fe20B77deA83d2F3A049fCf7DAF0e3d9',
        '0x0A36D06bc4111690a1fCaE1981a18Cc6614DBe35',
      ],
    },
    {
      chain: ChainNames.swellchain,
      birthday: 1737504000, // Wed Jan 22 2025 00:00:00 GMT+0000
      factory: '0x238bF86bb451ec3CA69BB855f91BDA001aB118b9',
      vaults: [
        '0x49C077B74292aA8F589d39034Bf9C1Ed1825a608',
        '0x4a5C95a0e3FCA4148F91cEb637fBA0E1080BE40e',
        '0x10D0D11A8B693F4E3e33d09BBab7D4aFc3C03ef3',
        '0x46e3c018798d6de4517A3c98358E4BD8D334B79C',
        '0x1773002742A2bCc7666e38454F761CE8fe613DE5',
        '0x3C12AA52b014Acf7957308808362909b5757cca8',
        '0xf34253Ec3Dd0cb39C29cF5eeb62161FB350A9d14',
        '0x29c85c752e854b0Cf2372e6B6c56f260755f5120',
      ],
    },
  ],
};
