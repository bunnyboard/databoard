import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const K3capitalConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.k3capital,
  birthday: 1740441600, // Tue Feb 25 2025 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.bob,
      birthday: 1740441600, // Tue Feb 25 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0xf168679179AA9b6E7772C8eCa4F8afB0B75ED346',
        '0x80E0d452da8eb37c8db9C8E89103DC92aD477773',
        '0x6f421F025DD9e3EfF6097536b7991029859C888A',
      ],
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1744156800, // Wed Apr 09 2025 00:00:00 GMT+0000
      morphoVaults: [],
      eulerVaults: [
        '0xa446938b0204Aa4055cdFEd68Ddf0E0d1BAB3E9E',
        '0x5030183B3DD0105d69D7d45595C120Fc4b542EC3',
        '0x6072A6d18446278bB5a43eb747de8F61e34cB77f',
        '0x03ef14425CF0d7Af62Cdb8D6E0Acb0b0512aE35C',
        '0x4d758aB40Abb122402F01e1ec4C71ACb06A1f620',
        '0xe91841F707936faf515ff6d478624A325A4f9199',
        '0x38eA4c0724b20B02e5fdE235F657a3aFc184f5aC',
      ],
    },
  ],
};
