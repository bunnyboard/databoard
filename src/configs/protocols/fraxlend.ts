import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface FraxlendFactoryConfig {
  chain: string;
  birthday: number;
  factory: string; // factory - pair deployer
  fraxlendPairVersion: 1 | 2;

  // only get data from whitelisted pair
  whitelistedPairs: Array<string>;
}

export interface FraxlendProtocolConfig extends ProtocolConfig {
  factories: Array<FraxlendFactoryConfig>;
}

export const FraxlendConfigs: FraxlendProtocolConfig = {
  protocol: ProtocolNames.fraxlend,
  birthday: 1662076800, // Fri Sep 02 2022 00:00:00 GMT+0000
  factories: [
    {
      chain: ChainNames.ethereum,
      birthday: 1662076800, // Fri Sep 02 2022 00:00:00 GMT+0000
      fraxlendPairVersion: 1,
      factory: '0x5d6e79bcf90140585ce88c7119b7e43caaa67044',
      whitelistedPairs: [
        '0x32467a5fc2d72D21E8DCe990906547A2b012f382',
        '0x794F6B13FBd7EB7ef10d1ED205c9a416910207Ff',
        '0xc4d57603D47FB842EC11A5332748f9F96d44cbEB',
        '0xa1D100a5bf6BFd2736837c97248853D989a9ED84',
        '0xDbe88DBAc39263c47629ebbA02b3eF4cf0752A72',
        '0x3835a58CA93Cdb5f912519ad366826aC9a752510',
        '0x50E627a1DF8D665524942aD7eC6392b6BA60293a',
        '0xF1b3Cbc51a7483C656af9Aa09F319a3b66aD5e04',
      ],
    },
    {
      chain: ChainNames.ethereum,
      birthday: 1675900800, // Thu Feb 09 2023 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      factory: '0x7ab788d0483551428f2291232477f1818952998c',
      whitelistedPairs: [
        '0x281E6CB341a552E4faCCc6b4eEF1A6fCC523682d',
        '0x1Fff4a418471a7b44EFa023320e02DCDB486ED77',
        '0x74F82Bd9D0390A4180DaaEc92D64cf0708751759',
        '0x3a25B9aB8c07FfEFEe614531C75905E810d8A239',
        '0x66bf36dBa79d4606039f04b32946A260BCd3FF52',
        '0x82Ec28636B77661a95f021090F6bE0C8d379DD5D',
        '0xc6CadA314389430d396C7b0C70c6281e99ca7fe8',
        '0xc779fEE076EB04b9F8EA424ec19DE27Efd17A68d',
        '0x35E08B28d5b01D058cbB1c39dA9188CC521a79aF',
        '0xd1887398f3bbdC9d10D0d5616AD83506DdF5057a',
        '0x1c0C222989a37247D974937782cebc8bF4f25733',
        '0xeE847a804b67f4887c9E8fe559A2dA4278deFB52',
        '0x7093F6141293F7C4F67E5efD922aC934402E452d',
        '0xb5a46f712F03808aE5c4B885C6F598fA06442684',
        '0x0601B72bEF2b3F09E9f48B7d60a8d7D2D3800C6e',
        '0xa4Ddd4770588EF97A3a03E4B7E3885d824159bAA',
        '0xb5Ae5b75C0DF5632c572A657109375646Ce66f90',
        '0xeca60a11c49486088Ad7c5e4aD7Dae2C061DBb1c',
        '0x5Ee658b7f46FD9DeE4608aE9c8E7d78AAD7509C2',
        '0xCfE3550206ea801c3F7Dc7997376F09E0b7e4B81',
        '0x48f32B7c960fD0280297F6F0182E2607a3398Db5',
        '0xbE08194b3F4ae9CD80Bd7f553A9a782c0ed65d17',
        '0x1D95C12d7A8d525F8d8Cb0C44814B12cd13Dfa01',
        '0x8C9dB7a9329f221eD1fFE56BF4Bd073aA320eed9',
        '0x76FF120FF669591b7cb5452995C0269437beA414',
        '0x254fbc9dBB12C446ea5c9a4439C816d34b875920',
        '0x54e20B542EEd95e6c7d8F29aD46A3cf5661C3048',
        '0xc16B81e004288C465EaAdf080028994044a3C69F',
        '0x6A80bE9Df5F46eB11d0C6ed706607F72c0d1C337',
        '0x5EA719aA26C158B7B0F5b6363c6beBCF4aE3cdB6',
        '0xb49B5cF2efB64d97825c70706a49059E93625865',
        '0xBb95286B7973f8B217cE903CA15c75528CBd8E69',
        '0x672500520A4734Af8401915DBDDa42F6E01BFBA9',
        '0x5F9deea62fDd79EfDd22Fd714670e53dE33463A5',
      ],
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1685404800, // Tue May 30 2023 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      factory: '0xc70cc721d19dc7e627b81feacb6a357fb11200af',
      whitelistedPairs: [
        '0x2D0483FefAbA4325c7521539a3DFaCf94A19C472',
        '0x6076ebDFE17555ed3E6869CF9C373Bbd9aD55d38',
        '0x9168AC3a83A31bd85c93F4429a84c05db2CaEF08',
        '0xc37Aa0cF7E45fe0e811d99062020080147970A1a',
      ],
    },
    {
      chain: ChainNames.fraxtal,
      birthday: 1708560000, // Thu Feb 22 2024 00:00:00 GMT+0000
      fraxlendPairVersion: 2,
      factory: '0x4c3b0e85cd8c12e049e07d9a4d68c441196e6a12',
      whitelistedPairs: [
        '0x032578d99b1070682a5E171012BE1756a50a17d4',
        '0x6154334A7D0E7f5f0479599D15F462B200C721E1',
        '0x4F968317721B9c300afBff3FD37365637318271D',
        '0x8EdA613EC96992D3C42BCd9aC2Ae58a92929Ceb2',
        '0xB71E4829e81f72f7F36A0d858e58109f5948A713',
        '0x3e92765eE2B009b104A8A7baf3759B159c19AbA1',
        '0x1b48c9595385F1780d7Be1aB57f8eAcFeA3A5cE5',
        '0x19031D9104d6242Da19CC2AE0d29E60F2e37e426',
        '0x7A26b401475A332f62632453a31519c6838b59cc',
        '0xb2d53dF70181FbE783f84B74F58E38cC1Ca8528d',
        '0x25Cb9BF429D5Ea0530C5dB6c96c131499dC255B7',
      ],
    },
  ],
};
