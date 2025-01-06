import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface AnzenPoolConfig {
  chain: string;
  USDz: string;
  sUSDz: string;
}

export interface AnzenProtocolConfig extends ProtocolConfig {
  pools: Array<AnzenPoolConfig>;
}

export const AnzenConfigs: AnzenProtocolConfig = {
  protocol: ProtocolNames.anzen,
  birthday: 1715904000, // Fri May 17 2024 00:00:00 GMT+0000
  pools: [
    {
      chain: ChainNames.ethereum,
      USDz: '0xA469B7Ee9ee773642b3e93E842e5D9b5BaA10067',
      sUSDz: '0x547213367cfB08ab418E7b54d7883b2C2AA27Fd7',
    },
    {
      chain: ChainNames.arbitrum,
      USDz: '0x5018609AB477cC502e170A5aCcf5312B86a4b94f',
      sUSDz: '0x1b2c29e3897b8f9170c98440a483e90e715c879d',
    },
    {
      chain: ChainNames.base,
      USDz: '0x04D5ddf5f3a8939889F11E97f8c4BB48317F1938',
      sUSDz: '0xe31eE12bDFDD0573D634124611e85338e2cBF0cF',
    },
    {
      chain: ChainNames.blast,
      USDz: '0x52056ED29Fe015f4Ba2e3b079D10C0B87f46e8c6',
      sUSDz: '0x73d23F3778a90Be8846E172354A115543dF2a7E4',
    },
    {
      chain: ChainNames.manta,
      USDz: '0x73d23F3778a90Be8846E172354A115543dF2a7E4',
      sUSDz: '0x8f08A3B5bCEADEF10C0B26c8BB720EBb8fA91758',
    },
  ],
};
