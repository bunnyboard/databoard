import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const RelendnetworkConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.relendnetwork,
  birthday: 1727740800, // Tue Oct 01 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1727740800, // Tue Oct 01 2024 00:00:00 GMT+0000
      morphoVaults: [
        '0x0F359FD18BDa75e9c49bC027E7da59a4b01BF32a',
        '0x45c1875F1C48622b3D9740Af2D7dc62Bc9a72422',
        '0xB9C9158aB81f90996cAD891fFbAdfBaad733c8C6',
      ],
      eulerVaults: [],
    },
    {
      chain: ChainNames.base,
      birthday: 1727740800, // Tue Oct 01 2024 00:00:00 GMT+0000
      morphoVaults: ['0x70F796946eD919E4Bc6cD506F8dACC45E4539771'],
      eulerVaults: [],
    },
  ],
};
