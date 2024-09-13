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
      ],
    },
  ],
};
