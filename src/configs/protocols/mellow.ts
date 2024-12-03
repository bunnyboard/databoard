import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface MellowVaultConfig {
  birthday: number;
  vault: string;
}

export interface MellowChainConfig {
  chain: string;
  vaults: Array<MellowVaultConfig>;
}

export interface MellowProtocolConfig extends ProtocolConfig {
  chains: Array<MellowChainConfig>;
}

export const MellowConfigs: MellowProtocolConfig = {
  protocol: ProtocolNames.mellow,
  birthday: 1717891200, // Sun Jun 09 2024 00:00:00 GMT+0000
  chains: [
    {
      chain: ChainNames.ethereum,
      vaults: [
        {
          birthday: 1717891200, // Sun Jun 09 2024 00:00:00 GMT+0000
          vault: '0xBEEF69Ac7870777598A04B2bd4771c71212E6aBc',
        },
        {
          birthday: 1717891200, // Sun Jun 09 2024 00:00:00 GMT+0000
          vault: '0x84631c0d0081FDe56DeB72F6DE77abBbF6A9f93a',
        },
        {
          birthday: 1717891200, // Sun Jun 09 2024 00:00:00 GMT+0000
          vault: '0x5fD13359Ba15A84B76f7F87568309040176167cd',
        },
        {
          birthday: 1717891200, // Sun Jun 09 2024 00:00:00 GMT+0000
          vault: '0x7a4EffD87C2f3C55CA251080b1343b605f327E3a',
        },
        {
          birthday: 1719446400, // Thu Jun 27 2024 00:00:00 GMT+0000
          vault: '0x49cd586dd9BA227Be9654C735A659a1dB08232a9',
        },
        {
          birthday: 1719446400, // Thu Jun 27 2024 00:00:00 GMT+0000
          vault: '0x82dc3260f599f4fC4307209A1122B6eAa007163b',
        },
        {
          birthday: 1719446400, // Thu Jun 27 2024 00:00:00 GMT+0000
          vault: '0xd6E09a5e6D719d1c881579C9C8670a210437931b',
        },
        {
          birthday: 1723766400, // Fri Aug 16 2024 00:00:00 GMT+0000
          vault: '0x7b31F008c48EFb65da78eA0f255EE424af855249',
        },
        {
          birthday: 1723766400, // Fri Aug 16 2024 00:00:00 GMT+0000
          vault: '0x4f3Cc6359364004b245ad5bE36E6ad4e805dC961',
        },
        {
          birthday: 1719273600, // Tue Jun 25 2024 00:00:00 GMT+0000
          vault: '0x82f5104b23FF2FA54C2345F821dAc9369e9E0B26',
        },
        {
          birthday: 1719273600, // Tue Jun 25 2024 00:00:00 GMT+0000
          vault: '0xc65433845ecD16688eda196497FA9130d6C47Bd8',
        },
        {
          birthday: 1722643200, // Sat Aug 03 2024 00:00:00 GMT+0000
          vault: '0x5E362eb2c0706Bd1d134689eC75176018385430B',
        },
        {
          birthday: 1723680000, // Thu Aug 15 2024 00:00:00 GMT+0000
          vault: '0x7F43fDe12A40dE708d908Fb3b9BFB8540d9Ce444',
        },
        {
          birthday: 1723680000, // Thu Aug 15 2024 00:00:00 GMT+0000
          vault: '0x64047dD3288276d70A4F8B5Df54668c8403f877F',
        },
        {
          birthday: 1723680000, // Thu Aug 15 2024 00:00:00 GMT+0000
          vault: '0x3a828C183b3F382d030136C824844Ea30145b4c7',
        },
      ],
    },
  ],
};
