import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SeaportConfig {
  chain: string;
  version: '1.1' | '1.4' | '1.5';
  birthday: number;
  seaport: string;
}

export interface OpenseaProtocolConfig extends ProtocolConfig {
  seaports: Array<SeaportConfig>;
}

export const OpenseaConfigs: OpenseaProtocolConfig = {
  protocol: ProtocolNames.opensea,
  category: ProtocolCategories.marketplace,
  birthday: 1654992000, // Sun Jun 12 2022 00:00:00 GMT+0000
  seaports: [
    {
      chain: ChainNames.ethereum,
      version: '1.1',
      birthday: 1654992000, // Sun Jun 12 2022 00:00:00 GMT+0000
      seaport: '0x00000000006c3852cbef3e08e8df289169ede581',
    },
    {
      chain: ChainNames.ethereum,
      version: '1.4',
      birthday: 1676764800, // Sun Feb 19 2023 00:00:00 GMT+0000
      seaport: '0x00000000000001ad428e4906ae43d8f9852d0dd6',
    },
    {
      chain: ChainNames.ethereum,
      version: '1.5',
      birthday: 1682553600, // Thu Apr 27 2023 00:00:00 GMT+0000
      seaport: '0x00000000000000adc04c56bf30ac9d3c0aaf14dc',
    },
  ],
};
