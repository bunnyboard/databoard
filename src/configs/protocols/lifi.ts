import { ProtocolCategories, ProtocolConfig } from '../../types/base';
import { ChainNames, ProtocolNames } from '../names';

export interface LifiDiamondConfig {
  chain: string;
  birthday: number;
  diamond: string;
  feeCollector: string;
}

export interface LifiProtocolConfig extends ProtocolConfig {
  diamonds: Array<LifiDiamondConfig>;
}

export const LifiConfigs: LifiProtocolConfig = {
  protocol: ProtocolNames.lifi,
  category: ProtocolCategories.bridge,
  birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
  diamonds: [
    {
      chain: ChainNames.ethereum,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    },
    {
      chain: ChainNames.optimism,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    },
    {
      chain: ChainNames.bnbchain,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    },
    {
      chain: ChainNames.gnosis,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    },
    {
      chain: ChainNames.polygon,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xbD6C7B0d2f68c2b7805d88388319cfB6EcB50eA9',
    },
    {
      chain: ChainNames.fantom,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xB0210dE78E28e2633Ca200609D9f528c13c26cD9',
    },
    {
      chain: ChainNames.zksync,
      birthday: 1689292800, // Fri Jul 14 2023 00:00:00 GMT+0000
      diamond: '0x341e94069f53234fE6DabeF707aD424830525715',
      feeCollector: '0x8dBf6f59187b2EB36B980F3D8F4cFC6DC4E4642e',
    },
    {
      chain: ChainNames.metis,
      birthday: 1706918400, // Sat Feb 03 2024 00:00:00 GMT+0000
      diamond: '0x24ca98fB6972F5eE05f0dB00595c7f68D9FaFd68',
      feeCollector: '0x27f0e36dE6B1BA8232f6c2e87E00A50731048C6B',
    },
    {
      chain: ChainNames.polygonzkevm,
      birthday: 1689811200, // Thu Jul 20 2023 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xB49EaD76FE09967D7CA0dbCeF3C3A06eb3Aa0cB4',
    },
    {
      chain: ChainNames.moonbeam,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xB0210dE78E28e2633Ca200609D9f528c13c26cD9',
    },
    {
      chain: ChainNames.mantle,
      birthday: 1715385600, // Sat May 11 2024 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xF048e5816B0C7951AC179f656C5B86e5a79Bd7b5',
    },
    {
      chain: ChainNames.base,
      birthday: 1692144000, // Wed Aug 16 2023 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0x0A6d96E7f4D7b96CFE42185DF61E64d255c12DFf',
    },
    {
      chain: ChainNames.arbitrum,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xB0210dE78E28e2633Ca200609D9f528c13c26cD9',
    },
    {
      chain: ChainNames.avalanche,
      birthday: 1666310400, // Fri Oct 21 2022 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xB0210dE78E28e2633Ca200609D9f528c13c26cD9',
    },
    {
      chain: ChainNames.linea,
      birthday: 1692921600, // Fri Aug 25 2023 00:00:00 GMT+0000
      diamond: '0xDE1E598b81620773454588B85D6b5D4eEC32573e',
      feeCollector: '0xA4A24BdD4608D7dFC496950850f9763B674F0DB2',
    },
    {
      chain: ChainNames.scroll,
      birthday: 1709769600, // Thu Mar 07 2024 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xF048e5816B0C7951AC179f656C5B86e5a79Bd7b5',
    },
    {
      chain: ChainNames.mode,
      birthday: 1712966400, // Sat Apr 13 2024 00:00:00 GMT+0000
      diamond: '0x1231DEB6f5749EF6cE6943a275A1D3E7486F4EaE',
      feeCollector: '0xF048e5816B0C7951AC179f656C5B86e5a79Bd7b5',
    },
  ],
};
