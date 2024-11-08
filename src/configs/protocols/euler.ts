import { ProtocolCategories, ProtocolConfig } from '../../types/base';
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
  category: ProtocolCategories.lending,
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
        // '0x19756be2473A9C3351A426568FF9630c9D67f300',
        // '0x57995a00bA1e3E17BCF08BA775BF225cA1f5F25e',
      ],
    },
  ],
};
