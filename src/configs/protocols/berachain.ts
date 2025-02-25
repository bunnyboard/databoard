import { ChainNames, ProtocolNames } from '../names';
import { BalancerProtocolConfig } from './balancer';

export const BerachaindexConfigs: BalancerProtocolConfig = {
  protocol: ProtocolNames.berachaindex,
  birthday: 1737417600, // Tue Jan 21 2025 00:00:00 GMT+0000
  dexes: [
    {
      chain: ChainNames.berachain,
      birthday: 1737417600, // Tue Jan 21 2025 00:00:00 GMT+0000
      version: 'balv2',
      vault: '0x4Be03f781C497A489E3cB0287833452cA9B9E80B',
      // https://docs.bex.berachain.com/learn/guides/fees#fee-distribution
      protocolFeeRate: 0.5,
      tokens: [
        '0x6fc6545d5cde268d5c7f1e476d444f39c995120d',
        '0x2f6f07cdcf3588944bf4c42ac74ff24bf56e7590',
        '0x688e72142674041f8f6af4c808a4045ca1d6ac82',
        '0xfcbd14dc51f0a4d49d5e53c2e0950e0bc26d0dce',
        '0x6969696969696969696969696969696969696969',
        '0x549943e04f40284185054145c6e4e9568c1d3241',
        '0x5b82028cfc477c4e7dda7ff33d59a23fa7be002a',
        '0x18878df23e2a36f81e820e4b47b4a40576d3159c',
        '0x779ded0c9e1022225f8e0630b35a9b54be713736',
      ],
    },
  ],
};
