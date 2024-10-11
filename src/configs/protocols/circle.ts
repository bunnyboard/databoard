import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface CircleCctpMessengerConfig {
  chain: string;
  tokenMessenger: string;
  birthday: number;
}

export interface CircleCctpProtocolConfig extends ProtocolConfig {
  messengers: Array<CircleCctpMessengerConfig>;
}

export const CircleCctpDomainChains: { [key: number]: string } = {
  0: ChainNames.ethereum,
  1: ChainNames.avalanche,
  2: ChainNames.optimism,
  3: ChainNames.arbitrum,
  6: ChainNames.base,
  7: ChainNames.polygon,
};

export const CircleCctpConfigs: CircleCctpProtocolConfig = {
  protocol: ProtocolNames.circlecctp,
  category: ProtocolCategories.bridge,
  birthday: 1674086400, // Thu Jan 19 2023 00:00:00 GMT+0000
  messengers: [
    {
      chain: ChainNames.ethereum,
      birthday: 1677628800, // Wed Mar 01 2023 00:00:00 GMT+0000
      tokenMessenger: '0xbd3fa81b58ba92a82136038b25adec7066af3155',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1674086400, // Thu Jan 19 2023 00:00:00 GMT+0000
      tokenMessenger: '0x6b25532e1060ce10cc3b0a99e5683b91bfde6982',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1687392000, // Thu Jun 22 2023 00:00:00 GMT+0000
      tokenMessenger: '0x2B4069517957735bE00ceE0fadAE88a26365528f',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1684281600, // Wed May 17 2023 00:00:00 GMT+0000
      tokenMessenger: '0x19330d10D9Cc8751218eaf51E8885D058642E08A',
    },
    {
      chain: ChainNames.base,
      birthday: 1695081600, // Tue Sep 19 2023 00:00:00 GMT+0000
      tokenMessenger: '0x1682Ae6375C4E4A97e4B583BC394c861A46D8962',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1698796800, // Wed Nov 01 2023 00:00:00 GMT+0000
      tokenMessenger: '0x9daf8c91aefae50b9c0e69629d3f6ca40ca3b3fe',
    },
  ],
};
