import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const HyperithmConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.hyperithm,
  birthday: 1740528000, // Wed Feb 26 2025 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1740528000, // Wed Feb 26 2025 00:00:00 GMT+0000
      morphoVaults: ['0x777791C4d6DC2CE140D00D2828a7C93503c67777'],
      eulerVaults: [],
    },
  ],
};
