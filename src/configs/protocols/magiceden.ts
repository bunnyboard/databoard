import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MagicedenPaymentConfig {
  chain: string;
  birthday: number;
  processor: string;
}

export interface MagicedenProtocolConfig extends ProtocolConfig {
  paymentProcessors: Array<MagicedenPaymentConfig>;
}

export const MagicedenConfigs: MagicedenProtocolConfig = {
  protocol: ProtocolNames.magiceden,
  birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
  paymentProcessors: [
    {
      chain: ChainNames.ethereum,
      birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
      processor: '0x9a1d00bed7cd04bcda516d721a596eb22aac6834',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
      processor: '0x9a1d00bed7cd04bcda516d721a596eb22aac6834',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
      processor: '0x9a1d00bed7cd04bcda516d721a596eb22aac6834',
    },
    {
      chain: ChainNames.base,
      birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
      processor: '0x9a1d00bed7cd04bcda516d721a596eb22aac6834',
    },
  ],
};
