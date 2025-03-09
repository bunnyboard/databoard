import { ChainNames, ProtocolNames } from '../names';
import { GauntletProtocolConfig } from './gauntlet';

export const LlamariskConfigs: GauntletProtocolConfig = {
  protocol: ProtocolNames.llamarisk,
  birthday: 1712966400, // Sat Apr 13 2024 00:00:00 GMT+0000
  curators: [
    {
      chain: ChainNames.ethereum,
      birthday: 1712966400, // Sat Apr 13 2024 00:00:00 GMT+0000
      morphoVaults: ['0x67315dd969B8Cd3a3520C245837Bf71f54579C75'],
      eulerVaults: [],
    },
  ],
};
