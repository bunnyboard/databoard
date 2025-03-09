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
  ],
};
