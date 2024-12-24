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
      protocolFeeRate: 0.5, // 50% - https://docs.beets.fi/ecosystem/protocol-fees
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
      chain: ChainNames.sonic,
      version: 'balv2',
      birthday: 1734134400, // Sat Dec 14 2024 00:00:00 GMT+0000
      vault: '0xBA12222222228d8Ba445958a75a0704d566BF2C8',
      protocolFeeRate: 0.25, // 25% - https://docs.beets.fi/ecosystem/protocol-fees
      tokens: [
        '0x2d0e0814e62d80056181f5cd932274405966e4f0',
        '0x29219dd400f2bf60e5a23d13be72b486d4038894',
        '0xe5da20f15420ad15de0fa650600afc998bbe3955',
        '0x309c92261178fa0cf748a855e90ae73fdb79ebc7',
        '0x039e2fb66102314ce7b64ce5ce3e5183bc94ad38',
      ],
    },

    // {
    //   chain: ChainNames.sonic,
    //   version: 'balv3',
    //   birthday: 1734134400, // Sat Dec 14 2024 00:00:00 GMT+0000
    //   vault: '0xba1333333333a1ba1108e8412f11850a5c319ba9',
    //   protocolFeeRate: 0.25, // 25% - https://docs.beets.fi/ecosystem/protocol-fees
    //   tokens: [
    //   ],
    // },
  ],
};
