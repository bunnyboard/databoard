import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const HakutoraConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.hakutora,
  birthday: 1737072000, // Fri Jan 17 2025 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1737072000, // Fri Jan 17 2025 00:00:00 GMT+0000
      morphoVaults: ['0x974c8FBf4fd795F66B85B73ebC988A51F1A040a9'],
      eulerVaults: [],
    },
  ],
};
