import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface BlurMarketplaceConfig {
  chain: string;
  birthday: number;
  marketplace: string;
}

export interface BlurProtocolConfig extends ProtocolConfig {
  chain: string;
  bidPool: string;
  marketplaceV1: string;
  marketplaceV2: Array<BlurMarketplaceConfig>;
}

export const BlurConfigs: BlurProtocolConfig = {
  protocol: ProtocolNames.blur,
  birthday: 1666224000, // Thu Oct 20 2022 00:00:00 GMT+0000
  chain: ChainNames.ethereum,
  bidPool: '0x0000000000a39bb272e79075ade125fd351887ac',
  marketplaceV1: '0x000000000000ad05ccc4f10045630fb830b95127',
  marketplaceV2: [
    {
      chain: ChainNames.ethereum,
      birthday: 1688342400, // Mon Jul 03 2023 00:00:00 GMT+0000
      marketplace: '0xb2ecfe4e4d61f8790bbb9de2d1259b9e2410cea5',
    },
    {
      chain: ChainNames.blast,
      birthday: 1712793600, // Thu Apr 11 2024 00:00:00 GMT+0000
      marketplace: '0x0f41639352b190f352baddd32856038f1c230ced',
    },
  ],
};
