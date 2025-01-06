import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LombardPoolConfig {
  chain: string;
  birthday: number;
  lbtc: string;
  native: boolean;
  pmm?: string;
  pmmToken?: string;
}

export interface LombardProtocolConfig extends ProtocolConfig {
  pools: Array<LombardPoolConfig>;
}

export const LombardConfigs: LombardProtocolConfig = {
  protocol: ProtocolNames.lombard,
  birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
  pools: [
    {
      chain: ChainNames.ethereum,
      birthday: 1715990400, // Sat May 18 2024 00:00:00 GMT+0000
      native: true,
      lbtc: '0x8236a87084f8b84306f72007f36f2618a5634494',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1728691200, // Sat Oct 12 2024 00:00:00 GMT+0000
      lbtc: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
      native: false,
      pmm: '0xE4ff44a615dF38e37cdF475833c1d57774CC9D4A',
      pmmToken: '0x7130d2a12b9bcbfae4f2634d864a1ee1ce3ead9c',
    },
    {
      chain: ChainNames.base,
      birthday: 1731369600, // Tue Nov 12 2024 00:00:00 GMT+0000
      lbtc: '0xecAc9C5F704e954931349Da37F60E39f515c11c1',
      native: false,
      pmm: '0x92c01FC0F59857c6E920EdFf1139904b2Bb74c7c',
      pmmToken: '0xcbb7c0000ab88b473b1f5afd9ef808440eed33bf',
    },
  ],
};
