import { ProtocolConfig, Token } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface BlackrockusdProtocolConfig extends ProtocolConfig {
  // BUILD stablecoins
  tokens: Array<Token>;
}

export const BlackrockusdConfigs: BlackrockusdProtocolConfig = {
  protocol: ProtocolNames.blackrockusd,
  birthday: 1709337600, // Sat Mar 02 2024 00:00:00 GMT+0000
  tokens: [
    {
      chain: ChainNames.ethereum,
      symbol: 'BUIDL',
      decimals: 6,
      address: '0x7712c34205737192402172409a8f7ccef8aa2aec',
    },
    {
      chain: ChainNames.ethereum,
      symbol: 'BUIDL-I',
      decimals: 6,
      address: '0x6a9da2d710bb9b700acde7cb81f10f1ff8c89041',
    },
    {
      chain: ChainNames.polygon,
      symbol: 'BUIDL',
      decimals: 6,
      address: '0x2893ef551b6dd69f661ac00f11d93e5dc5dc0e99',
    },
    {
      chain: ChainNames.avalanche,
      symbol: 'BUIDL',
      decimals: 6,
      address: '0x53fc82f14f009009b440a706e31c9021e1196a2f',
    },
    {
      chain: ChainNames.optimism,
      symbol: 'BUIDL',
      decimals: 6,
      address: '0xa1cdab15bba75a80df4089cafba013e376957cf5',
    },
    {
      chain: ChainNames.arbitrum,
      symbol: 'BUIDL',
      decimals: 6,
      address: '0xa6525ae43edcd03dc08e775774dcabd3bb925872',
    },
  ],
};
