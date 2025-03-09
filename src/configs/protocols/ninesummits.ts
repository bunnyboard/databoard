import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const NinesummitsConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.ninesummits,
  birthday: 1733184000, // Tue Dec 03 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1736812800, // Tue Jan 14 2025 00:00:00 GMT+0000
      morphoVaults: [
        '0x00B6f2C15E4439749f192D10c70f65354848Cf4b',
        '0x1E2aAaDcF528b9cC08F43d4fd7db488cE89F5741',
        '0xD5Ac156319f2491d4ad1Ec4aA5ed0ED48C0fa173',
      ],
      eulerVaults: [],
    },
    {
      chain: ChainNames.base,
      birthday: 1733184000, // Tue Dec 03 2024 00:00:00 GMT+0000
      morphoVaults: ['0x5496b42ad0deCebFab0db944D83260e60D54f667', '0xF540D790413FCFAedAC93518Ae99EdDacE82cb78'],
      eulerVaults: [],
    },
  ],
};
