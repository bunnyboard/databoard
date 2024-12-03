import { ChainNames, ProtocolNames } from '../names';
import { BalancerProtocolConfig } from './balancer';

export const BeetsConfigs: BalancerProtocolConfig = {
  protocol: ProtocolNames.beets,
  birthday: 1618876800, // Tue Apr 20 2021 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.fantom,
      version: 'balv2',
      birthday: 1631404800, // Sun Sep 12 2021 00:00:00 GMT+0000
      vault: '0x20dd72ed959b6147912c2e529f0a0c651c33c9ce',
      tokens: [
        '0xd7028092c830b5c8fce061af2e593413ebbc1fc1',
        '0xf24bcf4d1e507740041c9cfd2dddb29585adce1e',
        '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
        '0x321162Cd933E2Be498Cd2267a90534A804051b11',
        '0x74b23882a30290451A17c44f4F05243b6b58C76d',
        '0x2f733095b80a04b38b0d10cc884524a3d09b836a',
        '0xb7c2ddb1ebac1056231ef22c1b0a13988537a274',
        '0x10010078a54396f62c96df8532dc2b4847d47ed3',
        '0x662b3d319e693aa578edd4bd8a5c9395bc49e9f4',
        '0xb3654dc3d10ea7645f8319668e8f54d2574fbdc8',
        '0xde55b113a27cc0c5893caa6ee1c020b6b46650c0',
        '0x511D35c52a3C244E7b8bd92c0C297755FbD89212',
        '0x10b620b2dbac4faa7d7ffd71da486f5d44cd86f9',
        '0x85dec8c4b2680793661bca91a8f129607571863d',
        '0x468003b688943977e6130f4f68f23aad939a1040',
        '0x91fa20244Fb509e8289CA630E5db3E9166233FDc',
        '0xd361474bb19c8b98870bb67f5759cdf277dee7f9',
        '0x82f0b8b456c1a451378467398982d4834b6829c1',
        '0x21ada0d2ac28c3a5fa3cd2ee30882da8812279b6',
        '0xae75A438b2E0cB8Bb01Ec1E1e376De11D44477CC',
        '0x841fad6eae12c286d1fd18d1d525dffa75c7effe',
      ],
    },
    {
      chain: ChainNames.optimism,
      version: 'balv2',
      birthday: 1651622400, // Wed May 04 2022 00:00:00 GMT+0000
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      tokens: [
        '0x484c2d6e3cdd945a8b2df735e079178c1036578c',
        '0xfc2e6e6bcbd49ccf3a5f029c79984372dcbfe527',
        '0x2e3d870790dc77a83dd1d18184acc7439a53f475',
        '0x6806411765af15bddd26f8f544a34cc40cb9838b',
        '0xda10009cbd5d07dd0cecc66161fc93d7c9000da1',
        '0xfe8b128ba8c78aabc59d4c64cee7ff28e9379921',
        '0x1509706a6c66CA549ff0cB464de88231DDBe213B',
        '0x94b008aa00579c1307b0ef2c499ad98a8ce58e58',
        '0xfdb794692724153d1488ccdbe0c56c252596735f',
        '0x00a35fd824c717879bf370e70ac6868b95870dfb',
        '0x0c5b4c92c948691EEBf185C17eeB9c230DC019E9',
        '0x350a791bfc2c21f9ed5d10980dad2e2638ffa7f6',
        '0x8c6f28f2f1a3c87f0f938b96d27520d9751ec8d9',
        '0x8ae125e8653821e851f12a49f7765db9a9ce7384',
        '0x8700daec35af8ff88c16bdf0418774cb3d7599b4',
        '0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb',
        '0xb0b195aefa3650a6908f15cdac7d92f8a5791b0b',
        '0x217d47011b23bb961eb6d93ca9945b7501a5bb11',
      ],
    },
  ],
};
