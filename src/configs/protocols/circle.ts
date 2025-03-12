import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface CircleCctpMessengerConfig {
  chain: string;
  version: 1 | 2;
  tokenMessenger: string;
  birthday: number;
}

export interface CircleCctpProtocolConfig extends ProtocolConfig {
  messengers: Array<CircleCctpMessengerConfig>;
}

// https://developers.circle.com/stablecoins/supported-domains
export const CircleCctpDomainChains: { [key: number]: string } = {
  0: ChainNames.ethereum,
  1: ChainNames.avalanche,
  2: ChainNames.optimism,
  3: ChainNames.arbitrum,
  4: ChainNames.noble,
  5: ChainNames.solana,
  6: ChainNames.base,
  7: ChainNames.polygon,
  8: ChainNames.sui,
  9: ChainNames.aptos,
  10: ChainNames.unichain,
};

export const CircleCctpConfigs: CircleCctpProtocolConfig = {
  protocol: ProtocolNames.circlecctp,
  birthday: 1674086400, // Thu Jan 19 2023 00:00:00 GMT+0000
  messengers: [
    {
      chain: ChainNames.ethereum,
      birthday: 1677628800, // Wed Mar 01 2023 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0xbd3fa81b58ba92a82136038b25adec7066af3155',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1674086400, // Thu Jan 19 2023 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0x6b25532e1060ce10cc3b0a99e5683b91bfde6982',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1687392000, // Thu Jun 22 2023 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1684281600, // Wed May 17 2023 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
    },
    {
      chain: ChainNames.base,
      birthday: 1695081600, // Tue Sep 19 2023 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1698796800, // Wed Nov 01 2023 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0x9daf8c91aefae50b9c0e69629d3f6ca40ca3b3fe',
    },
    {
      chain: ChainNames.unichain,
      birthday: 1733443200, // Fri Dec 06 2024 00:00:00 GMT+0000
      version: 1,
      tokenMessenger: '0x4e744b28E787c3aD0e810eD65A24461D4ac5a762',
    },

    {
      chain: ChainNames.ethereum,
      birthday: 1739318400, // Wed Feb 12 2025 00:00:00 GMT+0000
      version: 2,
      tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1739318400, // Wed Feb 12 2025 00:00:00 GMT+0000
      version: 2,
      tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    },
    {
      chain: ChainNames.base,
      birthday: 1739318400, // Wed Feb 12 2025 00:00:00 GMT+0000
      version: 2,
      tokenMessenger: '0x28b5a0e9C621a5BadaA536219b3a228C8168cf5d',
    },
  ],
};
