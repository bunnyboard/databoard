import { ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface ZeroxExchangeConfig {
  chain: string;
  birthday: number;
  exchangeProxy: string;
  exchangeProxyFlashWallet: string;
}

export interface ZeroxProtocolConfig extends ProtocolConfig {
  exchanges: Array<ZeroxExchangeConfig>;
}

export const ZeroxConfigs: ZeroxProtocolConfig = {
  protocol: ProtocolNames.zerox,
  birthday: 1591920000, // Fri Jun 12 2020 00:00:00 GMT+0000
  exchanges: [
    {
      chain: ChainNames.ethereum,
      birthday: 1591920000, // Fri Jun 12 2020 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '0x22f9dcf4647084d6c31b2765f6910cd85c178c18',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1614902400, // Fri Mar 05 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '0xdb6f1920a889355780af7570773609bd8cb1f498',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1620864000, // Thu May 13 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '0xdb6f1920a889355780af7570773609bd8cb1f498',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1630022400, // Fri Aug 27 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '0xdb6f1920a889355780af7570773609bd8cb1f498',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1640304000, // Fri Dec 24 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1633996800, // Tue Oct 12 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef189deaef76e379df891899eb5a00a94cbc250',
      exchangeProxyFlashWallet: '0xb4d961671cadfed687e040b076eee29840c142e5',
    },
    {
      chain: ChainNames.celo,
      birthday: 1634342400, // Sat Oct 16 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '0xdb6f1920a889355780af7570773609bd8cb1f498',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1640304000, // Fri Dec 24 2021 00:00:00 GMT+0000
      exchangeProxy: '0xdef1abe32c034e558cdd535791643c58a13acc10',
      exchangeProxyFlashWallet: '0xa3128d9b7cca7d5af29780a56abeec12b05a6740',
    },
    {
      chain: ChainNames.base,
      birthday: 1689638400, // Tue Jul 18 2023 00:00:00 GMT+0000
      exchangeProxy: '0xdef1c0ded9bec7f1a1670819833240f027b25eff',
      exchangeProxyFlashWallet: '0xdb6f1920a889355780af7570773609bd8cb1f498',
    },
  ],
};
