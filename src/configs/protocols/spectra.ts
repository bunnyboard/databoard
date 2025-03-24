import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface SpectraRegistryConfig {
  chain: string;
  birthday: number;
  registry: string;
}

export interface SpectraProtocolConfig extends ProtocolConfig {
  registries: Array<SpectraRegistryConfig>;
}

export const SpectraConfigs: SpectraProtocolConfig = {
  protocol: ProtocolNames.spectra,
  birthday: 1714003200, // Thu Apr 25 2024 00:00:00 GMT+0000
  registries: [
    {
      chain: ChainNames.ethereum,
      birthday: 1714003200, // Thu Apr 25 2024 00:00:00 GMT+0000
      registry: '0x4973b53b300d64ab72147EFF8C9d962f6b1dA02e',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1714003200, // Thu Apr 25 2024 00:00:00 GMT+0000
      registry: '0x786Da12e9836a9ff9b7d92e8bac1C849e2ACe378',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1719878400, // Tue Jul 02 2024 00:00:00 GMT+0000
      registry: '0x0458c078fCf527DA293Ec9e813a0DcAF9F949EB1',
    },
    {
      chain: ChainNames.base,
      birthday: 1719878400, // Tue Jul 02 2024 00:00:00 GMT+0000
      registry: '0x786Da12e9836a9ff9b7d92e8bac1C849e2ACe378',
    },
  ],
};
